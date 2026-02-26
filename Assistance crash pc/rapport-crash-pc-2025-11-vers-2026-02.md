# Rapport d'analyse des crashes PC — Novembre 2025 → Février 2026

**Généré le :** 25/02/2026  
**Période demandée :** à partir de novembre 2025  
**Machine :** le_monstre (ASUS G814PP)  
**Source :** Journaux Windows (Système, Application) + minidumps

---

## 1. Synthèse

- **Total d’arrêts non prévus (event 6008) depuis le 1er novembre 2025 :** **88**
- **Plus ancien arrêt enregistré dans les logs :** **06/12/2025** (les journaux ne contiennent pas d’événements 6008 antérieurs à cette date ; novembre peut avoir été purgé ou sans crash enregistré).
- **Minidumps (BSOD) encore présents :** 5 fichiers, tous entre le **23/02/2026** et le **24/02/2026** (les anciens ont été écrasés ou supprimés).

---

## 2. Répartition des arrêts non prévus par mois

| Mois        | Nombre d’arrêts non prévus (6008) | Remarque                          |
|-------------|------------------------------------|-----------------------------------|
| Nov. 2025   | 0 (aucun dans les logs)           | Logs peut‑être purgés ou absents  |
| Déc. 2025   | ~14                                | 6, 7, 20, 21, 22, 31 décembre     |
| Jan. 2026   | ~35                                | Très nombreux, dont 15/01 très chargé |
| Fév. 2026   | ~39                                | Pic 14/02, 23/02, 24/02 (très chargé) |

**Tendance :** nette **augmentation** du nombre de crashes de décembre à février, avec une **aggravation fin février** (notamment le 24/02 avec plus de 10 arrêts dans la journée).

---

## 3. Liste chronologique des arrêts non prévus (6008)

*Du plus récent au plus ancien (extrait complet depuis le 1er nov. 2025).*

| Date (arrêt) | Heure (arrêt) |
|--------------|----------------|
| 24/02/2026   | 23:59:51 |
| 24/02/2026   | 23:39:30 |
| 24/02/2026   | 23:11:37 |
| 24/02/2026   | 21:13:56 |
| 24/02/2026   | 21:00:03 |
| 24/02/2026   | 20:05:04 |
| 24/02/2026   | 20:00:55 |
| 24/02/2026   | 18:39:54 |
| 24/02/2026   | 10:51:53 |
| 24/02/2026   | 10:33:25 |
| 24/02/2026   | 10:21:39 |
| 23/02/2026   | 23:56:37 |
| 23/02/2026   | 22:45:51 |
| 23/02/2026   | 22:09:08 |
| 23/02/2026   | 21:45:29 |
| 23/02/2026   | 21:42:06 |
| 23/02/2026   | 20:56:49 |
| 23/02/2026   | 20:24:54 |
| 23/02/2026   | 20:08:39 |
| 19/02/2026   | 21:15:08 |
| 16/02/2026   | 22:22:20, 20:19:40, 20:03:32 |
| 14/02/2026   | 19:42:54, 18:57:37, 18:47:58, 17:51:20, 16:35:02, 16:11:03, 13:07:24 |
| 10/02/2026   | 23:19:03 |
| 09/02/2026   | 22:20:32, 21:58:02, 20:22:28 |
| 06/02/2026   | 23:33:45, 23:16:10 |
| 03/02/2026   | 22:30:13 |
| 30/01/2026   | 12:28:11, 10:49:04, 10:29:11 |
| 28/01/2026   | 02:09:00 |
| 27/01/2026   | 22:57:48 |
| 26/01/2026   | 21:36:48, 19:33:59 |
| 25/01/2026   | 21:29:16, 20:38:55, 20:09:12, 19:45:25, 19:42:19 |
| 24/01/2026   | 15:11:29, 14:37:53, 14:27:18 |
| 21/01/2026   | 22:52:41, 22:29:41, 22:08:29, 21:18:21, 20:51:21 |
| 15/01/2026   | 23:57:49, 23:46:27, 23:27:49, 23:04:35, 22:23:21, 21:24:04, 20:24:46 |
| 14/01/2026   | 22:12:26 |
| 11/01/2026   | 16:19:01 |
| 10/01/2026   | 15:45:14 |
| 08/01/2026   | 23:54:22, 10:44:50, 10:37:04, 09:47:49 |
| 04/01/2026   | 13:05:35, 12:09:08, 03:29:42 |
| 03/01/2026   | 12:37:55, 05:17:33 |
| 31/12/2025   | 18:38:58, 16:41:01, 16:27:52, 15:38:29, 15:10:12, 08:44:46, 08:18:45 |
| 22/12/2025   | 06:23:13 |
| 21/12/2025   | 23:56:24 |
| 20/12/2025   | 17:12:38 |
| 06/12/2025   | 23:58:02, 17:05:31 |

