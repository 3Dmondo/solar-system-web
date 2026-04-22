param(
  [string]$SpiceNetRepoRoot = (Join-Path $PSScriptRoot "..\..\SpiceNet"),
  [string]$OutputRoot = (Join-Path $PSScriptRoot "..\public\ephemeris\generated"),
  [string]$SpkFileName = "de440s.bsp",
  [string]$SpkUrl = "https://ssd.jpl.nasa.gov/ftp/eph/planets/bsp/de440s.bsp",
  [switch]$ForceRegenerate,
  [switch]$ForceDownload
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$resolvedOutputRoot = Resolve-Path $OutputRoot -ErrorAction SilentlyContinue
if ($null -ne $resolvedOutputRoot) {
  $outputRoot = $resolvedOutputRoot.Path
}
else {
  $outputRoot = Join-Path $repoRoot "public\ephemeris\generated"
}

$manifestPath = Join-Path $outputRoot "manifest.json"

if ((-not $ForceRegenerate) -and (Test-Path -LiteralPath $manifestPath)) {
  Write-Host "Using existing local ephemeris data at $outputRoot"
  Write-Host "Pass -ForceRegenerate to rebuild the generated manifest and chunk assets."
  return
}

$resolvedSpiceNetRoot = Resolve-Path $SpiceNetRepoRoot -ErrorAction SilentlyContinue
if ($null -eq $resolvedSpiceNetRoot) {
  throw "SpiceNet repo not found at '$SpiceNetRepoRoot'. Pass -SpiceNetRepoRoot to point at the pinned external repo checkout."
}

$spiceNetRoot = $resolvedSpiceNetRoot.Path
$generatorScript = Join-Path $spiceNetRoot "scripts\Generate-WebDataBaselineDataset.ps1"

if (-not (Test-Path -LiteralPath $generatorScript)) {
  throw "SpiceNet baseline dataset script is missing at '$generatorScript'."
}

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

$generationArgs = @{
  OutputRoot = $outputRoot
  SpkFileName = $SpkFileName
  SpkUrl = $SpkUrl
}

if ($ForceDownload) {
  $generationArgs["ForceDownload"] = $true
}

Write-Host "Generating local Milestone 5 ephemeris assets into $outputRoot"
& $generatorScript @generationArgs

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Expected generated manifest at '$manifestPath', but the SpiceNet script did not produce it."
}

Write-Host "Local ephemeris assets are ready at $outputRoot"
Write-Host "When you enable the real-data runtime locally, point VITE_WEB_EPHEMERIS_DATA_BASE_URL at './ephemeris/generated'."
