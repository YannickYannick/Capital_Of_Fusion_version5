# Guide de réparation — Crashes PC (arrêts non prévus)

À faire **dans l’ordre** ci‑dessous. Après chaque étape, utiliser le PC normalement et noter si les crashes continuent.

---

## 1. Mettre à jour les pilotes et logiciels ASUS (priorité haute)

Les logs pointent un **pilote HID ASUS** et **AcPowerNotification** (Armoury). C’est la piste la plus cohérente avec tes crashes.

1. Va sur **https://www.asus.com/fr/supportonly/** et entre ta référence (ex. **G814PP** ou le nom exact de ton PC).
2. Onglet **Pilotes et utilitaires** → choisis ta version de Windows (24H2 / 26200).
3. Télécharge et installe (dans cet ordre si proposé) :
   - **BIOS** (dernière version stable)
   - **Chipset**
   - **Audio** (Realtek/Intel selon ta config)
   - **Armoury Crate** ou **ROG / Aura** si listés
4. Redémarre après chaque installation importante (surtout BIOS + chipset).

**Option :** désinstaller **Armoury Crate** temporairement et utiliser uniquement les pilotes du site ASUS pour tester si les crashes diminuent (certains bugs viennent d’Armoury).

---

## 2. Mettre à jour le pilote audio Intel

Un avertissement **IntcAzAudAddService** apparaît au démarrage.

- Sur le site ASUS (section Pilotes) : installe le **pilote Audio** à jour.
- Ou **Gestionnaire de périphériques** → Périphériques audio → Carte Intel → Mise à jour du pilote → Recherche automatique (ou téléchargement depuis Intel si tu connais le modèle).

Redémarre après.

---

## 3. Réparer Windows Update (KB5077181 en échec)

L’erreur **0x800F0831** peut venir d’un disque plein ou de composants corrompus.

1. **Espace disque :**  
   Paramètres → Système → Stockage → vérifier qu’il reste au moins **10–20 Go libres** sur C:.
2. **Outil de résolution des problèmes :**  
   Paramètres → Système → Dépannage → Autres utilitaires de résolution des problèmes → **Windows Update** → Exécuter.
3. **Réinstaller la mise à jour :**  
   Paramètres → Windows Update → Vérifier les mises à jour. Si KB5077181 réapparaît, laisser l’installer.
4. Si ça échoue encore : exécuter en **administrateur** :  
   `sfc /scannow`  
   puis :  
   `DISM /Online /Cleanup-Image /RestoreHealth`  
   (ça peut prendre 10–20 min).

---

## 4. Vérifier l’alimentation (coupures de courant)

Si les crashes arrivent **sans écran bleu** (PC qui s’éteint d’un coup), penser à une **coupure de courant** ou une **alimentation instable**.

- Brancher le PC sur une **autre prise** (idéalement une ligne différente).
- Si possible, tester avec un **onduleur (UPS)** pour voir si les arrêts diminuent.
- Vérifier que le **câble d’alimentation** et le **bloc** ne chauffent pas anormalement.

---

## 5. Analyser un minidump pour avoir la cause exacte (BSOD)

Pour savoir **quel pilote** provoque l’écran bleu :

1. Télécharge **WinDbg** (Windows SDK) :  
   https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/  
   ou via le **Microsoft Store** : « WinDbg ».
2. Ouvre **WinDbg** → Fichier → Ouvrir un fichier de vidage → choisis par ex. :  
   `C:\Windows\Minidump\022426-18546-01.dmp`
3. Dans la zone de commande en bas, tape :  
   `!analyze -v`  
   puis Entrée.
4. Regarde la sortie pour :
   - **BUGCHECK_CODE** (ex. 0x000000d1, 0x0000000a)
   - **MODULE_NAME** / **IMAGE_NAME** (souvent le pilote en cause)

Tu peux chercher ce code (ex. « BSOD 0xD1 ») et le nom du pilote sur le web pour confirmer la cause et la correction.

---

## 6. Options avancées (si les crashes continuent)

- **Mémoire (RAM) :** lancer **Diagnostic de mémoire Windows** (recherche Windows : « Outil de diagnostic de la mémoire ») et laisser le test complet s’exécuter.
- **Désactiver le redémarrage automatique après erreur** pour voir l’écran bleu :  
  Poste de travail → Propriétés → Paramètres système avancés → Démarrage et récupération → Paramètres → décocher « Redémarrer automatiquement ». Ainsi tu pourras noter le **code d’erreur** et le **nom du fichier** affichés sur l’écran bleu.
- **Nettoyage des logiciels récents :** si les crashes ont commencé après l’installation d’un logiciel ou d’un pilote, désinstaller ou revenir à une version précédente du pilote (Gestionnaire de périphériques → Propriétés du périphérique → Pilote → Restaurer).

---

## Récap ordre des actions

| Ordre | Action |
|-------|--------|
| 1 | Pilotes ASUS (BIOS, chipset, audio, Armoury) |
| 2 | Pilote audio Intel |
| 3 | Réparer Windows Update + espace disque |
| 4 | Vérifier prise / alimentation / onduleur |
| 5 | Analyser un minidump avec WinDbg |
| 6 | Si besoin : test RAM, désactiver redémarrage auto, désinstaller logiciels récents |

En cas de nouveau crash, noter **date, heure et ce que tu faisais** (jeu, navigateur, idle…) pour voir si un usage précis déclenche le problème.
