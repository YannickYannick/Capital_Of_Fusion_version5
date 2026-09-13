@echo off
REM Vide caches Metro / Expo puis relance sur emulateur (port 8086).
set PORT=%1
if "%PORT%"=="" set PORT=8086

cd /d "%~dp0.."

echo [pbvf] Nettoyage caches (.expo, node_modules\.cache)...
if exist ".expo" rmdir /s /q ".expo"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

echo [pbvf] adb reverse tcp:%PORT% tcp:%PORT%
adb reverse tcp:%PORT% tcp:%PORT%

echo [pbvf] Demarrage Expo --clear (lan:%PORT%)...
echo [pbvf] Raccourcis Metro : r = reload, Shift+R = reload + cache
npx expo start --clear --android --host lan --port %PORT%
