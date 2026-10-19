# Atelier — Éditions d’ailleurs

## Audit et périmètre

Le projet reste une application Node/Express avec PostgreSQL sur Render et SQLite
en développement. Le client utilise du JavaScript, CSS et SVG, sans framework.
Le moteur pur `engine.js`, les règles des modes, les parties classées, les duels,
la campagne et les fonctions sociales sont conservés. Les déplacements s’engagent
immédiatement et glissent pendant 180 ms, sans attendre les animations.

Les combos existants restent fondés sur leur fenêtre temporelle (1,5 seconde en
mode classique, 2 secondes en mort subite). Leurs règles et les récompenses ne
changent pas. Le journal et la validation serveur restent autoritaires.

## Contenu réellement livré

12 collections de 5 créations originales : NEBULA, EDEN, ABYSS, AFTERLIGHT,
ARCADE LEGACY, ARCANA, SUGAR DREAMS, CHRONOS, SOLARIS, TEMPEST, PRISM et GLITCH.
Les 60 compositions ont chacune un dessin, une histoire, une matière, un parcours
de 11 couleurs et une identité musicale. Les 660 études de tuiles sont incluses.

Étincelle reste le skin de départ. SOVEREIGN, id stable `king`, est hors des 60.
Les 136 autres anciennes éditions restent équipables par leurs propriétaires ;
les identifiants `gold` et `jade` sont conservés dans le nouveau catalogue.
L’accès créateur de TrueBallKnower continue de couvrir toutes les éditions.

Le registre est dans `public/atelier-catalog.json` et sa version navigateur
`atelier-catalog.js`. `scripts/build-atelier.py` contient la direction artistique,
les parcours chromatiques et les profils ; `scripts/render-atelier.py` dessine
les compositions dans `public/atelier-art/`. Ce sont des sources originales,
sans personnages, logos, musiques ou illustrations téléchargés.

Régénérer les sources et planches, sans dépendance Python supplémentaire :

```sh
python3 scripts/build-atelier.py
python3 scripts/render-atelier.py
```

Le serveur n’exécute pas ces scripts : tous les assets générés sont versionnés.
Ajouter un skin ne nécessite pas une nouvelle exception dans l’interface.

## Rendu, effets et son

Le moteur de rendu utilise le même `paint()` pour le jeu, les cartes et le plateau
de démonstration. Les matières ont leurs propres finitions : papier végétal,
bioluminescence, verre, pixels, pierre, satin, métal brossé, émail, orage et données.
Les chiffres ont une encre et un fond de lecture vérifiés ; les tailles suivent
le nombre de chiffres. Au-delà de 2048, la matière finale garde son identité et
reçoit un cadre d’ascension, un rang +1/+2/etc. et la véritable valeur.

Les fonds du plateau, emplacements vides, contours et accents suivent le skin.
Aucun filtre lourd ou animation permanente n’est ajouté aux cases.

11 grammaires de fusion : cosmique, botanique, abyssale, électrique, cristalline,
mécanique, arcade, solaire, glitch, confiserie et souveraine. Angle, durée,
intensité et paramètres restent configurables par skin. Les mêmes profils sont
joués en démonstration. Ils animent l’intérieur ; les glissements restent libres.
Les quatre paliers visuels suivent x3, x5, x8 et x12. Les particules de combo sont
limitées à 8, celles du plateau à 18 ; les effets légers et le mouvement réduit
les désactivent. Les changements de préférence système sont pris en compte.

60 signatures de synthèse utilisent des accords, accordages, rythmes, formes
d’onde et enveloppes distincts. Elles varient avec la valeur et le combo. Le moteur
limite le total à 32 voix, au plus 8 par fusion. Le volume et le mode muet sont
mémorisés localement. Aucun son ne part à la simple ouverture d’une collection.
L’écoute de démonstration est volontaire. Aucune ambiance sonore continue.

## Atelier et sauvegardes

L’accueil montre les 12 mondes : récit, palette, aperçu et progression réelle /5.
Une collection ouvre ses cinq éditions. Tous les skins, possessions, raretés,
favoris et recherche se combinent. La liste monte au plus 10 cartes ; les préférences
de navigation sont mémorisées par compte sur l’appareil.

