<# 
 Script : maj-asus-drivers.ps1
 Objet  : 
   1) Faire un inventaire des pilotes/firmwares ASUS / Armoury / ROG / Intel Audio
   2) Lancer, un par un, les installateurs placés dans C:\DriversASUS\

 Utilisation :
   - Ouvrir PowerShell en tant qu'ADMINISTRATEUR
   - Exécuter :
       powershell -ExecutionPolicy Bypass -File "C:\Users\yannb\Documents\1. Programmation\3. Bachata\Projet - site bachata V5\maj-asus-drivers.ps1"

 Prérequis :
   - Créer le dossier C:\DriversASUS\
   - Y déposer les installateurs téléchargés depuis le site ASUS (G814PP) :
       * Chipset, System Control Interface, Audio, Armoury Crate, etc.
   - Laisser de préférence les mises à jour BIOS à part (le script les liste mais NE les lance PAS automatiquement).
#>

param(
    [string]$DriversFolder = "C:\DriversASUS"
)

Write-Host "=== MAJ PILOTES ASUS / ARMOURY (G814PP) ===" -ForegroundColor Cyan

# 1. Vérification des droits administrateur
$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Ce script doit etre execute dans une console PowerShell **Administrateur**."
    Write-Warning "Clique droit sur l'icône PowerShell -> 'Executer en tant qu'administrateur', puis relance ce script."
    exit 1
}

