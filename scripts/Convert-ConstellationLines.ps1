# Convert-ConstellationLines.ps1
# Regenerates public/stars/constellations.json from d3-celestial source data
# while preserving the current curated constellation ID list and display names.

param(
    [string]$TemplatePath = "public/stars/constellations.json",
    [string]$OutputPath = "public/stars/constellations.json",
    [string]$SourcePath = "",
    [string]$SourceUrl = "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json",
    [int]$RaPrecision = 3,
    [int]$DecPrecision = 2
)

$ErrorActionPreference = "Stop"

function Convert-LongitudeToRaHours {
    param([double]$LongitudeDegrees)

    $wrapped = (($LongitudeDegrees % 360.0) + 360.0) % 360.0
    return $wrapped / 15.0
}

function Round-Coordinate {
    param(
        [double]$Value,
        [int]$Digits
    )

    return [Math]::Round($Value, $Digits, [MidpointRounding]::AwayFromZero)
}

Write-Host "Loading template constellation file: $TemplatePath"
$template = Get-Content -LiteralPath $TemplatePath -Raw | ConvertFrom-Json

if (-not $template.constellations) {
    throw "Template file does not contain a 'constellations' array."
}

$templateEntries = @($template.constellations)
$templateIds = @($templateEntries | ForEach-Object { $_.id })
$templateNamesById = @{}
foreach ($entry in $templateEntries) {
    $templateNamesById[$entry.id] = $entry.name
}

$sourceText = $null
if ($SourcePath -and (Test-Path -LiteralPath $SourcePath)) {
    Write-Host "Loading source GeoJSON from local file: $SourcePath"
    $sourceText = Get-Content -LiteralPath $SourcePath -Raw
} else {
    Write-Host "Downloading source GeoJSON: $SourceUrl"
    $sourceText = (Invoke-WebRequest -Uri $SourceUrl -UseBasicParsing).Content
}

$sourceGeoJson = $sourceText | ConvertFrom-Json
if (-not $sourceGeoJson.features) {
    throw "Source GeoJSON does not contain a 'features' array."
}

$featuresById = @{}
foreach ($feature in $sourceGeoJson.features) {
    $id = [string]$feature.id
    if (-not $featuresById.ContainsKey($id)) {
        $featuresById[$id] = [System.Collections.ArrayList]::new()
    }
    [void]$featuresById[$id].Add($feature)
}

$missingIds = @($templateIds | Where-Object { -not $featuresById.ContainsKey($_) })
if ($missingIds.Count -gt 0) {
    $missingJoined = ($missingIds -join ", ")
    throw "Missing constellation IDs in source data: $missingJoined"
}

$rebuiltConstellations = [System.Collections.ArrayList]::new()

foreach ($id in $templateIds) {
    $name = $templateNamesById[$id]
    $lineStrips = [System.Collections.ArrayList]::new()
    $features = @($featuresById[$id])

    foreach ($feature in $features) {
        $coordinates = @($feature.geometry.coordinates)
        foreach ($line in $coordinates) {
            $convertedLine = [System.Collections.ArrayList]::new()
            foreach ($pair in @($line)) {
                $longitude = [double]$pair[0]
                $declination = [double]$pair[1]
                $raHours = Convert-LongitudeToRaHours -LongitudeDegrees $longitude
                $roundedRa = Round-Coordinate -Value $raHours -Digits $RaPrecision
                $roundedDec = Round-Coordinate -Value $declination -Digits $DecPrecision
                [void]$convertedLine.Add(@($roundedRa, $roundedDec))
            }
            [void]$lineStrips.Add(@($convertedLine))
        }
    }

    [void]$rebuiltConstellations.Add([ordered]@{
        id = $id
        name = $name
        lines = @($lineStrips)
    })
}

$output = [ordered]@{
    version = "1.2"
    source = "IAU standard stick figures via d3-celestial"
    note = "Constellation lines with coordinates in RA (hours) and Dec (degrees). Regenerated from d3-celestial for curated IDs."
    constellations = @($rebuiltConstellations)
}

$json = $output | ConvertTo-Json -Depth 8
$fullOutputPath = Join-Path (Get-Location) $OutputPath
[System.IO.File]::WriteAllText($fullOutputPath, "$json`n")

$constellationCount = @($output.constellations).Count
$segmentCount = 0
foreach ($constellation in $output.constellations) {
    foreach ($line in $constellation.lines) {
        $lineCount = @($line).Count
        if ($lineCount -ge 2) {
            $segmentCount += ($lineCount - 1)
        }
    }
}

Write-Host "Wrote $constellationCount constellations to $OutputPath"
Write-Host "Total line segments: $segmentCount"