Chaque détail montre un plateau, des cases vides, les grandes valeurs, le récit,
la rareté, l’accès et l’équipement. « Essayer une fusion » rejoue 64+64 via le vrai
moteur dans un état séparé. Aucun point, mouvement, combo réel ni pièce ne change.
Les favoris sont idempotents, validés et sauvegardés côté serveur, même pour un
skin encore verrouillé. Marquer un favori n’accorde aucun droit d’équipement.

Les raretés sont Commun, Rare, Épique, Légendaire, Mythique. Le budget des anciens
tirages Légendaires est partagé avec Mythique :

| Coffre | Commun | Rare | Épique | Légendaire | Mythique |
|---|---:|---:|---:|---:|---:|
| Explorateur · 80 pièces | 70 % | 24 % | 5 % | 0,9 % | 0,1 % |
| Royal · 240 pièces | 35 % | 45 % | 18 % | 1,7 % | 0,3 % |
| Astral · 800 pièces | 0 % | 35 % | 50 % | 13 % | 2 % |

Le nombre total de chances haut de gamme, les prix, pièces de jeu et remboursements
restent cohérents avec l’économie existante. Les reçus protègent les ouvertures
contre les doubles débits, y compris pour une récompense maintenant archivée.

## Champion et événements

Le Trône du champion présente SOVEREIGN, ses valeurs et sa condition réelle.
Le serveur détermine le premier du classement classique permanent : score positif,
score décroissant, pseudo croissant en cas d’égalité (règle existante).
La perte de la place restaure le dernier skin encore autorisé, sans changer la
partie. Le client rafraîchit le statut toutes les cinq secondes quand il est visible.
Une erreur réseau enlève provisoirement la couronne chez les comptes ordinaires.
L’accès créateur existant est distinct et ne prétend pas conférer la première place.

`events` définit un type séparé, partenaire, crédits, dates, statut, skins,
conditions, palette, effets et son. `activeEvents()`/`available()` vérifient les dates
et le statut avant disponibilité. Le concept « Équinoxe / Studio Lisière » est
explicitement fictif et inactif : aucune nouveauté, récompense ou collaboration
officielle n’est simulée. Aucun événement réel ou saison n’est lancé par cette refonte.

## Validation et limites

`npm test` couvre règles, mouvements, modes, duels, campagne, comptes, accès,
archives, reçus, favoris, restauration du champion, tirages sur 10 000 valeurs,
registres, parcours chromatiques, contraste d’encre et assets. Aucun lint ni build
supplémentaire n’existe dans le manifeste du projet.

Les parcours Chromium mobiles vérifient les 12 mondes, les 60 éditions, les aperçus
isolés, l’équipement, les favoris, les grandes valeurs, les coffres, le volume et
les animations réduites. Des planches et captures des collections ont été inspectées.
Les 60 sons ont été rendus dans OfflineAudioContext : signaux différents,
non saturés, silence en mode muet ou volume zéro.

Les vérifications de fluidité comprennent CPU ralenti 4×, 800 ms de latence réseau,
reprise des mouvements hors ligne et direction inversée pendant un glissement.
Elles ne constituent pas une garantie de 60 FPS sur tout matériel. Safari/iPhone
physique et la base de production ne sont pas accessibles à ces vérifications.

## Couronnement : SOVEREIGN et IMPERIAL GOLD

`gold` conserve son identifiant et sa rareté Légendaire dans les coffres ; son
nouveau nom est **IMPERIAL GOLD**. Son illustration représente lingots biseautés,
sceaux solaires et lauriers gravés. Les anciens propriétaires le conservent.
SOVEREIGN reste réservé au premier classique, avec l’exception créateur existante
pour TrueBallKnower. Ses onze étapes mêlent velours pourpre, rubis, saphir, or,
perles et filigranes. Les compositions sont différentes de celles du skin or.
Les feuilles SVG sont statiques, partagées entre les tuiles et sans filtre animé.

SOVEREIGN possède une signature de fusion en accord majeur, des étoiles dorées
sur les combos et un motif original de couronnement de 4,8 secondes. Le bouton
« Écouter le couronnement » le prévisualise ; il accompagne aussi la victoire.
`royal.js` compose ce motif une seule fois avec OfflineAudioContext, puis réutilise
un AudioBuffer. Aucun séquenceur ou synthétiseur permanent ne tourne en partie.

