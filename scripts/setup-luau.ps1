$ErrorActionPreference = 'Stop'
$toolDirectory = Join-Path $PSScriptRoot '../.forge/tools/luau'
$archivePath = Join-Path $PSScriptRoot '../.forge/tools/luau-windows-0.738.zip'
New-Item -ItemType Directory -Force -Path $toolDirectory | Out-Null
Invoke-WebRequest 'https://github.com/luau-lang/luau/releases/download/0.738/luau-windows.zip' -OutFile $archivePath
$expectedHash = '1D465AA225DFF00ED589F32DD79F6E766B54C4DE57E3B8652410CCBD4D491695'
if ((Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash -ne $expectedHash) { throw 'Luau archive hash mismatch' }
Expand-Archive -LiteralPath $archivePath -DestinationPath $toolDirectory -Force
# Retained regression fixtures still resolve this legacy compiler location.
# Populate it from the same verified archive so fresh clones can run every test.
$legacyToolDirectory = Join-Path $PSScriptRoot '../research/tools/luau'
New-Item -ItemType Directory -Force -Path $legacyToolDirectory | Out-Null
Expand-Archive -LiteralPath $archivePath -DestinationPath $legacyToolDirectory -Force
Write-Output 'Luau installed. Set LUAU_BIN_DIR=.forge/tools/luau before running tests.'
