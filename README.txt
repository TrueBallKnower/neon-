FUSION — 2048

2048 solo avec animations, particules et SFX Web Audio.
En Classique, Sprint et Course, les fusions espacées de moins de 1,5 s montent le combo
et la hauteur/intensité du son. Effet renforcé dès x5.
Flèches, WASD/ZQSD et glissements tactiles. Son désactivable.
Mode libre et record local sans inscription ; comptes par pseudo et
mot de passe pour le classement. Les scores classés et les tuiles
sont calculés par le serveur. Cela empêche les scores arbitraires,
mais pas les bots qui jouent des parties valides.

MODES DE JEU
Ouvrir Modes pour choisir la règle, puis Solo, Solo classé ou Duel.
- Classique : atteindre 2048 à son rythme ; duel de 5 minutes au score.
- Mort subite : après la première fusion, fusionner à nouveau dans les
  2 secondes. Un déplacement sans fusion ne recharge pas le chrono.
  En solo, perdre le combo termine immédiatement la partie. En duel,
  la première fusion de l’un des joueurs active les 2 chronos pour
  empêcher l’attente volontaire ; le premier combo perdu fait perdre
  le duel. Si les deux tiennent 5 minutes, le meilleur score gagne.
- Sprint 60 s : obtenir le plus grand score en une minute.
- Courses à 128, 256, 512, 1024 et 2048 : atteindre la tuile choisie ;
  en duel, le premier à cet objectif gagne. Chaque objectif a son classement
  solo séparé. La course à 128 existante garde ses scores et salons.
Les classements solo sont séparés par mode. Les chronos continuent en
arrière-plan ou pendant l’ouverture des menus. Le créateur choisit la
règle d’un salon ; son adversaire la reçoit automatiquement.
Mort subite seul utilise un combo de 2 s ; les autres restent à 1,5 s.
Les coups portent leur heure de saisie pour valider les écarts entre
fusions sans les confondre avec un envoi groupé. Le serveur autorise
une courte marge de réception réseau avant de confirmer l’élimination,
sans prolonger le délai de 2 s entre les actions.

DUEL EN LIGNE (1V1)
Deux comptes distincts sont nécessaires. Ouvrir Duel 1v1, créer un salon,
puis partager son code ou Copier le lien avec un ami. L’adversaire saisit
ce code dans Duel 1v1 et rejoint le salon. Décompte de 3 secondes puis
la durée du mode choisie (5 minutes ou Sprint 60 s), contrôlée par le serveur ;
égalité possible quand le mode se termine au score. Les deux joueurs ont la même grille initiale
et la même séquence pseudo-aléatoire de génération. Les scores adverses
sont actualisés chaque seconde. Les scores de duel sont séparés du
classement solo. Une grille bloquée conserve son score jusqu’à la fin.
Quitter un duel en cours compte comme un abandon. Une déconnexion
ou un rafraîchissement ne suspend pas le chrono ; le navigateur retrouve
le duel sauvegardé à la reconnexion. Les salons expirent après 24 heures.
Les tables sont créées automatiquement, sans configuration supplémentaire.

RÉACTIVITÉ
Les commandes mettent à jour le jeu immédiatement ; les tuiles glissent
pendant 180 ms sans bloquer la commande suivante. Un geste qui interrompt
un glissement reprend les positions affichées, sans recaler les tuiles.
Les nœuds des tuiles sont réutilisés ; le combo conserve sa place dans
la page pour éviter les déplacements involontaires sur mobile.
Le toucher réagit dès le seuil de glissement, avant de lever le doigt.
La validation serveur se fait par lots en arrière-plan. Une séquence
partagée permet de continuer à afficher les nouvelles tuiles sans être
limité aux 32 prochaines tuiles d’une réponse réseau. Le journal de coups
est borné à 4096 entrées ; la reconnexion réessaie automatiquement, avec
délai progressif. Une réponse perdue est rapprochée de l’état officiel,
sans rejouer les coups déjà acceptés ni effacer les suivants. Les réponses
d’une ancienne partie ne peuvent pas remplacer la nouvelle partie.
Le serveur garde le calcul des scores et l’échéance des duels. Les coups
non transmis avant la fin d’un duel peuvent être rejetés par le serveur.
Tests navigateur Chromium : continuité visuelle lors d’un changement de
direction, animation suspendue, 64 coups hors ligne puis reconnexion,
tactile émulé, CPU ralenti 4x, latence de 800 ms et réponse réseau perdue.
Ces simulations ne remplacent pas un test sur chaque appareil physique.

