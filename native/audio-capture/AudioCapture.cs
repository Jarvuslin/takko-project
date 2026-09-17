// Original Takko interop implementation. See README.md for API references and limits.
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Media;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

namespace Takko.ProcessAudio
{
    [StructLayout(LayoutKind.Sequential, Pack = 2)]
    public struct WaveFormat { public ushort Tag, Channels; public uint SamplesPerSecond, AverageBytesPerSecond; public ushort BlockAlign, BitsPerSample, ExtraSize; }
    [StructLayout(LayoutKind.Explicit, Size = 24)]
    public struct PropVariant { [FieldOffset(0)] public ushort Type; [FieldOffset(8)] public uint BlobSize; [FieldOffset(16)] public IntPtr BlobData; }
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    internal struct OsVersion { public uint Size, Major, Minor, Build, Platform; [MarshalAs(UnmanagedType.ByValTStr, SizeConst=128)] public string ServicePack; }

    [ComImport, Guid("1CB9AD4C-DBFA-4c32-B178-C2F568A703B2"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IAudioClient
    {
        [PreserveSig] int Initialize(int mode, uint flags, long duration, long periodicity, ref WaveFormat format, IntPtr session);
        [PreserveSig] int GetBufferSize(out uint frames);
        [PreserveSig] int GetStreamLatency(out long latency);
        [PreserveSig] int GetCurrentPadding(out uint frames);
        [PreserveSig] int IsFormatSupported(int mode, ref WaveFormat format, out IntPtr closest);
        [PreserveSig] int GetMixFormat(out IntPtr format);
        [PreserveSig] int GetDevicePeriod(out long normal, out long minimum);
        [PreserveSig] int Start();
        [PreserveSig] int Stop();
        [PreserveSig] int Reset();
        [PreserveSig] int SetEventHandle(IntPtr handle);
        [PreserveSig] int GetService(ref Guid iid, [MarshalAs(UnmanagedType.IUnknown)] out object service);
    }
    [ComImport, Guid("C8ADBD64-E71E-48a0-A4DE-185C395CD317"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IAudioCaptureClient
    {
        [PreserveSig] int GetBuffer(out IntPtr data, out uint frames, out uint flags, out ulong devicePosition, out ulong qpcPosition);
        [PreserveSig] int ReleaseBuffer(uint frames);
        [PreserveSig] int GetNextPacketSize(out uint frames);
    }
    [ComImport, Guid("72A22D78-CDE4-431D-B8CC-843A71199B6D"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IActivateAudioInterfaceAsyncOperation { [PreserveSig] int GetActivateResult(out int result, [MarshalAs(UnmanagedType.IUnknown)] out object activated); }
    [ComVisible(true), Guid("41D949AB-9862-444A-80F6-C261334DA5EB"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IActivateAudioInterfaceCompletionHandler { [PreserveSig] int ActivateCompleted(IActivateAudioInterfaceAsyncOperation operation); }
    [ComVisible(true), Guid("94EA2B94-E9CC-49E0-C0FF-EE64CA8F5B90"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IAgileObject { }
    [ComVisible(true), ClassInterface(ClassInterfaceType.None)]
    public sealed class Activation : IActivateAudioInterfaceCompletionHandler, IAgileObject
    {
        public readonly ManualResetEvent Completed = new ManualResetEvent(false);
        public object Audio; public int Error = unchecked((int)0x80004005);
        public int ActivateCompleted(IActivateAudioInterfaceAsyncOperation operation)
        {
            try { int result; object activated; int hr = operation.GetActivateResult(out result, out activated); Error = hr < 0 ? hr : result; Audio = activated; }
            catch (Exception error) { Error = Marshal.GetHRForException(error); }
            finally { Completed.Set(); }
            return 0;
        }
    }
    internal static class Native
    {
        [DllImport("Mmdevapi.dll", CharSet=CharSet.Unicode, ExactSpelling=true)]
        internal static extern int ActivateAudioInterfaceAsync(string device, ref Guid iid, ref PropVariant parameters, IActivateAudioInterfaceCompletionHandler handler, out IActivateAudioInterfaceAsyncOperation operation);
        [DllImport("ntdll.dll", CharSet=CharSet.Unicode)] internal static extern int RtlGetVersion(ref OsVersion version);
    }
    public static class Program
    {
        const int SampleRate = 44100, Channels = 2, BlockAlign = 4, MaximumBytes = 5 * 1024 * 1024;
        static readonly JavaScriptSerializer Json = new JavaScriptSerializer();
        static void Emit(object value) { Console.WriteLine(Json.Serialize(value)); Console.Out.Flush(); }
        static void Check(int hr, string stage) { if (hr < 0) throw new CaptureFailure(stage, "Native audio operation failed", hr); }
        static Dictionary<string, string> Arguments(string[] args)
        {
            if (args.Length % 2 != 0) throw new CaptureFailure("arguments", "Arguments must be explicit name/value pairs");
            var result = new Dictionary<string,string>(StringComparer.Ordinal);
            for (int i = 0; i < args.Length; i += 2)
            {
                string key = args[i];
                if (key != "--pid" && key != "--started-at" && key != "--duration-ms" && key != "--output" && key != "--selftest-tone-hz") throw new CaptureFailure("arguments", "Unknown option");
                if (result.ContainsKey(key)) throw new CaptureFailure("arguments", "Duplicate option");
                result.Add(key, args[i+1]);
            }
            return result;
        }
        static string Required(Dictionary<string,string> args, string key) { string value; if (!args.TryGetValue(key, out value) || String.IsNullOrWhiteSpace(value)) throw new CaptureFailure("arguments", "Missing required option " + key); return value; }
        static int Integer(Dictionary<string,string> args, string key, int minimum, int maximum)
        {
            int value; if (!Int32.TryParse(Required(args,key), NumberStyles.None, CultureInfo.InvariantCulture, out value) || value < minimum || value > maximum) throw new CaptureFailure("arguments", "Invalid bounded integer for " + key); return value;
        }
        static string OutputPath(string supplied)
        {
            if (!Path.IsPathRooted(supplied) || supplied.StartsWith(@"\\", StringComparison.Ordinal)) throw new CaptureFailure("output", "Output must be an absolute local temporary WAV path");
            string full = Path.GetFullPath(supplied), parent = Path.GetDirectoryName(full), temp = Path.GetFullPath(Path.GetTempPath()).TrimEnd(Path.DirectorySeparatorChar);
            if (!full.EndsWith(".wav",StringComparison.OrdinalIgnoreCase) || !String.Equals(Path.GetDirectoryName(parent),temp,StringComparison.OrdinalIgnoreCase) || !Path.GetFileName(parent).StartsWith("takko-audio-",StringComparison.Ordinal) || !Directory.Exists(parent) || File.Exists(full)) throw new CaptureFailure("output", "Output must be a fresh WAV inside a caller-created temporary takko-audio-* directory");
            for (var directory = new DirectoryInfo(parent); directory != null; directory = directory.Parent)
                if ((directory.Attributes & FileAttributes.ReparsePoint) != 0) throw new CaptureFailure("output", "Reparse-point output directories are not allowed");
            return full;
        }
        static Process Target(int pid, DateTime expected)
        {
            Process process;
            try { process = Process.GetProcessById(pid); if (process.HasExited || process.StartTime.ToUniversalTime().Ticks != expected.Ticks) { process.Dispose(); throw new CaptureFailure("identity", "Target PID creation time does not match"); } }
            catch (CaptureFailure) { throw; }
            catch { throw new CaptureFailure("identity", "Target PID is unavailable or its creation time cannot be verified"); }
            return process;
        }
        static void VerifyTarget(Process process, DateTime expected)
        {
            try { if (process.HasExited || process.StartTime.ToUniversalTime().Ticks != expected.Ticks) throw new CaptureFailure("identity", "Target exited or identity changed during capture"); }
            catch (CaptureFailure) { throw; }
            catch { throw new CaptureFailure("identity", "Target identity is no longer verifiable"); }
        }
        static void Header(BinaryWriter writer, int bytes)
        {
            writer.Write(Encoding.ASCII.GetBytes("RIFF"));writer.Write(36+bytes);writer.Write(Encoding.ASCII.GetBytes("WAVEfmt "));writer.Write(16);
            writer.Write((ushort)1);writer.Write((ushort)Channels);writer.Write(SampleRate);writer.Write(SampleRate*BlockAlign);writer.Write((ushort)BlockAlign);writer.Write((ushort)16);writer.Write(Encoding.ASCII.GetBytes("data"));writer.Write(bytes);
        }
        static void Tone(int hz, int duration)
        {
            Emit(new { @event="tone-ready",processId=Process.GetCurrentProcess().Id,startedAt=Process.GetCurrentProcess().StartTime.ToUniversalTime().ToString("o"),frequencyHz=hz });
            var line = System.Threading.Tasks.Task.Factory.StartNew(() => Console.ReadLine());
            if (!line.Wait(10000) || line.Result != "START") throw new CaptureFailure("tone", "Owned tone did not receive START within its deadline");
            int frames = SampleRate*duration/1000;
            using (var memory = new MemoryStream())
            {
                using (var writer = new BinaryWriter(memory,Encoding.UTF8,true)) { Header(writer,frames*BlockAlign);for(int i=0;i<frames;i++){short sample=(short)(Math.Sin(2*Math.PI*hz*i/SampleRate)*7000);writer.Write(sample);writer.Write(sample);} }
                memory.Position=0;using(var player=new SoundPlayer(memory)) { player.Load();player.PlaySync(); }
            }
            // Remain alive until the supervised capture finishes its last packets.
            Thread.Sleep(2000);Emit(new { @event="tone-complete" });
        }
        static void Capture(int pid, DateTime startedAt, int duration, string output)
        {
            var version = new OsVersion(); version.Size=(uint)Marshal.SizeOf(typeof(OsVersion));Check(Native.RtlGetVersion(ref version),"os");
            if(version.Build<20348 || IntPtr.Size!=8)throw new CaptureFailure("unsupported", "Process-only capture requires Windows build 20348+ and the x64 helper");
            using (Process target=Target(pid,startedAt))
            {
                var callback = new Activation(); IntPtr parameters=Marshal.AllocHGlobal(12);IActivateAudioInterfaceAsyncOperation operation=null;IAudioClient audio=null;IAudioCaptureClient capture=null;bool capturing=false, completed=false, created=false;
                try
                {
                    // AUDIOCLIENT_ACTIVATION_TYPE_PROCESS_LOOPBACK=1; INCLUDE_TARGET_PROCESS_TREE=0. No other mode exists in this program.
                    Marshal.WriteInt32(parameters,0,1);Marshal.WriteInt32(parameters,4,pid);Marshal.WriteInt32(parameters,8,0);
                    var variant=new PropVariant {Type=65,BlobSize=12,BlobData=parameters};Guid clientId=typeof(IAudioClient).GUID;
                    Check(Native.ActivateAudioInterfaceAsync(@"VAD\Process_Loopback",ref clientId,ref variant,callback,out operation),"activate");
                    if(!callback.Completed.WaitOne(5000))throw new CaptureFailure("activation_timeout","Process-only capture activation exceeded five seconds");
                    Check(callback.Error,"activation_result");audio=(IAudioClient)callback.Audio;
                    var format=new WaveFormat {Tag=1,Channels=Channels,SamplesPerSecond=SampleRate,AverageBytesPerSecond=SampleRate*BlockAlign,BlockAlign=BlockAlign,BitsPerSample=16,ExtraSize=0};
                    // Shared, loopback, event-driven PCM conversion; no physical endpoint or microphone is opened.
                    Check(audio.Initialize(0,0x00020000|0x00040000|0x80000000,0,0,ref format,IntPtr.Zero),"initialize");
                    Guid captureId=typeof(IAudioCaptureClient).GUID;object service;Check(audio.GetService(ref captureId,out service),"capture_service");capture=(IAudioCaptureClient)service;
                    object receipt;
                    using(var samples=new AutoResetEvent(false))
                    using(var file=new FileStream(output,FileMode.CreateNew,FileAccess.ReadWrite,FileShare.None))
                    using(var writer=new BinaryWriter(file))
                    {
                        created=true;Header(writer,0);Check(audio.SetEventHandle(samples.SafeWaitHandle.DangerousGetHandle()),"event_handle");VerifyTarget(target,startedAt);
                        double captureStartQpc=Stopwatch.GetTimestamp()*10000000.0/Stopwatch.Frequency;
                        Check(audio.Start(),"start");capturing=true;
                        var stopwatch=Stopwatch.StartNew();string captureStartedAt=DateTime.UtcNow.ToString("o");
                        Emit(new { @event="ready",processId=pid,startedAt=startedAt.ToString("o"),captureStartedAt=captureStartedAt,mode="include_process_tree",durationMs=duration,sampleRate=SampleRate,channels=Channels,bitsPerSample=16 });
                        int bytes=0,packets=0,silentPackets=0,discontinuities=0,leadingSilenceFrames=0;double squares=0,peak=0;long sampleCount=0;
                        while(stopwatch.ElapsedMilliseconds<duration)
                        {
                            VerifyTarget(target,startedAt);samples.WaitOne(Math.Min(30,Math.Max(1,duration-(int)stopwatch.ElapsedMilliseconds)));
                            uint available;Check(capture.GetNextPacketSize(out available),"packet_size");
                            while(available>0)
                            {
                                IntPtr data;uint frames,flags;ulong position,qpc;Check(capture.GetBuffer(out data,out frames,out flags,out position,out qpc),"buffer");
                                try
                                {
                                    if(packets==0)
                                    {
                                        if((flags&4)!=0 || qpc==0)throw new CaptureFailure("timestamp","Initial native packet timestamp is unavailable; capture timeline cannot be established");
                                        // WASAPI's QPC timestamp is in 100ns units. Preserve only the measured startup gap, not invented audio.
                                        double gapFrames=(qpc-captureStartQpc)*SampleRate/10000000.0;
                                        if(gapFrames>SampleRate*.25)throw new CaptureFailure("startup_gap","Native audio startup gap exceeded the 250ms baseline bound");
                                        leadingSilenceFrames=(int)Math.Max(0,Math.Round(gapFrames));
                                        if(leadingSilenceFrames>0){writer.Write(new byte[leadingSilenceFrames*BlockAlign]);bytes+=leadingSilenceFrames*BlockAlign;sampleCount+=leadingSilenceFrames*Channels;}
                                    }
                                    int count=checked((int)frames*BlockAlign);if(count>MaximumBytes || bytes+count+44>MaximumBytes)throw new CaptureFailure("size_limit","Captured WAV exceeded its five MiB bound");
                                    var buffer=new byte[count];if((flags&2)==0 && count>0){if(data==IntPtr.Zero)throw new CaptureFailure("buffer","Native capture returned no sample buffer");Marshal.Copy(data,buffer,0,count);}else silentPackets++;
                                    if((flags&1)!=0)discontinuities++;
                                    writer.Write(buffer);bytes+=count;packets++;
                                    for(int i=0;i<count;i+=2){short raw=(short)(buffer[i]|buffer[i+1]<<8);double level=raw/32768.0;squares+=level*level;peak=Math.Max(peak,Math.Abs(level));sampleCount++;}
                                }
                                finally { Check(capture.ReleaseBuffer(frames),"release_buffer"); }
                                Check(capture.GetNextPacketSize(out available),"packet_size");
                                if(stopwatch.ElapsedMilliseconds>duration+500)throw new CaptureFailure("capture_timeout","Capture draining exceeded the fixed deadline");
                            }
                        }
                        Check(audio.Stop(),"stop");capturing=false;VerifyTarget(target,startedAt);file.Position=0;Header(writer,bytes);writer.Flush();file.Flush(true);
                        file.Position=0;string hash;using(var sha=SHA256.Create())hash=BitConverter.ToString(sha.ComputeHash(file)).Replace("-","").ToLowerInvariant();
                        receipt=new { @event="complete",status="captured",processId=pid,startedAt=startedAt.ToString("o"),mode="include_process_tree",output=output,sha256=hash,bytes=bytes+44,frames=bytes/BlockAlign,sampleRate=SampleRate,channels=Channels,bitsPerSample=16,capturedDurationMs=bytes*1000.0/(SampleRate*BlockAlign),wallDurationMs=stopwatch.ElapsedMilliseconds,packets=packets,silentPackets=silentPackets,discontinuities=discontinuities,leadingSilenceFrames=leadingSilenceFrames,peak=peak,rms=sampleCount==0?0:Math.Sqrt(squares/sampleCount),semanticVerified=false };
                    }
                    // The parent may read immediately on receipt: release the exclusive file handle first.
                    completed=true;Emit(receipt);
                }
                finally
                {
                    if(capturing && audio!=null)audio.Stop();
                    if(capture!=null)Marshal.ReleaseComObject(capture);if(audio!=null)Marshal.ReleaseComObject(audio);if(operation!=null)Marshal.ReleaseComObject(operation);
                    Marshal.FreeHGlobal(parameters);GC.KeepAlive(callback);
                    if(created && !completed) { try { File.Delete(output); } catch { } }
                }
            }
        }
        [MTAThread]
        public static int Main(string[] args)
        {
            try
            {
                var options=Arguments(args);int duration=Integer(options,"--duration-ms",500,8000);
                if(options.ContainsKey("--selftest-tone-hz")){if(options.Count!=2)throw new CaptureFailure("arguments","Tone mode accepts only frequency and duration");Tone(Integer(options,"--selftest-tone-hz",200,2000),duration);return 0;}
                if(options.Count!=4)throw new CaptureFailure("arguments","Capture requires PID, creation time, duration and output only");
                int pid=Integer(options,"--pid",1,Int32.MaxValue);DateTime startedAt;
                if(!DateTime.TryParse(Required(options,"--started-at"),CultureInfo.InvariantCulture,DateTimeStyles.RoundtripKind,out startedAt) || startedAt.Kind==DateTimeKind.Unspecified)throw new CaptureFailure("arguments","Creation time must be an ISO timestamp with explicit timezone");
                using(var watchdog=new Timer(delegate { Emit(new { @event="error",code="watchdog_timeout",semanticVerified=false });Environment.Exit(2); },null,duration+10000,Timeout.Infinite))
                    Capture(pid,startedAt.ToUniversalTime(),duration,OutputPath(Required(options,"--output")));
                return 0;
            }
            catch(CaptureFailure failure){Emit(new { @event="error",code=failure.Code,message=failure.Message,hresult=failure.NativeError==0?null:failure.NativeError.ToString("X8"),semanticVerified=false });return 1;}
            catch(Exception error){Emit(new { @event="error",code="capture_failed",message="Process-only capture failed; no installation or broader capture fallback was attempted",exceptionType=error.GetType().Name,semanticVerified=false });return 1;}
        }
        sealed class CaptureFailure:Exception { public readonly string Code;public readonly int NativeError;public CaptureFailure(string code,string message,int hr=0):base(message){Code=code;NativeError=hr;} }
    }
}
