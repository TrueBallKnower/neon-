# Fusion sur iPhone : installation gratuite

Fusion fonctionne comme une app web sur l’écran d’accueil. Aucun compte
développeur Apple, abonnement, App Store, TestFlight ou paiement n’est nécessaire.

1. Ouvre l’adresse du jeu dans **Safari** : https://neon-teyk.onrender.com/.
2. Laisse le jeu s’ouvrir une première fois avec Internet. Sous la grille,
   **Jouer comme une app · gratuit** indique quand les fichiers sont enregistrés.
3. Appuie sur **Partager**, puis **Ajouter à l’écran d’accueil**. Sur les versions
   récentes d’iOS, laisse **Ouvrir en tant qu’app web** activé si cette option apparaît.
4. Appuie sur **Ajouter**, puis ouvre **Fusion 2048** avec sa nouvelle icône.

Le mode libre peut ensuite s’ouvrir hors ligne si Safari a conservé le cache.
Les comptes, le classement, les pièces, les chats et les duels utilisent toujours
Internet. Le stockage privé n’est pas placé dans le cache public de l’app.
La première visite peut attendre le réveil du serveur Render gratuit.

Une installation ajoute une fenêtre autonome et garde les fichiers déjà chargés.
Elle ne garantit pas à elle seule un débit de 60 images par seconde. Le rendu du
jeu doit rester léger dans Safari et dans l’app installée. Il faut valider le jeu
sur un vrai iPhone ; une émulation de navigateur ne remplace pas cet essai.

Quand une nouvelle version est prête, une carte propose **Mettre à jour** ou
**Plus tard**. Le jeu ne recharge jamais une partie automatiquement. Le bouton
attend la fin des coups non synchronisés, d’une partie classée, d’un duel ou d’un
niveau d’histoire. Une partie libre est sauvegardée avant le rechargement ; si elle
est en cours, une confirmation permet de continuer à jouer. Une ancienne version
qui ne connaissait pas encore cette carte reçoit le nouveau cache sans interrompre
sa page ; il suffit ensuite de rouvrir normalement le jeu.

iOS peut effacer les caches inactifs ou lors d’un manque d’espace : une nouvelle
ouverture avec Internet permet de les reconstruire. Le texte sous la grille
n’annonce le mode hors ligne prêt qu’après confirmation des fichiers nécessaires
par le cache actif. Des icônes indisponibles ou un stockage refusé ne bloquent pas
le jeu en ligne.

Les icônes PNG sont déjà incluses. Pour les redessiner, l’outil facultatif
`python3 scripts/build-app-icons.py` utilise Pillow. Le serveur et le jeu
n’ajoutent aucune dépendance.

## Rendu mobile dédié

Sur écran tactile, Fusion sélectionne automatiquement le rendu Canvas. Le moteur
2048, les délais de combo, les coups classés et les résultats de duel restent
inchangés. La grille conserve ses skins, ses sons, les décors de l’histoire et
une grille de texte pour VoiceOver. L’animation termine sa boucle dès que le
plateau est immobile ; elle ne tourne pas en arrière-plan. Les skins sont
préparés en petites images réutilisables, avec une résolution bornée pour éviter
le travail inutile sur les écrans iPhone à haute densité.

Si un appareil ne peut pas créer de surface Canvas, le jeu reprend automatiquement
son affichage compatible. Pour un diagnostic, l’adresse `?renderer=dom` force cet
affichage, et `?renderer=canvas` force le nouveau rendu sur un ordinateur. Ces
paramètres ne changent ni les règles ni les scores et ne demandent aucune installation.

## Réglage de fluidité

Sous la grille, **Confort de jeu → Fluidité** propose trois réglages sauvegardés
sur cet appareil :

- **Automatique** : résolution adaptée aux capacités de l’appareil ; elle baisse
  aussi si le dessin reste trop coûteux, une fois le glissement terminé.
- **Fluidité maximale** : surface plus petite et effets décoratifs réduits. Les
  sons, les skins, la barre de combo et les règles restent disponibles.
- **Détails maximum** : résolution plus nette, toujours plafonnée pour limiter
  la mémoire sur les écrans Retina.

Ces réglages ne changent ni les scores, ni les délais de combo, ni la durée de
180 ms des glissements. Les textures des tuiles sont préparées par petites étapes
pendant les pauses, puis réutilisées. Les particules sont réutilisées et les sons
courants sont précalculés hors du geste, avec une mémoire bornée. Au repos, la
boucle de dessin s’arrête ; à l’arrière-plan, les effets sonores s’arrêtent aussi.

## Vérifications de cette optimisation

`npm test` vérifie les règles, les modes, les 18 niveaux, les comptes, les duels,
les reprises et les caches de l’app. Les scripts facultatifs ci-dessous utilisent
Playwright et Chromium fournis séparément, sans dépendance ajoutée au serveur :

- `scripts/check-iphone.cjs` : gestes tactiles avant relâchement, continuité des
  glissements interrompus, qualités de rendu sans changement de partie, textures
  préparées, arrêt des RAF, skins, histoire, accessibilité et affichage de secours.
- `scripts/check-audio.cjs` : signatures distinctes des 63 éditions, rendu en
  cache identique au synthétiseur, mémoire bornée, silence immédiat et reprise
  uniquement après une action de l’utilisateur.
- `scripts/profile-iphone.cjs` : série déterministe avec CPU ralenti quatre fois.
  `FUSION_BASELINE_REF=b163f49` compare l’ancien code conservé dans Git, la version
  optimisée et le réglage de fluidité maximale ; les service workers sont bloqués
  pendant cette comparaison pour garantir les versions effectivement mesurées.

Ces contrôles émulent un écran mobile. Ils ne prouvent pas les performances d’un
modèle précis d’iPhone ou de Safari. Un essai sur le téléphone reste nécessaire.

Comparaison enregistrée le 20 octobre 2026 (Chromium, 390 × 844, DPR 3, CPU ×4,
79 coups déterministes, SOVEREIGN, sons coupés, même machine) :

| Mesure | Avant `b163f49` | Automatique optimisé | Fluidité maximale |
| --- | ---: | ---: | ---: |
| Traitement synchrone médian d’un geste |9,2ms|2,4ms|2,1ms|
|95epercentile du traitement |13,1ms|4,5ms|3,6ms|
| Créations de nœuds sur la série |449|16|0|
| Écritures de propriétés CSS |1512|216|112|

Le temps entre images au 95e percentile reste proche de 16,7–16,8 ms dans les trois
cas ; ce test ne mesure pas le délai complet entre le doigt et les pixels sur un
iPhone. Les signatures sonores, le cache et le silence immédiat sont vérifiés séparément
par le contrôle audio.

Avec `FUSION_PROFILE_SOUND=1`, le même scénario avec SFX actifs passe de
10,6 ms à 3,8 ms de traitement médian (3,3 ms en fluidité maximale), et de
17 ms à 10,1 ms au 95e percentile. Ces chiffres décrivent cette exécution locale,
pas une promesse de fréquence ou de latence sur un téléphone physique.
