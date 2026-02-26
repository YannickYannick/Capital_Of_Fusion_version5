# Script diagnostic systeme - a executer puis supprimer
$ErrorActionPreference = 'SilentlyContinue'

Write-Host "=== ESPACE DISQUE ==="
Get-CimInstance Win32_LogicalDisk | ForEach-Object {
    $freeGB = [math]::Round($_.FreeSpace/1GB, 2)
    $totalGB = [math]::Round($_.Size/1GB, 2)
    Write-Host "$($_.DeviceID) Libre: $freeGB Go / Total: $totalGB Go"
}

Write-Host "`n=== RAM ==="
$cs = Get-CimInstance Win32_ComputerSystem
$ramGB = [math]::Round($cs.TotalPhysicalMemory/1GB, 2)
Write-Host "Total RAM: $ramGB Go"
Write-Host "Manufacturer: $($cs.Manufacturer) Model: $($cs.Model)"
Get-CimInstance Win32_PhysicalMemory | Select-Object Manufacturer, Capacity, Speed, DeviceLocator | Format-Table -AutoSize

Write-Host "`n=== PERIPHERIQUES EN ERREUR ==="
Get-PnpDevice | Where-Object { $_.ConfigManagerErrorCode -ne 0 } | Select-Object Status, Class, FriendlyName | Format-Table -Wrap -AutoSize

Write-Host "`n=== PILOTES ASUS / ARMOURY / INTEL AUDIO ==="
Get-WmiObject Win32_PnPSignedDriver | Where-Object { $_.DeviceName -match 'ASUS|Armoury|ROG|Intel.*Audio|Aura' } | Select-Object DeviceName, DriverVersion | Format-Table -Wrap -AutoSize

Write-Host "`n=== TEMPERATURE / ALIMENTATION (si dispo) ==="
Get-CimInstance MSAcpi_ThermalZoneTemperature -Namespace root/wmi -ErrorAction SilentlyContinue | Select-Object InstanceName, CurrentTemperature

Write-Host "`n=== SERVICES ASUS / ARMOURY (etat) ==="
Get-Service | Where-Object { $_.Name -match 'ASUS|Armoury|ROG|Aura' } | Select-Object Name, Status, StartType | Format-Table -AutoSize

Write-Host "`n=== FIN DIAGNOSTIC ==="
