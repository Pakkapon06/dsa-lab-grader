$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = if ($env:GRADER_PORT) { $env:GRADER_PORT } else { "5599" }
Write-Host "Starting Lab Grader on http://localhost:$port ..." -ForegroundColor Cyan
Start-Process "http://localhost:$port"
node "$here\server.js"
