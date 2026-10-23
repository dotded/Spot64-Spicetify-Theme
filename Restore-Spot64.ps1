param([switch]$SkipApply)
$ErrorActionPreference = 'Stop'
try {
    $base = Join-Path (Join-Path $env:APPDATA 'spicetify') 'spot64-backups'
    if (!(Test-Path -LiteralPath $base -PathType Container)) { throw 'No Spot64 backups were found.' }
    $receipts=@(Get-ChildItem -LiteralPath $base -Filter receipt.json -File -Recurse | Sort-Object LastWriteTime -Descending)
    if (!$receipts.Count) { throw 'No completed Spot64 installation receipt exists.' }
    $receiptPath=$receipts[0].FullName
    $r=Get-Content -LiteralPath $receiptPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $config=$r.configFile
    if (!(Test-Path -LiteralPath $config)) { throw 'Spicetify config is missing.' }
    $currentConfigHash=(Get-FileHash -LiteralPath $config -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($currentConfigHash -cne $r.installedConfigHash) { throw 'Spicetify config was changed after installation. Refusing to overwrite it. Restore manually from the backup.' }
    if (!(Test-Path -LiteralPath $r.configBackup)) { throw 'Original config backup is missing.' }
    foreach ($f in $r.files) {
        if (!(Test-Path -LiteralPath $f.target)) { throw "Installed file missing: $($f.target)" }
        if ((Get-FileHash -LiteralPath $f.target -Algorithm SHA256).Hash.ToLowerInvariant() -cne $f.installedHash) {
            throw "Extension changed after installation: $($f.target). Refusing to overwrite it."
        }
        if ($f.existed -and (!(Test-Path -LiteralPath $f.backup) -or (Get-FileHash -LiteralPath $f.backup -Algorithm SHA256).Hash.ToLowerInvariant() -cne $f.originalHash)) {
            throw "Original extension backup missing or corrupted: $($f.target)"
        }
    }
    foreach ($f in $r.files) {
        if ($f.existed) { Copy-Item -LiteralPath $f.backup -Destination $f.target -Force }
        else { Remove-Item -LiteralPath $f.target -Force }
    }
    Copy-Item -LiteralPath $r.configBackup -Destination $config -Force
    if ((Get-FileHash -LiteralPath $config -Algorithm SHA256).Hash.ToLowerInvariant() -cne $r.originalConfigHash) { throw 'Config restoration verification failed.' }
    Move-Item -LiteralPath $receiptPath -Destination (Join-Path (Split-Path $receiptPath -Parent) 'receipt.restored.json') -Force
    Write-Host 'Previous Spot64 files and Spicetify config restored. Backups retained.' -ForegroundColor Green
    if (!$SkipApply) {
        if (!(Get-Command spicetify -ErrorAction SilentlyContinue)) { throw 'Spicetify CLI missing; run spicetify apply manually.' }
        & spicetify apply
        if ($LASTEXITCODE -ne 0) { throw 'Previous files were restored, but Spicetify apply failed.' }
    }
    exit 0
} catch {
    Write-Error "Spot64 restore stopped: $($_.Exception.Message)"
    exit 1
}
