/* Last Orbit - Main update loop: spawning, movement, collisions */
"use strict";
/* ---------- update ---------- */
function bomberBlast(e) {
  var p = G.p;
  e.dead = true; dropGem(e.x, e.y, e.xp);
  G.rings.push({ x: e.x, y: e.y, r: 0, max: 85, life: 0.3, t: 0.3, col: "255,120,60" });
  particles(e.x, e.y, "#ff8a3c", 14, 220); snd("boom", 90);
  if (Math.hypot(p.x - e.x, p.y - e.y) < 85 + p.r) damagePlayer(20 * G.ds);
}
function swarm() {
  var p = G.p, alien = G.swarmN % 2 === 1, n = alien ? 32 : 26, r = Math.max(W, H) * 0.55 + 30;
  G.swarmN++;
  G.banner = { text: alien ? "ALIEN SWARM" : "ROBOT SWARM", t: 2 };
  for (var i = 0; i < n; i++) { var a = i * TAU / n; spawnEnemy(alien ? "spider" : "dasher", p.x + Math.cos(a) * r, p.y + Math.sin(a) * r); }
}
function addWave(x, y, max, dmg, sp) { G.waves.push({ x: x, y: y, r: 0, max: max, dmg: dmg, sp: sp, hit: false }); G.shake = Math.max(G.shake, 5); snd("boom", 120); }
function fireBeam(e) {
  var p = G.p, ca = Math.cos(e.aim), sa = Math.sin(e.aim), len = 900;
  var t = clamp((p.x - e.x) * ca + (p.y - e.y) * sa, 0, len);
  if (Math.hypot(p.x - (e.x + ca * t), p.y - (e.y + sa * t)) < p.r + 7) damagePlayer(24 * G.ds);
  e.shot = 0.2; snd("zap", 60);
}
function holeEffect(e, dt) {
  if (e.type === "boss") return;
  for (var h = 0; h < G.holes.length; h++) {
    var hole = G.holes[h], ex = hole.x - e.x, ey = hole.y - e.y, ed = Math.hypot(ex, ey) || 1;
    if (ed < BH_PULL) {
      var pe = 210 * Math.pow(1 - ed / BH_PULL, 1.4);
      e.x += ex / ed * pe * dt; e.y += ey / ed * pe * dt;
    }
    if (ed < BH_CORE) {
      if (e.elite) { e.hp -= e.max * 0.3 * dt; if (e.hp <= 0) kill(e); }
      else { e.dead = true; particles(e.x, e.y, "#b07cff", 6, 120); }
    }
  }
}
function isHeavy(e) { return e.type === "boss" || e.type === "asteroid"; }
function separate() {
  var cs = 40, grid = {}, list = G.en, n = list.length, i, k, e, o;
  for (i = 0; i < n; i++) {
    e = list[i]; if (e.dead) continue;
    e.gi = i;
    var key = (Math.floor(e.x / cs) & 0xffff) * 65536 + (Math.floor(e.y / cs) & 0xffff);
    (grid[key] || (grid[key] = [])).push(e);
  }
  for (i = 0; i < n; i++) {
    e = list[i]; if (e.dead) continue;
    var cx = Math.floor(e.x / cs), cy = Math.floor(e.y / cs), eh = isHeavy(e);
    for (var ax = -1; ax <= 1; ax++) for (var ay = -1; ay <= 1; ay++) {
      var arr = grid[((cx + ax) & 0xffff) * 65536 + ((cy + ay) & 0xffff)];
      if (!arr) continue;
      for (k = 0; k < arr.length; k++) {
        o = arr[k]; if (o.gi <= e.gi) continue;
        var oh = isHeavy(o);
        if (eh && oh) continue;
        var dx = o.x - e.x, dy = o.y - e.y, dd = dx * dx + dy * dy, mn = (e.r + o.r) * 0.9;
        if (dd < mn * mn && dd > 0.0001) {
          var dist = Math.sqrt(dd), push = (mn - dist) * 0.5, nx = dx / dist, ny = dy / dist;
          if (eh) { o.x += nx * push * 2; o.y += ny * push * 2; }
          else if (oh) { e.x -= nx * push * 2; e.y -= ny * push * 2; }
          else { e.x -= nx * push; e.y -= ny * push; o.x += nx * push; o.y += ny * push; }
        }
      }
    }
  }
}

