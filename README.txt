FUSION — 2048

2048 solo avec animations, particules et SFX Web Audio.
Les fusions réalisées à moins de 500 ms d’intervalle montent le combo
et la hauteur/intensité du son. Effet renforcé dès x5.
Flèches, WASD/ZQSD et glissements tactiles. Son désactivable.
Mode libre et record local sans inscription ; comptes par pseudo et
mot de passe pour le classement. Les scores classés et les tuiles
sont calculés par le serveur. Cela empêche les scores arbitraires,
mais pas les bots qui jouent des parties valides.

DÉVELOPPEMENT
Node.js >=22.13 (validé avec 24.19). npm ci puis npm start.
Sans DATABASE_URL, SQLite conserve les données dans .data/ (ignoré par Git).
DATA_DIR peut changer cet emplacement. npm test vérifie les règles,
comptes, sessions, scores, requêtes concurrentes et persistance.
Le test utilise un dossier temporaire SQLite. Ne jamais lancer les tests
avec DATABASE_URL pointant sur une base de production : ils créent des
comptes et parties de test. Un PostgreSQL de test dédié est accepté.

PUBLICATION GRATUITE : RENDER + SUPABASE
1. Créer un projet Supabase Free. La Data API peut rester désactivée.
2. Connect > Direct > Session pooler > URI. Remplacer [YOUR-PASSWORD]
   par le mot de passe de la base, sans crochets ni espaces. Encoder les
   caractères réservés du mot de passe pour une URI (ex. @ devient %40,
   # devient %23, % devient %25). Ne jamais publier cette URI.
3. Render : Web Service, dépôt GitHub, branche main, runtime Node,
   Build Command npm ci, Start Command npm start, instance Free.
4. Variables Render : NODE_VERSION=24.19.0, NODE_ENV=production,
   DATABASE_URL=URI du Session pooler. Health Check Path : /healthz.
   Aucune variable DATABASE_URL ne doit être envoyée au navigateur.
5. Le serveur initialise automatiquement les tables dans le schéma privé
   fusion. Aucun SQL à copier dans Supabase. Données persistantes dans
   PostgreSQL, même si Render redémarre. NODE_ENV=production exige
   DATABASE_URL pour éviter toute perte de données SQLite sur Render.
6. TLS vérifie le certificat du serveur. Si Supabase utilise une autorité
   non reconnue par Node, récupérer son certificat CA depuis les paramètres
   officiels Supabase et ajouter le PEM en variable Render DATABASE_CA_CERT.
   Ne jamais désactiver la vérification TLS.
7. Déployer et attendre l’état Live, puis ouvrir l’adresse onrender.com.
   Vérifier inscription, connexion, partie classée et classement.

LIMITES
Les quotas des offres gratuites et leur mise en veille s’appliquent.
L’inscription n’inclut pas de récupération de mot de passe par e-mail.
Les mots de passe sont salés et hachés par scrypt ; cookies HttpOnly,
SameSite=Lax et Secure en production. Les pseudos et records sont publics.
Sauvegarder la base Supabase ; ne pas supprimer le projet.
Les comptes SQLite locaux ne sont pas migrés automatiquement vers Supabase.
