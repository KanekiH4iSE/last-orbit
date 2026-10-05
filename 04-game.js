/* Last Orbit - Game state, menus, hangar, level-up, entities, weapons */
"use strict";
/* ---------- state ---------- */
var scene = "menu";            // menu | hangar | play | levelup | chest | paused | over
var G = null, pending = 0, choices = [], hangarFrom = "menu";
var keys = {};
var stick = { id: null, ox: 0, oy: 0, x: 0, y: 0, active: false };
var isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);

function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

function recompute() {
  var p = G.p, ps = G.passives, m = save.meta, sh = SHIPS[save.ship];
  p.dmgMul = (1 + 0.12 * (ps.dmg || 0)) * (1 + 0.06 * m.atk);
  p.rateMul = 1 + 0.10 * (ps.rate || 0);
  p.speed = sh.speed * (1 + 0.08 * (ps.speed || 0)) * (1 + 0.03 * m.spd);
  p.crit = 0.05 + 0.08 * (ps.crit || 0);
  p.critDmg = 2;
  p.maxHp = sh.hp + 12 * m.hp + 20 * (ps.hp || 0);
  p.hp = Math.min(p.hp, p.maxHp);
  p.magnet = 90 * (1 + 0.3 * (ps.magnet || 0)) * (1 + 0.1 * m.mag);
  p.regen = 0.5 * (ps.regen || 0);
  p.armor = Math.min(0.6, 0.06 * (ps.armor || 0));
  p.xpMul = (1 + 0.12 * (ps.xp || 0)) * (1 + 0.06 * m.xp);
}

function weaponCount() { return Object.keys(G.weapons).length; }
function passiveCount() { return Object.keys(G.passives).length; }

function newGame() {
  var sh = SHIPS[save.ship];
  G = {
    t: 0, kills: 0, gold: 0, shake: 0, flash: 0, freeze: 0, ds: 1, spawnT: 0.5, nextBoss: 90, nextElite: 45, nextSwarm: 60,
    astT: 40, nextShower: 90, shower: null, swarmN: 0,
    bossN: 0, boss: null, banner: null, banked: false, revives: save.meta.rev, rerolls: 2,
    p: { x: 0, y: 0, r: 12, hp: 100, maxHp: 100, speed: 170, xp: 0, lvl: 1, need: need(1), iv: 0, shield: 0, poolT: 0,
         dashT: 0, dashCd: 0, dashCdMax: 2, dir: { x: 1, y: 0 }, dmgMul: 1, rateMul: 1, crit: 0.05, critDmg: 2,
         magnet: 90, regen: 0, armor: 0, xpMul: 1, orbAng: 0, face: 0, thrust: false },
    weapons: {}, passives: {}, dr: [], holes: [],
    en: [], bu: [], eb: [], gems: [], pk: [], pt: [], tx: [], rings: [], ms: [], bl: [], arcs: [], waves: [], pools: []
  };
  G.weapons[sh.weapon] = { lv: 1, evo: false, cd: 0.3 };
  recompute(); G.p.hp = G.p.maxHp;
  pending = 0; renderSlots();
}

/* ---------- ui and scene control ---------- */
function show(id, on) { $(id).hidden = !on; }
function hideAll() { ["menu", "hangar", "levelup", "chest", "pause", "over"].forEach(function (i) { show(i, false); }); }
function syncUi() {
  var inGame = !!G && (scene === "play" || scene === "levelup" || scene === "chest" || scene === "paused");
  $("slots").hidden = !inGame;
  $("dashBtn").classList.toggle("show", isTouch && scene === "play");
  $("pauseBtn").classList.toggle("show", scene === "play");
}
function showMenu() {
  scene = "menu"; hideAll();
  $("mGold").innerHTML = icon("gold", 16) + "<span>" + num(save.gold) + "</span>";
  $("mBest").textContent = save.best ? "Longest run " + fmt(save.best) : "No runs yet";
  $("shipLine").textContent = "Ship: " + SHIPS[save.ship].name + ". Change it in the hangar.";
  show("menu", true); syncUi();
}
function startGame() {
  audio(); newGame(); scene = "play"; hideAll(); syncUi();
}
function bank() {
  if (!G || G.banked) return;
  G.banked = true; save.gold += Math.floor(G.gold);
  if (G.t > save.best) save.best = G.t;
  persist();
}
function pauseGame() {
  if (scene !== "play") return;
  scene = "paused"; show("pause", true); syncUi();
  stick.active = false; stick.id = null;
}
function resumeGame() {
  if (scene !== "paused") return;
  scene = "play"; show("pause", false); syncUi();
}
function endGame(win) {
  scene = "over"; bank(); syncUi();
  var p = G.p;
  $("overTitle").textContent = win ? "Warp jump complete" : "Shuttle destroyed";
  $("overSub").textContent = win ? "The gate opened and your shuttle escaped the sector." : "The robots overwhelmed you. Spend your gold in the hangar and launch again.";
  $("sTime").textContent = fmt(G.t);
  $("sKills").textContent = String(G.kills);
  $("sLvl").textContent = String(p.lvl);
  $("sGold").textContent = "+" + num(G.gold);
  $("overBest").textContent = "Longest run " + fmt(save.best) + ". Total gold " + num(save.gold) + ".";
  $("againBtn").textContent = win ? "Play again" : "Try again";
  show("over", true);
  $("againBtn").focus();
}

