# Fusion 2048 — application iPhone avec Capacitor

Le site https://neon-teyk.onrender.com/ reste disponible à la même adresse.
L’app est un second client du même serveur : mêmes comptes, classement, pièces,
skins, amis et duels. Le serveur navigateur continue à se lancer avec `npm start`.
Aucun abonnement ou outil payant n’a été ajouté.

## Ce qui est préparé

- Projet Xcode : `ios/App/App.xcodeproj`, identifiant provisoire
  `com.trueballknower.fusion2048`, version 1.0.0, iOS 15.4 minimum.
- Capacitor 8.5.3 et plugin App 8.1.2, versions verrouillées dans le lockfile.
- Icône Fusion de 1024 px, écran de démarrage sombre, mode sombre et marges iPhone.
- Fichiers du jeu, sons et dessins publics intégrés à l’app. La grille peut
  démarrer et le mode libre fonctionne même si le serveur ne répond pas.
- Requêtes HTTPS vers le serveur actuel via le module HTTP natif de Capacitor.
  Les sessions restent dans le stockage de cookies natif ; aucun jeton de session
  n’est écrit dans localStorage. Les protections du site navigateur sont conservées.
- Les dessins privés sont récupérés après authentification, gardés en mémoire et
  supprimés de ce cache à la déconnexion. Ils ne sont pas livrés dans le paquet public.
- Sauvegarde à la mise en arrière-plan et arrêt du dessin/des sons. Les chronos des
  modes compétitifs continuent ; la reprise ne remet pas leur temps à zéro.
- Liens de duel partagés avec l’adresse HTTPS habituelle : ils ouvrent le site.
  Cette version ne configure pas d’Universal Links ou de domaine Apple associé.

La connexion Safari ne se transfère pas automatiquement : reconnecte-toi dans
l’app avec le même pseudo et mot de passe. Les données liées au compte restent
sur le serveur. Les sauvegardes locales et étoiles d’histoire du navigateur et de
l’app sont séparées ; aucune sauvegarde existante n’est supprimée ou déplacée.

## Installer et essayer sur un Mac

Il faut un Mac, une version de Xcode compatible avec Capacitor 8 (Xcode 26 ou
plus récent), Node.js >= 22.13, Internet pour le premier téléchargement et un
identifiant Apple. Ouvre Xcode une première fois pour terminer son installation.

Dans le dossier du dépôt :

```sh
npm ci
npm run native:sync
npm run native:open
```

`native:sync` prépare `native/www`, copie les fichiers dans le projet iOS et
actualise les dépendances Swift Package Manager. Il ne déploie pas le site.
Les fichiers générés et réglages personnels Xcode ne sont pas suivis dans Git.

Dans Xcode :

1. Sélectionne le projet **App**, puis la cible **App**.
2. Dans **Signing & Capabilities**, active **Automatically manage signing** et
   choisis ton **Personal Team**. Si l’identifiant est indisponible, remplace
   `com.trueballknower.fusion2048` par un identifiant unique dans
   `capacitor.config.json` et dans **Bundle Identifier** de la cible.
3. Choisis un simulateur iPhone, ou branche ton iPhone et accepte de faire
   confiance au Mac. Active le mode développeur sur l’iPhone si Xcode le demande.
4. Appuie sur **Run ▶**.

Le simulateur et un essai personnel sur appareil avec un compte Apple gratuit
ne nécessitent pas l’abonnement App Store. La signature personnelle gratuite a
des restrictions et expire généralement après sept jours : il faut alors relancer
l’installation depuis Xcode. La distribution App Store/TestFlight nécessite
le programme Apple Developer et ses conditions ; elle n’est pas effectuée ici.

## Mettre à jour les deux versions

- **Site** : déploiement Render habituel de `main`, même lien public.
- **App** : après les changements, relance `npm run native:sync` puis **Run** dans
  Xcode. Pour une distribution, incrémente Version/Build avant un nouvel envoi.

L’app ne charge pas le site dans une WebView distante : `server.url` n’est pas
configuré. Ses fichiers ne sont pas remplacés par le service worker du site.
Il n’y a pas de système de mise à jour distante du code natif ou de signature.

Le serveur HTTPS est défini dans `native/settings.json`. Modifier cette adresse
ne renomme pas le site et ne modifie pas les données. Aucune clé secrète, aucun
certificat Apple et aucun identifiant de signature ne doit être ajouté au dépôt.

## Vérifications effectuées et restantes

`npm test` couvre le paquet local, les échanges natifs, l’annulation des requêtes,
le maintien des protections navigateur et les sessions avec le vrai serveur local.
Le contrôle facultatif `scripts/check-native.cjs` utilise Playwright/Chromium et
une simulation du pont Capacitor : connexion, skin privé, sauvegarde/reprise,
arrière-plan, invitations HTTPS et jeu lorsque le serveur est hors ligne.
Les fichiers iOS ont été générés et `npm run native:sync` a réussi sous Linux.

**Aucune compilation Swift signée, aucun simulateur Apple et aucun iPhone réel
n’ont été exécutés ici.** Il reste à vérifier dans Xcode les cookies iOS après
redémarrage, le clavier, le son, les marges, les gestes et un duel complet à deux.
Capacitor utilise WKWebView : emballer le jeu ne garantit pas à lui seul une
meilleure fréquence d’images. L’intégration locale évite surtout le chargement du
serveur pour ouvrir la grille. Une soumission App Store reste soumise à Apple.
