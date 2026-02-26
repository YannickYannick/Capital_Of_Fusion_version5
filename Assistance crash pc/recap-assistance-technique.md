### Récapitulatif pour l’assistance technique

#### 1. Configuration

- **PC** : ASUS **ROG Strix G18 G814PP** (G814PP_G814PP)  
- **OS** : Windows (build noyau **10.0.26200.7171**, DISM 10.0.26100.5074 – vraisemblablement 24H2)  
- **Stockage** : SSD Micron 1 To (`MTFDKBA1T0QGN-1BN1AABGA`), **HealthStatus = Healthy**, NTFS OK  
  - Partition système `C:` : ~**924 Go**, dont ~**629 Go libres**  
- **RAM** : **32 Go** (2×16 Go Micron, 5600 MHz)  
- **GPU** : NVIDIA GeForce RTX 5070 Laptop GPU + AMD Radeon 610M  
- **Pilotes/firmware ASUS repérés** :  
  - ROG Strix G18 UEFI : **10.1.2.310**  
  - ASUS System Control Interface v3 : **3.1.59.0**  
  - Armoury Crate Control Interface : **1.2.0.0**  
  - ASUS Precision Touchpad : **16.0.0.36**  
  - ASUS Component Firmware Update : **13.82.0.5**  

#### 2. Symptômes

- Depuis au moins **décembre 2025**, le PC subit **de très nombreux arrêts non prévus / redémarrages brutaux** (avec parfois BSOD, minidumps présents).  
- Exemple marquant : le **24/02/2026**, plus de **10 arrêts non prévus** dans la même journée (events 6008).  
- Pas de problème d’espace disque, pas de message d’erreur applicatif clair : le problème semble bas niveau (drivers / firmware / alimentation).

#### 3. Historique des crashes (journal Système, EventLog 6008)

- **Depuis 01/11/2025** : **88 événements 6008** (arrêts système précédents non prévus).  
- Les logs disponibles commencent au **06/12/2025** (aucune trace antérieure).  
- Répartition approximative :  
  - **Déc. 2025** : ≈ 14 arrêts non prévus  
  - **Jan. 2026** : ≈ 35 arrêts non prévus  
  - **Fév. 2026** (jusqu’au 25) : ≈ 39 arrêts non prévus  
- Journées avec fortes concentrations : **31/12/2025**, **15/01/2026**, **14/02/2026**, **23/02/2026**, surtout **24/02/2026**.

#### 4. Minidumps (BSOD)

Fichiers actuellement présents dans `C:\Windows\Minidump` (les plus anciens ont été écrasés) :

- `022326-19937-01.dmp` — 23/02/2026 23:06 (~5,4 Mo)  
- `022426-19000-01.dmp` — 24/02/2026 10:51 (~3,9 Mo)  
- `022426-20062-01.dmp` — 24/02/2026 12:29 (~5,5 Mo)  
- `022426-18546-01.dmp` — 24/02/2026 18:46 (~7,9 Mo)  
- `022426-18500-01.dmp` — 24/02/2026 21:13 (~5,3 Mo)  

Les codes BugCheck n’ont pas encore été analysés avec WinDbg ; ils sont **à disposition pour analyse**.

#### 5. Événements système liés / contexte

- **Arrêts non prévus** :  
  - Event **6008** très fréquent (cf. section 3).  
- **Pilotes / périphériques** :  
  - Event **219 (Kernel-PnP)** : échec de chargement du pilote `\Driver\WUDFRd` pour un périphérique **HID ASUS** (`HID\VID_0B05&PID_19B6...`).  
  - Plusieurs événements concernant des périphériques USB/HID, y compris matériels ASUS et périphériques audio externes.  
- **ASUS / Armoury** :  
  - Services **ArmouryCrateControlInterface** et **ArmouryCrateService** sont **arrêtés** (StartType = Manual), alors qu’autres services ASUS (ASUSOptimization, ASUSSystemAnalysis, ROG Live Service, Aura Wallpaper Service…) tournent.  
- **Windows Update** :  
  - Échec d’installation de la mise à jour **KB5077181** (Correctif de sécurité, 26200.7840) avec l’erreur **0x800F0831**.  
- **TPM / Secure Boot** :  
  - Event **1801 (TPM-WMI)** récurrent : « **Secure Boot CA/keys need to be updated** » (firmware ASUS).  
