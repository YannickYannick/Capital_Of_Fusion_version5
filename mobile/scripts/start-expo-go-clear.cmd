@echo off
REM Metro + Expo Go sur LAN — cache vide. Scanne le QR avec Expo Go (meme Wi-Fi).
set PORT=%1
if "%PORT%"=="" set PORT=8086

cd /d "%~dp0.."

echo [pbvf] Nettoyage caches (.expo, node_modules\.cache)...
if exist ".expo" rmdir /s /q ".expo"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

echo [pbvf] Demarrage Expo --clear (lan:%PORT%)...
echo [pbvf] Expo Go : scan QR ou entrer exp://IP_DU_PC:%PORT%
echo [pbvf] Raccourcis Metro : r = reload, Shift+R = reload + cache, touche c = QR
npx expo start --clear --host lan --port %PORT%
