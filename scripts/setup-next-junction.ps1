# setup-next-junction.ps1
# Creates an NTFS junction from .next (inside the OneDrive project folder) to
# $env:LOCALAPPDATA\project-01-next (outside OneDrive) so that Next.js build
# output is never touched by OneDrive's cloud-offloading, eliminating the
# ENOENT / file-locking errors during 'Collecting build traces'.

$target = Join-Path $env:LOCALAPPDATA 'project-01-next'

# $PSScriptRoot = scripts/ — go up one level to project root
$projectRoot = Split-Path $PSScriptRoot -Parent
$link = Join-Path $projectRoot '.next'

# 1. Ensure the target directory exists
if (-not (Test-Path $target)) {
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    Write-Host "[junction] Created target: $target"
}

# 2. Remove existing .next only if it is NOT already the correct junction
if (Test-Path $link -PathType Any) {
    $item = Get-Item $link -Force
    $isJunction = ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0

    if ($isJunction) {
        # Read the junction target via cmd fsutil
        $info = cmd /c "fsutil reparsepoint query `"$link`"" 2>&1 | Where-Object { $_ -match 'Print Name' }
        if ($info -match [regex]::Escape($target)) {
            Write-Host "[junction] Already correct: $link -> $target"
            exit 0
        }
        # Wrong target — remove it
        cmd /c "rmdir `"$link`"" | Out-Null
    } else {
        # It's a real directory — remove it
        Remove-Item -Recurse -Force $link
    }
}

# 3. Create the junction
$result = cmd /c "mklink /J `"$link`" `"$target`"" 2>&1
Write-Host "[junction] $result"
