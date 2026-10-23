$ErrorActionPreference='Stop'
try {
    $dir=Join-Path (Join-Path $env:APPDATA 'spicetify') 'Extensions'
    if (!(Test-Path -LiteralPath $dir -PathType Container)) { throw 'Spicetify Extensions folder not found.' }
    $markers=@('const ID = ''tm-root'';','const KEY = ''spot64.customize.v1'';','spot64-terminal-themes-style',
      '__spot64PlaybackLibraryLoaded','__spot64NowPlayingInfoLoaded','asciiStudioFactory',
      'const LINES = [','tm-cover-toggle-image','__spot64DitherExtensionLoaded')
    $temp=Join-Path ([IO.Path]::GetTempPath()) ('spot64-snapshot-'+[guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $temp -Force | Out-Null
    $selected=@()
    try {
        foreach($f in Get-ChildItem -LiteralPath $dir -Filter '*.js' -File) {
            $src=[IO.File]::ReadAllText($f.FullName)
            if (@($markers | Where-Object { $src.Contains($_) }).Count -gt 0) {
                Copy-Item -LiteralPath $f.FullName -Destination (Join-Path $temp $f.Name)
                $selected += [pscustomobject]@{file=$f.Name;sha256=(Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
            }
        }
        if($selected.Count -eq 0){throw 'No Spot64 JS extensions identified.'}
        $selected | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $temp 'file-hashes.json') -Encoding UTF8
        $destination=Join-Path (Join-Path $env:USERPROFILE 'Downloads') ('Spot64-Installed-Snapshot-'+(Get-Date -Format 'yyyyMMdd-HHmmss')+'.zip')
        Compress-Archive -Path (Join-Path $temp '*') -DestinationPath $destination -CompressionLevel Optimal
        Write-Host "Saved Spot64 source snapshot ($($selected.Count) files): $destination" -ForegroundColor Green
        Write-Host 'Review the ZIP before sharing; it includes extension source code, but not Spicetify config or Spotify localStorage.'
    } finally {Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue}
} catch { Write-Error "Spot64 snapshot failed: $($_.Exception.Message)";exit 1 }
