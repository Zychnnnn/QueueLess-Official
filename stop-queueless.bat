@echo off
echo Stopping QueueLess background processes...
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*node*' } | Stop-Process -Force"
echo QueueLess stopped.
timeout /t 2 >nul
