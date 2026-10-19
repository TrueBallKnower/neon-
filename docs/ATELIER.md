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
