<#
  Optimises raw portfolio assets into assets/img and assets/video.

  Usage:
    powershell -ExecutionPolicy Bypass -File tools\optimize-assets.ps1 -Source <raw folder> [-MaxWidth 1600]

  Rules
  - PNG/JPG: resized to MaxWidth (and max 2400px tall), saved as JPEG q80.
    Images that actually use transparency stay PNG.
  - GIF, SVG: copied unchanged (keep GIFs small; convert large ones to MP4 instead).
  - MP4: copied unchanged into assets/video.
  - Paths: skills/images -> thumbs, img|assets -> site, other "skills/" and "images/"
    folders are dropped, names lower-cased, spaces -> "-".
  Writes tools/asset-manifest.csv with output path and pixel size.
#>
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [int]$MaxWidth = 1600,
  [int]$MaxHeight = 2400,
  [long]$Quality = 80
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
# Normalise (expands 8.3 short names so relative paths line up with FullName)
$Source = (Get-Item $Source).FullName
$root = Split-Path -Parent $PSScriptRoot
$imgOut = Join-Path $root 'assets\img'
$vidOut = Join-Path $root 'assets\video'

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, $Quality)

function Get-CleanRelative([string]$full) {
  $rel = $full.Substring($Source.TrimEnd('\').Length + 1)
  # Old-site layout -> new layout
  $rel = $rel -replace '^skills\\images\\', 'thumbs\' -replace '^img\\', 'site\' -replace '^assets\\', 'site\'
  $parts = $rel -split '\\' | Where-Object { $_ -ne 'skills' -and $_ -ne 'images' }
  ($parts -join '\').ToLower() -replace ' ', '-'
}

function Test-UsesAlpha([System.Drawing.Bitmap]$bmp) {
  if (-not [System.Drawing.Image]::IsAlphaPixelFormat($bmp.PixelFormat)) { return $false }
  $probe = New-Object System.Drawing.Bitmap 48, 48
  $g = [System.Drawing.Graphics]::FromImage($probe)
  $g.DrawImage($bmp, 0, 0, 48, 48)
  $g.Dispose()
  for ($x = 0; $x -lt 48; $x++) {
    for ($y = 0; $y -lt 48; $y++) {
      if ($probe.GetPixel($x, $y).A -lt 250) { $probe.Dispose(); return $true }
    }
  }
  $probe.Dispose()
  return $false
}

$manifest = New-Object System.Collections.Generic.List[string]
$manifest.Add('path,width,height,bytes')

Get-ChildItem $Source -Recurse -File | ForEach-Object {
  $file = $_
  $ext = $file.Extension.ToLower()
  $rel = Get-CleanRelative $file.FullName

  if ($ext -eq '.mp4') {
    $dest = Join-Path $vidOut $rel
    New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
    Copy-Item $file.FullName $dest -Force
    $manifest.Add("assets/video/$($rel -replace '\\','/'),,,$($file.Length)")
    return
  }

  if ($ext -eq '.gif' -or $ext -eq '.svg') {
    $dest = Join-Path $imgOut $rel
    New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
    Copy-Item $file.FullName $dest -Force
    $w = ''; $h = ''
    if ($ext -eq '.gif') { $im = [System.Drawing.Image]::FromFile($file.FullName); $w = $im.Width; $h = $im.Height; $im.Dispose() }
    $manifest.Add("assets/img/$($rel -replace '\\','/'),$w,$h,$($file.Length)")
    return
  }

  if ($ext -notin '.png', '.jpg', '.jpeg') { return }

  try {
    $src = [System.Drawing.Bitmap]::FromFile($file.FullName)
  } catch {
    Write-Warning "Skipping unreadable $($file.FullName)"
    return
  }
  $scale = [Math]::Min(1.0, [Math]::Min($MaxWidth / $src.Width, $MaxHeight / $src.Height))
  $w = [int][Math]::Round($src.Width * $scale)
  $h = [int][Math]::Round($src.Height * $scale)
  $alpha = Test-UsesAlpha $src

  $fmt = if ($alpha) { [System.Drawing.Imaging.PixelFormat]::Format32bppArgb } else { [System.Drawing.Imaging.PixelFormat]::Format24bppRgb }
  $dst = New-Object System.Drawing.Bitmap $w, $h, $fmt
  $g = [System.Drawing.Graphics]::FromImage($dst)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  if (-not $alpha) { $g.Clear([System.Drawing.Color]::White) }
  $g.DrawImage($src, 0, 0, $w, $h)
  $g.Dispose()
  $src.Dispose()

  if ($alpha) {
    $relOut = [IO.Path]::ChangeExtension($rel, '.png')
    $dest = Join-Path $imgOut $relOut
    New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
    $dst.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
  } else {
    $relOut = [IO.Path]::ChangeExtension($rel, '.jpg')
    $dest = Join-Path $imgOut $relOut
    New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
    $dst.Save($dest, $jpegCodec, $encParams)
  }
  $dst.Dispose()
  $manifest.Add("assets/img/$($relOut -replace '\\','/'),$w,$h,$((Get-Item $dest).Length)")
}

$manifest | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot 'asset-manifest.csv')
"Wrote $($manifest.Count - 1) assets"
