param(
  [string]$InputRoot = (Join-Path $PSScriptRoot "..\public\ephemeris\generated-expanded-major-moons"),
  [string]$OutputRoot = (Join-Path $PSScriptRoot "..\.tmp\ephemeris-release"),
  [string]$AssetName = "ephemeris-expanded-major-moons-reduced-v1.zip",
  [switch]$AllowMilestone13FastMoons
)

$ErrorActionPreference = "Stop"

$resolvedInputRoot = Resolve-Path $InputRoot -ErrorAction SilentlyContinue
if ($null -eq $resolvedInputRoot) {
  throw "Input ephemeris asset root not found at '$InputRoot'. Stage or generate the reduced profile first."
}

$inputRootPath = $resolvedInputRoot.Path
$manifestPath = Join-Path $inputRootPath "manifest.json"

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Expected manifest.json at '$manifestPath'."
}

$chunkPaths = @(Get-ChildItem -LiteralPath $inputRootPath -Filter "chunk-*.json" -File)
if ($chunkPaths.Count -eq 0) {
  throw "Expected at least one chunk-*.json file in '$inputRootPath'."
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$deferredFastMoonIds = @(401, 402, 501, 502, 601, 602, 603, 604, 701, 705)
$manifestBodyIds = @($manifest.Bodies | ForEach-Object { [int]$_.BodyId })
$includedDeferredFastMoonIds = @($manifestBodyIds | Where-Object { $deferredFastMoonIds -contains $_ })

if ($includedDeferredFastMoonIds.Count -gt 0 -and -not $AllowMilestone13FastMoons) {
  $blockedIds = ($includedDeferredFastMoonIds | Sort-Object -Unique) -join ", "
  throw "Refusing to package release data with Milestone 13 fast-moon ids: $blockedIds. Pass -AllowMilestone13FastMoons only for Milestone 13 validation assets."
}

New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null

$outputRootPath = (Resolve-Path $OutputRoot).Path
$assetPath = Join-Path $outputRootPath $AssetName
$checksumPath = "$assetPath.sha256"
$stagingRoot = Join-Path $outputRootPath "staging"

Remove-Item -LiteralPath $assetPath -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $checksumPath -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $stagingRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $stagingRoot | Out-Null

Copy-Item -LiteralPath $manifestPath -Destination $stagingRoot
foreach ($chunkPath in $chunkPaths) {
  Copy-Item -LiteralPath $chunkPath.FullName -Destination $stagingRoot
}

Compress-Archive -Path (Join-Path $stagingRoot "*") -DestinationPath $assetPath -CompressionLevel Optimal -Force

$checksum = Get-FileHash -Algorithm SHA256 -LiteralPath $assetPath
"$($checksum.Hash.ToLowerInvariant())  $AssetName" | Set-Content -LiteralPath $checksumPath -Encoding ascii

Write-Host "Packaged reduced major-moons release asset:"
Write-Host "  $assetPath"
Write-Host "  $checksumPath"
Write-Host "Body count: $($manifestBodyIds.Count)."
Write-Host "Chunk count: $($chunkPaths.Count)."