/* hangar */
var hTab = "ships", hDraws = [];
var META_X = {
  atk: { ic: "dmg", fx: function (l) { return "+" + 6 * l + "% damage"; } },
  hp: { ic: "hp", fx: function (l) { return "+" + 12 * l + " health"; } },
  spd: { ic: "speed", fx: function (l) { return "+" + 3 * l + "% speed"; } },
  mag: { ic: "magnet", fx: function (l) { return "+" + 10 * l + "% pickup range"; } },
  xp: { ic: "xp", fx: function (l) { return "+" + 6 * l + "% experience"; } },
  rev: { ic: "regen", fx: function (l) { return l + (l === 1 ? " revive" : " revives") + " per run"; } }
};
META.forEach(function (m) { m.ic = META_X[m.id].ic; m.fx = META_X[m.id].fx; });
function withCtx(c2, fn) { var saved = ctx; ctx = c2; try { fn(); } finally { ctx = saved; } }
function mkCanvas(cls, w, h) { var c = document.createElement("canvas"); c.className = cls; c.width = w; c.height = h; return c; }
function barRow(label, val, max, txt) {
  var r = el("div", "bar"); r.appendChild(el("span", null, label));
  var i = el("i"), b = document.createElement("b"); b.style.width = Math.round(100 * val / max) + "%"; i.appendChild(b);
  r.appendChild(i); r.appendChild(el("em", null, txt)); return r;
}
function fakeEnemy(id, bk) {
  var d = TYPES[id];
  return { type: id, x: 0, y: 0, r: d.r, col: id === "boss" ? BOSSES[bk || 0].col : d.col, flash: 0, fuse: 0, ph: 1, age: 0, tel: 0, ghost: false,
    elite: false, stun: 0, bk: bk || 0, hp: 1, max: 1, rot: 0.6, shape: asteroidShape(), shot: 0, aim: 0 };
}
function renderShips(body) {
  var grid = el("div", "grid ships");
  Object.keys(SHIPS).forEach(function (id) {
    var s = SHIPS[id], owned = !!save.ships[id], sel = save.ship === id;
    var card = el("div", "panel" + (sel ? " sel" : "") + (owned ? "" : " lock"));
    var c2 = mkCanvas("pv", 240, 150); card.appendChild(c2);
    hDraws.push(function (tm) {
      withCtx(c2.getContext("2d"), function () {
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 240, 150);
        var r = rng(7); ctx.fillStyle = "#dbe8ff";
        for (var k = 0; k < 26; k++) { ctx.globalAlpha = 0.3 + r() * 0.6; ctx.fillRect(r() * 240, r() * 150, 1.5, 1.5); }
        ctx.globalAlpha = 1;
        ctx.setTransform(2.1, 0, 0, 2.1, 0, 0);
        drawShuttle(57, 36 + Math.sin(tm * 2) * 2, -0.55 + Math.sin(tm * 1.3) * 0.08, 1, s.col);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      });
    });
    var head = el("div", "ph"); head.appendChild(el("span", "pn", s.name)); head.appendChild(el("span", "pt", sel ? "Selected" : owned ? "Owned" : "Locked"));
    card.appendChild(head);
    card.appendChild(el("p", "pd", s.desc));
    card.appendChild(barRow("Health", s.hp, 140, String(s.hp)));
    card.appendChild(barRow("Speed", s.speed, 200, String(s.speed)));
    card.appendChild(el("div", "pt", "Starts with " + WMAP[s.weapon].name));
    var b = el("button", "btn sm"); b.type = "button";
    if (owned) { b.textContent = sel ? "Selected" : "Select"; b.disabled = sel; b.addEventListener("click", function () { save.ship = id; persist(); renderHangar(); }); }
    else { b.textContent = "Buy for " + num(s.cost); b.disabled = save.gold < s.cost; b.addEventListener("click", function () { if (save.gold >= s.cost) { save.gold -= s.cost; save.ships[id] = true; save.ship = id; persist(); renderHangar(); } }); }
    card.appendChild(b); grid.appendChild(card);
  });
  body.appendChild(grid);
}
function renderUpgrades(body) {
  var grid = el("div", "grid ups");
  META.forEach(function (m) {
    var lv = save.meta[m.id] || 0, card = el("div", "panel"), row = el("div", "uprow");
    var ic = el("span", "ic"); ic.innerHTML = icon(m.ic, 32); row.appendChild(ic);
    var tx = el("div"); tx.appendChild(el("div", "pn", m.name)); tx.appendChild(el("p", "pd", m.desc)); row.appendChild(tx);
    row.appendChild(el("span", "pt", lv + "/" + m.max)); card.appendChild(row);
    var pips = el("div", "pips");
    for (var i = 0; i < m.max; i++) pips.appendChild(el("span", i < lv ? "on" : ""));
    card.appendChild(pips);
    var fx = el("p", "upfx"); fx.innerHTML = "Now <b>" + (lv ? m.fx(lv) : "none") + "</b>" + (lv < m.max ? " &nbsp; Next <b>" + m.fx(lv + 1) + "</b>" : ""); card.appendChild(fx);
    var b = el("button", "btn sm"); b.type = "button";
    if (lv >= m.max) { b.textContent = "Maxed"; b.disabled = true; }
    else { var c = m.cost(lv); b.textContent = "Upgrade for " + num(c); b.disabled = save.gold < c; b.addEventListener("click", function () { if (save.gold >= c) { save.gold -= c; save.meta[m.id] = lv + 1; persist(); renderHangar(); } }); }
    card.appendChild(b); grid.appendChild(card);
  });
  body.appendChild(grid);
}
function addCodex(grid, id, bk) {
  var d = TYPES[id], boss = id === "boss", kind = boss ? "Boss" : d.kind;
  var card = el("div", "panel cx"), c2 = mkCanvas("pv sq", 88, 88); card.appendChild(c2);
  var info = el("div");
  info.appendChild(el("div", "pn", boss ? BOSSES[bk].name : d.name));
  info.appendChild(el("div", "pt kind-" + kind, kind));
  info.appendChild(el("p", "pd", boss ? BOSSES[bk].note : d.note));
  card.appendChild(info); grid.appendChild(card);
  var e = fakeEnemy(id, bk);
  hDraws.push(function (tm) {
    withCtx(c2.getContext("2d"), function () {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 88, 88);
      var sc = Math.min(3.2, 34 / e.r);
      ctx.setTransform(sc, 0, 0, sc, 44, 44);
      V = { px: 100, py: 0, t: tm, freeze: 0 }; e.age = tm; e.ghost = id === "wraith" && Math.sin(tm * 1.6) > 0.2;
      drawEnemy(e, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    });
  });
}
function renderCodex(body) {
  var grid = el("div", "grid codex");
  Object.keys(TYPES).forEach(function (id) { if (id !== "boss") addCodex(grid, id); });
  BOSSES.forEach(function (b, i) { addCodex(grid, "boss", i); });
  body.appendChild(grid);
}
function renderHangar() {
  $("hGold").innerHTML = icon("gold", 16) + "<span>" + num(save.gold) + "</span>";
  document.querySelectorAll("#hTabs .tab").forEach(function (t) { t.setAttribute("aria-selected", String(t.dataset.tab === hTab)); });
  var body = $("hBody"); body.innerHTML = ""; hDraws = [];
  if (hTab === "ships") renderShips(body); else if (hTab === "upgrades") renderUpgrades(body); else renderCodex(body);
}
function openHangar(from) { hangarFrom = from; scene = "hangar"; hideAll(); renderHangar(); show("hangar", true); syncUi(); }
function closeHangar() { hDraws = []; if (hangarFrom === "over") { scene = "over"; hideAll(); show("over", true); syncUi(); } else showMenu(); }

