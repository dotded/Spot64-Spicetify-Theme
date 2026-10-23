$ErrorActionPreference = 'Stop'
$release = 'V1.0'
$archive = "https://github.com/dotded/Spot64-Spicetify-Theme/archive/refs/tags/$release.zip"
$tmp = Join-Path ([IO.Path]::GetTempPath()) ('spot64-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
try {
  $zipPath = Join-Path $tmp 'spot64.zip'
  Invoke-WebRequest -UseBasicParsing -Uri $archive -OutFile $zipPath
  Expand-Archive -LiteralPath $zipPath -DestinationPath $tmp -Force
  $install=Get-ChildItem -LiteralPath $tmp -Recurse -File -Filter 'Install-Spot64.ps1' | Where-Object {$_.Directory.Name -like 'spot64-*'} | Select-Object -First 1
  if(-not $install){throw 'Spot64 installer missing from release archive.'}
  & $install.FullName
  if($LASTEXITCODE -ne 0){throw 'Spot64 installer failed. See output above.'}
} finally {
  Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
