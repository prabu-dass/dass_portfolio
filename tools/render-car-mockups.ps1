<#
  Renders every car UI screen into the in-cabin mockup (tools/car-mockup.html) with headless Edge
  and saves JPEGs to assets/img/car-ux/mockups/.
  Requires the local server running: powershell -File tools\serve.ps1 -Port 5173
  Usage: powershell -ExecutionPolicy Bypass -File tools\render-car-mockups.ps1 [-Port 5173]
#>
param([int]$Port = 5173)
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$outDir = Join-Path $root 'assets\img\car-ux\mockups'
New-Item -ItemType Directory -Force $outDir | Out-Null
# Short temp path: Start-Process does not quote arguments containing spaces.
$tmp = Join-Path ([IO.Path]::GetTempPath()) 'car-mockups'
New-Item -ItemType Directory -Force $tmp | Out-Null
$tmp = (New-Object -ComObject Scripting.FileSystemObject).GetFolder($tmp).ShortPath

$jobs = @()
foreach ($s in 'home','navigation','media','phone','apps','settings') {
  $jobs += @{ name = "sand-$s"; theme = 'dusk' }
  $jobs += @{ name = "blue-$s"; theme = 'day' }
}
$jobs += @{ name = 'glass-light'; theme = 'morning'; wide = 1 }
$jobs += @{ name = 'glass-dark'; theme = 'night'; wide = 1 }

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]86)

foreach ($j in $jobs) {
  $url = "http://localhost:$Port/tools/car-mockup.html?img=../assets/img/car-ux/screens/$($j.name).jpg&theme=$($j.theme)"
  if ($j.wide) { $url += '&wide=1' }
  $png = Join-Path $tmp "$($j.name).png"
  if (Test-Path $png) { Remove-Item $png -Force }
  Start-Process -FilePath $edge -Wait -ArgumentList @('--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',
    "--user-data-dir=$tmp\profile",'--window-size=1600,1000','--virtual-time-budget=3000',"--screenshot=$png",$url) | Out-Null
  if (-not (Test-Path $png)) { "FAILED $($j.name)"; continue }
  $im = [System.Drawing.Image]::FromFile($png)
  $im.Save((Join-Path $outDir "$($j.name).jpg"), $codec, $ep)
  $im.Dispose()
  "ok $($j.name)"
}
