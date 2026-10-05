/* Last Orbit - Core: constants, helpers, save data, audio */
"use strict";
var WARP = 600;                 // seconds until the warp gate opens
var SAVE_KEY = "last-orbit-save-v2";
var $ = function (id) { return document.getElementById(id); };
var cv = $("c"), ctx = cv.getContext("2d");
var W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.floor(W * DPR); cv.height = Math.floor(H * DPR);
}
window.addEventListener("resize", resize); resize();

var TAU = Math.PI * 2;
var rand = function (a, b) { return a + Math.random() * (b - a); };
var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
function fmt(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
function num(n) { return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

/* ---------- save data ---------- */
var SHIPS = {
  falcon: { name: "Falcon", desc: "Balanced. Starts with the pulse laser.", weapon: "laser", cost: 0, hp: 100, speed: 170, col: { hull: "#f4f7fb", wing: "#cfd8e4", acc: "#ff7a3c" } },
  hornet: { name: "Hornet", desc: "Fast and fragile. Starts with homing missiles.", weapon: "missile", cost: 500, hp: 85, speed: 192, col: { hull: "#fff0c9", wing: "#e8b94a", acc: "#e0443a" } },
  warden: { name: "Warden", desc: "Tough and slow. Starts with combat drones.", weapon: "drone", cost: 900, hp: 135, speed: 155, col: { hull: "#d6ecff", wing: "#6fa2d8", acc: "#4cd6a0" } }
};
var META = [
  { id: "atk", name: "Weapon calibration", desc: "+6% damage per level.", max: 10, cost: function (l) { return Math.round(80 * Math.pow(1.5, l)); } },
  { id: "hp", name: "Armor plating", desc: "+12 max health per level.", max: 10, cost: function (l) { return Math.round(70 * Math.pow(1.5, l)); } },
  { id: "spd", name: "Engine tuning", desc: "+3% move speed per level.", max: 8, cost: function (l) { return Math.round(90 * Math.pow(1.55, l)); } },
  { id: "mag", name: "Collector coils", desc: "+10% pickup range per level.", max: 8, cost: function (l) { return Math.round(60 * Math.pow(1.5, l)); } },
  { id: "xp", name: "Data core", desc: "+6% experience per level.", max: 10, cost: function (l) { return Math.round(100 * Math.pow(1.5, l)); } },
  { id: "rev", name: "Emergency warp", desc: "Revive at half health once per run, per level.", max: 2, cost: function (l) { return 500 * (l + 1); } }
];
var save = { gold: 0, best: 0, ship: "falcon", ships: { falcon: true }, meta: { atk: 0, hp: 0, spd: 0, mag: 0, xp: 0, rev: 0 } };
(function loadSave() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    var s = JSON.parse(raw);
    save.gold = +s.gold || 0; save.best = +s.best || 0;
    if (s.ship && SHIPS[s.ship]) save.ship = s.ship;
    if (s.ships) for (var k in s.ships) if (SHIPS[k]) save.ships[k] = !!s.ships[k];
    if (s.meta) for (var m in save.meta) save.meta[m] = +s.meta[m] || 0;
    save.ships.falcon = true;
  } catch (e) {}
})();
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }

/* ---------- audio ---------- */
var ac = null, muted = false, lastSnd = {};
function audio() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
  if (ac && ac.state === "suspended") ac.resume();
}
function tone(f1, f2, dur, type, vol) {
  if (!ac || muted) return;
  var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
  o.type = type;
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
function snd(name, gap) {
  var now = performance.now();
  if (gap && lastSnd[name] && now - lastSnd[name] < gap) return;
  lastSnd[name] = now;
  switch (name) {
    case "shoot": tone(620, 260, 0.06, "square", 0.02); break;
    case "hit": tone(220, 90, 0.07, "sawtooth", 0.03); break;
    case "gem": tone(700, 1100, 0.08, "sine", 0.045); break;
    case "coin": tone(1000, 1500, 0.07, "triangle", 0.05); break;
    case "hurt": tone(160, 50, 0.25, "sawtooth", 0.1); break;
    case "nova": tone(300, 60, 0.3, "sine", 0.1); break;
    case "dash": tone(300, 700, 0.1, "triangle", 0.06); break;
    case "boom": tone(140, 30, 0.45, "sawtooth", 0.12); break;
    case "ice": tone(1000, 400, 0.4, "sine", 0.08); break;
    case "boss": tone(90, 40, 0.8, "sawtooth", 0.12); break;
    case "zap": tone(900, 200, 0.08, "square", 0.03); break;
    case "lvl":
      tone(440, 440, 0.1, "triangle", 0.08);
      setTimeout(function () { tone(660, 660, 0.1, "triangle", 0.08); }, 90);
      setTimeout(function () { tone(880, 880, 0.18, "triangle", 0.08); }, 180);
      break;
    case "chest":
      tone(520, 520, 0.1, "triangle", 0.08);
      setTimeout(function () { tone(780, 780, 0.1, "triangle", 0.08); }, 80);
      setTimeout(function () { tone(1040, 1040, 0.1, "triangle", 0.08); }, 160);
      setTimeout(function () { tone(1560, 1560, 0.25, "triangle", 0.08); }, 240);
      break;
  }
}
