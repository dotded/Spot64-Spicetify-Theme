param([switch]$IncludeReleaseTag)
$ErrorActionPreference = 'Stop'
$repo='dotded/Spot64-Spicetify-Theme'
$here=Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $here
try {
    foreach ($command in @('git','gh','node')) {
        if (!(Get-Command $command -ErrorAction SilentlyContinue)) { throw "Required command '$command' is unavailable." }
    }
    & gh auth status
    if ($LASTEXITCODE -ne 0) { throw 'Sign in using gh auth login first.' }
    & node (Join-Path $here 'tests/check-sources.js')
    if ($LASTEXITCODE -ne 0) { throw 'Source integrity check failed.' }
    & node (Join-Path $here 'tests/check-signatures.js')
    if ($LASTEXITCODE -ne 0) { throw 'Extension signature check failed.' }
    if (!(Test-Path -LiteralPath '.git')) { & git init -b main; if($LASTEXITCODE -ne 0){throw 'git init failed.'} }
    & git add --all
    if($LASTEXITCODE -ne 0){throw 'git add failed.'}
    & git diff --cached --quiet
    if ($LASTEXITCODE -gt 1) { throw 'Unable to inspect staged Git changes.' }
    if ($LASTEXITCODE -eq 1) {
        & git -c user.name='Spot64 release preparation' -c user.email='spot64-release@users.noreply.github.com' commit -m 'Prepare Spot64 V1.0'
        if($LASTEXITCODE -ne 0){throw 'git commit failed.'}
    }
    & gh repo view $repo --json name --jq .name 2>$null
    $exists = $LASTEXITCODE -eq 0
    if (!$exists) {
        & gh repo create $repo --private --source . --remote origin --push
        if ($LASTEXITCODE -ne 0) { throw 'Failed to create or upload the private GitHub repository.' }
    } else {
        $remotes = & git remote
        if ($remotes -notcontains 'origin') { & git remote add origin "https://github.com/$repo.git" }
        & git push -u origin HEAD:main
        if ($LASTEXITCODE -ne 0) { throw 'Push rejected. Review the remote repository before retrying.' }
    }
    if ($IncludeReleaseTag) {
        throw 'The V1.0 tag requires successful Windows and Spotify regression tests.'
    }
    Write-Host "Private repository uploaded: https://github.com/$repo" -ForegroundColor Green
} finally { Pop-Location }
