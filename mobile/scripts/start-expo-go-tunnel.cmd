@echo off
REM Expo Go via tunnel ngrok — telephone hors Wi-Fi PC (4G / autre reseau).
set PORT=%1
if "%PORT%"=="" set PORT=8086

cd /d "%~dp0.."

echo [pbvf] Nettoyage caches (.expo, node_modules\.cache)...
if exist ".expo" rmdir /s /q ".expo"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

echo [pbvf] Verification @expo/ngrok (local, pas global — evite bug Windows)...
call npm install @expo/ngrok@^4.1.3 --no-fund --no-audit
if errorlevel 1 (
  echo [pbvf] Echec npm install @expo/ngrok
  exit /b 1
)

echo [pbvf] Demarrage Expo --tunnel --clear (port %PORT%)...
echo [pbvf] Scan le QR dans Expo Go. Tunnel = pas besoin du meme Wi-Fi.
echo [pbvf] Si Expo demande "install globally", reponds NON — le paquet est deja local.
npx expo start --clear --tunnel --port %PORT%
