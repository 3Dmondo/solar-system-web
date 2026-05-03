param(
  [string]$PreviewRoot = (Join-Path $PSScriptRoot "..\public\ephemeris\generated-expanded-major-moons"),
  [string]$BenchmarkReportPath = (Join-Path $PSScriptRoot "..\..\SpiceNet\artifacts\web-data\expanded-major-moons-reduced\configured-cadence-benchmark.json"),
  [string]$ChunkFileName = "chunk-2001-2026.json",
  [double]$FocusedOrbitRadiusPixels = 300,
  [double]$SuspiciousOrbitPercentThreshold = 0.5,
  [double]$SuspiciousPixelThreshold = 2,
  [switch]$AsJson
)

$ErrorActionPreference = "Stop"
$secondsPerDay = 86400.0

$retainedMoonParentIds = @{
  "503" = 599
  "504" = 599
  "605" = 699
  "606" = 699
  "608" = 699
  "702" = 799
  "703" = 799
  "704" = 799
  "801" = 899
}

function Read-JsonFile {
  param([Parameter(Mandatory = $true)][string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Expected JSON file at '$Path'."
  }

  return Get-Content -Raw -LiteralPath $Path | ConvertFrom-Json
}

function Get-VectorLength {
  param(
    [Parameter(Mandatory = $true)][double]$X,
    [Parameter(Mandatory = $true)][double]$Y,
    [Parameter(Mandatory = $true)][double]$Z
  )

  return [Math]::Sqrt(($X * $X) + ($Y * $Y) + ($Z * $Z))
}

function Get-BodyPositionAtTime {
  param(
    [Parameter(Mandatory = $true)]$Body,
    [Parameter(Mandatory = $true)][double]$Time,
    [Parameter(Mandatory = $true)][double]$SampleDays,
    [Parameter(Mandatory = $true)][double]$ChunkStart,
    [Parameter(Mandatory = $true)][double]$ChunkEnd
  )

  $samples = $Body.Samples
  $sampleCount = [int]($samples.Count / 6)

  if ($sampleCount -lt 2) {
    throw "Body $($Body.BodyId) must have at least two samples."
  }

  if ($Time -le $ChunkStart) {
    return @([double]$samples[0], [double]$samples[1], [double]$samples[2])
  }

  if ($Time -ge $ChunkEnd) {
    $last = ($sampleCount - 1) * 6
    return @([double]$samples[$last], [double]$samples[$last + 1], [double]$samples[$last + 2])
  }

  $stepSeconds = [double]$SampleDays * $secondsPerDay
  $sampleIndex = [int][Math]::Floor(($Time - $ChunkStart) / $stepSeconds)

  if ($sampleIndex -ge ($sampleCount - 1)) {
    $sampleIndex = $sampleCount - 2
  }

  $sampleTime = $ChunkStart + ([double]$sampleIndex * $stepSeconds)
  $nextSampleTime = [Math]::Min($sampleTime + $stepSeconds, $ChunkEnd)
  $intervalSeconds = $nextSampleTime - $sampleTime

  if ($intervalSeconds -le 0) {
    throw "Body $($Body.BodyId) has a non-positive interpolation interval."
  }

  $t = ($Time - $sampleTime) / $intervalSeconds
  $t2 = $t * $t
  $t3 = $t2 * $t
  $h00 = (2 * $t3) - (3 * $t2) + 1
  $h10 = $t3 - (2 * $t2) + $t
  $h01 = (-2 * $t3) + (3 * $t2)
  $h11 = $t3 - $t2

  $offsetA = $sampleIndex * 6
  $offsetB = ($sampleIndex + 1) * 6

  $position = @()
  for ($component = 0; $component -lt 3; $component++) {
    $p0 = [double]$samples[$offsetA + $component]
    $v0 = [double]$samples[$offsetA + $component + 3]
    $p1 = [double]$samples[$offsetB + $component]
    $v1 = [double]$samples[$offsetB + $component + 3]
    $position += ($h00 * $p0) + ($h10 * $intervalSeconds * $v0) + ($h01 * $p1) + ($h11 * $intervalSeconds * $v1)
  }

  return $position
}

$resolvedPreviewRoot = Resolve-Path $PreviewRoot -ErrorAction SilentlyContinue
if ($null -eq $resolvedPreviewRoot) {
  throw "Preview root not found at '$PreviewRoot'. Stage the reduced expanded preview first."
}

$previewRootPath = $resolvedPreviewRoot.Path
$manifest = Read-JsonFile -Path (Join-Path $previewRootPath "manifest.json")
$chunk = Read-JsonFile -Path (Join-Path $previewRootPath $ChunkFileName)
$benchmarkReport = Read-JsonFile -Path $BenchmarkReportPath

$manifestBodiesById = @{}
foreach ($body in $manifest.Bodies) {
  $manifestBodiesById["$($body.BodyId)"] = $body
}

$chunkBodiesById = @{}
foreach ($body in $chunk.Bodies) {
  $chunkBodiesById["$($body.BodyId)"] = $body
}

$resultsById = @{}
foreach ($result in $benchmarkReport.BodyResults) {
  $resultsById["$($result.RequestedBodyId)"] = $result
}

$diagnostics = foreach ($moonBodyId in ($retainedMoonParentIds.Keys | Sort-Object {[int]$_})) {
  $parentBodyId = "$($retainedMoonParentIds[$moonBodyId])"

  if (-not $manifestBodiesById.ContainsKey($moonBodyId) -or -not $chunkBodiesById.ContainsKey($moonBodyId)) {
    continue
  }

  if (-not $manifestBodiesById.ContainsKey($parentBodyId) -or -not $chunkBodiesById.ContainsKey($parentBodyId)) {
    throw "Retained moon $moonBodyId requires parent body $parentBodyId in the staged preview."
  }

  if (-not $resultsById.ContainsKey($moonBodyId)) {
    throw "Benchmark report does not include retained moon $moonBodyId."
  }

  $moonManifest = $manifestBodiesById[$moonBodyId]
  $parentManifest = $manifestBodiesById[$parentBodyId]
  $moonChunkBody = $chunkBodiesById[$moonBodyId]
  $parentChunkBody = $chunkBodiesById[$parentBodyId]
  $samples = $moonChunkBody.Samples
  $sampleCount = [int]($samples.Count / 6)
  $chunkStart = [double]$chunk.StartTdbSecondsFromJ2000
  $chunkEnd = [double]$chunk.EndTdbSecondsFromJ2000

  $sumOrbitKm = 0.0
  $minOrbitKm = [double]::PositiveInfinity
  $maxOrbitKm = 0.0

  for ($sampleIndex = 0; $sampleIndex -lt $sampleCount; $sampleIndex++) {
    $isTerminalSample = $sampleIndex -eq ($sampleCount - 1)
    $sampleTime = if ($isTerminalSample) {
      $chunkEnd
    }
    else {
      $chunkStart + ([double]$sampleIndex * [double]$moonManifest.SampleDays * $secondsPerDay)
    }

    $parentPosition = Get-BodyPositionAtTime `
      -Body $parentChunkBody `
      -Time $sampleTime `
      -SampleDays ([double]$parentManifest.SampleDays) `
      -ChunkStart $chunkStart `
      -ChunkEnd $chunkEnd

    $offset = $sampleIndex * 6
    $orbitKm = Get-VectorLength `
      -X ([double]$samples[$offset] - [double]$parentPosition[0]) `
      -Y ([double]$samples[$offset + 1] - [double]$parentPosition[1]) `
      -Z ([double]$samples[$offset + 2] - [double]$parentPosition[2])

    $sumOrbitKm += $orbitKm
    if ($orbitKm -lt $minOrbitKm) {
      $minOrbitKm = $orbitKm
    }
    if ($orbitKm -gt $maxOrbitKm) {
      $maxOrbitKm = $orbitKm
    }
  }

  $meanOrbitKm = $sumOrbitKm / $sampleCount
  $benchmarkResult = $resultsById[$moonBodyId]
  $maxErrorKm = [double]$benchmarkResult.MaxPositionErrorKm
  $meanErrorKm = [double]$benchmarkResult.MeanPositionErrorKm
  $errorOrbitPercent = ($maxErrorKm / $meanOrbitKm) * 100.0
  $pixelDisplacement = ($errorOrbitPercent / 100.0) * $FocusedOrbitRadiusPixels

  [pscustomobject]@{
    BodyId = [int]$moonBodyId
    BodyName = [string]$benchmarkResult.RequestedBodyName
    ParentBodyId = [int]$parentBodyId
    SampleDays = [double]$benchmarkResult.SampleDays
    MaxErrorKm = [Math]::Round($maxErrorKm, 0)
    MeanErrorKm = [Math]::Round($meanErrorKm, 0)
    MeanOrbitKm = [Math]::Round($meanOrbitKm, 0)
    MinOrbitKm = [Math]::Round($minOrbitKm, 0)
    MaxOrbitKm = [Math]::Round($maxOrbitKm, 0)
    ErrorOrbitPercent = [Math]::Round($errorOrbitPercent, 3)
    FocusedPixelDisplacement = [Math]::Round($pixelDisplacement, 1)
    Suspicious = ($errorOrbitPercent -ge $SuspiciousOrbitPercentThreshold) -or ($pixelDisplacement -ge $SuspiciousPixelThreshold)
  }
}

if ($AsJson) {
  $diagnostics | ConvertTo-Json
  return
}

Write-Host "Reduced major-moon preview diagnostic"
Write-Host "Preview root: $previewRootPath"
Write-Host "Benchmark report: $BenchmarkReportPath"
Write-Host "Orbit-scale chunk: $ChunkFileName"
Write-Host "Focused orbit proxy: $FocusedOrbitRadiusPixels px"
Write-Host ""

$diagnostics |
  Sort-Object ErrorOrbitPercent -Descending |
  Format-Table BodyName, BodyId, SampleDays, MaxErrorKm, MeanOrbitKm, ErrorOrbitPercent, FocusedPixelDisplacement, Suspicious -AutoSize

$suspiciousBodies = @($diagnostics | Where-Object { $_.Suspicious })
if ($suspiciousBodies.Count -gt 0) {
  $bodyNames = ($suspiciousBodies | Sort-Object ErrorOrbitPercent -Descending | ForEach-Object { $_.BodyName }) -join ", "
  Write-Host ""
  Write-Host "Manual visual spot-check recommended for: $bodyNames"
}
else {
  Write-Host ""
  Write-Host "No retained moon exceeded the configured suspicious thresholds."
}