Une transition serveur vers `finished`, avec le joueur local gagnant et SOVEREIGN
équipé, déclenche une bannière et **« The king has won »**, une seule fois par
manche. Ni un chronomètre local, ni un match nul, ni une défaite, ni l’ouverture
d’un ancien résultat ne déclenche l’annonce. Les revanches ont leur propre clé.
Le clip synthétique de 20 Ko est fourni dans `public/audio/king-victory.mp3`, avec
crédits et licence dans `NOTICE.txt`. Il se précharge et se décode une fois lors
de la première interaction audio avec SOVEREIGN. Aucun service vocal externe ni
voix système n’est nécessaire ; SpeechSynthesis sert uniquement de secours en cas
d’échec du fichier. L’auteur peut régénérer le clip avec `scripts/build-royal-voice.sh`
et un FFmpeg disposant de Flite. FFmpeg ne fait pas partie des dépendances du jeu.
Le volume, la sourdine et le passage en arrière-plan arrêtent la célébration sonore.
Le mouvement réduit désactive l’apparition animée de la bannière.

Optimisations : thèmes du document écrits seulement au changement de skin ;
textes de portefeuille écrits seulement au changement de valeur ; images,
keyframes et descriptions de particules réutilisées ; références aux glissements
terminés libérées. Une fusion joue sa signature sans superposer les deux notes du
bruit de déplacement. Le glissement reste à 180 ms et ne bloque jamais l’entrée.

Validation de cette mise à jour : 31 tests Node ; aperçu des 22 nouvelles tuiles ;
partie 1v1 réelle sur serveur local avec annonce unique après abandon de l’adversaire ;
clip décodé dans Chromium sans voix système ; motif rendu hors ligne sans écrêtage ;
100 notifications de portefeuille sans réécriture du thème du document ;
60 signatures de fusion audibles, distinctes et plafonnées à huit voix par fusion.
Avec SOVEREIGN, quatre coups classés locaux en 240 ms sous ralentissement CPU ×4,
malgré 800 ms de latence réseau simulée ; état final identique au serveur.
Contrôles tactiles avant relâchement, reprise après 64 coups hors ligne et continuité
d’un glissement interrompu (saut mesuré : 0 px) vérifiés. Huit formats mobiles et
paysage vérifiés sans débordement. Ces mesures Chromium ne constituent pas une
mesure sur un iPhone/Safari physique ; aucun appareil de ce type n’était accessible.

## Mise à jour mobile Safari et hommages

Priorité iPhone : le compteur de combo utilise désormais une animation native
`transform` et une seule échéance, au lieu d’une boucle JavaScript à chaque image.
Les règles restent fondées sur les horloges réelles : 1,5 s en classique, 2 s en
mort subite. Les tuiles sont réutilisées dans un pool borné ; les silhouettes de
fusion sont limitées à 16, avec annulation et recyclage propres. La glisse reste
à 180 ms. Sur écran tactile, le geste se valide dès 10 px ; l’audio est préparé
pendant une période inactive et sa reprise reste liée au geste iOS. Les événements
de viewport identiques ne réécrivent plus les variables de page. Les textures ont
une zone de peinture isolée ; les particules mobiles évitent les ombres coûteuses.

La collection **HOMMAGES · JEUX** ajoute deux éditions dessinées pour Fusion :
**Minecraft · Minerais** (Épique, onze minerais du charbon à la netherite) et
**Pokémon · Ligue des Capsules** (Légendaire, onze capsules de Poké à Master).
Elles sont disponibles dans les coffres aux probabilités habituelles ; les
identifiants `ores` et `capsules` conservent les anciennes possessions. L’accès
créateur inclut les deux éditions. Les douze collections originales de cinq skins
restent présentes : 60 créations originales + 2 hommages, hors starter et champion.
Les compteurs et la pagination prennent en charge les collections de taille variable.
Les variantes au-dessus de 2048 affichent leur nombre sans revenir à un ancien minerai.