SAFARI ET MOBILE
Le plateau adapte sa taille au portrait et au paysage, avec des commandes
accessibles au toucher et les marges des encoches. Les menus suivent la
zone visible quand le clavier s’ouvre et restaurent le défilement à la fermeture.
Un deuxième doigt ne coupe plus le geste principal. Un repli Touch Events
est disponible si Pointer Events manque. Le son reprend après interruption.
Le rendu évite les mesures des tuiles immobiles ; les effets coûteux sont
réduits sur écran tactile. Une rotation recalcule les positions des tuiles.
Validation Chromium : huit formats de 320x568 à 1024x768, paysage, clavier
simulé, multitouch, CPU 4x et réseau lent. Safari réel reste à vérifier ;
le téléchargement de WebKit était bloqué dans l’environnement de travail.

AMIS, CHAT ET REVANCHES
Amis & chat : envoyer une demande par pseudo, accepter ou refuser, puis
ouvrir une discussion privée. Les 100 derniers messages sont affichés ;
ils sont conservés en base. Retirer un ami coupe l’accès à la discussion.
Le bouton Proposer un duel publie une invitation dans le chat, réservée
aux deux joueurs. Chacun ouvre le duel depuis cette invitation.
Après le résultat, les deux joueurs acceptent la revanche. La nouvelle
grille repart à zéro ; les victoires et égalités de la série restent
visibles, avec le numéro de manche, y compris après rechargement.
Créer un autre duel démarre une nouvelle série. Les salons expirent après
24 heures. Les messages se rafraîchissent quand le panneau Amis est ouvert ;
il n’y a pas encore de notifications hors du chat.
Tests : accès privé, invitation réservée, acceptation réciproque,
revanches concurrentes sans doublons, séries et chat après redémarrage,
parcours navigateur à deux joueurs dont un mobile, SQLite et PostgreSQL TLS.

SKINS ET EFFETS
Ouvrir Skins pour voir les défis et équiper un effet débloqué : Étincelle
(disponible), Aurore (1 200 points), Pulsar (combo x8), Solaire (course 512
en 90 s maximum), Prisme (course 1024 en 180 s maximum).
Couleurs et transformations de fusion changent sans modifier les règles.
Les défis sont cosmétiques, évalués pendant le jeu et sauvegardés dans le
navigateur de cet appareil ; ils ne sont pas synchronisés avec le compte.
Effets légers désactive les particules et réduit l’amplitude des fusions.
Les préférences de réduction des animations restent respectées.
Le mouvement conserve ses 180 ms : les interruptions utilisent la progression
de l’animation sans mesurer les tuiles, les particules utilisent la géométrie
mise en cache et le texte des tuiles inchangées n’est plus recréé à chaque coup.
Tests : continuité sans saut, animation suspendue, zéro mesure de tuile
pendant les coups, déblocages et limites de temps, équipement et persistance.

CONTINUITÉ DES ANIMATIONS
Un geste conserve les glissements dont la destination ne change pas.
Les tuiles consommées par une fusion terminent leur animation même si
un nouveau coup arrive avant la fin. La géométrie du plateau est mesurée
à l’initialisation et aux redimensionnements, pas à chaque commande.
Le jeu garde une référence aux animations au lieu de les rechercher pour
chaque tuile. Les réponses réseau évitent de réécrire les textes inchangés ;
la sauvegarde locale attend une période inactive lorsque le navigateur le permet.
Mesure Chromium mobile émulé, CPU x4, 60 coups : médiane 12,8 → 9 ms,
p95 23,3 → 15,4 ms, 60 → 0 mesures du plateau pendant les coups.
Ce sont des temps de traitement JavaScript, pas une garantie de fréquence
d’affichage sur Safari ou sur tous les téléphones physiques.

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
