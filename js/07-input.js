/* Last Orbit - Input handling, game loop, startup, test hook */
"use strict";
/* ---------- input ---------- */
function dash() {
  if (scene !== "play") return;
  var p = G.p;
  if (p.dashCd > 0) return;
  p.dashT = 0.15; p.dashCd = p.dashCdMax; p.iv = Math.max(p.iv, 0.28); snd("dash");
}
window.addEventListener("keydown", function (e) {
  if (e.code === "Space" || e.code.indexOf("Arrow") === 0) e.preventDefault();
  audio();
  if (e.code === "KeyM") { muted = !muted; return; }
  if (scene === "levelup") {
    if (e.code === "Digit1" || e.code === "Numpad1") choose(0);
    else if (e.code === "Digit2" || e.code === "Numpad2") choose(1);
    else if (e.code === "Digit3" || e.code === "Numpad3") choose(2);
    else if (e.code === "KeyR") reroll();
    return;
  }
  if (scene === "chest") { if (e.code === "Enter" || e.code === "Space") { e.preventDefault(); closeChest(); } return; }
  if (scene === "hangar") { if (e.code === "Escape") closeHangar(); return; }
  if (scene === "menu" || scene === "over") { if (e.code === "Enter") { e.preventDefault(); startGame(); } return; }
  if (e.code === "KeyP" || e.code === "Escape") {
    if (scene === "play") pauseGame(); else if (scene === "paused") resumeGame();
    return;
  }
  if (e.code === "Space" && scene === "play") { dash(); return; }
  keys[e.code] = true;
});
window.addEventListener("keyup", function (e) { keys[e.code] = false; });
window.addEventListener("blur", function () { keys = {}; pauseGame(); });
document.addEventListener("visibilitychange", function () { if (document.hidden) pauseGame(); });

cv.addEventListener("pointerdown", function (e) {
  audio();
  if (e.pointerType !== "touch" || scene !== "play" || stick.id !== null) return;
  if (e.clientX > W * 0.62) return;
  stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stick.x = 0; stick.y = 0; stick.active = true;
  try { cv.setPointerCapture(e.pointerId); } catch (err) {}
});
cv.addEventListener("pointermove", function (e) {
  if (e.pointerId !== stick.id) return;
  var dx = e.clientX - stick.ox, dy = e.clientY - stick.oy, l = Math.hypot(dx, dy), m = 56;
  var k = l > m ? m / l : 1;
  stick.x = dx * k / m; stick.y = dy * k / m;
});
function endStick(e) { if (e.pointerId === stick.id) { stick.id = null; stick.active = false; stick.x = 0; stick.y = 0; } }
cv.addEventListener("pointerup", endStick);
cv.addEventListener("pointercancel", endStick);

$("startBtn").addEventListener("click", startGame);
$("hangarBtn").addEventListener("click", function () { openHangar("menu"); });
$("howBtn").addEventListener("click", function () { $("how").hidden = !$("how").hidden; });
$("hangarBack").addEventListener("click", closeHangar);
document.querySelectorAll("#hTabs .tab").forEach(function (t) { t.addEventListener("click", function () { hTab = t.dataset.tab; renderHangar(); }); });
$("overHangar").addEventListener("click", function () { openHangar("over"); });
$("againBtn").addEventListener("click", startGame);
$("restartBtn").addEventListener("click", function () { bank(); startGame(); });
$("quitBtn").addEventListener("click", function () { bank(); G = null; showMenu(); });
$("resumeBtn").addEventListener("click", resumeGame);
$("pauseBtn").addEventListener("click", function () { if (scene === "play") pauseGame(); });
$("dashBtn").addEventListener("pointerdown", function (e) { e.preventDefault(); audio(); dash(); });
$("rerollBtn").addEventListener("click", reroll);
$("chestBtn").addEventListener("click", closeChest);

/* ---------- loop ---------- */
var last = performance.now();
function frame(now) {
  var dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (scene === "play" && G) update(dt);
  if (scene === "hangar") { var tm = now / 1000; for (var hi = 0; hi < hDraws.length; hi++) hDraws[hi](tm); }
  draw();
  window.requestAnimationFrame(frame);
}
showMenu();
window.requestAnimationFrame(frame);

window.__lo = {
  start: startGame, update: function (dt) { update(dt); }, draw: draw, state: function () { return G; },
  scene: function () { return scene; }, choices: function () { return choices; }, choose: choose, closeChest: closeChest, save: save,
  spawn: function (t, x, y) { return spawnEnemy(t, x, y); }, spawnBoss: spawnBoss, openHangar: openHangar, setTab: function (t) { hTab = t; renderHangar(); }, hDraws: function () { return hDraws; }, setT: function (t) { G.t = t; }
};
