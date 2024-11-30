@echo off
echo Iniciando o servidor de desenvolvimento...
cd /d "%~dp0"
start http://localhost:3000
npm run dev
