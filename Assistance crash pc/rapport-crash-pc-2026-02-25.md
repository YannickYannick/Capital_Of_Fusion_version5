# Rapport d'analyse des crashes PC — 25 février 2026

**Généré le :** 25/02/2026  
**Machine :** le_monstre (ASUS — G814PP, firmware American Megatrends G814PP.310)  
**Source :** Journaux Windows (Système, Application) + présence de minidumps

---

## 1. Synthèse

Votre PC a subi **plusieurs arrêts non prévus** le **24 février 2026**. Les journaux enregistrent au moins **3 arrêts brutaux** et il existe **5 fichiers minidump** (écrans bleus) sur les 23–24 février. Aucun arrêt propre (type « arrêt Windows ») n’est indiqué pour ces moments.

---

## 2. Arrêts non prévus enregistrés (Event 6008)

| Heure enregistrée (après redémarrage) | Heure de l’arrêt non prévu |
|----------------------------------------|----------------------------|
| 25/02/2026 00:08:29                    | **24/02/2026 23:59:51**    |
| 24/02/2026 23:49:47                    | **24/02/2026 23:39:30**    |
| 24/02/2026 23:14:30                    | **24/02/2026 23:11:37**    |

Donc au moins 3 crashes/redémarrages le 24/02, vers **23h11**, **23h39** et **23h59**.

---

## 3. Fichiers Minidump (écrans bleus)

Des **écrans bleus (BSOD)** ont bien eu lieu. Fichiers présents dans `C:\Windows\Minidump\` :

| Fichier                    | Date/heure        | Taille   |
|---------------------------|-------------------|----------|
| 022326-19937-01.dmp       | 23/02/2026 23:06  | ~5,4 Mo  |
| 022426-19000-01.dmp       | 24/02/2026 10:51  | ~3,9 Mo  |
| 022426-20062-01.dmp       | 24/02/2026 12:29  | ~5,5 Mo  |
| 022426-18546-01.dmp       | 24/02/2026 18:46  | ~7,9 Mo  |
| 022426-18500-01.dmp       | 24/02/2026 21:13  | ~5,3 Mo  |

Pour connaître la **cause exacte** (code BugCheck et pilote en faute), il faut analyser ces dumps avec **WinDbg** (Windows SDK) ou l’outil « Ouvrir le fichier de vidage » dans le Rapport de fiabilité Windows.

---

## 4. Événements notables autour des crashes

### Juste avant/après le crash de 23:59

- **23:59:02** — Plusieurs erreurs **DCOM** : serveurs ne s’enregistrant pas à temps (CLSID 021E4F06… et AB8902B4…). Souvent observé quand le système est en surcharge ou en cours d’arrêt brutal.

### Après le redémarrage du 25/02 (00:08–00:10)

- **6008** — « L’arrêt système précédant à 23:59:51 le 24/02/2026 n’était pas prévu. »
- **219 (Kernel-PnP)** — Échec du chargement du pilote **WUDFRd** pour le périphérique **HID\VID_0B05&PID_19B6** (périphérique ASUS, type ROG/Armoury) — code **0xC0000365**.
- **257 (IntcAzAudAddService)** — Avertissement pilote audio Intel : « HAP AcpCreateAudioEngine ».
- **RestartManager** — Impossible de redémarrer **ASUS AcPowerNotification.exe** (SID ne correspond pas) — logiciel ASUS (alimentation / Armoury).

### Autres (24/02)

- **Windows Update** — Échec de l’installation de **KB5077181** (Correctif de sécurité 26200.7840) avec l’erreur **0x800F0831**.
- **TPM-WMI 1801** — « Secure Boot CA/keys need to be updated » (ASUS) — information firmware, pas forcément liée au crash.
- **NDIS 10317** — Événement sur une interface « Remote NDIS based Internet Sharing Device » (suppression d’interface alors que le périphérique PnP existe encore).

---

## 5. Pistes de cause probables

1. **Pilotes / logiciels ASUS**  
   - Échec du pilote pour un périphérique HID ASUS (VID_0B05) après redémarrage.  
   - RestartManager qui n’arrive pas à redémarrer `AcPowerNotification.exe`.  
   → Mettre à jour **Armoury Crate**, **pilotes ASUS** et **BIOS** depuis le site ASUS (modèle G814PP).

2. **Pilote audio Intel**  
   - Avertissement Intel Audio (AcpCreateAudioEngine) au démarrage.  
   → Mettre à jour le pilote audio depuis le site du fabricant ou Intel.

3. **Mise à jour Windows en échec**  
   - KB5077181 en échec (0x800F0831, souvent lié à l’espace disque ou à des composants corrompus).  
   → Vérifier l’espace disque, l’outil « Résolution des problèmes de mise à jour », et réessayer la mise à jour.

4. **Coupure courant / alimentation**  
   - Les arrêts à 23:11, 23:39 et 23:59 peuvent aussi correspondre à des coupures ou à une alimentation instable.  
   → Si vous n’avez pas vu d’écran bleu, vérifier onduleur, câble, prise et alimentation.

5. **Cause précise des BSOD**  
   - Seule l’analyse des **minidumps** (WinDbg ou outil intégré) donnera le code BugCheck et le pilote en cause.

---

## 6. Recommandations

1. **Analyser un minidump récent** (ex. `022426-18500-01.dmp` ou `022426-18546-01.dmp`) avec WinDbg pour obtenir le **code d’erreur** et le **module** en faute.
2. **Mettre à jour** : Armoury Crate, pilotes ASUS (surtout HID/ROG), pilote audio Intel, et BIOS depuis le site ASUS.
3. **Vérifier Windows Update** : espace disque, résolution des problèmes, puis réinstallation de KB5077181 si nécessaire.
4. **Alimentation** : si les crashes continuent sans écran bleu clairement visible, tester avec une autre prise/onduleur et surveiller les coupures.
5. **Surveiller** : en cas de nouveau crash, noter l’heure exacte et ouvrir le Rapport de fiabilité (`perfmon /rel`) pour croiser avec les événements et les nouveaux minidumps.

---

## 7. Commandes utilisées pour ce rapport

- `Get-WinEvent` — journaux **System** et **Application** (niveaux Erreur/Avertissement, 24–25/02).
- Contrôle du dossier `C:\Windows\Minidump`.
- Filtrage des événements 6008, 41 et messages liés à l’arrêt.

---

*Rapport généré automatiquement à partir des journaux Windows. Pour une analyse détaillée des BSOD, utilisez WinDbg sur les fichiers .dmp listés ci-dessus.*
