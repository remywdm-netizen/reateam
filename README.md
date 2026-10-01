# Planning MAR · Réa / Endoscopie

Application web (un seul fichier `index.html`, sans serveur) pour le roulement des MAR entre réanimation et endoscopie.

## Règles intégrées

- Cycle de 10 semaines (cycles A et B).
- Réa : 3 postes = 2 MAR du roulement + 1 MAR extérieur fixe. Endoscopie : 3 MAR du roulement.
- Chaque MAR du roulement enchaîne 2 semaines de réa (relais d'un MAR par semaine) puis 3 semaines d'endoscopie.
- Aucune absence n'est possible pendant la 1re des deux semaines de réa.
  - Un temps partiel, une récupération, une formation ou une autre absence y sont refusés à la saisie.
  - Un congé, une garde ou une maladie sont acceptés, et le planning propose une alternative.
    - De préférence, la semaine 1 de l'absent est échangée avec la semaine 2 du MAR qui entrait en réa la semaine suivante. Ce MAR entre une semaine plus tôt et l'absent une semaine plus tard ; chacun garde ses 2 semaines, donc il n'y a aucun déséquilibre.
    - Sinon, un MAR en endoscopie ces deux semaines et disponible toute la 1re semaine fait les 2 semaines de réa de l'absent. On choisit de préférence celui dont les consultations et blocs tombent le moins sur les jours d'absence, et l'absent reprend son planning d'endoscopie.
    - Le bouton **Appliquer** valide l'échange, **Annuler** revient en arrière.
  - Rééquilibrage sur 3 mois : après un échange, le planning propose l'échange inverse sur une des périodes de réa suivantes du remplaçant, dans les 13 semaines, quand l'absent est disponible. Un encadré *Équilibre de la réa sur 3 mois* compte les semaines de réa de chaque MAR sur les 13 semaines affichées et les compare au cycle sans échange ; tout écart est signalé. Avec 5 MAR en relais, le rééquilibrage fait enchaîner plus de 2 semaines de réa : le nombre de semaines est indiqué.
- Consultations l'après-midi : lundi ×2, mardi ×1, mercredi ×1, jeudi ×2.
- Consultations lib (consultation du mardi et l'une des deux du jeudi) : le consultant du mardi est au bloc le lundi après-midi suivant, celui du jeudi le mardi après-midi suivant.
- MAR : CS (100 %), RW et SG (90 %), MS et JC (80 %), Extérieur réa (fixe en réa), Extérieur renfort (ajouté automatiquement en réa ou en endoscopie quand un poste manque, la réa en priorité).
- Une consultation lib ne se fait jamais sans le bloc qui suit. Si le consultant ne peut pas assurer ce bloc (indisponible, ou en réa après un échange), la consultation passe à un MAR qui le pourra. Celui-ci est de préférence en endoscopie le jour du bloc ; sinon, il fait le bloc et sa consultation simple est confiée à un extérieur.
- Consultation impossible à cause d'une indisponibilité :
  - consultation simple (lundi, mercredi, jeudi) : le planning indique qu'elle est à confier à un MAR extérieur ;
  - consultation lib (mardi, ou jeudi *) : le planning propose un remplaçant du roulement. Ce remplaçant est en endoscopie ce jour-là et libre pour le bloc de l'après-midi suivant. On choisit de préférence un MAR en endoscopie ce jour-là ; sinon un MAR dont la consultation simple de ce jour-là passera à un extérieur. Le bouton **Appliquer** valide la proposition : le planning est modifié, consultation et bloc compris. **Annuler** revient en arrière.
- Temps partiels (0,9 : 2 jours off en cycle A, 3 en cycle B ; 0,8 : 5 jours off par cycle) : les jours off ne sont pas placés automatiquement. Chaque MAR les saisit dans **Indisponibilités** avec le motif « Temps partiel ». Le planning signale alors le poste à compenser (renfort extérieur, consultation ou bloc à réattribuer).

## Code d'accès

Un code d'accès (lettres et chiffres, majuscules ou minuscules indifférentes) est demandé à l'ouverture. Il est mémorisé 30 jours sur chaque appareil, ou jusqu'au clic sur **Se déconnecter**. Pour le changer, calculez l'empreinte SHA-256 de `planning-mar:<NOUVEAU CODE EN MAJUSCULES>` et remplacez `ACCESS_HASH` dans `index.html`.

Ce code évite un accès fortuit, mais ce n'est pas une vraie sécurité. Le site est statique et le dépôt public, donc le contenu de `index.html` reste lisible sur GitHub, et un code simple peut être deviné à partir de son empreinte. N'y mettez aucune donnée sensible (la page ne contient que les initiales des MAR, les saisies restant dans chaque navigateur).

## Onglets

- **Planning par MAR** : semaines réelles avec dates, chaque jour divisé en matin et après-midi (consultations et blocs l'après-midi), effectifs réa / endo, consultations, et alertes (réa réduite, endoscopie incomplète, consultation à réattribuer avec les MAR disponibles). Bouton **Régénérer le planning** : après une mise à jour des indisponibilités, il retire les remplacements et échanges devenus inutiles, puis applique toutes les propositions dans l'ordre chronologique. Export CSV et impression.
- **Récupération en un clic** : dans *Planning par MAR*, un clic sur la case d'un MAR ajoute une récupération ce jour-là, après confirmation. Un nouveau clic la retire. Les règles s'appliquent : refus en 1re semaine de réa.
- **Planning par poste** : même période et mêmes alertes, présentées en récapitulatif : une ligne par demi-journée, les colonnes Réa, Endoscopie, Consultation, Consultation lib, Bloc et Absents, avec les noms des MAR dans les cases.
- **Indisponibilités** : saisie des jours de temps partiel, congés, formations, maladies… pour chaque MAR, sur une date ou une période. Un **compteur annuel** indique, pour chaque MAR et chaque année, les jours ouvrés saisis par motif, ainsi que les jours de temps partiel posés, le quota annuel (10 % des jours ouvrés pour 0,9, 20 % pour 0,8) et le reste à poser.
- **Paramètres** : date de la semaine 1 du cycle, noms des MAR, récapitulatif de toutes les règles du planning, export / import des données.

## Mise en ligne sur GitHub Pages

1. Créez un dépôt sur GitHub (par exemple `planning-mar`).
2. Déposez `index.html` et `README.md` à la racine (bouton *Add file → Upload files*).
3. Dans *Settings → Pages*, choisissez la branche `main` et le dossier `/ (root)`, puis enregistrez.
4. La page est disponible à l'adresse `https://<votre-compte>.github.io/planning-mar/`.

## Données

Les indisponibilités sont enregistrées dans le navigateur de chaque utilisateur (localStorage). Pour partager une saisie, utilisez **Paramètres → Exporter les données**, puis **Importer un fichier** sur l'autre poste. Aucune donnée n'est envoyée sur un serveur.
