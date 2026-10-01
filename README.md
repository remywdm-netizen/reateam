# Planning MAR · Réa / Endoscopie

Application web (un seul fichier `index.html`, sans serveur) pour le roulement des MAR entre réanimation et endoscopie.

## Règles intégrées

- Cycle de 10 semaines (cycles A et B).
- Réa : 3 postes = 2 MAR du roulement + 1 MAR extérieur fixe. Endoscopie : 3 MAR du roulement.
- Chaque MAR du roulement enchaîne 2 semaines de réa (relais d'un MAR par semaine) puis 3 semaines d'endoscopie.
- Consultations l'après-midi : lundi ×2, mardi ×1, mercredi ×1, jeudi ×2.
- Consultant du mardi : bloc le lundi après-midi suivant. Consultant du jeudi (*) : bloc le mardi après-midi suivant.
- MAR : CS (100 %), RW et SG (90 %), MS et JC (80 %), Extérieur réa (fixe en réa), Extérieur renfort (ajouté automatiquement en réa ou en endoscopie quand un poste manque, la réa en priorité).
- Temps partiels (0,9 : 2 jours off en cycle A, 3 en cycle B ; 0,8 : 5 jours off par cycle) : les jours off ne sont pas placés automatiquement. Chaque MAR les saisit dans **Indisponibilités** avec le motif « Temps partiel ». Le planning signale alors le poste à compenser (renfort extérieur, consultation ou bloc à réattribuer).

## Code d'accès

Un code d'accès (lettres et chiffres, majuscules ou minuscules indifférentes) est demandé à l'ouverture. Il est mémorisé 30 jours sur chaque appareil, ou jusqu'au clic sur **Se déconnecter**. Pour le changer, calculez l'empreinte SHA-256 de `planning-mar:<NOUVEAU CODE EN MAJUSCULES>` et remplacez `ACCESS_HASH` dans `index.html`.

Ce code évite un accès fortuit, mais ce n'est pas une vraie sécurité. Le site est statique et le dépôt public, donc le contenu de `index.html` reste lisible sur GitHub, et un code simple peut être deviné à partir de son empreinte. N'y mettez aucune donnée sensible (la page ne contient que les initiales des MAR, les saisies restant dans chaque navigateur).

## Onglets

- **Planning** : semaines réelles avec dates, effectifs réa / endo, consultations, et alertes (réa réduite, endoscopie incomplète, consultation à réattribuer avec les MAR disponibles). Export CSV et impression.
- **Indisponibilités** : saisie des jours de temps partiel, congés, formations, maladies… pour chaque MAR, sur une date ou une période. Un **compteur annuel** indique, pour chaque MAR et chaque année, les jours ouvrés saisis par motif, ainsi que les jours de temps partiel posés, le quota annuel (10 % des jours ouvrés pour 0,9, 20 % pour 0,8) et le reste à poser.
- **Paramètres** : date de la semaine 1 du cycle, noms des MAR, export / import des données.

## Mise en ligne sur GitHub Pages

1. Créez un dépôt sur GitHub (par exemple `planning-mar`).
2. Déposez `index.html` et `README.md` à la racine (bouton *Add file → Upload files*).
3. Dans *Settings → Pages*, choisissez la branche `main` et le dossier `/ (root)`, puis enregistrez.
4. La page est disponible à l'adresse `https://<votre-compte>.github.io/planning-mar/`.

## Données

Les indisponibilités sont enregistrées dans le navigateur de chaque utilisateur (localStorage). Pour partager une saisie, utilisez **Paramètres → Exporter les données**, puis **Importer un fichier** sur l'autre poste. Aucune donnée n'est envoyée sur un serveur.
