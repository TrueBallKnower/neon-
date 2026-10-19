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

Les fichiers de l’app se mettent à jour au prochain chargement avec Internet.
L’activation du cache n’interrompt pas une partie et ne recharge jamais la page
automatiquement. Si une ancienne version reste affichée, ferme l’app puis
rouvre-la avec Internet. iOS peut effacer les caches inactifs ou lors d’un manque
d’espace : une nouvelle ouverture avec Internet permet de les reconstruire.

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
