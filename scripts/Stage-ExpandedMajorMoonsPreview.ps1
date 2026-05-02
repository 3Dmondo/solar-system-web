param(
  [string]$SpiceNetOutputRoot = (Join-Path $PSScriptRoot "..\..\SpiceNet\artifacts\web-data\expanded-major-moons-reduced"),
  [string]$OutputRoot = (Join-Path $PSScriptRoot "..\public\ephemeris\generated-expanded-major-moons"),
  [switch]$AllowMilestone13FastMoons
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$resolvedSourceRoot = Resolve-Path $SpiceNetOutputRoot -ErrorAction SilentlyContinue

if ($null -eq $resolvedSourceRoot) {
  throw "Expanded major-moons output not found at '$SpiceNetOutputRoot'. Generate the profile in SpiceNet first or pass -SpiceNetOutputRoot."
}

$sourceRoot = $resolvedSourceRoot.Path
$outputRootPath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot "public\ephemeris\generated-expanded-major-moons"))
$resolvedOutputRoot = Resolve-Path $OutputRoot -ErrorAction SilentlyContinue

if ($null -ne $resolvedOutputRoot) {
  $outputRootPath = $resolvedOutputRoot.Path
}

$expectedRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot "public\ephemeris\generated-expanded-major-moons"))

if ($outputRootPath -ne $expectedRoot) {
  throw "Preview output must stay inside '$expectedRoot'. Refusing to stage into '$outputRootPath'."
}

$manifestPath = Join-Path $sourceRoot "manifest.json"

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Expected expanded profile manifest at '$manifestPath'."
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$deferredFastMoonIds = @(401, 402, 501, 502, 601, 602, 603, 604, 701, 705)
$manifestBodyIds = @($manifest.Bodies | ForEach-Object { [int]$_.BodyId })
$includedDeferredFastMoonIds = @($manifestBodyIds | Where-Object { $deferredFastMoonIds -contains $_ })

if ($includedDeferredFastMoonIds.Count -gt 0 -and -not $AllowMilestone13FastMoons) {
  $blockedIds = ($includedDeferredFastMoonIds | Sort-Object -Unique) -join ", "
  throw "Refusing to stage expanded preview with Milestone 13 fast-moon ids: $blockedIds. Pass -AllowMilestone13FastMoons only for future sub-day cadence validation."
}

New-Item -ItemType Directory -Force -Path $outputRootPath | Out-Null

Get-ChildItem -LiteralPath $outputRootPath -Filter "*.json" -File | ForEach-Object {
  Remove-Item -LiteralPath $_.FullName -Force
}

Copy-Item -LiteralPath $manifestPath -Destination $outputRootPath
Get-ChildItem -LiteralPath $sourceRoot -Filter "chunk-*.json" -File | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $outputRootPath
}

$chunkCount = @(Get-ChildItem -LiteralPath $outputRootPath -Filter "chunk-*.json" -File).Count

Write-Host "Staged expanded major-moons preview assets into $outputRootPath"
Write-Host "Copied manifest.json plus $chunkCount chunk files."
Write-Host "Preview body count: $($manifestBodyIds.Count)."
Write-Host "Run pnpm dev with VITE_WEB_EPHEMERIS_PROFILE=expanded-major-moons to inspect the preview."
