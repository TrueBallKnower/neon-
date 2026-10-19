FUSION — 2048

2048 solo avec animations, particules et SFX Web Audio.
Les fusions réalisées à moins de 1,5 seconde d’intervalle montent le combo
et la hauteur/intensité du son. Effet renforcé dès x5.
Flèches, WASD/ZQSD et glissements tactiles. Son désactivable.
Mode libre et record local sans inscription ; comptes par pseudo et
mot de passe pour le classement. Les scores classés et les tuiles
sont calculés par le serveur. Cela empêche les scores arbitraires,
mais pas les bots qui jouent des parties valides.

DUEL EN LIGNE (1V1)
Deux comptes distincts sont nécessaires. Ouvrir Duel 1v1, créer un salon,
puis partager son code ou Copier le lien avec un ami. L’adversaire saisit
ce code dans Duel 1v1 et rejoint le salon. Décompte de 3 secondes puis
5 minutes chronométrées par le serveur ; le plus grand score gagne,
avec égalité possible. Les deux joueurs ont la même grille initiale
et la même séquence pseudo-aléatoire de génération. Les scores adverses
sont actualisés chaque seconde. Les scores de duel sont séparés du
classement solo. Une grille bloquée conserve son score jusqu’à la fin.
Quitter un duel en cours compte comme un abandon. Une déconnexion
ou un rafraîchissement ne suspend pas le chrono ; le navigateur retrouve
le duel sauvegardé à la reconnexion. Les salons expirent après 24 heures.
Les tables sont créées automatiquement, sans configuration supplémentaire.

RÉACTIVITÉ
Les mouvements et les nouvelles tuiles sont calculés immédiatement sur
l’appareil grâce à une réserve de tuiles fournie par le serveur. Les coups
sont validés par lots en arrière-plan, sans attendre chaque réponse réseau.
Le serveur recalcule les grilles, les points et le délai du duel. Les lots
vérifient leur grille et compteur de départ pour éviter les doublons ; une
réponse perdue déclenche une resynchronisation avec l’état officiel.
Le tampon est borné à 32 coups ; une coupure prolongée peut donc suspendre
la saisie ou demander de recharger la page. Les animations de déplacement
durent 90 ms et les glissements tactiles répondent dès le franchissement
du seuil, avant de relâcher le doigt. Effets visuels et audio allégés pour
limiter les ralentissements sur les appareils moins puissants.
Validation navigateur Chromium : clavier, tactile émulé, CPU ralenti 4x,
800 ms de latence ajoutée, lots, retour à l’état serveur et réponse perdue.
Ces simulations ne remplacent pas un test sur chaque appareil physique.

DÉVELOPPEMENT
Node.js >=22.13 (validé avec 24.19). npm ci puis npm start.
Sans DATABASE_URL, SQLite conserve les données dans .data/ (ignoré par Git).
DATA_DIR peut changer cet emplacement. npm test vérifie les règles,
comptes, sessions, scores, requêtes concurrentes, persistance, duels et
validation des lots de coups prédits (sans double comptage en cas de reprise).
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
6. TLS vérifie le certificat du serveur. Le certificat public Supabase Root
   2021 est inclus dans certs/ et utilisé pour les hôtes Supabase seulement.
   DATABASE_CA_CERT permet de remplacer cette liste par un autre CA PEM
   officiel si nécessaire. Ne jamais désactiver la vérification TLS.
7. Déployer et attendre l’état Live, puis ouvrir l’adresse onrender.com.
   Vérifier inscription, connexion, partie classée et classement.

LIMITES
Les quotas des offres gratuites et leur mise en veille s’appliquent.
L’inscription n’inclut pas de récupération de mot de passe par e-mail.
Les mots de passe sont salés et hachés par scrypt ; cookies HttpOnly,
SameSite=Lax et Secure en production. Les pseudos et records sont publics.
Sauvegarder la base Supabase ; ne pas supprimer le projet.
Les comptes SQLite locaux ne sont pas migrés automatiquement vers Supabase.
