# Vérification déploiement (prod)

## 1. Base de données en prod (PostgreSQL)

**Problème :** En prod, Django n’utilisait PostgreSQL que si `DB_NAME` ou `DB_HOST` étaient définis. Sur Railway, quand tu ajoutes une base PostgreSQL, c’est en général **`DATABASE_URL`** qui est fournie, pas les variables `DB_*`. Du coup, la prod pouvait encore tourner en SQLite.

**Modification :** Dans `backend/config/settings/production.py`, la config a été mise à jour pour :
- utiliser **`DATABASE_URL`** en priorité (format Railway/Supabase) ;
- sinon utiliser `DB_NAME` / `DB_HOST` / etc. ;
- sinon rester en SQLite.

Dès que **`DATABASE_URL`** est définie dans les variables d’environnement du service Railway (ce qui est le cas quand tu as une base PostgreSQL liée), la prod utilisera bien PostgreSQL après le prochain déploiement.

**À faire de ton côté :**
1. Vérifier dans Railway que le service backend a bien une variable **`DATABASE_URL`** (souvent ajoutée automatiquement quand tu lies un service PostgreSQL au projet).
2. Redéployer le backend pour prendre en compte le nouveau code des settings.

---

## 2. Planètes en ligne

Les « planètes » viennent des **OrganizationNode** avec `is_visible_3d=True`, exposés par l’API **`GET /api/organization/nodes/`**.

**Vérifier depuis chez toi :**

### Depuis l’API (après déploiement)

Remplace par l’URL réelle de ton backend si besoin :

```bash
curl -s "https://capitaloffusionversion5-production.up.railway.app/api/organization/nodes/"
```

Si tu reçois un JSON avec un tableau de nœuds (ex. Paris, Lyon, etc.), les planètes sont bien en ligne.

### Depuis l’environnement Railway (pour lancer des commandes Django)

Depuis la racine du repo (ou le dossier `backend` si tu lances depuis là) :

```bash
railway run --project=a32a6714-e6db-4f25-b94d-68b4f8dfbea2 --environment=fd7f19c6-3f95-4366-95b7-6a712e29c877 --service=d7965208-e9f6-4aad-8bd0-08a1a9c27775 python manage.py shell -c "from apps.organization.models import OrganizationNode; print('Noeuds 3D:', OrganizationNode.objects.filter(is_visible_3d=True).count())"
```

Tu verras le nombre de nœuds « planètes » en base.

### Si le compte est 0

Créer la hiérarchie et les données de base (planètes + styles/niveaux) :

```bash
railway run --project=a32a6714-e6db-4f25-b94d-68b4f8dfbea2 --environment=fd7f19c6-3f95-4366-95b7-6a712e29c877 --service=d7965208-e9f6-4aad-8bd0-08a1a9c27775 python manage.py setup_planets
```

Puis éventuellement :

```bash
railway run ... python manage.py load_demo_data
```

---

**En résumé :**
- **PostgreSQL en prod :** oui, tu es bien configuré **à condition** que `DATABASE_URL` soit définie sur le service Railway ; la modification dans `production.py` fait que cette variable est maintenant utilisée.
- **Planètes en ligne :** à vérifier avec le `curl` ou la commande `railway run ... shell`, et si besoin en lançant `setup_planets` (et `load_demo_data`) une fois.
