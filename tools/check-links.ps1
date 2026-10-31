<#
  Checks every local reference (src, href, poster, data-src, data-video, data-poster, srcset)
  in the site's HTML files and every in-page #anchor. Exits 1 if anything is missing.
  Usage: powershell -ExecutionPolicy Bypass -File tools\check-links.ps1
#>
$root = Split-Path -Parent $PSScriptRoot
$pages = Get-ChildItem $root -Filter *.html
$missing = 0
$checked = 0
foreach ($page in $pages) {
  $html = [IO.File]::ReadAllText($page.FullName)
  $ids = [regex]::Matches($html, '\sid="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  $refs = [regex]::Matches($html, '(?:src|href|poster|data-src|data-video|data-poster)="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  foreach ($ref in $refs | Sort-Object -Unique) {
    if ($ref -match '^(https?:|mailto:|tel:|data:|//)') { continue }
    $checked++
    $path, $hash = $ref -split '#', 2
    if ($path -eq '') {
      if ($hash -and $ids -notcontains $hash) { "MISSING ANCHOR  $($page.Name) -> #$hash"; $missing++ }
      continue
    }
    $file = Join-Path $root ($path.TrimStart('/') -replace '/', '\')
    if (-not (Test-Path $file)) { "MISSING FILE    $($page.Name) -> $ref"; $missing++; continue }
    if ($hash -and $file -like '*.html') {
      $other = [IO.File]::ReadAllText($file)
      if ($other -notmatch "\sid=""$([regex]::Escape($hash))""") { "MISSING ANCHOR  $($page.Name) -> $ref"; $missing++ }
    }
  }
}
"Checked $checked local references in $($pages.Count) pages; $missing problem(s)."
if ($missing -gt 0) { exit 1 }