# 2. Préparation dossier et log
if (-not (Test-Path $DriversFolder)) {
    Write-Host "Le dossier $DriversFolder n'existe pas. Creation..." -ForegroundColor Yellow
    New-Item -Path $DriversFolder -ItemType Directory | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath  = Join-Path $DriversFolder "maj-asus-drivers-$timestamp.log"

function Write-Log {
    param(
        [string]$Message
    )
    $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
    $line | Out-File -FilePath $logPath -Encoding UTF8 -Append
    Write-Host $Message
}

Write-Log "=== Debut script maj-asus-drivers.ps1 ==="
Write-Log "Dossier installateurs : $DriversFolder"

# 3. Inventaire des pilotes ASUS / Armoury / ROG / Intel Audio
Write-Log "Inventaire des pilotes ASUS / Armoury / ROG / Intel Audio en cours..."

try {
    $drivers = Get-WmiObject Win32_PnPSignedDriver |
        Where-Object {
            $_.DeviceName -match 'ASUS|Armoury|ROG|System Control|Precision Touchpad|Aura' -or
            $_.Manufacturer -match 'ASUSTeK|ASUS' -or
            $_.DeviceName -match 'Intel.*Audio'
        } |
        Select-Object DeviceName, DriverVersion, Manufacturer, DriverDate

    if ($drivers) {
        Write-Log "Pilotes trouves :"
        $drivers |
            Sort-Object DeviceName |
            ForEach-Object {
                Write-Log ("  - {0} | version {1} | {2} | date {3}" -f $_.DeviceName, $_.DriverVersion, $_.Manufacturer, $_.DriverDate)
            }
    }
    else {
        Write-Log "Aucun pilote ASUS/ROG/Armoury/Intel Audio n'a ete trouve via Win32_PnPSignedDriver."
    }
}
catch {
    Write-Log "ERREUR lors de la recuperation des pilotes : $_"
}

Write-Host ""

# 4. Recherche des installateurs dans C:\DriversASUS
Write-Log "Scan du dossier $DriversFolder pour trouver des installateurs (.exe / .msi)..."

$allInstallers = Get-ChildItem -Path $DriversFolder -File -Recurse -Include *.exe, *.msi -ErrorAction SilentlyContinue

if (-not $allInstallers) {
    Write-Log "Aucun installateur (.exe / .msi) trouve dans $DriversFolder."
    Write-Host "Depose tes fichiers telecharges depuis le site ASUS dans $DriversFolder puis relance le script." -ForegroundColor Yellow
    Write-Log "=== Fin script (aucun installateur) ==="
    exit 0
}

# On isole les potentiels BIOS/UEFI pour ne PAS les lancer automatiquement
$biosPatterns = 'BIOS', 'UEFI', '\.CAP'
$biosInstallers = $allInstallers | Where-Object { $biosPatterns | ForEach-Object { $_ } | Where-Object { $_ -and ($_.Length -gt 0) -and ($_.GetType().Name -eq 'String') -and ($_.ToString() -ne '') } | Out-Null }
$biosInstallers = $allInstallers | Where-Object { $_.Name -match 'BIOS|UEFI|\.CAP' }
$otherInstallers = $allInstallers | Where-Object { $biosInstallers -notcontains $_ }

Write-Host "Installateurs trouves dans $DriversFolder :" -ForegroundColor Green
Write-Host ""

if ($biosInstallers) {
    Write-Host "  [ATTENTION] Fichiers BIOS/UEFI detectes (a lancer manuellement, un par un, batterie chargee + secteur) :" -ForegroundColor Red
    $biosInstallers | ForEach-Object {
        Write-Host ("    - {0}" -f $_.FullName) -ForegroundColor Red
        Write-Log  ("BIOS/UEFI detecte (NON lance automatiquement) : {0}" -f $_.FullName)
    }
    Write-Host ""
}

if ($otherInstallers) {
    Write-Host "  Autres installateurs (pilotes / outils) :" -ForegroundColor Cyan
    $i = 1
    $menu = @()
    foreach ($inst in $otherInstallers) {
        $entry = [PSCustomObject]@{
            Index = $i
            Name  = $inst.Name
            Path  = $inst.FullName
        }
        $menu += $entry
        Write-Host ("    [{0}] {1}" -f $i, $inst.Name)
        $i++
    }
}
else {
    Write-Host "  Aucun autre installateur detecte en dehors des BIOS/UEFI."
}

Write-Host ""
Write-Host "Tu peux lancer les installateurs un par un. Ordre suggere :" -ForegroundColor Yellow
Write-Host "  1) Chipset / System Control Interface" -ForegroundColor Yellow
Write-Host "  2) Pilotes GPU (NVIDIA/AMD) si presentes" -ForegroundColor Yellow
Write-Host "  3) Audio (Intel/Realtek)" -ForegroundColor Yellow
Write-Host "  4) Armoury Crate / Aura / utilitaires ASUS" -ForegroundColor Yellow
Write-Host ""

if (-not $otherInstallers) {
    Write-Log "=== Fin script (seuls BIOS detectes) ==="
    exit 0
}

# 5. Boucle d'execution des installateurs selectionnes
while ($true) {
    Write-Host ""
    $choice = Read-Host "Entrez le numero d'un installateur a lancer (ou appuie sur Entree pour quitter)"

    if ([string]::IsNullOrWhiteSpace($choice)) {
        Write-Log "Fin de la selection utilisateur. Sortie du script."
        break
    }

    if (-not [int]::TryParse($choice, [ref]$null)) {
        Write-Host "Entree invalide. Merci de saisir un numero." -ForegroundColor Red
        continue
    }

    $index = [int]$choice
    $selected = $menu | Where-Object { $_.Index -eq $index }

    if (-not $selected) {
        Write-Host "Numero introuvable. Reessaie." -ForegroundColor Red
        continue
    }

    Write-Host ""
    Write-Host ("Tu vas lancer : {0}" -f $selected.Name) -ForegroundColor Green
    $confirm = Read-Host "Confirmer le lancement ? (O/N)"
    if ($confirm -notin @('O','o','Y','y','OUI','Oui','yes','YES')) {
        Write-Host "Annule." -ForegroundColor Yellow
        continue
    }

    Write-Log ("Lancement de l'installateur : {0}" -f $selected.Path)

    try {
        $proc = Start-Process -FilePath $selected.Path -Verb RunAs -Wait -PassThru
        Write-Log ("  -> Termine avec code de sortie : {0}" -f $proc.ExitCode)
    }
    catch {
        Write-Log ("  -> ERREUR lors du lancement : {0}" -f $_)
        Write-Host "Erreur lors du lancement. Voir le log : $logPath" -ForegroundColor Red
    }
}

Write-Log "=== Fin script maj-asus-drivers.ps1 ==="
Write-Host ""
Write-Host "Script termine. Log enregistre dans : $logPath" -ForegroundColor Cyan

