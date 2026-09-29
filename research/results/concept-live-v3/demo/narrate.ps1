Add-Type -AssemblyName System.Speech
$taskNarration=Get-Content -LiteralPath 'D:\RobloxProjects\Roblox Gen\research\results\concept-live-v3\demo\narration.json' -Raw | ConvertFrom-Json
$taskSpeech=New-Object System.Speech.Synthesis.SpeechSynthesizer
$taskSpeech.SelectVoice('Microsoft David Desktop')
$taskSpeech.Rate=1
try { foreach ($taskLine in $taskNarration) { $taskSpeech.SetOutputToWaveFile((Join-Path 'D:\RobloxProjects\Roblox Gen\research\results\concept-live-v3\demo' ($taskLine.name+'.wav'))); $taskSpeech.Speak($taskLine.text); $taskSpeech.SetOutputToNull() } } finally { $taskSpeech.Dispose() }
