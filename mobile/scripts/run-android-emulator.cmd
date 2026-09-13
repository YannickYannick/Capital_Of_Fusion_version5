@echo off
REM Emulateur Android : Metro doit ecouter sur 0.0.0.0 (--host lan).
REM L'emulateur atteint le PC via 10.0.2.2 (alias host) ou adb reverse + 127.0.0.1.
set PORT=%1
if "%PORT%"=="" set PORT=8086

echo [pbvf] adb reverse tcp:%PORT% tcp:%PORT%
adb reverse tcp:%PORT% tcp:%PORT%

echo [pbvf] Demarrage Expo (lan:%PORT%)...
npx expo start --clear --android --host lan --port %PORT%