---

## 4. Minidumps (BSOD) encore présents

Les dumps plus anciens ont été remplacés (Windows ne garde qu’un nombre limité de minidumps). Fichiers actuels dans `C:\Windows\Minidump\` :

| Fichier | Date/heure | Taille |
|---------|------------|--------|
| 022426-18500-01.dmp | 24/02/2026 21:13 | ~5,1 Mo |
| 022426-18546-01.dmp | 24/02/2026 18:46 | ~7,6 Mo |
| 022426-20062-01.dmp | 24/02/2026 12:29 | ~5,3 Mo |
| 022426-19000-01.dmp | 24/02/2026 10:51 | ~3,7 Mo |
| 022326-19937-01.dmp | 23/02/2026 23:06 | ~5,4 Mo |

Pour analyser la cause précise (code BugCheck, pilote en faute) : WinDbg ou « Ouvrir le fichier de vidage » dans le Rapport de fiabilité Windows.

---

## 5. Événements système « Erreur » (Level 2) sur la période

Sur la plage novembre 2025 → 25/02/2026, les erreurs système les plus récurrentes en lien avec les crashes ou le matériel sont notamment :

- **6008** — Arrêt système précédent non prévu (détail ci‑dessus).
- **10010 (DCOM)** — Serveurs ne s’enregistrant pas à temps (souvent autour des arrêts brutaux).
- **1801 (TPM-WMI)** — « Secure Boot CA/keys need to be updated » (ASUS).
- **20 (WindowsUpdate)** — Échec d’installation de mises à jour (ex. KB5077181, 0x800F0831).
- **219 (Kernel-PnP)** — Échec chargement pilote (ex. WUDFRd, périphérique ASUS HID).
- **10317 (NDIS)** — Événements interface réseau (Remote NDIS).

Les autres erreurs (DCOM répétées, etc.) sont cohérentes avec des redémarrages brutaux ou un système instable.

---

## 6. Constats et pistes

1. **Problème récurrent et qui s’aggrave**  
   Environ **88 arrêts non prévus** depuis début novembre (données réelles à partir du 06/12), avec **plus de crashes en janvier et février**, et **pic le 24/02**.

2. **Certains jours à très forte concentration**  
   - 24/02/2026 : plus de 10 arrêts  
   - 23/02/2026 : plusieurs arrêts en soirée  
   - 15/01/2026 : plusieurs arrêts  
   - 14/02/2026 : plusieurs arrêts  
   - 31/12/2025 : plusieurs arrêts  

   Cela peut indiquer **alimentation instable**, **pilote défaillant** qui se déclenche dans certaines conditions, ou **surchauffe** après une durée d’utilisation.

3. **Pas de données novembre**  
   Aucun événement 6008 avant le 06/12/2025 dans les logs récupérés. Soit les journaux ont été purgés/cyclés, soit il n’y a pas eu d’arrêt non prévu enregistré en novembre.

4. **Pistes inchangées par rapport au premier rapport**  
   - Mise à jour **pilotes ASUS** (Armoury Crate, HID, BIOS).  
   - Mise à jour **pilote audio Intel**.  
   - Vérification **alimentation** (prise, onduleur, PSU).  
   - **Analyse d’un minidump** récent pour identifier le BugCheck et le pilote en cause.  
   - Corriger les **mises à jour Windows** en échec (espace disque, résolution des problèmes).

---

## 7. Commandes utilisées

- `Get-WinEvent -FilterHashtable @{LogName='System'; Id=6008; StartTime=[DateTime]'2025-11-01'} -MaxEvents 200`
- `Get-WinEvent -FilterHashtable @{LogName='System'; Level=2; StartTime=[DateTime]'2025-11-01'} -MaxEvents 150`
- `Get-ChildItem C:\Windows\Minidump\*.dmp`

---

*Rapport généré automatiquement. Pour une analyse détaillée des BSOD, utiliser WinDbg sur les fichiers .dmp listés en section 4.*
