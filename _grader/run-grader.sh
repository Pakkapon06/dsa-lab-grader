#!/usr/bin/env bash
cd "$(dirname "$0")"
PORT="${GRADER_PORT:-5599}"
echo "Starting Lab Grader on http://localhost:$PORT ..."
if command -v xdg-open >/dev/null 2>&1; then xdg-open "http://localhost:$PORT" >/dev/null 2>&1 &
elif command -v open >/dev/null 2>&1; then open "http://localhost:$PORT" >/dev/null 2>&1 &
fi
node server.js
