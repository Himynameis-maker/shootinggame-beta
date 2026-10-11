@echo off
rem Makes context.md for AI. Usage: make-context.bat  /  make-context.bat -Include js/content,js/lang  /  make-context.bat -Copy
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\make-context.ps1" %*
if "%~1"=="" pause
