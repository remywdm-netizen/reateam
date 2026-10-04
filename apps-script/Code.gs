/**
 * Planning MAR · stockage en ligne des données (Google Apps Script)
 *
 * Installation (une seule fois) :
 *  1. Créez un tableur Google vide (https://sheets.new), par exemple « Planning MAR – données ».
 *  2. Menu Extensions > Apps Script : remplacez tout le contenu par ce fichier.
 *  3. Remplacez la valeur de ACCESS_CODE ci-dessous par votre code d'accès, puis enregistrez.
 *  4. Bouton « Déployer » > « Nouveau déploiement » > type « Application Web » :
 *     Exécuter en tant que « Moi », Accès « Tout le monde ». Autorisez l'accès demandé.
 *  5. Copiez l'URL de l'application Web (…/exec) dans la page : Paramètres > Stockage en ligne.
 *
 * Les données sont rangées dans ce tableur :
 *  - feuille « Données » : sauvegarde complète du planning (lue et écrite par la page) ;
 *  - feuille « Indisponibilités » : liste lisible des absences (mise à jour à chaque enregistrement).
 * Sans le code d'accès, rien ne peut être lu ni modifié.
 */
const ACCESS_CODE = "REMPLACEZ-PAR-VOTRE-CODE";
const CHUNK = 40000;               // taille max. d'un morceau de JSON par cellule

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: "requête illisible" }); }
  if (String(req.code || "").trim().toUpperCase() !== String(ACCESS_CODE).trim().toUpperCase()) {
    Utilities.sleep(1500);         // ralentit les essais de code
    return out_({ ok: false, error: "code" });
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const cur = read_();
    if (req.action === "load") return out_({ ok: true, version: cur.version, state: cur.state, savedAt: cur.savedAt });
    if (req.action === "save") {
      if (cur.version && req.version !== cur.version) return out_({ ok: false, error: "conflict", version: cur.version, state: cur.state, savedAt: cur.savedAt });
      const version = (cur.version || 0) + 1, savedAt = new Date().toISOString();
      write_(req.state, version, savedAt);
      return out_({ ok: true, version: version, savedAt: savedAt });
    }
    return out_({ ok: false, error: "action inconnue" });
  } finally { lock.releaseLock(); }
}

function doGet() { return out_({ ok: true, service: "planning-mar" }); }

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function read_() {
  const sh = sheet_("Données"), n = sh.getLastRow();
  if (n < 2) return { version: 0, state: null, savedAt: null };
  const head = sh.getRange(1, 1, 1, 2).getValues()[0];          // A1 : version, B1 : date
  const parts = sh.getRange(2, 1, n - 1, 1).getValues().map(function (r) { return r[0]; });
  return { version: Number(head[0]) || 0, savedAt: head[1] || null, state: JSON.parse(parts.join("")) };
}

function write_(state, version, savedAt) {
  const sh = sheet_("Données"), json = JSON.stringify(state), rows = [];
  for (let i = 0; i < json.length; i += CHUNK) rows.push([json.slice(i, i + CHUNK)]);
  sh.clearContents();
  sh.getRange(1, 1, 1, 2).setValues([[version, savedAt]]);
  if (rows.length) sh.getRange(2, 1, rows.length, 1).setNumberFormat("@").setValues(rows);
  // liste lisible des indisponibilités
  const names = (state && state.names) || {}, list = ((state && state.indispos) || []).slice().sort(function (a, b) { return a.from < b.from ? -1 : 1; });
  const ind = sheet_("Indisponibilités");
  ind.clearContents();
  const data = [["MAR", "Du", "Au", "Motif", "Commentaire"]].concat(list.map(function (i) { return [names[i.who] || ("MAR " + i.who), i.from, i.to, i.motif, i.note || ""]; }));
  ind.getRange(1, 1, data.length, 5).setNumberFormat("@").setValues(data);
}
