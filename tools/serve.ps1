<#
  Minimal static file server for local preview (no Node/Python needed).
  Usage: powershell -ExecutionPolicy Bypass -File tools\serve.ps1 [-Port 5173] [-Root <folder>]
  Supports HTTP Range requests so video seeking works.
#>
param(
  [int]$Port = 5173,
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  # Dev only: accept POST /__poster?name=<slug> (JPEG body) and save to assets/img/posters/<slug>.jpg.
  # Used by tools/capture-posters.html to grab video frames as poster images.
  [switch]$AllowPosterUpload
)

$Root = (Get-Item $Root).FullName
$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'
  '.gif' = 'image/gif'; '.webp' = 'image/webp'; '.mp4' = 'video/mp4'; '.ico' = 'image/x-icon'; '.txt' = 'text/plain; charset=utf-8'
  '.xml' = 'application/xml'; '.woff2' = 'font/woff2'; '.md' = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root at http://localhost:$Port/"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response
  try {
    if ($AllowPosterUpload -and $req.HttpMethod -eq 'POST' -and $req.Url.AbsolutePath -eq '/__poster') {
      $name = $req.QueryString['name']
      if ($name -notmatch '^[a-z0-9-]{1,60}$') { $res.StatusCode = 400; continue }
      $dir = Join-Path $Root 'assets\img\posters'
      New-Item -ItemType Directory -Force $dir | Out-Null
      $fs = [IO.File]::Create((Join-Path $dir "$name.jpg"))
      try { $req.InputStream.CopyTo($fs) } finally { $fs.Dispose() }
      $res.StatusCode = 204
      Write-Host "poster saved: $name"
      continue
    }
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
    if ($path -eq '' -or $path.EndsWith('/')) { $path += 'index.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $Root $path))
    if (-not $file.StartsWith($Root) -or -not (Test-Path $file -PathType Leaf)) {
      $res.StatusCode = 404
      $notFound = Join-Path $Root '404.html'
      if (Test-Path $notFound) {
        $bytes = [IO.File]::ReadAllBytes($notFound)
        $res.ContentType = 'text/html; charset=utf-8'
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      }
      Write-Host "404 /$path"
    } else {
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $res.Headers.Add('Accept-Ranges', 'bytes')
      $res.Headers.Add('Cache-Control', 'no-cache')
      $fs = [IO.File]::OpenRead($file)
      try {
        $len = $fs.Length
        $start = 0; $end = $len - 1
        $range = $req.Headers['Range']
        if ($range -match 'bytes=(\d*)-(\d*)') {
          if ($matches[1] -ne '') { $start = [int64]$matches[1] }
          if ($matches[1] -eq '' -and $matches[2] -ne '') { $start = [Math]::Max(0, $len - [int64]$matches[2]) }
          elseif ($matches[2] -ne '') { $end = [Math]::Min([int64]$matches[2], $len - 1) }
          # Single-threaded server: serve open-ended ranges in 2 MB chunks so one video can't block other requests.
          else { $end = [Math]::Min($start + 2MB - 1, $len - 1) }
          $res.StatusCode = 206
          $res.Headers.Add('Content-Range', "bytes $start-$end/$len")
        }
        $count = $end - $start + 1
        $res.ContentLength64 = $count
        if ($req.HttpMethod -ne 'HEAD') {
          $fs.Seek($start, 'Begin') | Out-Null
          $buf = New-Object byte[] 65536
          $remaining = $count
          while ($remaining -gt 0) {
            $n = $fs.Read($buf, 0, [Math]::Min($buf.Length, $remaining))
            if ($n -le 0) { break }
            $res.OutputStream.Write($buf, 0, $n)
            $remaining -= $n
          }
        }
      } finally { $fs.Dispose() }
    }
  } catch {
    # Client aborted (e.g. video seek) — ignore.
  } finally {
    try { $res.OutputStream.Close() } catch {}
  }
}
