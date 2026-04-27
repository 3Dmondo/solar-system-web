# Convert-HygCatalog.ps1
# Filters HYG v4.2 catalog to naked-eye stars and converts to optimized JSON

param(
    [string]$CsvPath = "public/stars/hygdata_v42.csv",
    [string]$JsonPath = "public/stars/catalog.json",
    [double]$MagnitudeLimit = 6.5
)

Write-Host "Loading HYG catalog from $CsvPath..."
$csv = Import-Csv $CsvPath

Write-Host "Total stars in catalog: $($csv.Count)"

# Filter to naked-eye visible stars
$nakedEye = $csv | Where-Object { 
    $mag = 0.0
    if ([double]::TryParse($_.mag, [ref]$mag)) {
        $mag -le $MagnitudeLimit -and $mag -gt -2
    } else {
        $false
    }
}

Write-Host "Naked-eye stars (mag <= $MagnitudeLimit): $($nakedEye.Count)"

# Convert to optimized format
# Fields: ra (degrees), dec (degrees), mag, spect (spectral type), name (proper name)
$stars = $nakedEye | ForEach-Object {
    $star = @{
        ra = [double]$_.ra      # Right ascension in degrees (0-360)
        dec = [double]$_.dec    # Declination in degrees (-90 to +90)
        mag = [double]$_.mag    # Apparent magnitude
    }
    
    # Add spectral type if present (first character for color mapping)
    if ($_.spect -and $_.spect.Length -gt 0) {
        $star.spect = $_.spect.Substring(0, [Math]::Min(2, $_.spect.Length))
    }
    
    # Add proper name if present
    if ($_.proper -and $_.proper.Trim().Length -gt 0) {
        $star.name = $_.proper.Trim()
    }
    
    $star
}

# Sort by magnitude (brightest first) for potential early-exit rendering
$stars = $stars | Sort-Object { $_.mag }

# Convert to JSON array
$json = @{
    version = "hyg-4.2"
    license = "CC-BY-SA-4.0"
    source = "https://codeberg.org/astronexus/hyg"
    magnitudeLimit = $MagnitudeLimit
    count = $stars.Count
    stars = @($stars)
}

$jsonText = $json | ConvertTo-Json -Depth 3 -Compress

# Write to file
$fullPath = Join-Path (Get-Location) $JsonPath
[System.IO.File]::WriteAllText($fullPath, $jsonText)

$fileSize = (Get-Item $fullPath).Length
Write-Host "Written $($stars.Count) stars to $JsonPath ($([math]::Round($fileSize / 1KB)) KB)"