function update(dt) {
  var p = G.p, i, j, e, b;
  G.t += dt;
  if (G.t >= WARP) { endGame(true); return; }
  G.ds = 1 + 0.2 * (G.t / 60);
  G.shake = Math.max(0, G.shake - 30 * dt);
  G.flash = Math.max(0, G.flash - dt * 1.5);
  G.freeze = Math.max(0, G.freeze - dt);
  p.shield = Math.max(0, p.shield - dt);
  p.poolT = Math.max(0, p.poolT - dt);
  if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }

  /* movement */
  var mx = 0, my = 0;
  if (keys.KeyA || keys.ArrowLeft) mx -= 1;
  if (keys.KeyD || keys.ArrowRight) mx += 1;
  if (keys.KeyW || keys.ArrowUp) my -= 1;
  if (keys.KeyS || keys.ArrowDown) my += 1;
  if (stick.active) { mx = stick.x; my = stick.y; }
  var ml = Math.hypot(mx, my);
  if (ml > 1) { mx /= ml; my /= ml; ml = 1; }
  if (ml > 0.1) { var nn = Math.hypot(mx, my); p.dir.x = mx / nn; p.dir.y = my / nn; }
  p.dashCd = Math.max(0, p.dashCd - dt);
  if (p.dashT > 0) {
    p.x += p.dir.x * 720 * dt; p.y += p.dir.y * 720 * dt; p.dashT -= dt;
    if (Math.random() < 0.8) G.pt.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.25, max: 0.25, col: "#62d6ff", s: 5 });
  } else { p.x += mx * p.speed * dt; p.y += my * p.speed * dt; }
  p.iv = Math.max(0, p.iv - dt);
  p.thrust = ml > 0.1 || p.dashT > 0;
  if (p.regen > 0) p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);

  /* black holes */
  G.holes = holesNear(p.x, p.y);
  for (j = 0; j < G.holes.length; j++) {
    var h = G.holes[j], hx = h.x - p.x, hy = h.y - p.y, hd = Math.hypot(hx, hy) || 1;
    if (hd < BH_PULL && p.dashT <= 0) { var pl = 170 * Math.pow(1 - hd / BH_PULL, 1.4); p.x += hx / hd * pl * dt; p.y += hy / hd * pl * dt; }
    if (hd < BH_CORE + p.r) { damagePlayer(30 * G.ds); p.x -= hx / hd * 90; p.y -= hy / hd * 90; G.shake = Math.max(G.shake, 10); }
  }

  var tgt0 = nearest(560);
  var want = tgt0 ? Math.atan2(tgt0.y - p.y, tgt0.x - p.x) : (ml > 0.1 ? Math.atan2(my, mx) : p.face);
  var da = Math.atan2(Math.sin(want - p.face), Math.cos(want - p.face));
  p.face += da * Math.min(1, 14 * dt);

  /* weapons */
  for (var wid in G.weapons) WSTEP[wid](G.weapons[wid], dt);
  var dw = G.weapons.drone;
  p.orbAng += (2.6 + 0.15 * (dw ? dw.lv : 0)) * dt;
  G.dr = dronePositions();
  if (dw) {
    var dbase = 11 * (1 + 0.2 * (dw.lv - 1)) * (dw.evo ? 1.5 : 1);
    for (j = 0; j < G.dr.length; j++) {
      for (i = 0; i < G.en.length; i++) {
        e = G.en[i];
        if (!e.dead && e.orbT <= 0 && Math.hypot(e.x - G.dr[j].x, e.y - G.dr[j].y) < e.r + 10) {
          e.orbT = 0.35; strike(e, dbase, e.x - G.dr[j].x, e.y - G.dr[j].y, 140);
        }
      }
    }
  }

  /* spawning */
  G.spawnT -= dt;
  if (G.spawnT <= 0) {
    G.spawnT = Math.max(0.09, 1.1 - G.t / 700);
    var count = 1 + Math.floor(G.t / 80);
    for (i = 0; i < count && G.en.length < 280; i++) {
      var type = pickType();
      if (type === "spider") spawnPack("spider", 5);
      else { var pos = ringPos(); spawnEnemy(type, pos.x, pos.y); }
    }
  }
  if (G.t >= G.nextBoss && !G.boss) { spawnBoss(); G.nextBoss += 120; }
  if (G.t >= G.nextElite) { spawnElite(); G.nextElite += 45; }
  if (G.t >= G.nextSwarm) { swarm(); G.nextSwarm += 80; }
  G.astT -= dt;
  if (G.astT <= 0) { spawnAsteroid(); G.astT = rand(4, 7) * (1 - Math.min(0.5, G.t / 1200)); }
  if (G.t >= G.nextShower) { G.nextShower += 100; G.shower = { left: 16, t: 0, ang: rand(0, TAU) }; G.banner = { text: "METEOR SHOWER", t: 2 }; }
  if (G.shower) {
    G.shower.t -= dt;
    if (G.shower.t <= 0) { spawnShowerAsteroid(); G.shower.left--; G.shower.t = 0.4; if (G.shower.left <= 0) G.shower = null; }
  }

  /* enemies */
  for (i = 0; i < G.en.length; i++) {
    e = G.en[i]; if (e.dead) continue;
    var dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    e.flash = Math.max(0, e.flash - dt); e.orbT = Math.max(0, e.orbT - dt); e.age += dt;
    var frozen = G.freeze > 0 || e.stun > 0;
    if (e.stun > 0) e.stun -= dt;
    var cd = e.dmg * G.ds;
    if (e.type === "asteroid") {
      if (!frozen) { e.x += e.vx * dt; e.y += e.vy * dt; e.rot += e.rs * dt; }
      e.x += e.kx * dt; e.y += e.ky * dt; e.kx *= Math.max(0, 1 - 8 * dt); e.ky *= Math.max(0, 1 - 8 * dt);
      holeEffect(e, dt);
      if (d > 1800) e.dead = true;
      else if (!frozen && d < e.r + p.r) damagePlayer(cd);
      continue;
    }
    if (!frozen) {
      var sp = e.spd, mvx = ux, mvy = uy, ln, a, a2;
      if (e.type === "gunner") {
        if (d < 170) sp = -e.spd * 0.7; else if (d < 240) sp = 0;
        e.sT -= dt;
        if (e.sT <= 0 && d < 480) { e.sT = e.elite ? 1.2 : 2.2; G.eb.push({ x: e.x, y: e.y, vx: ux * 170, vy: uy * 170, r: 5, dmg: cd, life: 4 }); }
      } else if (e.type === "bomber") {
        if (e.fuse > 0) { sp = 0; e.fuse -= dt; if (e.fuse <= 0) { bomberBlast(e); continue; } }
        else if (d < 95) e.fuse = 0.6;
      } else if (e.type === "jelly") {
        var sw = Math.sin(e.age * 2 + e.ph);
        mvx = ux - uy * sw * 0.9; mvy = uy + ux * sw * 0.9; ln = Math.hypot(mvx, mvy) || 1; mvx /= ln; mvy /= ln;
        e.sT -= dt;
        if (e.sT <= 0 && d < 460) {
          e.sT = 3.2; a = Math.atan2(uy, ux);
          for (j = -1; j <= 1; j++) G.eb.push({ x: e.x, y: e.y, vx: Math.cos(a + j * 0.3) * 130, vy: Math.sin(a + j * 0.3) * 130, r: 5, dmg: cd, life: 4, col: "#d9a0ff" });
        }
      } else if (e.type === "beetle") {
        if (e.chg > 0) { e.chg -= dt; sp = e.spd * 4.2; mvx = e.cx; mvy = e.cy; }
        else if (e.tel > 0) { e.tel -= dt; sp = 0; if (e.tel <= 0) { e.chg = 0.55; e.cx = ux; e.cy = uy; } }
        else { e.sT -= dt; if (e.sT <= 0 && d < 420) { e.tel = 0.55; e.sT = 4; } }
      } else if (e.type === "wraith") {
        e.ghost = Math.sin(e.age * 1.6 + e.ph) > 0.25;
        var wv = Math.sin(e.age * 1.5 + e.ph) * 0.6;
        mvx = ux - uy * wv; mvy = uy + ux * wv; ln = Math.hypot(mvx, mvy) || 1; mvx /= ln; mvy /= ln;
      } else if (e.type === "eye") {
        if (e.tel > 0) { e.tel -= dt; sp = 0; if (e.tel > 0.4) e.aim = Math.atan2(uy, ux); if (e.tel <= 0) fireBeam(e); }
        else {
          if (d < 230) sp = -e.spd * 0.8; else if (d < 330) sp = 0;
          e.sT -= dt;
          if (e.sT <= 0 && d < 700) { e.tel = 1.1; e.aim = Math.atan2(uy, ux); e.sT = 4.2; }
        }
      } else if (e.type === "golem") {
        e.sT -= dt;
        if (e.sT <= 0) { e.sT = 3.2; addWave(e.x, e.y, 170, e.dmg * 1.6 * G.ds, 280); }
      } else if (e.type === "boss") {
        e.bT -= dt; e.sumT -= dt;
        if (e.bk === 0) {
          if (e.bT <= 0) {
            e.bT = 2.4; var off = rand(0, TAU);
            for (j = 0; j < 14; j++) { a = off + j * TAU / 14; G.eb.push({ x: e.x, y: e.y, vx: Math.cos(a) * 135, vy: Math.sin(a) * 135, r: 6, dmg: 12 * e.bm * G.ds, life: 5 }); }
          }
          if (e.sumT <= 0) { e.sumT = 7; for (j = 0; j < 6; j++) { a2 = j * TAU / 6; spawnEnemy("scout", e.x + Math.cos(a2) * 60, e.y + Math.sin(a2) * 60); } }
        } else if (e.bk === 1) {
          if (e.bT <= 0) {
            e.bT = 1.8; a = Math.atan2(uy, ux);
            for (j = -2; j <= 2; j++) G.eb.push({ x: e.x, y: e.y, vx: Math.cos(a + j * 0.22) * 150, vy: Math.sin(a + j * 0.22) * 150, r: 6, dmg: 12 * e.bm * G.ds, life: 5, col: "#7dffb0" });
          }
          if (e.sumT <= 0) { e.sumT = 6; for (j = 0; j < 8; j++) { a2 = j * TAU / 8; spawnEnemy("spider", e.x + Math.cos(a2) * (e.r + 20), e.y + Math.sin(a2) * (e.r + 20)); } }
        } else {
          e.wv -= dt;
          if (e.bT <= 0) { e.bT = 0.16; e.spir += 0.5; G.eb.push({ x: e.x, y: e.y, vx: Math.cos(e.spir) * 150, vy: Math.sin(e.spir) * 150, r: 6, dmg: 10 * e.bm * G.ds, life: 5, col: "#d77bff" }); }
          if (e.wv <= 0) { e.wv = 4; addWave(e.x, e.y, 340, 22 * e.bm * G.ds, 260); }
          if (e.sumT <= 0) { e.sumT = 10; spawnEnemy("wraith", e.x + e.r, e.y); spawnEnemy("wraith", e.x - e.r, e.y); }
        }
      }
      e.x += mvx * sp * dt; e.y += mvy * sp * dt;
      if (d < e.r + p.r && e.type !== "bomber" && e.type !== "eye") damagePlayer(cd);
    }
    e.x += e.kx * dt; e.y += e.ky * dt;
    e.kx *= Math.max(0, 1 - 8 * dt); e.ky *= Math.max(0, 1 - 8 * dt);
    holeEffect(e, dt);
    if (d > 1400 && e.type !== "boss" && !e.elite) { var q = ringPos(); e.x = q.x; e.y = q.y; }
  }
  separate();

  /* shockwaves and acid */
  for (i = 0; i < G.waves.length; i++) {
    var wf = G.waves[i]; wf.r += wf.sp * dt;
    if (!wf.hit && Math.abs(Math.hypot(p.x - wf.x, p.y - wf.y) - wf.r) < 12 + p.r * 0.5) { wf.hit = true; damagePlayer(wf.dmg); }
  }
  for (i = 0; i < G.pools.length; i++) {
    var pool = G.pools[i]; pool.life -= dt;
    if (p.poolT <= 0 && Math.hypot(p.x - pool.x, p.y - pool.y) < pool.r + p.r * 0.5) { damagePlayer(5 * G.ds); p.poolT = 0.6; }
  }

  /* laser bolts */
  for (i = 0; i < G.bu.length; i++) {
    b = G.bu[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0) { b.dead = true; continue; }
    for (j = 0; j < G.en.length; j++) {
      e = G.en[j];
      if (e.dead || b.hit.indexOf(e) !== -1) continue;
      if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
        strike(e, b.base, b.vx, b.vy, 110); b.hit.push(e);
        if (b.pierce <= 0) { b.dead = true; break; } else b.pierce--;
      }
    }
  }
  /* missiles */
  for (i = 0; i < G.ms.length; i++) {
    var m = G.ms[i];
    m.life -= dt;
    if (!m.t || m.t.dead) m.t = nearestTo(m.x, m.y, 900);
    if (m.t) {
      var wa = Math.atan2(m.t.y - m.y, m.t.x - m.x), dang = Math.atan2(Math.sin(wa - m.ang), Math.cos(wa - m.ang));
      m.ang += clamp(dang, -5 * dt, 5 * dt);
    }
    m.sp = Math.min(380, m.sp + 260 * dt);
    m.x += Math.cos(m.ang) * m.sp * dt; m.y += Math.sin(m.ang) * m.sp * dt;
    var hit = false;
    for (j = 0; j < G.en.length; j++) { e = G.en[j]; if (!e.dead && Math.hypot(e.x - m.x, e.y - m.y) < e.r + 7) { hit = true; break; } }
    if (hit || m.life <= 0) { m.dead = true; explode(m.x, m.y, m.rad, m.base); }
  }
  /* plasma cutters */
  for (i = 0; i < G.bl.length; i++) {
    var bl = G.bl[i];
    bl.spin += dt * 14;
    if (bl.phase === 0) {
      bl.x += bl.dx * 440 * dt; bl.y += bl.dy * 440 * dt; bl.trav += 440 * dt;
      if (bl.trav >= bl.reach) { bl.phase = 1; bl.hit = []; }
    } else {
      var bx = p.x - bl.x, by = p.y - bl.y, bd = Math.hypot(bx, by) || 1;
      bl.x += bx / bd * 560 * dt; bl.y += by / bd * 560 * dt;
      if (bd < 20) { bl.dead = true; continue; }
    }
    for (j = 0; j < G.en.length; j++) {
      e = G.en[j];
      if (e.dead || bl.hit.indexOf(e) !== -1) continue;
      if (Math.hypot(e.x - bl.x, e.y - bl.y) < e.r + bl.size) { strike(e, bl.base, e.x - bl.x, e.y - bl.y, 140); bl.hit.push(e); }
    }
  }
  for (i = 0; i < G.arcs.length; i++) G.arcs[i].life -= dt;
  /* enemy bolts */
  if (G.freeze <= 0) {
    for (i = 0; i < G.eb.length; i++) {
      b = G.eb[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0) { b.dead = true; continue; }
      if (Math.hypot(p.x - b.x, p.y - b.y) < p.r + b.r) { damagePlayer(b.dmg); b.dead = true; }
    }
  }

  /* gems */
  if (G.gems.length > 400) { for (i = 0; i < 100; i++) p.xp += G.gems[i].v * p.xpMul; G.gems.splice(0, 100); }
  for (i = 0; i < G.gems.length; i++) {
    var g = G.gems[i], gd = Math.hypot(p.x - g.x, p.y - g.y);
    if (gd < p.magnet) g.pull = true;
    if (g.pull) { g.sp = Math.min(760, g.sp + 1500 * dt); g.x += (p.x - g.x) / (gd || 1) * g.sp * dt; g.y += (p.y - g.y) / (gd || 1) * g.sp * dt; }
    if (gd < p.r + 8) { g.dead = true; p.xp += g.v * p.xpMul; snd("gem", 50); }
  }
  while (p.xp >= p.need) { p.xp -= p.need; p.lvl++; p.need = need(p.lvl); pending++; }
  /* pickups */
  for (i = 0; i < G.pk.length; i++) {
    var k = G.pk[i]; if (k.dead) continue;
    var kd = Math.hypot(p.x - k.x, p.y - k.y);
    if (k.type === "coin" && kd < p.magnet) k.pull = true;
    if (k.pull) { k.sp = Math.min(760, (k.sp || 0) + 1500 * dt); k.x += (p.x - k.x) / (kd || 1) * k.sp * dt; k.y += (p.y - k.y) / (kd || 1) * k.sp * dt; }
    if (kd < p.r + (k.type === "chest" ? 22 : 14)) { k.dead = true; collectPickup(k); if (scene !== "play") break; }
  }

  /* fx */
  for (i = 0; i < G.pt.length; i++) { var q2 = G.pt[i]; q2.x += q2.vx * dt; q2.y += q2.vy * dt; q2.vx *= 0.94; q2.vy *= 0.94; q2.life -= dt; }
  for (i = 0; i < G.tx.length; i++) { G.tx[i].y -= 30 * dt; G.tx[i].life -= dt; }
  for (i = 0; i < G.rings.length; i++) { var rg = G.rings[i]; rg.t -= dt; rg.r = rg.max * (1 - rg.t / rg.life); }

  /* cleanup */
  G.en = G.en.filter(function (x) { return !x.dead; });
  G.bu = G.bu.filter(function (x) { return !x.dead; });
  G.ms = G.ms.filter(function (x) { return !x.dead; });
  G.bl = G.bl.filter(function (x) { return !x.dead; });
  G.eb = G.eb.filter(function (x) { return !x.dead; });
  G.gems = G.gems.filter(function (x) { return !x.dead; });
  G.pk = G.pk.filter(function (x) { return !x.dead; });
  G.arcs = G.arcs.filter(function (x) { return x.life > 0; });
  G.waves = G.waves.filter(function (x) { return x.r < x.max; });
  G.pools = G.pools.filter(function (x) { return x.life > 0; });
  G.pt = G.pt.filter(function (x) { return x.life > 0; });
  G.tx = G.tx.filter(function (x) { return x.life > 0; });
  G.rings = G.rings.filter(function (x) { return x.t > 0; });

  if (scene === "play" && pending > 0) openLevelUp();
}