/* slots */
function slotEl(id, label, max, passive, title) {
  var s = el("div", "slot" + (max ? " max" : "") + (passive ? " passive" : ""));
  s.innerHTML = icon(id, 18) + "<b>" + label + "</b>"; s.title = title; return s;
}
function renderSlots() {
  var box = $("slots"); box.innerHTML = "";
  if (!G) return;
  var r1 = el("div", "srow"), r2 = el("div", "srow");
  WEAPONS.forEach(function (w) { var h = G.weapons[w.id]; if (h) r1.appendChild(slotEl(w.id, h.evo ? "E" : h.lv, h.evo || h.lv >= MAX_WLV, false, h.evo ? w.evoName : w.name)); });
  PASSIVES.forEach(function (p) { var l = G.passives[p.id]; if (l) r2.appendChild(slotEl(p.id, l, l >= p.max, true, p.name)); });
  box.appendChild(r1); box.appendChild(r2);
}

/* level-up and crates */
function makeChoices(n) {
  var pool = [], evo = [];
  WEAPONS.forEach(function (w) {
    var h = G.weapons[w.id];
    if (h) {
      if (h.lv >= MAX_WLV && !h.evo && G.passives[w.pair]) evo.push({ kind: "evo", id: w.id });
      else if (h.lv < MAX_WLV) pool.push({ kind: "wup", id: w.id });
    } else if (weaponCount() < MAX_WEAPONS) pool.push({ kind: "wnew", id: w.id });
  });
  PASSIVES.forEach(function (p) {
    var l = G.passives[p.id] || 0;
    if (l >= p.max) return;
    if (l > 0) pool.push({ kind: "pup", id: p.id });
    else if (passiveCount() < MAX_PASSIVES) pool.push({ kind: "pnew", id: p.id });
  });
  var out = [];
  if (evo.length) out.push(evo[Math.floor(Math.random() * evo.length)]);
  shuffle(pool);
  while (out.length < n && pool.length) out.push(pool.pop());
  var fill = [{ kind: "heal" }, { kind: "gold" }], fi = 0;
  while (out.length < n) out.push(fill[fi++ % 2]);
  return out;
}
function describe(c) {
  var w, p, h, l;
  if (c.kind === "wnew") { w = WMAP[c.id]; return { ic: c.id, name: w.name, tag: "NEW", desc: w.desc, evo: false }; }
  if (c.kind === "wup") { w = WMAP[c.id]; h = G.weapons[c.id]; return { ic: c.id, name: w.name, tag: "Lv " + h.lv + " > " + (h.lv + 1), desc: w.up, evo: false }; }
  if (c.kind === "evo") { w = WMAP[c.id]; return { ic: c.id, name: w.evoName, tag: "EVOLVE", desc: "Evolves " + w.name + " using " + PMAP[w.pair].name + ". Far stronger.", evo: true }; }
  if (c.kind === "pnew" || c.kind === "pup") { p = PMAP[c.id]; l = G.passives[c.id] || 0; return { ic: c.id, name: p.name, tag: c.kind === "pnew" ? "NEW" : "Lv " + l + " > " + (l + 1), desc: p.desc, evo: false }; }
  if (c.kind === "heal") return { ic: "heal", name: "Field repair", tag: "HEAL", desc: "Restore 40% health.", evo: false };
  return { ic: "gold", name: "Salvage", tag: "GOLD", desc: "+100 gold.", evo: false };
}
function applyChoice(c) {
  var p = G.p;
  if (c.kind === "wnew") G.weapons[c.id] = { lv: 1, evo: false, cd: 0.3 };
  else if (c.kind === "wup") G.weapons[c.id].lv++;
  else if (c.kind === "evo") { G.weapons[c.id].evo = true; G.banner = { text: WMAP[c.id].evoName.toUpperCase(), t: 2 }; G.flash = 0.35; }
  else if (c.kind === "pnew" || c.kind === "pup") {
    G.passives[c.id] = (G.passives[c.id] || 0) + 1;
    recompute();
    if (c.id === "hp") p.hp = Math.min(p.maxHp, p.hp + 20);
  }
  else if (c.kind === "heal") p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.4);
  else if (c.kind === "gold") G.gold += 100;
  recompute(); renderSlots();
}
function fillCard(node, d) {
  node.innerHTML = '<span class="ic">' + icon(d.ic, 30) + '</span><span class="n"></span><span class="lv"></span><span class="d"></span>';
  node.querySelector(".n").textContent = d.name;
  node.querySelector(".lv").textContent = d.tag;
  node.querySelector(".d").textContent = d.desc;
}
function renderPicks() {
  var box = $("picks"); box.innerHTML = "";
  choices.forEach(function (c, idx) {
    var d = describe(c), b = el("button", "pick" + (d.evo ? " evo" : "")); b.type = "button";
    fillCard(b, d);
    var k = el("span", "k", String(idx + 1)); b.insertBefore(k, b.firstChild);
    b.addEventListener("click", function () { choose(idx); });
    box.appendChild(b);
  });
  $("rerollBtn").textContent = "Reroll (" + G.rerolls + ")";
  $("rerollBtn").disabled = G.rerolls <= 0;
}
function openLevelUp() {
  choices = makeChoices(3); scene = "levelup"; snd("lvl");
  renderPicks(); show("levelup", true); syncUi();
  stick.active = false; stick.id = null;
}
function reroll() { if (scene !== "levelup" || G.rerolls <= 0) return; G.rerolls--; choices = makeChoices(3); renderPicks(); }
function choose(i) {
  if (scene !== "levelup" || !choices[i]) return;
  applyChoice(choices[i]); pending--;
  show("levelup", false);
  if (pending > 0) openLevelUp(); else { scene = "play"; syncUi(); }
}
function rewardChoice() {
  var b = { evo: [], pool: [] }, all = makeChoices(30), i;
  for (i = 0; i < all.length; i++) { if (all[i].kind === "evo") return all[i]; }
  for (i = 0; i < all.length; i++) { if (all[i].kind !== "heal" && all[i].kind !== "gold") return all[i]; }
  return { kind: "gold" };
}
function openChest(tier) {
  scene = "chest";
  var n = tier >= 3 ? 3 : 1, list = $("rewards"); list.innerHTML = "";
  for (var k = 0; k < n; k++) {
    var c = rewardChoice(), d = describe(c);
    applyChoice(c);
    var r = el("div", "reward" + (d.evo ? " evo" : "")); fillCard(r, d); list.appendChild(r);
  }
  $("chestSub").textContent = tier >= 3 ? "Boss cache. Three free upgrades." : "Elite cache. One free upgrade.";
  show("chest", true); snd("chest"); syncUi();
  stick.active = false; stick.id = null;
  $("chestBtn").focus();
}
function closeChest() {
  if (scene !== "chest") return;
  show("chest", false);
  if (pending > 0) openLevelUp(); else { scene = "play"; syncUi(); }
}

