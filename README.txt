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

SKINS, PIÈCES ET COFFRES
La collection est liée au compte et conservée en base. Les anciens déblocages
locaux par combo/course sont remplacés par les coffres ; aucun skin payant
n’existait dans cette version. Étincelle reste disponible sans compte.
La sélection contient 34 éditions : 5 Communes, 8 Rares, 9 Épiques,
10 Légendaires, Étincelle et King. Chaque collection a ses motifs SVG, ses formes, ses couleurs
par valeur et sa transformation de fusion. Aucun effet continu sur le plateau.
Or impérial est désormais Légendaire et disponible dans les coffres. Le seuil
de score ne le débloque plus ; les propriétaires existants le conservent.
King : le seul premier du classement classique (score positif, puis pseudo
croissant pour départager, comme le classement). Droit calculé côté serveur,
retiré au prochain contrôle client (toutes les 5 s en page visible). En cas
de perte de connexion pendant le contrôle, King est masqué par précaution.
Pièces : 1 par coup valide et 1 par tranche de 128 points en classé et duel.
En histoire, la première victoire vérifiée d’un niveau donne 20 + 2 x niveau
pièces. Son parcours est rejoué par le serveur ; la récompense n’est versée
qu’une fois par niveau et compte. Le mode libre local ne verse pas de pièces.
Coffre explorateur : 80 pièces ; Commun 70 %, Rare 24 %, Épique 5 %, Légendaire 1 %.
Coffre royal : 240 pièces ; 35 %, 45 %, 18 %, 2 % dans le même ordre.
Coffre astral : 800 pièces ; 0 %, 35 %, 50 %, 15 % dans le même ordre.
Un coffre donne un skin. Un nouveau skin est choisi en priorité dans la
rareté tirée ; si tous sont possédés, le doublon rembourse 35 % du prix.
King et Étincelle sont exclus des tirages. Aucun achat en argent réel.
Tirages cryptographiques côté serveur, débit et récompense dans une seule
transaction ; reçu idempotent pour reprendre une ouverture dont la réponse
a été perdue. Inventaire, sélection et pièces sont synchronisés entre appareils.
La scène de coffre utilise des sons progressifs, un couvercle animé, des rayons
et des particules bornées. Effets légers et réduction des animations respectés.
Tests : probabilités exactes, contrôle des gains, tirage Or, révocation King,
concurrence, reprise sans double débit, persistance SQLite/PostgreSQL TLS,
révélation mobile et dessins distincts pour les valeurs de 2 à 2048.

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

DIAGNOSTIC DU DÉMARRAGE
Une erreur de connexion 28P01 est réessayée trois fois, après 1, 2 puis
4 secondes, sans modifier les identifiants. Un rejet persistant reste fatal.
Les erreurs TLS et les migrations ne sont pas réessayées par ce mécanisme.
Le message de démarrage inclut RENDER_GIT_COMMIT pour identifier la version.
Un message de démarrage ne remplace pas la confirmation Live de Render.

MODE HISTOIRE — LES FRAGMENTS DE L’AURORE
Modes > Histoire ouvre une campagne solo de 18 niveaux, en trois chapitres.
Aider Luma à rallumer le Jardin des étincelles, les Ruines de cristal puis
le Cœur de l’aurore. Chaque victoire débloque le niveau suivant ; les
anciens niveaux restent rejouables pour améliorer leurs une à trois étoiles.
Objectifs : créer une tuile, gagner des points, compter les fusions,
collecter plusieurs tuiles précises, libérer la glace ou rejoindre une balise.
Les rochers coupent les lignes et restent fixes. La glace bloque une case
jusqu’à une fusion orthogonalement adjacente. Une balise demande une tuile
assez grande sur sa case. Les niveaux ont un budget de coups ; trois défis
ajoutent un chrono. Les chronos continuent sur la carte et en arrière-plan.
Les essais partagent une séquence déterministe de nouvelles tuiles : on peut
apprendre un chemin et le refaire. Pas de vies payantes ni d’attente imposée.
Étoiles et partie en cours sont locales à cet appareil/navigateur, sans compte.
Reprendre depuis la carte après un rechargement. Les règles des obstacles
restent isolées des parties classiques, classées et des duels.
Les 18 chemins de victoire de test/fixtures/story-solutions.json sont rejoués
par npm test avec vérification des budgets, des cases bloquées et des étoiles.
Contrôles navigateur : campagne complète, verrouillage, reprise, transitions
entre modes, petits écrans et paysage. Les animations existantes sont réutilisées.

ÉDITIONS SIGNATURES : DIRECTION ARTISTIQUE
34 skins actifs (17 hommages non officiels et 17 créations originales ou
exclusives) remplacent la sélection de 100 thèmes. 32 sont dans les coffres ;
Étincelle et King restent exclusifs. Les probabilités de rareté ne changent pas.
Les 106 éditions archivées restent résolues, visibles et équipables pour leurs
propriétaires. Les reçus en attente fonctionnent encore, sans nouveau débit.

Six univers, avec palette, motifs, maxime, courte histoire et aperçus dessinés :
- Éléments : forge, banquise, marées, vitrail et phénix.
- Mondes oubliés : cartes stellaires, Saturne, Mars et trou noir.
- Dark Tech : terminaux nocturnes, code, laboratoires et vaisseaux.
- Arcade : pixels, blocs, anneaux, labyrinthes et cartoon à l’encre.
- Sceaux antiques : or, lapis, ivoire, écailles et gravures.
- Anime : chakra, sphères étoilées, toile de pirate et forêt peinte.
La collection est indiquée par un bandeau teinté sur chaque carte. La rareté
reste une information distincte. Les filtres par univers, rareté, possession,
recherche et type d’hommage se combinent. Les listes sont paginées à 12 cartes ;
les onze valeurs se chargent dans la galerie à la demande.

Les dessins sont des compositions vectorielles en couleur, et non un emblème
répété sur un cadre. Les matières et typographies varient : pixels sans lissage,
cartoon crème/noir, acier de terminal, papier peint, lapis et gravures d’or.
Mines cubiques conserve ses onze minerais. Les planches sont statiques et
partagées entre les tuiles ; aucun filtre, flou ni animation de fond en continu.
L’animation de déplacement reste à 180 ms, sans attente ajoutée aux entrées.

Régénération (optionnelle, assets inclus ; pas de Python en production) :
python3 scripts/generate-skin-art.py
La commande génère skin-expansion.js, les planches des archives puis appelle
scripts/illustrate-signature-skins.py pour les compositions des éditions actives.
Le choix actif et les métadonnées sont dans skin-expansion.json ; les anciennes
définitions et tous les identifiants sont conservés. Les SVG restent des créations
originales, les hommages sont signalés non officiels.

ANIMATIONS ET AMBIANCES
Le coffre suit les phases charge > harmonisation > déverrouillage > onde
> révélation. Les couleurs et sons suivent le tirage confirmé par le serveur.
Passer l’animation et réduire les mouvements ne changent ni récompense ni reçu.
14 palettes de sons évoluent avec la valeur et le combo, sous une limite de
32 voix. Les effets de barre Rares et supérieurs sont limités à 8 particules
par fusion, nettoyées après 850 ms ; les effets légers les désactivent.

Validation : npm test vérifie inventaires, archives, reçus, probabilités, dessins,
collections, modes de jeu et synchronisation. Les contrôles navigateur couvrent
les six univers, les aperçus, la recherche Naruto/Dragon Ball, l’équipement,
les coffres, les anciens reçus et les petits écrans. Les contrôles de glissement
et de latence restent disponibles en développement. Safari sur appareil physique
n’est pas disponible dans cet environnement.
