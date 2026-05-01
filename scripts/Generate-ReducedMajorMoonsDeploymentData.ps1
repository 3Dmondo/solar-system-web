param(
  [string]$SpiceNetRepoRoot = (Join-Path $PSScriptRoot "..\..\SpiceNet"),
  [string]$CacheRoot = (Join-Path $PSScriptRoot "..\.tmp\spicenet-kernel-cache"),
  [string]$OutputRoot = (Join-Path $PSScriptRoot "..\public\ephemeris\generated"),
  [string]$LskFileName = "naif0012.tls",
  [string]$LskUrl = "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0012.tls",
  [switch]$ForceDownload
)

$ErrorActionPreference = "Stop"

function Get-FullPath {
  param(
    [Parameter(Mandatory = $true)][string]$Path
  )

  if ([System.IO.Path]::IsPathRooted($Path)) {
    return [System.IO.Path]::GetFullPath($Path)
  }

  return [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $Path))
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$expectedOutputRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot "public\ephemeris\generated"))
$outputRootPath = Get-FullPath $OutputRoot

if ($outputRootPath -ne $expectedOutputRoot) {
  throw "Deployment output must stay inside '$expectedOutputRoot'. Refusing to write into '$outputRootPath'."
}

$resolvedSpiceNetRoot = Resolve-Path $SpiceNetRepoRoot -ErrorAction SilentlyContinue
if ($null -eq $resolvedSpiceNetRoot) {
  throw "SpiceNet repo not found at '$SpiceNetRepoRoot'. Pass -SpiceNetRepoRoot to point at the pinned external repo checkout."
}

$spiceNetRoot = $resolvedSpiceNetRoot.Path
$generatorProject = Join-Path $spiceNetRoot "Spice.WebDataGenerator\Spice.WebDataGenerator.csproj"

if (-not (Test-Path -LiteralPath $generatorProject)) {
  throw "SpiceNet web data generator project is missing at '$generatorProject'."
}

$cacheRootPath = Get-FullPath $CacheRoot
$lskRoot = Join-Path $cacheRootPath "lsk"
$pckRoot = Join-Path $cacheRootPath "pck"

$spkSpecs = @(
  @{
    FileName = "de440s.bsp"
    RelativePath = "planets\bsp\de440s.bsp"
    Url = "https://ssd.jpl.nasa.gov/ftp/eph/planets/bsp/de440s.bsp"
  },
  @{
    FileName = "jup365.bsp"
    RelativePath = "satellites\bsp\jup365.bsp"
    Url = "https://ssd.jpl.nasa.gov/ftp/eph/satellites/bsp/jup365.bsp"
  },
  @{
    FileName = "sat427l.bsp"
    RelativePath = "satellites\bsp\sat427l.bsp"
    Url = "https://ssd.jpl.nasa.gov/ftp/eph/satellites/bsp/sat427l.bsp"
  },
  @{
    FileName = "ura111.bsp"
    RelativePath = "satellites\bsp\ura111.bsp"
    Url = "https://ssd.jpl.nasa.gov/ftp/eph/satellites/bsp/ura111.bsp"
  },
  @{
    FileName = "Triton.nep097.30kyr.bsp"
    RelativePath = "satellites\bsp\Triton.nep097.30kyr.bsp"
    Url = "https://ssd.jpl.nasa.gov/ftp/eph/satellites/bsp/Triton.nep097.30kyr.bsp"
  }
)

$bodySpecs = @(
  @{ BodyId = 10; CadenceDays = 30; Name = "Sun" },
  @{ BodyId = 199; CadenceDays = 3; Name = "Mercury" },
  @{ BodyId = 299; CadenceDays = 7; Name = "Venus" },
  @{ BodyId = 399; CadenceDays = 7; Name = "Earth" },
  @{ BodyId = 301; CadenceDays = 3; Name = "Moon" },
  @{ BodyId = 499; CadenceDays = 14; Name = "Mars" },
  @{ BodyId = 599; CadenceDays = 30; Name = "Jupiter" },
  @{ BodyId = 503; CadenceDays = 1; Name = "Ganymede" },
  @{ BodyId = 504; CadenceDays = 2; Name = "Callisto" },
  @{ BodyId = 699; CadenceDays = 30; Name = "Saturn" },
  @{ BodyId = 605; CadenceDays = 1; Name = "Rhea" },
  @{ BodyId = 606; CadenceDays = 2; Name = "Titan" },
  @{ BodyId = 608; CadenceDays = 4; Name = "Iapetus" },
  @{ BodyId = 799; CadenceDays = 30; Name = "Uranus" },
  @{ BodyId = 702; CadenceDays = 1; Name = "Umbriel" },
  @{ BodyId = 703; CadenceDays = 2; Name = "Titania" },
  @{ BodyId = 704; CadenceDays = 2; Name = "Oberon" },
  @{ BodyId = 899; CadenceDays = 30; Name = "Neptune" },
  @{ BodyId = 801; CadenceDays = 1; Name = "Triton" }
)

