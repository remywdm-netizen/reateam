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
 *  - feuille « Indisponibilités » : liste lisible des absences (mise à jour à chaque enregistrement) ;
 *  - feuille « Planning réa » : REA 1 / REA 2 semaine par semaine (calculé par la page, mis à jour à chaque enregistrement) ;
 *  - feuille « Planning hebdo » : une ligne par jour, une colonne par MAR (matin / après-midi), mise à jour de même ;
 *  - un onglet par semaine (« S1 2027 », « S2 2027 »…) au format de la trame du service ; seules les semaines
 *    modifiées sont réécrites. Le modèle de mise en forme est l'onglet masqué « Modèle trame ».
 *
 * Mise à jour du script : collez la nouvelle version, enregistrez, puis « Déployer » > « Gérer les déploiements »
 * > crayon (modifier) > Version : « Nouvelle version » > « Déployer ». L'URL de l'application Web ne change pas.
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
  let result, saved = false;
  try {
    const cur = read_();
    if (req.action === "load") return out_({ ok: true, version: cur.version, state: cur.state, savedAt: cur.savedAt });
    if (req.action !== "save") return out_({ ok: false, error: "action inconnue" });
    if (cur.version && req.version !== cur.version) return out_({ ok: false, error: "conflict", version: cur.version, state: cur.state, savedAt: cur.savedAt });
    const version = (cur.version || 0) + 1, savedAt = new Date().toISOString();
    write_(req.state, version, savedAt);
    if (Array.isArray(req.rea) && req.rea.length) writeTable_("Planning réa", req.rea);
    if (Array.isArray(req.hebdo) && req.hebdo.length) writeTable_("Planning hebdo", req.hebdo);
    result = { ok: true, version: version, savedAt: savedAt }; saved = true;
  } finally { lock.releaseLock(); }
  // onglets hebdomadaires (après la sauvegarde, sans bloquer les autres postes)
  if (saved && req.trame && Array.isArray(req.trame.weeks)) { try { writeTrame_(req.trame); } catch (err) { result.trameError = String(err); } }
  return out_(result);
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

// Tableau lisible envoyé par la page (première ligne = en-têtes), réécrit à chaque enregistrement
function writeTable_(name, rows) {
  const w = rows[0].length, data = rows.map(function (r) { const x = r.slice(0, w).map(String); while (x.length < w) x.push(""); return x; });
  const sh = sheet_(name);
  sh.clearContents();
  sh.getRange(1, 1, data.length, w).setNumberFormat("@").setValues(data);
  sh.getRange(1, 1, 1, w).setFontWeight("bold");
  sh.setFrozenRows(1);
}

// Trame du service : un onglet par semaine, copié de l'onglet masqué « Modèle trame » puis rempli
function writeTrame_(t) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), props = PropertiesService.getDocumentProperties();
  const R = t.rows, C = 29, t0 = Date.now();
  let tpl = ss.getSheetByName("Modèle trame");
  if (!tpl || props.getProperty("trame:layout") !== t.layoutHash) { tpl = buildTemplate_(ss, tpl, t.layout, R, C); props.setProperty("trame:layout", t.layoutHash); }
  const base = tpl.getRange(1, 1, R, C).getValues();
  t.weeks.forEach(function (w) {
    if (Date.now() - t0 > 240000) return;            // au-delà de 4 min, la suite à la prochaine sauvegarde
    const key = "trame:" + w.name;
    let sh = ss.getSheetByName(w.name);
    if (sh && props.getProperty(key) === w.hash) return;   // semaine inchangée
    if (!sh) { sh = tpl.copyTo(ss).setName(w.name); sh.showSheet(); }
    const g = base.map(function (r) { return r.slice(); });
    Object.keys(w.fill).forEach(function (k) { const p = k.split(","), r = +p[0] - 1, c = +p[1] - 1; if (r < R && c < C) g[r][c] = w.fill[k]; });
    sh.getRange(1, 1, R, C).setValues(g);
    props.setProperty(key, w.hash);
  });
}

function buildTemplate_(ss, old, L, R, C) {
  if (old) ss.deleteSheet(old);
  const sh = ss.insertSheet("Modèle trame");
  const vals = [], bold = [], bg = [], al = [], size = [];
  for (let r = 1; r <= R; r++) {
    const v = [], b = [], g = [], a = [], z = [];
    for (let c = 1; c <= C; c++) {
      const x = L.cells[r + "," + c] || {};
      v.push(x.v || ""); b.push(x.b || r === 1 ? "bold" : "normal"); g.push(x.bg ? "#" + x.bg : null);
      a.push(c === 1 && r > 6 ? "left" : "center"); z.push(r === 1 ? 16 : 10);
    }
    vals.push(v); bold.push(b); bg.push(g); al.push(a); size.push(z);
  }
  const rng = sh.getRange(1, 1, R, C);
  rng.setNumberFormat("@").setValues(vals).setFontWeights(bold).setBackgrounds(bg).setHorizontalAlignments(al).setFontSizes(size)
    .setVerticalAlignment("middle").setFontFamily("Calibri");
  sh.getRange(40, 1, 2, C).setWrap(true);
  Object.keys(L.widths).forEach(function (c) { sh.setColumnWidth(+c, Math.round(L.widths[c] * 7 + 5)); });
  sh.setRowHeights(1, R, 19); sh.setRowHeights(41, 2, 48);
  const S = SpreadsheetApp.BorderStyle;
  sh.getRange(4, 1, R - 3, C).setBorder(true, true, true, true, true, true, "#000000", S.SOLID);
  [1, 2, 6, 10, 14, 18, 22, 26].forEach(function (c) { sh.getRange(4, c, R - 3, 1).setBorder(null, true, null, null, null, null, "#000000", S.SOLID_MEDIUM); });
  sh.getRange(4, C, R - 3, 1).setBorder(null, null, null, true, null, null, "#000000", S.SOLID_MEDIUM);
  L.merges.forEach(function (m) { sh.getRange(m[0], m[1], m[2] - m[0] + 1, m[3] - m[1] + 1).merge(); });
  sh.hideSheet();
  return sh;
}