- **DCOM** :  
  - Nombreux events **10010 / 10016** (serveurs DCOM ne s’enregistrant pas à temps) autour de certains crashes – probablement conséquence plutôt que cause.  

#### 6. Diagnostics déjà effectués

En **invite de commandes / PowerShell administrateur** :

- **`sfc /scannow`**  
  - Résultat : *« Le programme de protection des ressources Windows n’a trouvé aucune violation d’intégrité. »*  
  - ⇒ **Fichiers système Windows intègres.**
- **`DISM /Online /Cleanup-Image /RestoreHealth`**  
  - Échec avec **erreur 0x800F0915** – *« Le contenu de réparation est introuvable »*.  
  - ⇒ Source de réparation manquante, mais SFC étant propre, pas de corruption évidente restante.
- **`chkdsk C: /scan`**  
  - Résultat : « **Windows a analysé le système de fichiers et n’a trouvé aucun problème. Aucune autre action n’est requise.** »  
  - ⇒ **Système de fichiers et disque OK.**
- Script de diagnostic local (`diagnostic_systeme.ps1`) :  
  - Confirme :
    - SSD Healthy, partitions OK  
    - 32 Go de RAM, modèle ASUS correct  
    - Grand nombre de périphériques PnP en état *Unknown* (principalement USB/Bluetooth débranchés).

#### 7. Hypothèses principales actuelles

1. **Problème de pilotes/logiciels ASUS (Armoury / HID / System Control / firmware)**  
   - Échecs de pilotes HID ASUS (WUDFRd).  
   - Services Armoury Crate non démarrés alors que d’autres composants ASUS tournent.  
   - Fréquence élevée des crashes malgré un Windows et un disque sains.
2. **Éventuel problème de mise à jour firmware / BIOS ou interaction avec Secure Boot**  
   - Événements TPM-WMI 1801 (Secure Boot CA/keys need to be updated).  
3. **Alimentation / hardware** (moins prioritaire mais possible)  
   - Grand nombre d’arrêts brutaux par jour, pouvant aussi pointer vers alimentation instable ou composant défaillant.

#### 8. Actions déjà préparées / en place

- Documents dans le projet :  
  - `rapport-crash-pc-2026-02-25.md` : analyse détaillée des crashes du 23–25/02/2026.  
  - `rapport-crash-pc-2025-11-vers-2026-02.md` : synthèse des 88 événements 6008 depuis 06/12/2025.  
  - `rapport-diagnostic-approfondi.md` : état disque/RAM/services ASUS, résultats SFC/DISM/CHKDSK, recommandations.  
  - `guide-reparation-crashes.md` : plan d’action (mise à jour pilotes ASUS, Armoury, GPU, audio, alimentation, analyse minidumps).
- Scripts d’aide :  
  - `executer-diagnostic-admin.bat` (déjà exécuté) : enchaîne `sfc`, `DISM`, `chkdsk`.  
  - `maj-asus-drivers.ps1` :  
    - Liste les pilotes ASUS/ROG/Armoury/Intel Audio installés.  
    - Scanne `C:\DriversASUS\` pour les installateurs `.exe`/`.msi` téléchargés sur le site ASUS.  
    - Menu pour lancer chaque installateur **manuellement** (avec élévation), dans un ordre conseillé.  
    - Ne lance **pas** automatiquement les fichiers identifiés comme **BIOS/UEFI** (seulement listés).

#### 9. Ce qui est demandé à l’assistance technique

- **Analyser les minidumps** listés (fichiers `.dmp` de février 2026) pour identifier :
  - Les **codes BugCheck** exacts.  
  - Les **pilotes / modules** incriminés (notamment s’il s’agit de pilotes ASUS / Armoury / HID / audio / GPU).  
- **Confirmer ou infirmer** l’hypothèse d’un problème connu sur :
  - ASUS **ROG Strix G18 G814PP** avec BIOS et pilotes actuels,
  - Les versions actuelles des pilotes **ASUS System Control Interface**, **Armoury Crate**, **pilotes HID ASUS**, **audio** et éventuellement **GPU** pour ce modèle.  
- Fournir, si possible :
  - Un **package / séquence de mises à jour pilotes/BIOS recommandé** pour stabiliser ce modèle compte tenu des BSOD observés.  
  - Des instructions pour résoudre l’erreur **DISM 0x800F0915** avec une **source officielle** (ISO ou autre) adaptée à la build 10.0.26200.7171, si jugé pertinent malgré un SFC propre.  

