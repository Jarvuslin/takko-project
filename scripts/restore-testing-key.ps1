param([string]$AppUrl = 'http://127.0.0.1:4324')
$ErrorActionPreference = 'Stop'
$taskUri = [Uri]$AppUrl
if ($taskUri.Scheme -ne 'http' -or $taskUri.Host -notin @('127.0.0.1', 'localhost') -or $taskUri.UserInfo -or $taskUri.Query -or $taskUri.Fragment) {
    throw 'Testing keys may only be restored to the local Takko service.'
}
$taskSecretFile = Join-Path $env:LOCALAPPDATA 'Takko\secrets\openrouter-testing.dpapi'
$taskSecureKey = ConvertTo-SecureString ([IO.File]::ReadAllText($taskSecretFile))
$taskPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskSecureKey)
try {
    $taskKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPointer)
    $taskSettings = Invoke-RestMethod -Uri "$AppUrl/api/models"
    $taskIds = @()
    foreach ($taskProfile in $taskSettings.profiles) {
        if ($taskProfile.provider -eq 'openrouter' -and $taskProfile.baseUrl.TrimEnd('/') -eq 'https://openrouter.ai/api/v1') {
            $taskBody = @{ key = $taskKey } | ConvertTo-Json -Compress
            try {
                Invoke-RestMethod -Uri "$AppUrl/api/models/$($taskProfile.id)/key" -Method Put -ContentType 'application/json' -Body $taskBody | Out-Null
            } catch { throw 'Local key assignment failed; credential details suppressed.' }
            $taskIds += $taskProfile.id
        }
    }
    $taskPublic = Invoke-RestMethod -Uri "$AppUrl/api/models"
    $taskVerified = @($taskPublic.profiles | Where-Object { $_.id -in $taskIds -and $_.hasKey }).Count
    if ($taskVerified -ne $taskIds.Count) { throw 'Key restoration verification failed.' }
    [pscustomobject]@{ restoredProfiles = $taskVerified; storage = 'Windows CurrentUser DPAPI'; paidCalls = 0 } | ConvertTo-Json
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPointer)
    $taskKey = $null
    $taskBody = $null
    $taskSecureKey.Dispose()
}
