$ErrorActionPreference = "Stop"

$node = "C:\Users\24742\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$npm = Join-Path $PSScriptRoot ".tools\npm\bin\npm-cli.js"
$vite = Join-Path $PSScriptRoot "node_modules\vite\bin\vite.js"
if (-not (Test-Path -LiteralPath $node)) {
  throw "Node runtime not found: $node"
}

if (-not (Test-Path -LiteralPath $npm)) {
  throw "npm cli not found: $npm"
}

if (-not (Test-Path -LiteralPath $vite)) {
  throw "Vite entry not found: $vite"
}

$existing = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue |
  Where-Object { $_.State -eq "Listen" } |
  Select-Object -First 1

if ($existing) {
  Write-Host "Vite is already listening on http://localhost:5173/"
  exit 0
}

Write-Host "Starting Vite on http://localhost:5173/"
Write-Host "Keep this window open while previewing the site."
& $node $vite --host 0.0.0.0 --port 5173 --strictPort
