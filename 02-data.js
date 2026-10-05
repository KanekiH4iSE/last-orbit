/* Last Orbit - Game data: weapons, passives, enemies, ships, upgrades */
"use strict";
/* ---------- game data ---------- */
var ICON = {
  laser: '<path d="M4 20 L20 4"/><circle cx="20" cy="4" r="2"/><path d="M4 13 L13 4" opacity=".5"/>',
  missile: '<path d="M6 18 L18 6"/><path d="M18 6 l-6 1 M18 6 l-1 6"/><circle cx="6" cy="18" r="2"/>',
  drone: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>',
  blade: '<path d="M12 3 l3 9 -3 9 -3 -9 z"/><path d="M3 12 l9 -3 9 3 -9 3 z" opacity=".5"/>',
  emp: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="10.5" opacity=".5"/>',
  arc: '<path d="M13 3 L7 13 H12 L10 21 L17 10 H12 Z"/>',
  dmg: '<path d="M12 3 v5 M12 16 v5 M3 12 h5 M16 12 h5"/><circle cx="12" cy="12" r="2"/>',
  rate: '<path d="M5 12 a7 7 0 1 1 2 5"/><path d="M5 12 l-1 -5 M5 12 l5 -1"/>',
  speed: '<path d="M5 6 l6 6 -6 6 M12 6 l6 6 -6 6"/>',
  crit: '<circle cx="12" cy="12" r="6"/><path d="M12 2 v5 M12 17 v5 M2 12 h5 M17 12 h5"/>',
  hp: '<path d="M12 5 v14 M5 12 h14"/>',
  magnet: '<path d="M6 4 v8 a6 6 0 0 0 12 0 v-8 M6 8 h3 M15 8 h3"/>',
  regen: '<path d="M12 20 s-8 -5 -8 -11 a4 4 0 0 1 8 -1 a4 4 0 0 1 8 1 c0 6 -8 11 -8 11 z"/>',
  armor: '<path d="M12 3 l8 3 v6 c0 5 -4 8 -8 9 c-4 -1 -8 -4 -8 -9 v-6 z"/>',
  xp: '<path d="M12 3 l7 9 -7 9 -7 -9 z"/>',
  heal: '<path d="M12 5 v14 M5 12 h14"/><circle cx="12" cy="12" r="9"/>',
  gold: '<circle cx="12" cy="12" r="8"/><path d="M12 8 v8 M9 10.5 h6"/>'
};
function icon(id, size) {
  return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[id] + '</svg>';
}
var WEAPONS = [
  { id: "laser", name: "Pulse laser", evoName: "Railgun", pair: "dmg", desc: "Fires bolts at the nearest robot.", up: "More damage, extra bolts, piercing." },
  { id: "missile", name: "Homing missiles", evoName: "Swarm launcher", pair: "rate", desc: "Missiles that seek robots and explode.", up: "More missiles and bigger blasts." },
  { id: "drone", name: "Combat drones", evoName: "Drone halo", pair: "speed", desc: "Drones circle your shuttle and ram robots.", up: "More drones and more damage." },
  { id: "blade", name: "Plasma cutter", evoName: "Twin cutters", pair: "crit", desc: "Throws a spinning blade that flies back to you.", up: "More blades, damage and reach." },
  { id: "emp", name: "EMP pulse", evoName: "Gravity nova", pair: "hp", desc: "A pulse that hits every robot nearby.", up: "Bigger pulse, more damage, faster recharge." },
  { id: "arc", name: "Arc coil", evoName: "Storm coil", pair: "magnet", desc: "Lightning that jumps from robot to robot.", up: "More jumps and more damage." }
];
var PASSIVES = [
  { id: "dmg", name: "Overcharge", desc: "+12% damage.", max: 8 },
  { id: "rate", name: "Cooling core", desc: "+10% fire rate.", max: 8 },
  { id: "speed", name: "Thrusters", desc: "+8% move speed.", max: 8 },
  { id: "crit", name: "Targeting", desc: "+8% critical chance. Crits deal double.", max: 8 },
  { id: "hp", name: "Hull plating", desc: "+20 max health and heal 20.", max: 8 },
  { id: "magnet", name: "Tractor beam", desc: "+30% pickup range.", max: 8 },
  { id: "regen", name: "Repair bots", desc: "Recover 0.5 health per second.", max: 5 },
  { id: "armor", name: "Shield matrix", desc: "Take 6% less damage.", max: 5 },
  { id: "xp", name: "Data scanner", desc: "+12% experience.", max: 5 }
];
var WMAP = {}, PMAP = {};
WEAPONS.forEach(function (w) { WMAP[w.id] = w; });
PASSIVES.forEach(function (p) { PMAP[p.id] = p; });
var MAX_WLV = 8, MAX_WEAPONS = 6, MAX_PASSIVES = 6;

