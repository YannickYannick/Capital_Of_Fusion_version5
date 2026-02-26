# Rapport de diagnostic approfondi — PC ROG Strix G18 (G814PP)

**Date du diagnostic :** 25/02/2026  
**Machine :** ASUSTeK ROG Strix G18 G814PP_G814PP

---

## 1. Synthèse

| Élément | État |
|--------|------|
| Disques physiques | **Healthy** (SSD Micron 1 To) |
| Volumes (C:, etc.) | **Healthy**, espace libre largement suffisant |
| RAM | 32 Go (2×16 Go Micron 5600 MHz) — **OK** |
| Périphériques en erreur | Nombreux « Unknown » (souvent appareils USB débranchés — **souvent normal**) |
| Services ASUS / Armoury | **ArmouryCrateControlInterface** et **ArmouryCrateService** sont **arrêtés** |
| Fichiers système (sfc) | **Non exécuté** — nécessite une invite en **administrateur** |
| Disque (chkdsk) | **Non exécuté** — nécessite une invite en **administrateur** |

---

## 2. Stockage

### Disques physiques
- **SSD :** MTFDKBA1T0QGN-1BN1AABGA — **HealthStatus: Healthy**, **OperationalStatus: OK**
- **Taille :** ~1 To (1024 Go)

### Volumes
| Lecteur | Système de fichiers | Santé | Libre | Total |
|---------|---------------------|-------|-------|--------|
| C: (OS) | NTFS | Healthy | **~629 Go** | ~924 Go |
| G: | NTFS | — | ~598 Go | ~924 Go |
| MYASUS | FAT32 | Healthy | — | 256 Mo |
| RESTORE | NTFS | Healthy | — | 30 Go |

**Conclusion :** Aucun souci de place (plus de 600 Go libres sur C:). Les échecs Windows Update (ex. 0x800F0831) ne viennent probablement pas du manque d’espace.

---

## 3. Mémoire (RAM)

- **Total :** 31,21 Go (32 Go utilisables)
- **Barrettes :** 2 × Micron Technology, 16 Go, **5600 MHz**, DIMM 0
- **Modèle PC :** ROG Strix G18 G814PP

Aucune anomalie détectée côté logiciel. En cas de doute (crashes aléatoires), lancer l’**Outil de diagnostic de la mémoire Windows** (redémarrage requis).

---

## 4. Batterie

- **Nom :** R220358  
- **Statut :** OK  
- **BatteryStatus :** 6 (informations détaillées non affichées ici)  
- **EstimatedChargeRemaining :** non renseigné dans la sortie

PC portable — les crashes peuvent aussi être liés à l’alimentation (secteur, câble, batterie). À garder en tête si les pilotes ASUS ne suffisent pas.

---

## 5. Périphériques « en erreur » (PnP)

Beaucoup de périphériques ont le **statut « Unknown »** et un **ConfigManagerErrorCode ≠ 0**. Souvent ce sont des **appareils USB ou Bluetooth actuellement déconnectés** (casque, souris, clé, téléphone, etc.) : Windows les garde en base mais marqués « absents ». **Ce n’est en général pas la cause des crashes.**

Périphériques concernés (extrait) :  
- Concentrateurs USB, Souris HID, Clavier PIH, HID-compliant headset  
- SAMSUNG Mobile USB, Remote NDIS based Internet Sharing Device  
- JBL, Jabra, ACTON III, LS32A600U (NVIDIA HD Audio), INTENSO, etc.

**Recommandation :** Pas d’action obligatoire. Si un périphérique précis pose problème (plantage quand tu le branches), mettre à jour son pilote ou le débrancher pour tester.

---

## 6. Pilotes ASUS / Armoury / ROG

| Périphérique / logiciel | Version pilote |
|-------------------------|----------------|
| ROG Strix G18 UEFI | 10.1.2.310 |
| ASUS System Control Interface v3 | 3.1.59.0 |
| Armoury Crate Control Interface | 1.2.0.0 |
| ASUS Precision Touchpad | 16.0.0.36 |
| ASUS Component Firmware Update | 13.82.0.5 |

Carte graphique (d’après journaux précédents) : **NVIDIA GeForce RTX 5070 Laptop GPU**, **AMD Radeon 610M**.

**Conseil :** Vérifier sur le site ASUS (support G814PP) s’il existe des versions plus récentes pour **BIOS**, **System Control Interface**, **Armoury Crate** et **pilotes graphiques**. Les crashes récurrents sont souvent liés à ces logiciels/pilotes.