/* ---------- entities ---------- */
var V = { px: 0, py: 0, t: 0, freeze: 0 };      // view info used by drawEnemy
var UNLOCK = { scout: 0, dasher: 25, spider: 60, gunner: 70, slime: 90, heavy: 110, jelly: 130, bomber: 150, beetle: 170, splitter: 200, wraith: 230, eye: 270, golem: 320 };
var WEIGHT = { scout: 10, dasher: 5, spider: 4, gunner: 3, slime: 3, heavy: 2, jelly: 3, bomber: 2.5, beetle: 2, splitter: 2, wraith: 2.5, eye: 1.5, golem: 1 };
function asteroidShape() { var a = []; for (var i = 0; i < 12; i++) a.push(0.78 + Math.random() * 0.4); return a; }
function spawnEnemy(type, x, y) {
  var d = TYPES[type], hm = 1 + G.t / 130;
  var e = { type: type, x: x, y: y, r: d.r, hp: d.hp * hm, max: d.hp * hm,
    spd: d.spd * (1 + Math.min(0.5, G.t / 900)), dmg: d.dmg, col: d.col, xp: d.xp,
    kx: 0, ky: 0, flash: 0, orbT: 0, stun: 0, fuse: 0, elite: false, sT: rand(1, 2.4), bT: 2, sumT: 6, dead: false, i: 0, gi: 0,
    ph: rand(0, TAU), age: 0, tel: 0, chg: 0, cx: 0, cy: 0, ghost: false, aim: 0, shot: 0, vx: 0, vy: 0, rot: 0, rs: 0, shape: null, bk: 0, bm: 1, spir: 0, wv: 4 };
  G.en.push(e); return e;
}
function spawnPack(type, n) {
  var pos = ringPos();
  for (var i = 0; i < n; i++) spawnEnemy(type, pos.x + rand(-40, 40), pos.y + rand(-40, 40));
}
function spawnElite() {
  var pool = Object.keys(UNLOCK).filter(function (k) { return UNLOCK[k] <= G.t && k !== "bomber"; });
  var pos = ringPos(60), e = spawnEnemy(pool[Math.floor(Math.random() * pool.length)], pos.x, pos.y);
  e.elite = true; e.r *= 1.4; e.hp *= 10; e.max = e.hp; e.dmg *= 1.3; e.xp = 20;
  G.banner = { text: "ELITE " + TYPES[e.type].name.toUpperCase(), t: 1.8 };
}
function ringPos(extra) {
  var a = rand(0, TAU), r = Math.max(W, H) * 0.6 + (extra || 40);
  return { x: G.p.x + Math.cos(a) * r, y: G.p.y + Math.sin(a) * r };
}
function spawnBoss() {
  var n = G.bossN, pos = ringPos(100), e = spawnEnemy("boss", pos.x, pos.y);
  e.bk = n % 3; e.bm = Math.pow(1.35, n);
  e.r = Math.min(100, TYPES.boss.r * (1 + 0.22 * n));
  e.hp = e.max = TYPES.boss.hp * Math.pow(2, n) * (1 + G.t / 400);
  e.dmg = TYPES.boss.dmg * e.bm; e.col = BOSSES[e.bk].col; e.spd = 46; e.wv = 4;
  G.boss = e; G.bossN++;
  G.banner = { text: BOSSES[e.bk].name.toUpperCase(), t: 2.6 }; snd("boss"); G.shake = 10;
}
function pickType() {
  var t = G.t, pool = [], sum = 0, i;
  Object.keys(UNLOCK).forEach(function (k) { if (UNLOCK[k] <= t) { pool.push(k); sum += WEIGHT[k]; } });
  var r = Math.random() * sum;
  for (i = 0; i < pool.length; i++) { r -= WEIGHT[pool[i]]; if (r <= 0) return pool[i]; }
  return "scout";
}
function spawnAsteroidAt(x, y, r, vx, vy) {
  var e = spawnEnemy("asteroid", x, y);
  e.r = r; e.hp = e.max = (10 + r * 1.6) * (1 + G.t / 260); e.dmg = 5 + r * 0.4;
  e.vx = vx; e.vy = vy; e.rs = rand(-2, 2); e.shape = asteroidShape(); e.xp = 2; e.age = 0;
  return e;
}
function asteroidRadius() { var q = Math.random(); return q < 0.5 ? rand(14, 22) : q < 0.85 ? rand(24, 34) : rand(38, 48); }
function spawnAsteroid() {
  var pos = ringPos(80), p = G.p, tx = p.x + rand(-260, 260), ty = p.y + rand(-260, 260);
  var dx = tx - pos.x, dy = ty - pos.y, d = Math.hypot(dx, dy) || 1, sp = rand(70, 150);
  spawnAsteroidAt(pos.x, pos.y, asteroidRadius(), dx / d * sp, dy / d * sp);
}
function spawnShowerAsteroid() {
  var p = G.p, a = G.shower.ang, R = Math.max(W, H) * 0.6 + 70, off = rand(-380, 380);
  var x = p.x + Math.cos(a) * R - Math.sin(a) * off, y = p.y + Math.sin(a) * R + Math.cos(a) * off;
  var tx = p.x + rand(-200, 200), ty = p.y + rand(-200, 200), dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy) || 1, sp = rand(200, 300);
  spawnAsteroidAt(x, y, asteroidRadius(), dx / d * sp, dy / d * sp);
}
function particles(x, y, col, n, spd) {
  if (G.pt.length > 500) return;
  for (var i = 0; i < n; i++) {
    var a = rand(0, TAU), s = rand(20, spd || 140);
    G.pt.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.25, 0.55), max: 0.55, col: col, s: rand(1.5, 3.5) });
  }
}
function floatText(x, y, txt, col) { if (G.tx.length < 50) G.tx.push({ x: x, y: y, txt: txt, col: col, life: 0.7 }); }

