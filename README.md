# Planning MAR · Réa / Endoscopie

Application web (un seul fichier `index.html`, sans serveur) pour le roulement des MAR entre réanimation et endoscopie.

## Règles intégrées

- Cycle de 10 semaines (cycles A et B).
- Réa : 3 postes = 2 MAR du roulement + 1 MAR extérieur fixe. Endoscopie : 3 MAR du roulement.
- Chaque MAR du roulement enchaîne 2 semaines de réa (relais d'un MAR par semaine) puis 3 semaines d'endoscopie.
- Consultations l'après-midi : lundi ×2, mardi ×1, mercredi ×1, jeudi ×2.
- Consultant du mardi : bloc le lundi après-midi suivant. Consultant du jeudi (*) : bloc le mardi après-midi suivant.
- MAR : CS (100 %), RW et SG (90 %), MS et JC (80 %), Extérieur réa (fixe en réa), Extérieur renfort (ajouté automatiquement en réa ou en endoscopie quand un poste manque, la réa en priorité).
- Temps partiels en journées entières : 0,9 = 2 jours off en cycle A, 3 en cycle B ; 0,8 = 5 jours off par cycle. Les jours off sont posés sur la 2e semaine de réa (compensés par l'extérieur renfort) et sur des jours d'endoscopie sans consultation ni bloc imposé.

## Onglets

- **Planning** : semaines réelles avec dates, effectifs réa / endo, consultations, et alertes (réa réduite, endoscopie incomplète, consultation à réattribuer avec les MAR disponibles). Export CSV et impression.
- **Indisponibilités** : saisie des congés, formations, maladies… pour chaque MAR, sur une date ou une période.
- **Desiderata** : chaque MAR à temps partiel choisit ses jours off, période de 5 semaines par période (moitié A ou B du cycle), en cliquant dans une grille. Seuls les jours de réa ou d'endoscopie sont possibles (jamais un jour de consultation ou de bloc imposé), et un seul temps partiel peut être off par jour, car le renfort ne compense qu'un poste. Dès que le quota de la période est atteint (0,9 : 2 jours en A, 3 en B ; 0,8 : 5 jours), les souhaits remplacent la répartition par défaut dans le planning. Sinon la répartition par défaut reste appliquée.
- **Paramètres** : date de la semaine 1 du cycle, noms des MAR, export / import des données.

## Mise en ligne sur GitHub Pages

1. Créez un dépôt sur GitHub (par exemple `planning-mar`).
2. Déposez `index.html` et `README.md` à la racine (bouton *Add file → Upload files*).
3. Dans *Settings → Pages*, choisissez la branche `main` et le dossier `/ (root)`, puis enregistrez.
4. La page est disponible à l'adresse `https://<votre-compte>.github.io/planning-mar/`.

## Données

Les indisponibilités et les desiderata sont enregistrés dans le navigateur de chaque utilisateur (localStorage). Pour partager une saisie, utilisez **Paramètres → Exporter les données**, puis **Importer un fichier** sur l'autre poste. Aucune donnée n'est envoyée sur un serveur.
