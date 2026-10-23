param([switch]$SkipApply)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$backupRoot = $null
$backupConfig = $null
try {
    $package = Split-Path -Parent $MyInvocation.MyCommand.Path
    $manifestFile = Join-Path $package 'manifest.json'
    if (!(Test-Path -LiteralPath $manifestFile -PathType Leaf)) { throw 'manifest.json is missing.' }
    $manifest = Get-Content -LiteralPath $manifestFile -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($manifest.name -cne 'Spot64' -or @($manifest.extensions).Count -ne 8) { throw 'Unexpected release manifest.' }
    if (!(Get-Command spicetify -ErrorAction SilentlyContinue)) {
        throw 'Spicetify CLI is not available. Install it first from https://spicetify.app/docs/getting-started.'
    }
    if ([string]::IsNullOrWhiteSpace($env:APPDATA)) { throw 'Windows APPDATA path not found.' }
    $spicetifyDir = Join-Path $env:APPDATA 'spicetify'
    $configFile = Join-Path $spicetifyDir 'config-xpui.ini'
    $extensionsDir = Join-Path $spicetifyDir 'Extensions'
    if (!(Test-Path -LiteralPath $configFile -PathType Leaf)) { throw "Spicetify config not found at $configFile. Run 'spicetify' first." }
    if (!(Test-Path -LiteralPath $extensionsDir -PathType Container)) { New-Item -ItemType Directory -Path $extensionsDir -Force | Out-Null }
    $signatures = @{
        'spot64Core.js'='const ID = ''tm-root'';'
        'spot64Customize.js'='const KEY = ''spot64.customize.v1'';'
        'spot64TerminalThemes.js'='spot64-terminal-themes-style'
        'spot64PlaybackLibrary.js'='__spot64PlaybackLibraryLoaded'
        'spot64NowPlayingInfo.js'='__spot64NowPlayingInfoLoaded'
        'spot64Artwork.js'='asciiStudioFactory'
        'spot64AnsiBackground.js'='const LINES = ['
        'spot64Dither.js'='__spot64DitherExtensionLoaded'
    }
    $targets = @()
    foreach ($entry in $manifest.extensions) {
        $name = [string]$entry.name
        if (!$signatures.ContainsKey($name) -or $name -notmatch '^[\w-]+\.js$') { throw "Unrecognized extension in manifest: $name" }
        $sourcePath = Join-Path (Join-Path $package 'Extensions') $name
        if (!(Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing payload: $name" }
        $sourceHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($sourceHash -cne [string]$entry.sha256) { throw "Source integrity verification failed: $name" }
        $target = Join-Path $extensionsDir $name
        $exists = Test-Path -LiteralPath $target -PathType Leaf
        if ($exists -and !([IO.File]::ReadAllText($target).Contains($signatures[$name]))) {
            throw "File collision at $target. Refusing to replace an unrelated extension."
        }
        $previousHash = if ($exists) { (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant() } else { $null }
        $targets += [pscustomobject]@{ name=$name; source=$sourcePath; target=$target; existed=$exists; originalHash=$previousHash; installedHash=$sourceHash; backup=$null }
    }
    $configText = [IO.File]::ReadAllText($configFile)
    $configMatch = [regex]::Match($configText, '(?im)^\s*extensions\s*=\s*([^\r\n]*)')
    $configured = @()
    if ($configMatch.Success) {
        $configured = @($configMatch.Groups[1].Value -split '[|,\s]+' | Where-Object { $_.Trim() -ne '' })
    }
    $canonical = @($targets | ForEach-Object { $_.name })
    $legacyRegistrations = @()
    foreach ($alias in $configured) {
        if ($canonical -contains $alias -or $alias -notmatch '^(?i:(?:spot64|terminalMinimal)[\w.()-]*)\.js$') { continue }
        $legacyFile = Join-Path $extensionsDir $alias
        if (!(Test-Path -LiteralPath $legacyFile -PathType Leaf)) { continue }
        $legacySource = [IO.File]::ReadAllText($legacyFile)
        $owned = $false
        foreach ($signature in $signatures.Values) {
            if ($legacySource.Contains([string]$signature)) { $owned = $true; break }
        }
        if ($alias -ieq 'spot64CoverToggle.js' -and $legacySource.Contains('tm-visualizer.tm-char-wave')) { $owned = $true }
        if ($owned -and $legacyRegistrations -notcontains $alias) { $legacyRegistrations += $alias }
    }
    $stamp = (Get-Date -Format 'yyyyMMdd-HHmmss-fff') + '-' + [guid]::NewGuid().ToString('N').Substring(0,8)
    $backupRoot = Join-Path (Join-Path $spicetifyDir 'spot64-backups') $stamp
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
    $backupConfig = Join-Path $backupRoot 'config-xpui.ini.before'
    Copy-Item -LiteralPath $configFile -Destination $backupConfig
    $originalConfigHash = (Get-FileHash -LiteralPath $configFile -Algorithm SHA256).Hash.ToLowerInvariant()
    if ((Get-FileHash -LiteralPath $backupConfig -Algorithm SHA256).Hash.ToLowerInvariant() -cne $originalConfigHash) { throw 'Config backup failed integrity check.' }
    for ($i=0;$i -lt $targets.Count;$i++) {
        $entry=$targets[$i]
        if ($entry.existed) {
            $backup = Join-Path $backupRoot ('old-' + $i + '-' + [IO.Path]::GetFileName($entry.target) + '.bak')
            Copy-Item -LiteralPath $entry.target -Destination $backup
            if ((Get-FileHash -LiteralPath $backup -Algorithm SHA256).Hash.ToLowerInvariant() -cne $entry.originalHash) { throw "Backup verification failed: $($entry.name)" }
            $entry.backup=$backup
        }
    }
    foreach ($alias in $legacyRegistrations) {
        & spicetify config extensions ($alias + '-')
        if ($LASTEXITCODE -ne 0) { throw "Unable to unregister previous Spot64 extension: $alias" }
    }
    foreach ($entry in $targets) {
        if ($entry.originalHash -cne $entry.installedHash) {
            $tmp = Join-Path $extensionsDir ('.spot64-stage-' + [guid]::NewGuid().ToString('N') + '.tmp')
            Copy-Item -LiteralPath $entry.source -Destination $tmp
            if ((Get-FileHash -LiteralPath $tmp -Algorithm SHA256).Hash.ToLowerInvariant() -cne $entry.installedHash) { Remove-Item -LiteralPath $tmp -Force; throw "Staged file verification failed: $($entry.name)" }
            Move-Item -LiteralPath $tmp -Destination $entry.target -Force
        }
    }
    foreach ($entry in $targets) {
        $ini = [IO.File]::ReadAllText($configFile)
        $match = [regex]::Match($ini, '(?im)^\s*extensions\s*=\s*([^\r\n]*)')
        $configured = @()
        if ($match.Success) { $configured = @($match.Groups[1].Value -split '[|, ]+' | Where-Object { $_.Trim() -ne '' }) }
        $base = [IO.Path]::GetFileName($entry.target)
        if ($configured -notcontains $base) {
            & spicetify config extensions $base
            if ($LASTEXITCODE -ne 0) { throw "Unable to register Spicetify extension: $base" }
        }
    }
    foreach ($entry in $targets) {
        if ((Get-FileHash -LiteralPath $entry.target -Algorithm SHA256).Hash.ToLowerInvariant() -cne $entry.installedHash) { throw "Final hash mismatch: $($entry.name)" }
    }
    Write-Host "Spot64 sources verified and installed ($($targets.Count) extensions)." -ForegroundColor Green
    if ($legacyRegistrations.Count) { Write-Host "Disabled older Spot64 registrations: $($legacyRegistrations -join ', ')" }
    Write-Host "Persistent backup: $backupRoot"
    if (!$SkipApply) {
        & spicetify apply
        if ($LASTEXITCODE -ne 0) { throw 'Spicetify apply did not complete successfully. Files and config have been restored where possible.' }
    } else { Write-Host 'SkipApply selected. Run spicetify apply when ready.' }
    $installedConfigHash=(Get-FileHash -LiteralPath $configFile -Algorithm SHA256).Hash.ToLowerInvariant()
    $receipt = [pscustomobject]@{
        version=$manifest.version; installedAt=(Get-Date -Format o)
        configFile=$configFile; configBackup=$backupConfig
        originalConfigHash=$originalConfigHash; installedConfigHash=$installedConfigHash
        files=$targets
    }
    $receipt | ConvertTo-Json -Depth 7 | Set-Content -LiteralPath (Join-Path $backupRoot 'receipt.json') -Encoding UTF8
    Write-Host 'Spot64 V1.0 installation complete.' -ForegroundColor Green
    exit 0
} catch {
    Write-Warning "Spot64 install stopped: $($_.Exception.Message)"
    if ($backupRoot -and (Test-Path -LiteralPath $backupRoot)) {
        foreach ($entry in $targets) {
            try {
                if ($entry.existed -and $entry.backup -and (Test-Path -LiteralPath $entry.backup)) {
                    Copy-Item -LiteralPath $entry.backup -Destination $entry.target -Force
                } elseif (!$entry.existed -and (Test-Path -LiteralPath $entry.target)) {
                    if ((Get-FileHash -LiteralPath $entry.target -Algorithm SHA256).Hash.ToLowerInvariant() -ceq $entry.installedHash) {
                        Remove-Item -LiteralPath $entry.target -Force
                    }
                }
            } catch { Write-Warning "Could not auto-restore $($entry.target): $_" }
        }
        if ($backupConfig -and (Test-Path -LiteralPath $backupConfig)) {
            try { Copy-Item -LiteralPath $backupConfig -Destination $configFile -Force }
            catch { Write-Warning "Could not restore config: $_" }
        }
        Write-Warning "Backup files retained: $backupRoot"
    }
    exit 1
}
