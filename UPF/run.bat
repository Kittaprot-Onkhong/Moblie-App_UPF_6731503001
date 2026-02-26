@echo off
set PATH=%PATH%;C:\Program Files\nodejs
cd /d "%~dp0"
if exist .expo rmdir /s /q .expo
npm start
pause
