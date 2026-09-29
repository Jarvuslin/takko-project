param([string]$TargetPath = (Join-Path $env:LOCALAPPDATA 'Takko\secrets\openrouter-testing.dpapi'))
$ErrorActionPreference = 'Stop'
$taskPlain = $null
$taskSecure = $null
$taskRestored = $null
$taskTemporary = $null
try {
  $taskPlain = [Console]::In.ReadToEnd().Trim()
  if ([string]::IsNullOrWhiteSpace($taskPlain)) { throw 'Missing input' }
  $taskDirectory = Split-Path -Parent $TargetPath
  [IO.Directory]::CreateDirectory($taskDirectory) | Out-Null
  $taskSecure = ConvertTo-SecureString $taskPlain -AsPlainText -Force
  $taskEncrypted = ConvertFrom-SecureString $taskSecure
  if ($taskEncrypted.Contains($taskPlain)) { throw 'Encryption verification failed' }
  $taskTemporary = Join-Path $taskDirectory ('.key-' + [guid]::NewGuid().ToString('N') + '.dpapi')
  [IO.File]::WriteAllText($taskTemporary, $taskEncrypted)
  $taskAcl = New-Object System.Security.AccessControl.FileSecurity
  $taskAcl.SetAccessRuleProtection($true, $false)
  $taskIdentity = [Security.Principal.WindowsIdentity]::GetCurrent().User
  $taskRule = New-Object System.Security.AccessControl.FileSystemAccessRule($taskIdentity, 'FullControl', 'Allow')
  $taskAcl.AddAccessRule($taskRule)
  [IO.FileSystemAclExtensions]::SetAccessControl([IO.FileInfo]::new($taskTemporary), $taskAcl)
  $taskRestored = ConvertTo-SecureString ([IO.File]::ReadAllText($taskTemporary))
  $taskPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskRestored)
  try {
    if ([Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPointer) -cne $taskPlain) { throw 'Round-trip verification failed' }
  } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPointer) }
  [IO.File]::Move($taskTemporary, $TargetPath, $true)
  $taskTemporary = $null
  [pscustomobject]@{ saved = $true; encryption = 'Windows DPAPI CurrentUser'; roundTripVerified = $true; access = 'Current Windows user only'; at = [DateTime]::UtcNow.ToString('o') } | ConvertTo-Json -Compress
} catch {
  [Console]::Error.WriteLine('Encrypted credential save failed. Details suppressed.')
  exit 1
} finally {
  if ($taskTemporary -and [IO.File]::Exists($taskTemporary)) { [IO.File]::Delete($taskTemporary) }
  if ($taskSecure) { $taskSecure.Dispose() }
  if ($taskRestored) { $taskRestored.Dispose() }
  $taskPlain = $null
}
