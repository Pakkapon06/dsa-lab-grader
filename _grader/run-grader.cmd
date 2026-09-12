@echo off
setlocal
set "PORT=5599"
if not "%GRADER_PORT%"=="" set "PORT=%GRADER_PORT%"
echo Starting Lab Grader on http://localhost:%PORT% ...
start "" "http://localhost:%PORT%"
node "%~dp0server.js"
pause
