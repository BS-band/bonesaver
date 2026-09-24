param(
    [ValidateRange(1024, 65535)][int]$Port = 4174,
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
    throw 'Node.js is required. Install Node.js 20 or newer, then run this command again.'
}
& $nodeCommand.Source (Join-Path $PSScriptRoot 'preview.mjs') --port $Port --root $Root