Validation : 32 tests Node ; les 682 panneaux des éditions de coffre sont vérifiés ;
aperçu des nouveaux dessins ; équipement et 60 coups rapides avec chacun des deux
skins, sans métadonnées périmées après recyclage. La même séquence de 159 coups
sur profil mobile crée 36 éléments de tuile contre 318 auparavant (-89 %) ; le
maximum présent passe de 103 à 32 éléments. Un compteur de combo actif produit une
seule écriture de style en 350 ms. Un geste de 11 px est validé avant relâchement.
Le banc classé avec SOVEREIGN, CPU ×4 et réseau à 800 ms, termine quatre coups
locaux en 165 ms et rejoint l’état serveur. Continuité de glisse (0 px de saut),
reprise hors ligne, huit dimensions mobiles, atelier et victoire royale vérifiés.
Ces mesures sont faites dans Chromium simulant un mobile. Le téléchargement du
moteur WebKit disponible a échoué dans cet environnement ; aucun résultat Safari
physique ou taux d’images garanti sur iPhone n’est revendiqué.

## Chargement mobile : jeu prioritaire et cache hors ligne

`client-assets.js` assemble en mémoire un paquet de jeu, un paquet de cosmétiques
et une feuille CSS commune. La page servie par Express demande une feuille et un
seul script `defer`, au lieu de quatorze scripts successifs. Le catalogue et les
anciennes éditions restent dans un paquet séparé, chargé après l’affichage du jeu
ou immédiatement à la demande du bouton Skins. La session courante est transmise
au module même si la connexion intervient avant son chargement. La création des
cartes de collection attend leur ouverture. Une récompense d’histoire n’exige
plus que le module cosmétique soit déjà disponible.

Les fichiers sont compressés une fois en Brotli/gzip, avec les modules intégrés
à Node ; aucune dépendance ni commande de construction supplémentaire. Les noms
des paquets contiennent leur empreinte et se conservent un an. Le HTML et le
service worker restent revalidés. Les images SVG sont également compressées,
avec un cache serveur borné à 48 illustrations ; les anciennes URL de paquet
redirigent vers leur version actuelle pour les onglets ouverts pendant un déploiement.
Le transfert initial est d’environ 50 Ko en Brotli, contre environ 468 Ko pour
l’ancienne page et ses fichiers non compressés. Le paquet de jeu est d’environ
26 Ko en Brotli ; les 60 Ko de cosmétiques arrivent séparément.

`sw.js` conserve la page publique et les fichiers nécessaires au jeu, puis les
illustrations utilisées. Une visite déjà enregistrée peut donc ouvrir le jeu sans
attendre le serveur, même hors ligne. Un nouveau déploiement renouvelle le cache.
Le cache n’intercepte ni les requêtes non-GET, ni les API de comptes, scores, chats
ou inventaires, ni le contrôle de santé. Les erreurs d’écriture du cache ne font
pas échouer les téléchargements valides. Les données des comptes restent côté
serveur ; seule la présentation publique du jeu est conservée par le worker.
Si la première lecture de session échoue pendant un réveil du serveur, elle est
réessayée avec délai progressif ; une connexion/déconnexion manuelle prend priorité
sur les anciennes réponses en cours.

Validation : 35 tests Node, dont négociation Brotli/gzip, décompression, ETag/304,
HEAD, URL immuables, anciennes URL, compression SVG et syntaxe des paquets/worker.
Comparaison Chromium mobile à 100 Ko/s et 150 ms de latence, serveur déjà éveillé :
ancienne page 4 910 ms, nouvelle page 843 ms jusqu’au jeu utilisable. Un autre essai
retarde volontairement les cosmétiques de 5 secondes : le plateau reste jouable
avant leur arrivée. Retour hors ligne vérifié en 57 ms avec déplacement effectif ;
collection de 13 univers/62 éditions et reconnexion d’un compte après échec réseau
vérifiées. Huit tailles mobiles, gestes multipoints et reprise audio vérifiés.
Ces mesures ne sont pas prises sur Safari/iPhone physique. Le cache nécessite que
Safari ait pu enregistrer la visite ; il ne peut supprimer le réveil de Render
Free lors de la toute première visite. L’origine publique n’a pas pu être mesurée
depuis cet environnement, dont le proxy refuse cette destination.

## Rendu mobile Canvas et app gratuite

