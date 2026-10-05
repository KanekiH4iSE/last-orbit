/* Last Orbit - Rendering: world, enemies, effects, HUD */
"use strict";
/* ---------- draw ---------- */
function drawAsteroid(e, x, y) {
  var r = e.r, sh = e.shape || [], k;
  ctx.save(); ctx.translate(x, y); ctx.rotate(e.rot || 0);
  ctx.beginPath();
  for (k = 0; k < 12; k++) {
    var aa = k * TAU / 12, rr = r * (sh[k] || 1);
    if (k === 0) ctx.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr); else ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = e.flash > 0 ? "#ffffff" : "#8c8479"; ctx.fill();
  ctx.strokeStyle = "#4a443c"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "rgba(60,54,46,0.55)";
  ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.2, r * 0.22, 0, TAU); ctx.arc(-r * 0.35, r * 0.25, r * 0.18, 0, TAU); ctx.arc(r * 0.1, r * 0.45, r * 0.12, 0, TAU); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
  ctx.restore();
}

function drawEnemy(e, cx, cy) {
  var x = e.x + cx, y = e.y + cy, r = e.r, fl = e.flash > 0, k, s;
  if (x < -120 || y < -120 || x > W + 120 || y > H + 120) return;
  if (e.type === "asteroid") { drawAsteroid(e, x, y); }
  else {
    var body = fl ? "#ffffff" : e.col, dark = fl ? "#e6e6e6" : "#2a3347", light = fl ? "#ffffff" : "#c9d4e6";
    var ang = Math.atan2(V.py - e.y, V.px - e.x);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    if (e.type === "dasher") {
      var fl2 = r * (1.5 + Math.random() * 0.6);
      ctx.fillStyle = "#ff9a3c"; ctx.beginPath(); ctx.moveTo(-r * 0.8, -r * 0.3); ctx.lineTo(-fl2 - r * 0.4, 0); ctx.lineTo(-r * 0.8, r * 0.3); ctx.fill();
      ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(r * 1.3, 0); ctx.lineTo(-r * 0.9, -r * 0.95); ctx.lineTo(-r * 0.4, 0); ctx.lineTo(-r * 0.9, r * 0.95); ctx.closePath(); ctx.fill();
      ctx.fillStyle = dark; ctx.fillRect(-r * 0.3, -r * 0.2, r * 0.9, r * 0.4);
      ctx.fillStyle = "#ff4d4d"; ctx.fillRect(r * 0.5, -r * 0.14, r * 0.4, r * 0.28);
    } else if (e.type === "heavy") {
      ctx.fillStyle = dark; ctx.fillRect(-r * 0.5, -r * 1.2, r * 1.1, r * 0.5); ctx.fillRect(-r * 0.5, r * 0.7, r * 1.1, r * 0.5);
      ctx.beginPath(); ctx.arc(r * 0.7, -r * 1.0, r * 0.38, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.7, r * 1.0, r * 0.38, 0, TAU); ctx.fill();
      ctx.fillStyle = body; ctx.fillRect(-r * 0.95, -r * 0.85, r * 1.9, r * 1.7);
      ctx.fillStyle = dark; ctx.fillRect(-r * 0.7, -r * 0.4, r * 0.5, r * 0.8);
      ctx.fillStyle = "#ffd23c"; ctx.fillRect(-r * 0.1, -r * 0.85, r * 0.16, r * 1.7);
      ctx.fillStyle = light; ctx.fillRect(r * 0.25, -r * 0.4, r * 0.65, r * 0.8);
      ctx.fillStyle = "#ff8a2e"; ctx.fillRect(r * 0.6, -r * 0.22, r * 0.3, r * 0.44);
    } else if (e.type === "gunner") {
      ctx.fillStyle = dark; ctx.fillRect(r * 0.2, -r * 0.2, r * 1.5, r * 0.4);
      ctx.fillRect(-r * 0.5, -r * 1.05, r * 0.7, r * 0.3); ctx.fillRect(-r * 0.5, r * 0.75, r * 0.7, r * 0.3);
      ctx.fillStyle = body; ctx.fillRect(-r * 0.9, -r * 0.75, r * 1.4, r * 1.5);
      ctx.fillStyle = light; ctx.beginPath(); ctx.arc(r * 0.1, 0, r * 0.45, 0, TAU); ctx.fill();
      ctx.fillStyle = "#ff4d4d"; ctx.fillRect(r * 0.2, -r * 0.14, r * 0.28, r * 0.28);
    } else if (e.type === "bomber") {
      ctx.fillStyle = dark; ctx.fillRect(-r * 0.3, -r * 1.2, r * 0.7, r * 0.35); ctx.fillRect(-r * 0.3, r * 0.85, r * 0.7, r * 0.35);
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, TAU); ctx.fill();
      var on = e.fuse > 0 ? Math.floor(V.t * 16) % 2 === 0 : Math.floor(V.t * 3) % 2 === 0;
      ctx.fillStyle = on ? "#ff3b30" : "#7a1a14"; ctx.beginPath(); ctx.arc(0, 0, r * 0.32, 0, TAU); ctx.fill();
    } else if (e.type === "splitter") {
      ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(-r * 0.1, -r * 0.95, r * 0.5, 0, TAU); ctx.arc(-r * 0.1, r * 0.95, r * 0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = body; ctx.fillRect(-r * 0.85, -r * 0.8, r * 1.7, r * 1.6);
      ctx.fillStyle = dark; ctx.fillRect(-r * 0.05, -r * 0.8, r * 0.1, r * 1.6);
      ctx.fillStyle = "#ff4d4d"; ctx.fillRect(r * 0.5, -r * 0.4, r * 0.3, r * 0.2); ctx.fillRect(r * 0.5, r * 0.2, r * 0.3, r * 0.2);
    } else if (e.type === "spider") {
      var phs = V.t * 18 + e.ph;
      ctx.strokeStyle = fl ? "#fff" : "#5a3a90"; ctx.lineWidth = 1.6;
      for (k = 0; k < 4; k++) for (s = -1; s <= 1; s += 2) {
        var la = s * (0.5 + k * 0.5) + Math.sin(phs + k * 1.7) * 0.22 * s;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(la) * r * 1.9, Math.sin(la) * r * 1.9); ctx.stroke();
      }
      ctx.fillStyle = fl ? "#fff" : "#5a3a90"; ctx.beginPath(); ctx.arc(-r * 0.75, 0, r * 0.7, 0, TAU); ctx.fill();
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, TAU); ctx.fill();
      ctx.fillStyle = "#ff4d4d"; ctx.fillRect(r * 0.4, -r * 0.45, r * 0.25, r * 0.25); ctx.fillRect(r * 0.4, r * 0.2, r * 0.25, r * 0.25);
    } else if (e.type === "slime") {
      var wob = 1 + 0.08 * Math.sin(V.t * 6 + e.ph);
      ctx.fillStyle = fl ? "#fff" : "rgba(111,211,111,0.92)"; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.1 * wob, r * (2 - wob) * 0.95, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "rgba(210,255,210,0.45)"; ctx.beginPath(); ctx.ellipse(-r * 0.2, -r * 0.3, r * 0.45, r * 0.28, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "rgba(40,130,60,0.7)"; ctx.beginPath(); ctx.arc(-r * 0.2, r * 0.1, r * 0.33, 0, TAU); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(r * 0.45, -r * 0.35, r * 0.22, 0, TAU); ctx.arc(r * 0.45, r * 0.35, r * 0.22, 0, TAU); ctx.fill();
      ctx.fillStyle = "#10331a"; ctx.beginPath(); ctx.arc(r * 0.53, -r * 0.35, r * 0.1, 0, TAU); ctx.arc(r * 0.53, r * 0.35, r * 0.1, 0, TAU); ctx.fill();
    } else if (e.type === "jelly") {
      ctx.strokeStyle = fl ? "#fff" : "rgba(177,132,232,0.85)"; ctx.lineWidth = 2;
      for (k = 0; k < 4; k++) {
        ctx.beginPath(); ctx.moveTo(-r * 0.3, (k - 1.5) * r * 0.45);
        for (s = 1; s <= 4; s++) ctx.lineTo(-r * 0.3 - s * r * 0.5, (k - 1.5) * r * 0.45 + Math.sin(V.t * 6 + k + s) * r * 0.3);
        ctx.stroke();
      }
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.beginPath(); ctx.arc(r * 0.2, -r * 0.25, r * 0.45, 0, TAU); ctx.fill();
      ctx.fillStyle = "#ffd0ff"; ctx.beginPath(); ctx.arc(-r * 0.1, 0, r * 0.28, 0, TAU); ctx.fill();
      ctx.fillStyle = "#3a1f66"; ctx.beginPath(); ctx.arc(r * 0.55, -r * 0.3, r * 0.12, 0, TAU); ctx.arc(r * 0.55, r * 0.3, r * 0.12, 0, TAU); ctx.fill();
    } else if (e.type === "beetle") {
      ctx.strokeStyle = fl ? "#fff" : "#1f4a60"; ctx.lineWidth = 2;
      for (k = 0; k < 3; k++) for (s = -1; s <= 1; s += 2) { ctx.beginPath(); ctx.moveTo(r * (0.4 - k * 0.5), s * r * 0.5); ctx.lineTo(r * (0.6 - k * 0.5), s * r * 1.25); ctx.stroke(); }
      if (e.tel > 0) { ctx.fillStyle = "rgba(255,80,60,0.35)"; ctx.beginPath(); ctx.arc(0, 0, r * 1.5, 0, TAU); ctx.fill(); }
      ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.15, r * 0.9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = fl ? "#fff" : "rgba(160,225,250,0.55)"; ctx.beginPath(); ctx.ellipse(-r * 0.1, -r * 0.25, r * 0.7, r * 0.3, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = fl ? "#ddd" : "#1f4a60"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-r * 1.1, 0); ctx.lineTo(r * 0.6, 0); ctx.stroke();
      ctx.fillStyle = fl ? "#fff" : "#2f6f8f"; ctx.beginPath(); ctx.moveTo(r * 0.9, -r * 0.3); ctx.lineTo(r * 1.8, 0); ctx.lineTo(r * 0.9, r * 0.3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ff4d4d"; ctx.fillRect(r * 0.6, -r * 0.55, r * 0.2, r * 0.2); ctx.fillRect(r * 0.6, r * 0.35, r * 0.2, r * 0.2);
    } else if (e.type === "wraith") {
      ctx.globalAlpha = e.ghost ? 0.32 : 0.9;
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(r * 0.2, 0, r * 0.75, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(r * 0.1, -r * 0.7);
      for (k = 1; k <= 4; k++) ctx.lineTo(-r * (0.4 + k * 0.55), -r * 0.45 + Math.sin(V.t * 8 + k) * r * 0.4);
      for (k = 4; k >= 1; k--) ctx.lineTo(-r * (0.4 + k * 0.55), r * 0.45 + Math.sin(V.t * 8 + k + 2) * r * 0.4);
      ctx.lineTo(r * 0.1, r * 0.7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#10243a"; ctx.beginPath(); ctx.ellipse(r * 0.55, -r * 0.28, r * 0.17, r * 0.26, 0, 0, TAU); ctx.ellipse(r * 0.55, r * 0.28, r * 0.17, r * 0.26, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (e.type === "eye") {
      ctx.strokeStyle = fl ? "#fff" : "#8a6a78"; ctx.lineWidth = 2.5;
      for (k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-r * 0.6, (k - 1) * r * 0.5); for (s = 1; s <= 3; s++) ctx.lineTo(-r * (0.6 + s * 0.5), (k - 1) * r * 0.5 + Math.sin(V.t * 5 + k * 2 + s) * r * 0.3); ctx.stroke(); }
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = fl ? "#fff" : "rgba(200,60,60,0.6)"; ctx.lineWidth = 1;
      for (k = 0; k < 4; k++) { var va = 2.4 + k * 0.5; ctx.beginPath(); ctx.moveTo(Math.cos(va) * r, Math.sin(va) * r); ctx.lineTo(Math.cos(va) * r * 0.55, Math.sin(va) * r * 0.55); ctx.stroke(); }
      ctx.fillStyle = e.tel > 0 ? "#ff3030" : "#d9a038"; ctx.beginPath(); ctx.arc(r * 0.25, 0, r * 0.55, 0, TAU); ctx.fill();
      ctx.fillStyle = "#120808"; ctx.beginPath(); ctx.ellipse(r * 0.35, 0, r * 0.2, r * 0.3, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = "#3a2a30"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
    } else if (e.type === "golem") {
      ctx.fillStyle = fl ? "#fff" : "#6f6155";
      ctx.beginPath(); ctx.arc(r * 0.75, -r * 1.05, r * 0.5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.75, r * 1.05, r * 0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = body; ctx.beginPath();
      ctx.moveTo(r * 0.9, -r * 0.5); ctx.lineTo(r * 0.5, -r * 0.95); ctx.lineTo(-r * 0.5, -r * 1.0); ctx.lineTo(-r * 1.0, -r * 0.4);
      ctx.lineTo(-r * 0.95, r * 0.5); ctx.lineTo(-r * 0.4, r * 1.0); ctx.lineTo(r * 0.6, r * 0.9); ctx.lineTo(r * 1.0, r * 0.35); ctx.closePath(); ctx.fill();
      ctx.fillStyle = fl ? "#fff" : "#b3a291"; ctx.beginPath(); ctx.moveTo(r * 0.2, -r * 0.6); ctx.lineTo(-r * 0.4, -r * 0.5); ctx.lineTo(-r * 0.3, r * 0.1); ctx.lineTo(r * 0.3, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#ff8a2e"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-r * 0.6, r * 0.3); ctx.lineTo(-r * 0.1, r * 0.55); ctx.lineTo(r * 0.2, r * 0.3); ctx.stroke();
      ctx.fillStyle = e.sT < 0.5 ? "#fff0a0" : "#ff8a2e"; ctx.fillRect(r * 0.6, -r * 0.35, r * 0.25, r * 0.2); ctx.fillRect(r * 0.6, r * 0.15, r * 0.25, r * 0.2);
    } else if (e.type === "boss") {
      var pulse = 0.55 + 0.45 * Math.sin(V.t * 6);
      if (e.bk === 1) {
        ctx.strokeStyle = fl ? "#fff" : "#1f5a30"; ctx.lineWidth = 4;
        for (k = 0; k < 4; k++) for (s = -1; s <= 1; s += 2) { var ba = s * (0.6 + k * 0.5) + Math.sin(V.t * 3 + k) * 0.1 * s; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ba) * r * 1.5, Math.sin(ba) * r * 1.5); ctx.stroke(); }
        ctx.fillStyle = fl ? "#fff" : "#2f8f4a"; ctx.beginPath(); ctx.ellipse(-r * 0.7, 0, r * 0.75 * (1 + pulse * 0.08), r * 0.7, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = fl ? "#fff" : "rgba(180,255,190," + (0.3 + pulse * 0.3).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(-r * 0.8, 0, r * 0.35, 0, TAU); ctx.fill();
        ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(r * 0.1, 0, r * 0.95, r * 0.8, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = fl ? "#fff" : "#1f5a30"; ctx.beginPath(); ctx.moveTo(r * 0.8, -r * 0.45); ctx.lineTo(r * 1.5, -r * 0.15); ctx.lineTo(r * 0.9, -r * 0.1); ctx.fill(); ctx.beginPath(); ctx.moveTo(r * 0.8, r * 0.45); ctx.lineTo(r * 1.5, r * 0.15); ctx.lineTo(r * 0.9, r * 0.1); ctx.fill();
        ctx.fillStyle = "#ff3b5c"; for (k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(r * 0.55, (k - 1.5) * r * 0.22, r * 0.09, 0, TAU); ctx.fill(); }
        ctx.fillStyle = "#ffe36e"; ctx.beginPath(); ctx.moveTo(-r * 0.2, -r * 0.8); ctx.lineTo(0, -r * 1.15); ctx.lineTo(r * 0.2, -r * 0.8); ctx.closePath(); ctx.fill();
      } else if (e.bk === 2) {
        for (k = 0; k < 6; k++) { var oa = V.t * 1.2 + k * TAU / 6; ctx.fillStyle = fl ? "#fff" : "#a24be0"; ctx.beginPath(); ctx.arc(Math.cos(oa) * r * 1.25, Math.sin(oa) * r * 1.25, r * 0.16, 0, TAU); ctx.fill(); }
        ctx.fillStyle = body; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
        ctx.strokeStyle = fl ? "#fff" : "#c88bff"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 0.88, 0, TAU); ctx.stroke();
        ctx.strokeStyle = "rgba(255,90,140," + (0.5 + pulse * 0.4).toFixed(2) + ")"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.5); ctx.lineTo(-r * 0.2, -r * 0.2); ctx.lineTo(-r * 0.5, r * 0.3); ctx.moveTo(-r * 0.3, r * 0.75); ctx.lineTo(r * 0.0, r * 0.4); ctx.stroke();
        ctx.fillStyle = fl ? "#fff" : "#f2e9ff"; ctx.beginPath(); ctx.arc(r * 0.2, 0, r * 0.55, 0, TAU); ctx.fill();
        ctx.fillStyle = "rgba(255,50,90," + (0.7 + pulse * 0.3).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(r * 0.32, 0, r * 0.33, 0, TAU); ctx.fill();
        ctx.fillStyle = "#12040c"; ctx.beginPath(); ctx.ellipse(r * 0.4, 0, r * 0.12, r * 0.27, 0, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = dark;
        ctx.fillRect(-r * 0.5, -r * 1.3, r * 1.2, r * 0.5); ctx.fillRect(-r * 0.5, r * 0.8, r * 1.2, r * 0.5);
        ctx.fillRect(r * 0.5, -r * 1.2, r * 0.9, r * 0.22); ctx.fillRect(r * 0.5, r * 0.98, r * 0.9, r * 0.22);
        ctx.fillStyle = body; ctx.beginPath();
        ctx.moveTo(r, -r * 0.5); ctx.lineTo(r * 0.6, -r); ctx.lineTo(-r * 0.8, -r); ctx.lineTo(-r, -r * 0.6);
        ctx.lineTo(-r, r * 0.6); ctx.lineTo(-r * 0.8, r); ctx.lineTo(r * 0.6, r); ctx.lineTo(r, r * 0.5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(-r * 0.2, 0, r * 0.55, 0, TAU); ctx.fill();
        ctx.fillStyle = "rgba(255,80,80," + pulse.toFixed(2) + ")"; ctx.beginPath(); ctx.arc(-r * 0.2, 0, r * 0.32, 0, TAU); ctx.fill();
        ctx.fillStyle = light; ctx.fillRect(r * 0.45, -r * 0.32, r * 0.5, r * 0.64);
        ctx.fillStyle = "#ff4d4d"; ctx.fillRect(r * 0.75, -r * 0.2, r * 0.2, r * 0.4);
      }
    } else {
      ctx.fillStyle = dark; ctx.fillRect(-r * 0.35, -r * 1.15, r * 0.9, r * 0.4); ctx.fillRect(-r * 0.35, r * 0.75, r * 0.9, r * 0.4);
      ctx.fillStyle = body; ctx.fillRect(-r * 0.85, -r * 0.8, r * 1.5, r * 1.6);
      ctx.fillStyle = light; ctx.beginPath(); ctx.arc(r * 0.3, 0, r * 0.55, 0, TAU); ctx.fill();
      ctx.fillStyle = "#ff4d4d"; ctx.fillRect(r * 0.5, -r * 0.3, r * 0.35, r * 0.6);
    }
    ctx.restore();
  }
  if (V.freeze > 0 || e.stun > 0) { ctx.fillStyle = "rgba(150,230,255,0.4)"; ctx.beginPath(); ctx.arc(x, y, r * 1.15, 0, TAU); ctx.fill(); }
  if (e.elite) {
    ctx.strokeStyle = "rgba(255,210,77," + (0.6 + 0.3 * Math.sin(V.t * 8)).toFixed(2) + ")"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r + 5, 0, TAU); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.15)"; ctx.fillRect(x - r, y - r - 12, r * 2, 4);
    ctx.fillStyle = "#ffd24d"; ctx.fillRect(x - r, y - r - 12, r * 2 * clamp(e.hp / e.max, 0, 1), 4);
  }
}

function drawShuttle(px, py, face, thrust, col) {
  var L = (6 + 12 * thrust) * (0.75 + Math.random() * 0.5);
  ctx.save(); ctx.translate(px, py); ctx.rotate(face);
  ctx.fillStyle = "rgba(255,150,60,0.95)"; ctx.beginPath(); ctx.moveTo(-15, -3.8); ctx.lineTo(-15 - L, 0); ctx.lineTo(-15, 3.8); ctx.fill();
  ctx.fillStyle = "rgba(130,225,255,0.95)"; ctx.beginPath(); ctx.moveTo(-15, -1.9); ctx.lineTo(-15 - L * 0.6, 0); ctx.lineTo(-15, 1.9); ctx.fill();
  ctx.fillStyle = col.wing;
  ctx.beginPath(); ctx.moveTo(6, -3); ctx.lineTo(-12, -19); ctx.lineTo(-17, -19); ctx.lineTo(-13, -3); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(6, 3); ctx.lineTo(-12, 19); ctx.lineTo(-17, 19); ctx.lineTo(-13, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#2a3347"; ctx.fillRect(-17, -19, 5, 2.6); ctx.fillRect(-17, 16.4, 5, 2.6);
  ctx.fillStyle = col.hull; ctx.beginPath(); ctx.ellipse(0, 0, 20, 6.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = col.acc; ctx.fillRect(-14, -1.2, 9, 2.4);
  ctx.fillStyle = "#2a3347"; ctx.beginPath(); ctx.ellipse(17, 0, 3.6, 2.8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = "#2b7fb0"; ctx.beginPath(); ctx.ellipse(8, 0, 4.5, 2.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = "#3a4558"; ctx.fillRect(-18, -4.2, 3.4, 2.4); ctx.fillRect(-18, -1.2, 3.4, 2.4); ctx.fillRect(-18, 1.8, 3.4, 2.4);
  ctx.restore();
}

function drawPickup(k, x, y) {
  y += Math.sin(G.t * 4 + k.x * 0.1) * 2;
  var glowCol = { coin: "255,210,77", heart: "255,90,95", magnet: "255,90,95", bomb: "255,150,60", freeze: "120,220,255", shield: "98,214,255", chest: "255,210,77" }[k.type];
  if (k.type !== "coin") {
    ctx.fillStyle = "rgba(" + glowCol + ",0.2)"; ctx.beginPath(); ctx.arc(x, y, k.type === "chest" ? 24 : 16, 0, TAU); ctx.fill();
  }
  switch (k.type) {
    case "coin":
      ctx.fillStyle = "#ffd24d"; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
      ctx.fillStyle = "#b8860b"; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill(); break;
    case "heart":
      ctx.fillStyle = "#ff5a5f"; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillRect(x - 1.8, y - 5.5, 3.6, 11); ctx.fillRect(x - 5.5, y - 1.8, 11, 3.6); break;
    case "magnet":
      ctx.strokeStyle = "#ff5a5f"; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.arc(x, y + 1, 6, 0, Math.PI); ctx.moveTo(x - 6, y + 1); ctx.lineTo(x - 6, y - 6); ctx.moveTo(x + 6, y + 1); ctx.lineTo(x + 6, y - 6); ctx.stroke();
      ctx.fillStyle = "#eaf2fb"; ctx.fillRect(x - 8, y - 9, 4, 3); ctx.fillRect(x + 4, y - 9, 4, 3); break;
    case "bomb":
      ctx.fillStyle = "#2a3347"; ctx.beginPath(); ctx.arc(x, y + 1, 8, 0, TAU); ctx.fill();
      ctx.strokeStyle = "#c9d4e6"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 4, y - 6); ctx.lineTo(x + 8, y - 11); ctx.stroke();
      ctx.fillStyle = Math.floor(G.t * 8) % 2 ? "#ffb02e" : "#ff3b30"; ctx.beginPath(); ctx.arc(x + 8, y - 11, 2.5, 0, TAU); ctx.fill(); break;
    case "freeze":
      ctx.strokeStyle = "#8fe3ff"; ctx.lineWidth = 2.5; ctx.beginPath();
      for (var s = 0; s < 3; s++) { var sa = s * Math.PI / 3; ctx.moveTo(x - Math.cos(sa) * 9, y - Math.sin(sa) * 9); ctx.lineTo(x + Math.cos(sa) * 9, y + Math.sin(sa) * 9); }
      ctx.stroke(); break;
    case "shield":
      ctx.fillStyle = "rgba(98,214,255,.35)"; ctx.strokeStyle = "#62d6ff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x + 8, y - 6); ctx.lineTo(x + 8, y + 2); ctx.lineTo(x, y + 10); ctx.lineTo(x - 8, y + 2); ctx.lineTo(x - 8, y - 6); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
    case "chest":
      ctx.fillStyle = "#b8860b"; ctx.fillRect(x - 13, y - 9, 26, 18);
      ctx.fillStyle = "#ffd24d"; ctx.fillRect(x - 13, y - 9, 26, 7);
      ctx.fillStyle = "#5a3d05"; ctx.fillRect(x - 13, y - 2, 26, 2.5);
      ctx.fillStyle = "#fff4c2"; ctx.fillRect(x - 3, y - 4, 6, 7); break;
  }
}

var menuActors = null;
function drawMenuScene() {
  var tt = performance.now() / 1000;
  drawSpace(tt * 60, tt * 20);
  drawBlackHole({ x: W * 0.84, y: H * 0.2 }, 0, 0, tt);
  var cxm = W / 2, cym = H * 0.82;
  V = { px: cxm, py: cym, t: tt, freeze: 0 };
  if (scene === "menu") {
    if (!menuActors) menuActors = ["scout", "dasher", "spider", "slime", "jelly", "beetle", "wraith", "eye", "golem", "heavy", "gunner", "splitter", "asteroid"].map(function (t, i) { var e = fakeEnemy(t); e.mi = i; return e; });
    var rx = Math.min(W * 0.44, 420), ry = Math.min(H * 0.1, 95);
    for (var i = 0; i < menuActors.length; i++) {
      var e = menuActors[i], a = tt * 0.22 * (i % 2 ? 1 : -1) + i * TAU / menuActors.length;
      e.x = cxm + Math.cos(a) * rx * (0.65 + 0.35 * ((i * 5) % 4) / 3);
      e.y = cym + Math.sin(a) * ry * (0.7 + 0.3 * ((i * 3) % 4) / 3) - 20; e.age = tt; e.rot = tt * 0.5 + i;
      e.ghost = e.type === "wraith" && Math.sin(tt * 1.6) > 0.2;
      drawEnemy(e, 0, 0);
    }
  }
  if (scene === "menu") drawShuttle(cxm, cym, -Math.PI / 2 + Math.sin(tt) * 0.08, 1, SHIPS[save.ship].col);
}

function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = "#05070f"; ctx.fillRect(0, 0, W, H);
  if (!G || scene === "menu" || scene === "hangar") { drawMenuScene(); return; }
  var p = G.p, shx = 0, shy = 0, i;
  if (G.shake > 0) { shx = rand(-1, 1) * G.shake; shy = rand(-1, 1) * G.shake; }
  var cx = W / 2 - p.x + shx, cy = H / 2 - p.y + shy;
  V = { px: p.x, py: p.y, t: G.t, freeze: G.freeze };
  drawSpace(p.x - shx, p.y - shy);
  for (i = 0; i < G.holes.length; i++) drawBlackHole(G.holes[i], cx, cy, G.t);

  for (i = 0; i < G.pools.length; i++) {
    var pl = G.pools[i];
    ctx.fillStyle = "rgba(111,211,111," + (0.18 + 0.1 * Math.sin(G.t * 5 + i)).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(pl.x + cx, pl.y + cy, pl.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = "rgba(140,255,140,0.6)"; ctx.lineWidth = 2; ctx.stroke();
  }
  var gemCol = function (v) { return v >= 100 ? "#ffd24d" : v >= 20 ? "#c58bff" : v >= 5 ? "#62d6ff" : "#7dffb0"; };
  for (i = 0; i < G.gems.length; i++) {
    var g = G.gems[i], gx = g.x + cx, gy = g.y + cy;
    if (gx < -20 || gy < -20 || gx > W + 20 || gy > H + 20) continue;
    var s = 3 + Math.min(5, g.v / 3);
    ctx.fillStyle = gemCol(g.v);
    ctx.beginPath(); ctx.moveTo(gx, gy - s); ctx.lineTo(gx + s, gy); ctx.lineTo(gx, gy + s); ctx.lineTo(gx - s, gy); ctx.closePath(); ctx.fill();
  }
  for (i = 0; i < G.pk.length; i++) drawPickup(G.pk[i], G.pk[i].x + cx, G.pk[i].y + cy);
  /* watcher beams under the bodies */
  for (i = 0; i < G.en.length; i++) {
    var be = G.en[i];
    if (be.type !== "eye" || (be.tel <= 0 && be.shot <= 0)) continue;
    ctx.lineCap = "round";
    if (be.shot > 0) { ctx.strokeStyle = "rgba(255,230,230," + clamp(be.shot / 0.2, 0, 1).toFixed(2) + ")"; ctx.lineWidth = 9; }
    else { ctx.strokeStyle = "rgba(255,60,60," + (0.2 + 0.5 * (1 - be.tel)).toFixed(2) + ")"; ctx.lineWidth = 1.5; }
    ctx.beginPath(); ctx.moveTo(be.x + cx, be.y + cy); ctx.lineTo(be.x + cx + Math.cos(be.aim) * 900, be.y + cy + Math.sin(be.aim) * 900); ctx.stroke();
  }
  for (i = 0; i < G.en.length; i++) drawEnemy(G.en[i], cx, cy);
  for (i = 0; i < G.eb.length; i++) { var eb = G.eb[i]; ctx.fillStyle = eb.col || "#ff5a4a"; ctx.beginPath(); ctx.arc(eb.x + cx, eb.y + cy, eb.r, 0, TAU); ctx.fill(); }
  for (i = 0; i < G.waves.length; i++) {
    var wf = G.waves[i]; ctx.strokeStyle = "rgba(255,90,90," + clamp(0.9 * (1 - wf.r / wf.max), 0, 1).toFixed(2) + ")"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(wf.x + cx, wf.y + cy, wf.r, 0, TAU); ctx.stroke();
  }

  /* missiles and cutters */
  for (i = 0; i < G.ms.length; i++) {
    var m = G.ms[i];
    ctx.save(); ctx.translate(m.x + cx, m.y + cy); ctx.rotate(m.ang);
    ctx.fillStyle = "#ff9a3c"; ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(-13 - Math.random() * 4, 0); ctx.lineTo(-6, 2); ctx.fill();
    ctx.fillStyle = "#eaf2fb"; ctx.fillRect(-6, -2.2, 11, 4.4);
    ctx.fillStyle = "#ff5a4a"; ctx.beginPath(); ctx.moveTo(5, -2.2); ctx.lineTo(9, 0); ctx.lineTo(5, 2.2); ctx.fill();
    ctx.restore();
  }
  for (i = 0; i < G.bl.length; i++) {
    var bl = G.bl[i];
    ctx.save(); ctx.translate(bl.x + cx, bl.y + cy); ctx.rotate(bl.spin);
    ctx.fillStyle = "rgba(98,214,255,.25)"; ctx.beginPath(); ctx.arc(0, 0, bl.size + 4, 0, TAU); ctx.fill();
    ctx.fillStyle = "#d9f6ff"; ctx.beginPath();
    for (var sp = 0; sp < 4; sp++) { var a1 = sp * Math.PI / 2; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a1 - 0.35) * bl.size, Math.sin(a1 - 0.35) * bl.size); ctx.lineTo(Math.cos(a1 + 0.25) * bl.size * 0.55, Math.sin(a1 + 0.25) * bl.size * 0.55); }
    ctx.fill(); ctx.restore();
  }

  ctx.globalCompositeOperation = "lighter";
  for (i = 0; i < G.arcs.length; i++) {
    var ar = G.arcs[i];
    ctx.strokeStyle = "rgba(160,230,255," + clamp(ar.life / 0.2, 0, 1).toFixed(2) + ")"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var pi = 0; pi < ar.pts.length; pi++) {
      var pt = ar.pts[pi], jx = pi ? rand(-4, 4) : 0, jy = pi ? rand(-4, 4) : 0;
      if (pi === 0) ctx.moveTo(pt.x + cx, pt.y + cy); else ctx.lineTo(pt.x + cx + jx, pt.y + cy + jy);
    }
    ctx.stroke();
  }
  for (i = 0; i < G.bu.length; i++) {
    var b = G.bu[i];
    ctx.strokeStyle = b.evo ? "#ffffff" : "#62d6ff"; ctx.lineCap = "round"; ctx.lineWidth = b.r * 1.2;
    ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.moveTo(b.x + cx, b.y + cy); ctx.lineTo(b.x + cx - b.vx * 0.025, b.y + cy - b.vy * 0.025); ctx.stroke();
    ctx.globalAlpha = 0.3; ctx.lineWidth = b.r * 2.6; ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (i = 0; i < G.dr.length; i++) {
    var dr = G.dr[i], dxs = dr.x + cx, dys = dr.y + cy;
    ctx.fillStyle = "rgba(98,214,255,.3)"; ctx.beginPath(); ctx.arc(dxs, dys, 15, 0, TAU); ctx.fill();
    ctx.fillStyle = "#d9f6ff"; ctx.beginPath(); ctx.arc(dxs, dys, 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = "#62d6ff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(dxs, dys, 9, 0, TAU); ctx.stroke();
  }
  for (i = 0; i < G.rings.length; i++) {
    var rg = G.rings[i]; ctx.strokeStyle = "rgba(" + rg.col + "," + clamp(rg.t / rg.life * 0.8, 0, 1).toFixed(2) + ")"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(rg.x + cx, rg.y + cy, rg.r, 0, TAU); ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  /* player */
  var px = W / 2 + shx, py = H / 2 + shy;
  var glow = ctx.createRadialGradient(px, py, 4, px, py, 120);
  glow.addColorStop(0, "rgba(98,214,255,0.14)"); glow.addColorStop(1, "rgba(98,214,255,0)");
  ctx.fillStyle = glow; ctx.fillRect(px - 120, py - 120, 240, 240);
  var blink = p.iv > 0 && p.shield <= 0 && Math.floor(p.iv * 20) % 2 === 0;
  if (!blink) drawShuttle(px, py, p.face, p.thrust ? 1 : 0.35, SHIPS[save.ship].col);
  if (p.shield > 0) {
    ctx.fillStyle = "rgba(98,214,255,0.12)"; ctx.strokeStyle = "rgba(98,214,255," + (p.shield < 1.5 && Math.floor(p.shield * 8) % 2 ? 0.2 : 0.7) + ")"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px, py, 27, 0, TAU); ctx.fill(); ctx.stroke();
  }

  for (i = 0; i < G.pt.length; i++) {
    var q = G.pt[i]; ctx.globalAlpha = clamp(q.life / q.max, 0, 1); ctx.fillStyle = q.col;
    ctx.fillRect(q.x + cx - q.s / 2, q.y + cy - q.s / 2, q.s, q.s);
  }
  ctx.globalAlpha = 1;
  ctx.font = '500 12px "DM Mono", monospace'; ctx.textAlign = "center";
  for (i = 0; i < G.tx.length; i++) { var t = G.tx[i]; ctx.globalAlpha = clamp(t.life / 0.4, 0, 1); ctx.fillStyle = t.col; ctx.fillText(t.txt, t.x + cx, t.y + cy); }
  ctx.globalAlpha = 1;

  var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, "rgba(2,3,8,0)"); vg.addColorStop(1, "rgba(2,3,8,0.55)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (G.freeze > 0) { ctx.fillStyle = "rgba(120,220,255,0.08)"; ctx.fillRect(0, 0, W, H); }
  if (G.flash > 0) { ctx.fillStyle = "rgba(255,255,255," + (G.flash * 0.6).toFixed(2) + ")"; ctx.fillRect(0, 0, W, H); }

  if (scene === "play" || scene === "paused" || scene === "levelup" || scene === "chest") drawHud();
  if (stick.active) {
    ctx.strokeStyle = "rgba(234,242,251,.35)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(stick.ox, stick.oy, 56, 0, TAU); ctx.stroke();
    ctx.fillStyle = "rgba(234,242,251,.4)";
    ctx.beginPath(); ctx.arc(stick.ox + stick.x * 56, stick.oy + stick.y * 56, 22, 0, TAU); ctx.fill();
  }
}

function drawHud() {
  var p = G.p, i;
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.fillRect(0, 0, W, 6);
  ctx.fillStyle = "#7dffb0"; ctx.fillRect(0, 0, W * clamp(p.xp / p.need, 0, 1), 6);

  var hw = Math.min(190, W * 0.42), top = 18;
  ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.fillRect(14, top, hw, 12);
  ctx.fillStyle = p.hp / p.maxHp < 0.3 ? "#ff5a5f" : "#e8645f"; ctx.fillRect(14, top, hw * clamp(p.hp / p.maxHp, 0, 1), 12);
  ctx.fillStyle = "#eaf2fb"; ctx.font = '500 12px "DM Mono", monospace';
  ctx.fillText("HP " + Math.ceil(p.hp) + "/" + p.maxHp, 14, top + 28);
  ctx.fillText("LV " + p.lvl, 14, top + 44);

  ctx.textAlign = "center";
  ctx.font = '500 22px "DM Mono", monospace'; ctx.fillStyle = "#eaf2fb";
  ctx.fillText(fmt(G.t), W / 2, 36);
  ctx.font = '400 11px "DM Mono", monospace'; ctx.fillStyle = "#93a3bb";
  ctx.fillText("wave " + (Math.floor(G.t / 30) + 1) + "  |  warp in " + fmt(WARP - G.t), W / 2, 52);

  ctx.textAlign = "right"; ctx.font = '500 12px "DM Mono", monospace'; ctx.fillStyle = "#eaf2fb";
  var rx = W - 62;
  ctx.fillText(G.kills + " robots", rx, top + 10);
  ctx.fillStyle = "#ffd24d"; ctx.fillText(num(G.gold) + " gold", rx, top + 26);
  ctx.fillStyle = "#93a3bb"; ctx.fillText(p.dashCd > 0 ? "dash " + p.dashCd.toFixed(1) + "s" : "dash ready", rx, top + 42);
  ctx.fillStyle = "#ff8a8d"; ctx.fillText("enemy damage x" + G.ds.toFixed(1), rx, top + 58);

  if (G.boss) {
    var bw = Math.min(520, W - 32), bx = (W - bw) / 2;
    ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.fillRect(bx, 60, bw, 8);
    ctx.fillStyle = "#b45bd6"; ctx.fillRect(bx, 60, bw * clamp(G.boss.hp / G.boss.max, 0, 1), 8);
    ctx.textAlign = "center"; ctx.font = '500 11px "DM Mono", monospace'; ctx.fillStyle = "#d9b8ee";
    ctx.fillText(BOSSES[G.boss.bk].name.toUpperCase() + "  " + Math.ceil(G.boss.hp), W / 2, 82);
  }
  if (G.banner) {
    ctx.textAlign = "center"; ctx.font = '800 34px "Bricolage Grotesque", sans-serif';
    ctx.globalAlpha = clamp(G.banner.t, 0, 1); ctx.fillStyle = "#62d6ff";
    ctx.fillText(G.banner.text, W / 2, H * 0.26); ctx.globalAlpha = 1;
  }
  /* arrows toward supply crates that are off screen */
  for (i = 0; i < G.pk.length; i++) {
    var k = G.pk[i];
    if (k.type !== "chest") continue;
    var sx = k.x - p.x, sy = k.y - p.y;
    if (Math.abs(sx) < W / 2 - 30 && Math.abs(sy) < H / 2 - 30) continue;
    var a = Math.atan2(sy, sx), tx = Math.abs(Math.cos(a)) < 1e-4 ? 1e9 : (W / 2 - 34) / Math.abs(Math.cos(a)), ty = Math.abs(Math.sin(a)) < 1e-4 ? 1e9 : (H / 2 - 70) / Math.abs(Math.sin(a));
    var tt = Math.min(tx, ty), ax = W / 2 + Math.cos(a) * tt, ay = H / 2 + Math.sin(a) * tt;
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(a);
    ctx.fillStyle = "#ffd24d"; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -9); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