function nearestTo(x, y, range, excl) {
  var bd = range * range, best = null;
  for (var i = 0; i < G.en.length; i++) {
    var e = G.en[i]; if (e.dead) continue;
    if (excl && excl.indexOf(e) !== -1) continue;
    var dx = e.x - x, dy = e.y - y, d = dx * dx + dy * dy;
    if (e.type === "asteroid" && d > 170 * 170) continue;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function nearest(range) { return nearestTo(G.p.x, G.p.y, range); }

function hurt(e, dmg, crit, dx, dy, knock) {
  if (e.dead) return;
  if (e.ghost) dmg *= 0.3;
  e.hp -= dmg; e.flash = 0.08;
  var l = Math.hypot(dx, dy) || 1, k = (e.type === "boss" ? 0.05 : e.elite ? 0.4 : 1) * (knock || 120);
  e.kx += dx / l * k; e.ky += dy / l * k;
  floatText(e.x, e.y - e.r, String(Math.round(dmg)), crit ? "#ffd84d" : "#eaf2fb");
  snd("hit", 70);
  if (e.hp <= 0) kill(e);
}
function strike(e, base, dx, dy, knock) {
  var p = G.p, crit = Math.random() < p.crit;
  hurt(e, base * p.dmgMul * (crit ? p.critDmg : 1), crit, dx, dy, knock);
}

function dropGem(x, y, v) { G.gems.push({ x: x + rand(-8, 8), y: y + rand(-8, 8), v: v, pull: false, sp: 0, dead: false }); }
function dropPickup(x, y, type, v) { G.pk.push({ x: x + rand(-6, 6), y: y + rand(-6, 6), type: type, v: v || 0, pull: false, dead: false }); }
function randomPickup() {
  var tbl = [["heart", 30], ["magnet", 22], ["bomb", 16], ["freeze", 16], ["shield", 16]], r = Math.random() * 100;
  for (var i = 0; i < tbl.length; i++) { r -= tbl[i][1]; if (r <= 0) return tbl[i][0]; }
  return "heart";
}
function coinValue() { return 4 + Math.floor(G.t / 40); }

function kill(e) {
  e.dead = true; G.kills++;
  particles(e.x, e.y, e.col, e.type === "boss" ? 40 : 8, e.type === "boss" ? 260 : 140);
  var x = e.x, y = e.y, i;
  if (e.type === "boss") {
    for (i = 0; i < 10; i++) dropGem(x, y, 12);
    for (i = 0; i < 8; i++) dropPickup(x, y, "coin", coinValue() * 3);
    dropPickup(x, y, "chest", 3);
    G.boss = null; G.shake = 14; G.banner = { text: BOSSES[e.bk].name.toUpperCase() + " DOWN", t: 2.2 }; snd("boss");
    return;
  }
  if (e.type === "asteroid") {
    if (e.r > 26) {
      for (i = 0; i < 2; i++) { var a = rand(0, TAU); spawnAsteroidAt(x + Math.cos(a) * 8, y + Math.sin(a) * 8, e.r * 0.6, Math.cos(a) * 110 + e.vx * 0.5, Math.sin(a) * 110 + e.vy * 0.5); }
    }
    dropGem(x, y, e.xp);
    if (Math.random() < 0.25) dropPickup(x, y, "coin", coinValue());
    return;
  }
  dropGem(x, y, e.xp);
  if (e.elite) {
    dropPickup(x, y, "chest", 1);
    for (i = 0; i < 4; i++) dropPickup(x, y, "coin", coinValue() * 2);
    if (Math.random() < 0.5) dropPickup(x, y, randomPickup());
  } else {
    if (Math.random() < 0.16) dropPickup(x, y, "coin", coinValue());
    if (Math.random() < 0.03) dropPickup(x, y, randomPickup());
  }
  if (e.type === "splitter") { spawnEnemy("scout", x - 14, y); spawnEnemy("scout", x + 14, y); }
  if (e.type === "slime") G.pools.push({ x: x, y: y, r: 38, life: 5 });
}

function damagePlayer(n) {
  var p = G.p;
  if (p.iv > 0 || p.shield > 0 || p.dashT > 0) return;
  p.hp -= Math.max(1, n * (1 - p.armor)); p.iv = 0.7; G.shake = Math.max(G.shake, 8);
  particles(p.x, p.y, "#ff5a5f", 10, 180); snd("hurt");
  if (p.hp <= 0) {
    if (G.revives > 0) {
      G.revives--; p.hp = p.maxHp * 0.5; p.iv = 3; p.shield = 3;
      bombEffect(0.5, 1); G.banner = { text: "REVIVED", t: 2 };
    } else { p.hp = 0; endGame(false); }
  }
}

function bombEffect(bossFrac, scale) {
  var p = G.p, R = Math.max(W, H) * 0.75 * scale;
  G.rings.push({ x: p.x, y: p.y, r: 0, max: R, life: 0.6, t: 0.6, col: "255,190,90" });
  G.flash = 0.45; G.shake = 14; snd("boom");
  for (var i = 0; i < G.en.length; i++) {
    var e = G.en[i];
    if (e.dead || Math.hypot(e.x - p.x, e.y - p.y) > R) continue;
    if (e.type === "boss") hurt(e, e.max * 0.06 * bossFrac * 2, false, e.x - p.x, e.y - p.y, 60);
    else hurt(e, e.elite ? e.max * 0.25 : 200 + G.t * 0.6, false, e.x - p.x, e.y - p.y, 300);
  }
  G.eb.length = 0;
}

function collectPickup(k) {
  var p = G.p, i;
  switch (k.type) {
    case "coin": G.gold += k.v; snd("coin", 40); floatText(p.x, p.y - 18, "+" + k.v, "#ffd24d"); break;
    case "heart": p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.3); floatText(p.x, p.y - 18, "REPAIR", "#ff8a8d"); snd("gem"); break;
    case "magnet":
      for (i = 0; i < G.gems.length; i++) G.gems[i].pull = true;
      for (i = 0; i < G.pk.length; i++) if (G.pk[i].type === "coin") G.pk[i].pull = true;
      G.banner = { text: "MAGNET", t: 1.2 }; snd("coin"); break;
    case "bomb": bombEffect(1, 1); G.banner = { text: "BOMB", t: 1.2 }; break;
    case "freeze": G.freeze = 4.5; G.banner = { text: "FREEZE", t: 1.2 }; snd("ice"); break;
    case "shield": p.shield = 6; G.banner = { text: "SHIELD", t: 1.2 }; snd("gem"); break;
    case "chest": openChest(k.v); break;
  }
}

/* ---------- weapons ---------- */
function explode(x, y, rad, base) {
  G.rings.push({ x: x, y: y, r: 0, max: rad, life: 0.3, t: 0.3, col: "255,160,80" });
  particles(x, y, "#ffb060", 8, 200);
  for (var i = 0; i < G.en.length; i++) {
    var e = G.en[i];
    if (!e.dead && Math.hypot(e.x - x, e.y - y) < rad + e.r) strike(e, base, e.x - x, e.y - y, 160);
  }
  snd("boom", 90);
}
var WSTEP = {
  laser: function (w, dt) {
    w.cd -= dt; if (w.cd > 0) return;
    var p = G.p, t = nearest(640);
    if (!t) { w.cd = 0.1; return; }
    var n = w.evo ? 4 : 1 + Math.floor((w.lv - 1) / 3);
    var base = 12 * (1 + 0.2 * (w.lv - 1)) * (w.evo ? 1.8 : 1);
    var pierce = w.evo ? 99 : (w.lv >= 5 ? 1 : 0) + (w.lv >= 8 ? 1 : 0);
    var a = Math.atan2(t.y - p.y, t.x - p.x), sp = w.evo ? 820 : 560;
    for (var i = 0; i < n; i++) {
      var ang = a + (i - (n - 1) / 2) * 0.14;
      G.bu.push({ x: p.x, y: p.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: w.evo ? 6 : 4, life: 1.2, base: base, pierce: pierce, hit: [], evo: w.evo, dead: false });
    }
    w.cd = 0.52 * (1 - 0.04 * (w.lv - 1)) / p.rateMul; snd("shoot", 60);
  },
  missile: function (w, dt) {
    w.cd -= dt; if (w.cd > 0) return;
    var p = G.p;
    if (!G.en.length) { w.cd = 0.2; return; }
    var n = 1 + Math.floor((w.lv - 1) / 2); if (w.evo) n *= 2;
    var base = 18 * (1 + 0.2 * (w.lv - 1)) * (w.evo ? 1.4 : 1), rad = 55 + 4 * w.lv + (w.evo ? 30 : 0);
    for (var i = 0; i < n; i++) G.ms.push({ x: p.x, y: p.y, ang: rand(0, TAU), sp: 180, t: null, life: 3, base: base, rad: rad, dead: false });
    w.cd = 1.4 * (1 - 0.03 * (w.lv - 1)) / p.rateMul; snd("shoot", 80);
  },
  drone: function () {},
  blade: function (w, dt) {
    w.cd -= dt; if (w.cd > 0) return;
    var p = G.p, t = nearest(500), a = t ? Math.atan2(t.y - p.y, t.x - p.x) : rand(0, TAU);
    var n = 1 + Math.floor((w.lv - 1) / 3); if (w.evo) n += 2;
    var base = 20 * (1 + 0.2 * (w.lv - 1)) * (w.evo ? 1.5 : 1), reach = 240 + 12 * w.lv;
    for (var i = 0; i < n; i++) {
      var ang = a + (i - (n - 1) / 2) * (w.evo ? 0.8 : 0.6);
      G.bl.push({ x: p.x, y: p.y, dx: Math.cos(ang), dy: Math.sin(ang), phase: 0, trav: 0, reach: reach, base: base, hit: [], size: w.evo ? 24 : 17, spin: 0, dead: false });
    }
    w.cd = 2.3 * (1 - 0.03 * (w.lv - 1)) / p.rateMul;
  },
  emp: function (w, dt) {
    w.cd -= dt; if (w.cd > 0) return;
    var p = G.p;
    w.cd = Math.max(1.8, 4.6 - 0.35 * (w.lv - 1)) / p.rateMul;
    var R = (100 + 14 * w.lv) * (w.evo ? 1.5 : 1), base = 24 * (1 + 0.2 * (w.lv - 1)) * (w.evo ? 1.6 : 1);
    G.rings.push({ x: p.x, y: p.y, r: 0, max: R, life: 0.45, t: 0.45, col: "98,214,255" });
    for (var i = 0; i < G.en.length; i++) {
      var e = G.en[i];
      if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < R + e.r) { strike(e, base, e.x - p.x, e.y - p.y, 260); if (w.evo) e.stun = 1.2; }
    }
    snd("nova");
  },
  arc: function (w, dt) {
    w.cd -= dt; if (w.cd > 0) return;
    var p = G.p, t = nearest(420);
    if (!t) { w.cd = 0.15; return; }
    var chains = w.evo ? 2 : 1, jumps = 2 + Math.floor(w.lv / 2) + (w.evo ? 4 : 0);
    var base = 15 * (1 + 0.2 * (w.lv - 1)) * (w.evo ? 1.5 : 1), used = [];
    for (var c = 0; c < chains; c++) {
      var cur = c === 0 ? t : nearestTo(p.x, p.y, 420, used);
      if (!cur) break;
      var pts = [{ x: p.x, y: p.y }];
      for (var j = 0; j <= jumps && cur; j++) {
        pts.push({ x: cur.x, y: cur.y }); used.push(cur);
        strike(cur, base, cur.x - pts[pts.length - 2].x, cur.y - pts[pts.length - 2].y, 90);
        cur = nearestTo(cur.x, cur.y, 170, used);
      }
      G.arcs.push({ pts: pts, life: 0.2 });
    }
    w.cd = 1.3 * (1 - 0.03 * (w.lv - 1)) / p.rateMul; snd("zap", 80);
  }
};
function dronePositions() {
  var w = G.weapons.drone, p = G.p, out = [];
  if (!w) return out;
  var n = 1 + Math.floor((w.lv - 1) / 2) + (w.lv >= 8 ? 1 : 0), i, a;
  for (i = 0; i < n; i++) { a = p.orbAng + i * TAU / n; out.push({ x: p.x + Math.cos(a) * 70, y: p.y + Math.sin(a) * 70 }); }
  if (w.evo) { var n2 = n + 1; for (i = 0; i < n2; i++) { a = -p.orbAng * 0.8 + i * TAU / n2; out.push({ x: p.x + Math.cos(a) * 118, y: p.y + Math.sin(a) * 118 }); } }
  return out;
}