`canvas-motion.js` gère uniquement la présentation : positions interpolées,
glissement de 180 ms, fusion et apparition des nouvelles tuiles. Les coups du
moteur logique restent synchrones et n’attendent jamais l’animation. Une seconde
direction repart de la position visible interpolée ; les anciennes silhouettes
de fusion sont plafonnées à seize et supprimées à tout changement de partie.
Le mouvement réduit et la reprise après arrière-plan placent les tuiles à leur
position finale. Le renderer arrête les requêtes d’images quand la scène est stable.

`canvas-renderer.js` sélectionne cette voie sur écran tactile. Il conserve les
seize cases fixes (dont glace, murs et balises de l’histoire) et remplace les
tuiles mobiles HTML par un seul Canvas transparent. Une grille de seize cellules
textuelles accessibles garde valeurs et coordonnées pour VoiceOver. Une absence
de contexte 2D reprend le renderer HTML ; `?renderer=dom` permet aussi de comparer.
Les SVG sont chargés une fois à une taille explicite puis découpés en petites
textures, numéros compris ; le renderer réutilise ces bitmaps pendant les glisses.
Le cache est borné à 64 textures et quatre atlas ; la densité est limitée à 2,
y compris sur écran iPhone à densité 3. Les particules mobiles sont dessinées sur
le même Canvas. Aucun style ou métrique de mise en page n’est lu dans une entrée.
Le Canvas se redessine après changement de skin, taille, retour de page ou
restauration de son contexte ; les sons existants restent indépendants du rendu.

Le paquet initial inclut ces deux modules ; les catalogues restent différés.
`manifest.webmanifest`, les métadonnées Apple, les icônes PNG incluses et le panneau
« Jouer comme une app · gratuit » permettent une installation depuis Safari sans
App Store ni compte développeur payant. Le service worker conserve aussi les
fichiers d’installation ; les comptes, scores et messages restent hors du cache.
Voir `docs/IPHONE.md` pour les étapes d’installation et les limites du stockage iOS.

Validation de cette version : 39 tests Node, dont continuité à l’interruption,
absence de modification des snapshots logiques, suppression des ghosts à un nouveau
chargement, mouvement réduit et monotonie de l’interpolation. Contrôles navigateur :
gestes réels simulés avant relâchement sous CPU ×4 ; aucune lecture de géométrie à
l’entrée ; densité 3 plafonnée à 2 ; boucle arrêtée au repos ; portrait 320 à 430 px
et paysage ; six skins dont Dragon archivé et grands nombres ; cellules VoiceOver ;
glace au niveau 7, murs et balise au niveau 8 ; fallback HTML réellement testé en
renvoyant `null` à la création d’un contexte 2D.

Comparaison série sur le même scénario de 79 coups avec SOVEREIGN, largeur 390 px,
densité 3 et CPU ralenti ×4 (Chromium) : entrée médiane 17,7 → 7,0 ms ; entrée au
95e percentile 40,1 → 14,4 ms ; intervalle d’images au 95e percentile 33,4 → 16,8 ms.
Les lectures de timeline passent de 149 à zéro et les écritures de style de 3 870
à 1 512 sur ce scénario. Ce sont des mesures comparatives émulées, sans garantie
de fréquence d’images sur un iPhone physique ou avec le mode économie d’énergie iOS.
Le scénario réseau vérifie les coups classés et duels avec 800 ms de latence,
la récupération d’un accusé perdu et l’accord avec l’état serveur. Le jeu Canvas
est utilisable avant l’arrivée du catalogue retardé de cinq secondes et s’ouvre
hors ligne après mise en cache. Aucun coût ou service supplémentaire n’est ajouté.

Les vérifications navigateur sont conservées dans `scripts/check-iphone.cjs` et
`scripts/profile-iphone.cjs`. Elles nécessitent Playwright/Chromium pour le poste de
validation seulement (module configurable via `PLAYWRIGHT_MODULE`, exécutable via
`FUSION_BROWSER_PATH`). Elles suppriment la liaison DATABASE_URL dans leur processus,
utilisent un répertoire SQLite temporaire et ne touchent jamais à la base de production.
Le module de jeu livré au téléphone n’ajoute aucune dépendance Playwright.