---

## 7. Services ASUS / Armoury

| Service | État | Démarrage |
|---------|------|-----------|
| **ArmouryCrateControlInterface** | **Stopped** | Manual |
| **ArmouryCrateService** | **Stopped** | Manual |
| asus | Stopped | Automatic |
| asusm | Stopped | Manual |
| AsusAppService | Running | Automatic |
| AsusCertService | Running | Automatic |
| AsusMsControl | Running | Automatic |
| ASUSOptimization | Running | Automatic |
| AsusPTPService | Running | Automatic |
| ASUSSoftwareManager | Running | Automatic |
| ASUSSwitch | Running | Automatic |
| ASUSSystemAnalysis | Running | Automatic |
| ASUSSystemDiagnosis | Running | Automatic |
| Aura Wallpaper Service | Running | Automatic |
| ROG Live Service | Running | Automatic |

**Constats :**  
- **ArmouryCrateControlInterface** et **ArmouryCrateService** sont **arrêtés**. Soit tu les as désactivés, soit ils ont planté / ne démarrent pas. Cela peut être **lié aux crashes** (services qui crashent et provoquent un arrêt ou un bug ailleurs).  
- Beaucoup d’autres services ASUS tournent ; en cas de problème persistant, on peut tester en **désactivant temporairement** les services non essentiels (Armoury, Aura, etc.) pour voir si la stabilité s’améliore.

---

## 8. Température

Aucune donnée **MSAcpi_ThermalZoneTemperature** disponible dans l’environnement du diagnostic (souvent le cas sur certains portables). Pour surveiller la température en usage : **HWiNFO64**, **Core Temp** ou l’interface Armoury Crate (si elle fonctionne).

---

## 9. Ce qui n’a pas pu être fait (droits administrateur)

Les commandes suivantes **nécessitent une invite de commandes ou PowerShell en tant qu’administrateur** :

1. **Vérification des fichiers système :**  
   `sfc /scannow`  
   (durée typique : 5–15 min)

2. **Réparation de l’image Windows :**  
   `DISM /Online /Cleanup-Image /RestoreHealth`  
   (souvent 10–20 min)

3. **Vérification du disque :**  
   `chkdsk C: /scan`  
   (scan en ligne, pas de redémarrage)  
   Ou pour une réparation complète (au redémarrage) :  
   `chkdsk C: /f`

4. **Diagnostic mémoire :**  
   Recherche Windows : **« Outil de diagnostic de la mémoire »** → Exécuter → Redémarrer et laisser le test complet se faire.

**Recommandation :** Ouvrir **PowerShell en tant qu’administrateur** (clic droit → Exécuter en tant qu’administrateur), puis lancer dans l’ordre :  
`sfc /scannow`  
puis  
`DISM /Online /Cleanup-Image /RestoreHealth`.  
Ensuite, si tu veux, lancer `chkdsk C: /scan` (ou `chkdsk C: /f` si tu acceptes un redémarrage).

---

## 10. Actions recommandées (résumé)

1. **Mettre à jour** : BIOS, pilotes ASUS (dont System Control Interface, Armoury Crate), pilotes audio et graphiques (NVIDIA/AMD) depuis le site ASUS pour le **G814PP**.
2. **Services Armoury** : Vérifier pourquoi **ArmouryCrateControlInterface** et **ArmouryCrateService** sont arrêtés (Observateur d’événements → Journal Application/Système au démarrage). Les redémarrer ou réinstaller Armoury Crate si besoin.
3. **En admin** : Lancer **sfc /scannow** puis **DISM /Online /Cleanup-Image /RestoreHealth**, et éventuellement **chkdsk C: /scan** ou **/f**.
4. **Test RAM** : Lancer l’**Outil de diagnostic de la mémoire Windows** (avec redémarrage) si les crashes persistent après les mises à jour.
5. **Analyse des BSOD** : Ouvrir un fichier **minidump** récent (ex. `C:\Windows\Minidump\022426-18546-01.dmp`) avec **WinDbg** et taper **!analyze -v** pour obtenir le code BugCheck et le pilote en cause.

---

*Rapport généré automatiquement. Script utilisé : `diagnostic_systeme.ps1` (à supprimer ou conserver pour refaire un diagnostic plus tard).*
