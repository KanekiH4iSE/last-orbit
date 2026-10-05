/* Last Orbit - Procedural space background, planets, black holes */
"use strict";
/* ---------- space background ---------- */
function hash(x, y, s) {
  var h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 982451653);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function rng(seed) {
  return function () {
    seed = (seed + 0x6D2B79F5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
var PLANETS = [
  { a: "#f4a45f", b: "#6b2a18", ring: false, bands: true },
  { a: "#7cbcf5", b: "#17335c", ring: false, bands: false },
  { a: "#c9a0ee", b: "#37245e", ring: true, bands: true },
  { a: "#97e0ad", b: "#16452f", ring: false, bands: false },
  { a: "#f0d993", b: "#5c4c1c", ring: true, bands: true },
  { a: "#e88282", b: "#44121c", ring: false, bands: true },
  { a: "#8fe3e3", b: "#14424a", ring: false, bands: true },
  { a: "#e3a6d0", b: "#4a2150", ring: true, bands: false },
  { a: "#9db6ff", b: "#1d2a70", ring: false, bands: true },
  { a: "#ffb877", b: "#7a2b0c", ring: false, bands: false }
];
function drawNebulae(camx, camy) {
  var f = 0.08, cell = 1300, ox = camx * f, oy = camy * f;
  var x0 = Math.floor((ox - W / 2 - 700) / cell), x1 = Math.floor((ox + W / 2 + 700) / cell);
  var y0 = Math.floor((oy - H / 2 - 700) / cell), y1 = Math.floor((oy + H / 2 + 700) / cell);
  var cols = ["110,80,230", "40,140,220", "210,70,150", "40,190,170"];
  for (var a = x0; a <= x1; a++) for (var b = y0; b <= y1; b++) {
    if (hash(a, b, 11) > 0.8) continue;
    var rad = 420 + hash(a, b, 12) * 400;
    var px = a * cell + hash(a, b, 13) * cell - ox + W / 2, py = b * cell + hash(a, b, 14) * cell - oy + H / 2;
    var c = cols[Math.floor(hash(a, b, 15) * cols.length)];
    var g = ctx.createRadialGradient(px, py, 0, px, py, rad);
    g.addColorStop(0, "rgba(" + c + ",0.2)"); g.addColorStop(1, "rgba(" + c + ",0)");
    ctx.fillStyle = g; ctx.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }
}
function drawStars(camx, camy, f, tile, count, size, alpha, seed) {
  var ox = camx * f, oy = camy * f;
  var x0 = Math.floor((ox - W / 2) / tile), x1 = Math.floor((ox + W / 2) / tile);
  var y0 = Math.floor((oy - H / 2) / tile), y1 = Math.floor((oy + H / 2) / tile);
  ctx.fillStyle = "#dbe8ff";
  for (var a = x0; a <= x1; a++) for (var b = y0; b <= y1; b++) {
    var r = rng(Math.imul(a, 73856093) ^ Math.imul(b, 19349663) ^ seed);
    for (var k = 0; k < count; k++) {
      var sx = a * tile + r() * tile - ox + W / 2, sy = b * tile + r() * tile - oy + H / 2, br = r();
      ctx.globalAlpha = alpha * (0.35 + 0.65 * br);
      ctx.fillRect(sx, sy, size, size);
    }
  }
  ctx.globalAlpha = 1;
}
function drawBrightStars(camx, camy, T) {
  var f = 0.35, cell = 380, ox = camx * f, oy = camy * f, pad = 70;
  var x0 = Math.floor((ox - W / 2 - pad) / cell), x1 = Math.floor((ox + W / 2 + pad) / cell);
  var y0 = Math.floor((oy - H / 2 - pad) / cell), y1 = Math.floor((oy + H / 2 + pad) / cell);
  var cols = ["255,255,255", "170,200,255", "255,214,150", "255,160,140"];
  for (var a = x0; a <= x1; a++) for (var b = y0; b <= y1; b++) {
    if (hash(a, b, 41) > 0.65) continue;
    var px = a * cell + hash(a, b, 42) * cell - ox + W / 2, py = b * cell + hash(a, b, 43) * cell - oy + H / 2;
    var rad = 14 + hash(a, b, 44) * 28, c = cols[Math.floor(hash(a, b, 45) * cols.length)];
    var tw = 0.75 + 0.25 * Math.sin(T * 2 + a * 7 + b * 3);
    var g = ctx.createRadialGradient(px, py, 0, px, py, rad);
    g.addColorStop(0, "rgba(" + c + "," + (0.95 * tw).toFixed(2) + ")"); g.addColorStop(0.16, "rgba(" + c + ",0.5)"); g.addColorStop(1, "rgba(" + c + ",0)");
    ctx.fillStyle = g; ctx.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    ctx.strokeStyle = "rgba(" + c + ",0.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px - rad * 1.5, py); ctx.lineTo(px + rad * 1.5, py); ctx.moveTo(px, py - rad * 1.5); ctx.lineTo(px, py + rad * 1.5); ctx.stroke();
  }
}
function drawSuns(camx, camy) {
  var f = 0.14, cell = 2200, ox = camx * f, oy = camy * f, pad = 320;
  var x0 = Math.floor((ox - W / 2 - pad) / cell), x1 = Math.floor((ox + W / 2 + pad) / cell);
  var y0 = Math.floor((oy - H / 2 - pad) / cell), y1 = Math.floor((oy + H / 2 + pad) / cell);
  var cols = [["255,200,110", "255,140,40"], ["170,200,255", "90,140,255"], ["255,150,130", "255,70,60"]];
  for (var a = x0; a <= x1; a++) for (var b = y0; b <= y1; b++) {
    if (hash(a, b, 61) > 0.5) continue;
    var px = a * cell + hash(a, b, 62) * cell - ox + W / 2, py = b * cell + hash(a, b, 63) * cell - oy + H / 2;
    var rad = 70 + hash(a, b, 64) * 60, c = cols[Math.floor(hash(a, b, 65) * cols.length)];
    var g = ctx.createRadialGradient(px, py, rad * 0.4, px, py, rad * 3.2);
    g.addColorStop(0, "rgba(" + c[1] + ",0.45)"); g.addColorStop(1, "rgba(" + c[1] + ",0)");
    ctx.fillStyle = g; ctx.fillRect(px - rad * 3.2, py - rad * 3.2, rad * 6.4, rad * 6.4);
    var g2 = ctx.createRadialGradient(px, py, 0, px, py, rad);
    g2.addColorStop(0, "rgba(255,255,245,1)"); g2.addColorStop(0.6, "rgba(" + c[0] + ",1)"); g2.addColorStop(1, "rgba(" + c[1] + ",1)");
    ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(px, py, rad, 0, TAU); ctx.fill();
  }
}
function drawPlanets(camx, camy, f, cell, seed, rmin, rmax, pfrac, dim) {
  var ox = camx * f, oy = camy * f, pad = rmax * 2.4;
  var x0 = Math.floor((ox - W / 2 - pad) / cell), x1 = Math.floor((ox + W / 2 + pad) / cell);
  var y0 = Math.floor((oy - H / 2 - pad) / cell), y1 = Math.floor((oy + H / 2 + pad) / cell);
  for (var a = x0; a <= x1; a++) for (var b = y0; b <= y1; b++) {
    if (hash(a, b, seed) > pfrac) continue;
    var rad = rmin + hash(a, b, seed + 1) * (rmax - rmin);
    var px = a * cell + hash(a, b, seed + 2) * cell - ox + W / 2, py = b * cell + hash(a, b, seed + 3) * cell - oy + H / 2;
    if (px + rad * 2.4 < 0 || px - rad * 2.4 > W || py + rad * 2.4 < 0 || py - rad * 2.4 > H) continue;
    var pal = PLANETS[Math.floor(hash(a, b, seed + 4) * PLANETS.length)];
    ctx.globalAlpha = dim;
    var g = ctx.createRadialGradient(px - rad * 0.4, py - rad * 0.4, rad * 0.1, px, py, rad * 1.05);
    g.addColorStop(0, pal.a); g.addColorStop(1, pal.b);
    if (pal.ring) {
      ctx.save(); ctx.translate(px, py); ctx.rotate(-0.4); ctx.scale(1, 0.26);
      ctx.strokeStyle = "rgba(255,240,215,0.28)"; ctx.lineWidth = rad * 0.22;
      ctx.beginPath(); ctx.arc(0, 0, rad * 1.65, Math.PI, TAU); ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, rad, 0, TAU); ctx.fill();
    if (pal.bands) {
      ctx.save(); ctx.beginPath(); ctx.arc(px, py, rad, 0, TAU); ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (var i = 0; i < 3; i++) ctx.fillRect(px - rad, py - rad + rad * (0.35 + i * 0.55), rad * 2, rad * 0.14);
      ctx.restore();
    }
    var sh = ctx.createRadialGradient(px - rad * 0.5, py - rad * 0.5, rad * 0.6, px + rad * 0.2, py + rad * 0.2, rad * 1.15);
    sh.addColorStop(0, "rgba(2,3,8,0)"); sh.addColorStop(1, "rgba(2,3,8,0.6)");
    ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(px, py, rad, 0, TAU); ctx.fill();
    if (pal.ring) {
      ctx.save(); ctx.translate(px, py); ctx.rotate(-0.4); ctx.scale(1, 0.26);
      ctx.strokeStyle = "rgba(255,240,215,0.38)"; ctx.lineWidth = rad * 0.22;
      ctx.beginPath(); ctx.arc(0, 0, rad * 1.65, 0, Math.PI); ctx.stroke(); ctx.restore();
    }
    if (hash(a, b, seed + 5) < 0.5) {
      var ma = hash(a, b, seed + 6) * TAU, md = rad * (1.5 + hash(a, b, seed + 7) * 0.6), mr = rad * 0.2;
      var mx = px + Math.cos(ma) * md, my = py + Math.sin(ma) * md * 0.8;
      var mg = ctx.createRadialGradient(mx - mr * 0.4, my - mr * 0.4, 1, mx, my, mr);
      mg.addColorStop(0, "#d9dde6"); mg.addColorStop(1, "#3a3f4d");
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
function drawSpace(camx, camy) {
  var T = performance.now() / 1000;
  drawNebulae(camx, camy);
  drawStars(camx, camy, 0.1, 300, 9, 1.2, 0.55, 101);
  drawSuns(camx, camy);
  drawPlanets(camx, camy, 0.07, 520, 21, 40, 105, 1, 0.5);
  drawStars(camx, camy, 0.25, 260, 8, 1.6, 0.8, 202);
  drawPlanets(camx, camy, 0.18, 720, 31, 55, 150, 0.95, 0.8);
  drawBrightStars(camx, camy, T);
  drawPlanets(camx, camy, 0.38, 900, 51, 50, 130, 0.75, 1);
  drawStars(camx, camy, 0.55, 220, 6, 2, 0.95, 303);
}

/* black holes live in world space and pull everything toward them */
var BH_CELL = 2200, BH_PULL = 300, BH_CORE = 32;
function holesNear(x, y) {
  var out = [], cx = Math.floor(x / BH_CELL), cy = Math.floor(y / BH_CELL);
  for (var a = cx - 1; a <= cx + 1; a++) for (var b = cy - 1; b <= cy + 1; b++) {
    if (hash(a, b, 901) > 0.6) continue;
    var hx = a * BH_CELL + hash(a, b, 902) * BH_CELL, hy = b * BH_CELL + hash(a, b, 903) * BH_CELL;
    if (Math.hypot(hx, hy) < 800) continue;
    out.push({ x: hx, y: hy });
  }
  return out;
}
function drawBlackHole(h, cx, cy, T) {
  var x = h.x + cx, y = h.y + cy;
  if (x < -420 || y < -420 || x > W + 420 || y > H + 420) return;
  ctx.strokeStyle = "rgba(180,120,255,0.12)"; ctx.lineWidth = 1.5; ctx.setLineDash([6, 10]);
  ctx.beginPath(); ctx.arc(x, y, BH_PULL, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  var g = ctx.createRadialGradient(x, y, 20, x, y, 180);
  g.addColorStop(0, "rgba(255,150,60,0.38)"); g.addColorStop(0.5, "rgba(160,80,255,0.16)"); g.addColorStop(1, "rgba(160,80,255,0)");
  ctx.fillStyle = g; ctx.fillRect(x - 180, y - 180, 360, 360);
  var cols = ["rgba(255,205,130,0.9)", "rgba(255,140,60,0.7)", "rgba(190,90,255,0.6)"];
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35); ctx.scale(1, 0.38);
  for (var i = 0; i < 3; i++) { ctx.strokeStyle = cols[i]; ctx.lineWidth = 8 - i * 2; ctx.beginPath(); ctx.arc(0, 0, 60 + i * 20, 0, TAU); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = "#ffd9a0";
  for (var k = 0; k < 28; k++) {
    var a = T * (1.7 - (k % 5) * 0.25) + k * 0.97, rr = 46 + (k * 13) % 90;
    var ex = Math.cos(a) * rr, ey = Math.sin(a) * rr * 0.38;
    ctx.fillRect(x + ex * 0.939 + ey * 0.343, y - ex * 0.343 + ey * 0.939, 2, 2);
  }
  ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(x, y, BH_CORE - 2, 0, TAU); ctx.fill();
  ctx.strokeStyle = "rgba(255,230,200,0.75)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, BH_CORE - 1, 0, TAU); ctx.stroke();
}