$metadataKernelSpecs = @(
  @{
    FileName = "pck00011.tpc"
    Url = "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/pck/pck00011.tpc"
  },
  @{
    FileName = "gm_de440.tpc"
    Url = "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/pck/gm_de440.tpc"
  }
)

function Ensure-DownloadedFile {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$Destination,
    [switch]$Force
  )

  if ($Force -or -not (Test-Path -LiteralPath $Destination)) {
    Write-Host "Downloading $(Split-Path -Leaf $Destination) from $Url"
    Invoke-WebRequest -Uri $Url -OutFile $Destination
  }
  else {
    Write-Host "Using cached $(Split-Path -Leaf $Destination)"
  }
}

New-Item -ItemType Directory -Force -Path $cacheRootPath | Out-Null
New-Item -ItemType Directory -Force -Path $lskRoot | Out-Null
New-Item -ItemType Directory -Force -Path $pckRoot | Out-Null

$spkPaths = @()
foreach ($spk in $spkSpecs) {
  $destination = Join-Path $cacheRootPath $spk.RelativePath
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
  Ensure-DownloadedFile -Url $spk.Url -Destination $destination -Force:$ForceDownload
  $spkPaths += $destination
}

$lskPath = Join-Path $lskRoot $LskFileName
Ensure-DownloadedFile -Url $LskUrl -Destination $lskPath -Force:$ForceDownload

$metadataKernelPaths = @()
foreach ($kernel in $metadataKernelSpecs) {
  $destination = Join-Path $pckRoot $kernel.FileName
  Ensure-DownloadedFile -Url $kernel.Url -Destination $destination -Force:$ForceDownload
  $metadataKernelPaths += $destination
}

Remove-Item -LiteralPath $outputRootPath -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $outputRootPath | Out-Null

$generatorArgs = @(
  "run",
  "--project", $generatorProject,
  "--",
  "--profile-name", "expanded-major-moons",
  "--lsk", $lskPath,
  "--lsk-source-url", $LskUrl,
  "--output", $outputRootPath,
  "--start-year", "1901",
  "--end-year", "2100",
  "--chunk-years", "25",
  "--sample-days", "30",
  "--center", "0"
)

foreach ($spkPath in $spkPaths) {
  $generatorArgs += @("--spk", $spkPath)
}

foreach ($spk in $spkSpecs) {
  $generatorArgs += @("--spk-source-url", $spk.Url)
}

foreach ($kernelPath in $metadataKernelPaths) {
  $generatorArgs += @("--metadata-kernel", $kernelPath)
}

foreach ($kernel in $metadataKernelSpecs) {
  $generatorArgs += @("--metadata-kernel-source-url", $kernel.Url)
}

foreach ($body in $bodySpecs) {
  $generatorArgs += @("--body", "$($body.BodyId)")

  if ($body.CadenceDays -ne 30) {
    $generatorArgs += @("--body-cadence", "$($body.BodyId):$($body.CadenceDays)")
  }
}

Write-Host "Generating reduced expanded-major-moons deployment data into $outputRootPath"
& dotnet @generatorArgs

$manifestPath = Join-Path $outputRootPath "manifest.json"
if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Expected generated manifest at '$manifestPath', but the SpiceNet generator did not produce it."
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$deferredFastMoonIds = @(401, 402, 501, 502, 601, 602, 603, 604, 701, 705)
$manifestBodyIds = @($manifest.Bodies | ForEach-Object { [int]$_.BodyId })
$includedDeferredFastMoonIds = @($manifestBodyIds | Where-Object { $deferredFastMoonIds -contains $_ })

if ($includedDeferredFastMoonIds.Count -gt 0) {
  $blockedIds = ($includedDeferredFastMoonIds | Sort-Object -Unique) -join ", "
  throw "Generated deployment data unexpectedly includes Milestone 13 fast-moon ids: $blockedIds."
}

Write-Host "Reduced expanded-major-moons deployment data is ready."
Write-Host "Generated body count: $($manifestBodyIds.Count)."