var TYPES = {
  scout:    { name: "Scout bot", kind: "Robot", note: "Swarms in numbers.", r: 11, hp: 10, spd: 58, dmg: 6, xp: 1, col: "#7d93b5" },
  dasher:   { name: "Dasher", kind: "Robot", note: "Fast and fragile.", r: 9, hp: 6, spd: 118, dmg: 6, xp: 1, col: "#e0596f" },
  heavy:    { name: "Heavy bot", kind: "Robot", note: "Slow, tough and hits hard.", r: 21, hp: 70, spd: 42, dmg: 15, xp: 6, col: "#c98a3d" },
  gunner:   { name: "Gunner", kind: "Robot", note: "Keeps its distance and shoots.", r: 12, hp: 16, spd: 48, dmg: 7, xp: 3, col: "#58b8a6" },
  bomber:   { name: "Bomber", kind: "Robot", note: "Arms itself and explodes near you.", r: 13, hp: 12, spd: 88, dmg: 0, xp: 2, col: "#e7792b" },
  splitter: { name: "Splitter", kind: "Robot", note: "Breaks into two scouts.", r: 16, hp: 34, spd: 50, dmg: 10, xp: 3, col: "#a7c957" },
  spider:   { name: "Void spider", kind: "Alien", note: "Arrives in fast packs.", r: 8, hp: 8, spd: 108, dmg: 5, xp: 1, col: "#8a5ad0" },
  slime:    { name: "Acid slime", kind: "Alien", note: "Leaves a pool of acid when killed.", r: 13, hp: 20, spd: 50, dmg: 7, xp: 2, col: "#6fd36f" },
  jelly:    { name: "Star jelly", kind: "Alien", note: "Drifts sideways and fires orbs.", r: 14, hp: 26, spd: 62, dmg: 6, xp: 4, col: "#b184e8" },
  beetle:   { name: "Crystal beetle", kind: "Alien", note: "Armored. Winds up, then charges.", r: 17, hp: 60, spd: 55, dmg: 12, xp: 5, col: "#4aa3c9" },
  wraith:   { name: "Wraith", kind: "Monster", note: "Fades out. Takes little damage while a ghost.", r: 13, hp: 28, spd: 78, dmg: 9, xp: 4, col: "#a8f0ff" },
  eye:      { name: "Watcher", kind: "Monster", note: "Charges a deadly beam. Move off the line.", r: 18, hp: 40, spd: 40, dmg: 0, xp: 6, col: "#e0d6c8" },
  golem:    { name: "Golem", kind: "Monster", note: "Stomps and sends out shockwaves.", r: 27, hp: 160, spd: 34, dmg: 16, xp: 10, col: "#9a8878" },
  asteroid: { name: "Asteroid", kind: "Hazard", note: "Flies through the field. Splits when shot.", r: 22, hp: 30, spd: 0, dmg: 14, xp: 2, col: "#8c8479" },
  boss:     { name: "Boss", kind: "Boss", note: "Every boss has twice the health of the last.", r: 46, hp: 700, spd: 50, dmg: 22, xp: 0, col: "#8d3fb0" }
};
var BOSSES = [
  { name: "Mega Mech", col: "#8d3fb0", note: "Robot. Ring volleys and scout drops." },
  { name: "Hive Queen", col: "#3fae5e", note: "Alien. Acid fans and spider broods." },
  { name: "Void Titan", col: "#6a2aa0", note: "Monster. Spiral fire and shockwaves." }
];
function need(l) { return Math.floor(3 + l * 2.6 + l * l * 0.3); }
