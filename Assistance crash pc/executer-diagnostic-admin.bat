@echo off
:: Executer en clic-droit ^> Executer en tant qu'administrateur
title Diagnostic systeme (Admin)
echo.
echo === 1/3 sfc /scannow (verification des fichiers systeme) ===
echo Cela peut prendre 5 a 15 minutes...
echo.
sfc /scannow
echo.
echo === 2/3 DISM RestoreHealth (reparation image Windows) ===
echo Cela peut prendre 10 a 20 minutes...
echo.
DISM /Online /Cleanup-Image /RestoreHealth
echo.
echo === 3/3 chkdsk C: /scan (verification disque, sans redemarrage) ===
chkdsk C: /scan
echo.
echo === Termine ===
echo.
pause
