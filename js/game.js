// ============================================================
// GAME - Engine utama & Loop
// ============================================================
'use strict';

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');

let selectedChar = null;
let lastT = 0;

// ---------- INIT ----------
function resize() {
  G.W = cv.width  = window.innerWidth;
  G.H = cv.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ---------- MENU HANDLERS ----------
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('sel'));
    card.classList.add('sel');
    selectedChar = card.dataset.c;
    const btn = document.getElementById('startBtn');
    btn.disabled = false;
    btn.textContent = 'MULAI PETUALANGAN';
  });
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resumeBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', () => {
  document.getElementById('pause').classList.add('hidden');
  startGame();
});
document.getElementById('retryBtn').addEventListener('click', () => {
  document.getElementById('over').classList.add('hidden');
  startGame();
});

// ---------- FLOW ----------
function startGame() {
  if (!selectedChar) return;
  document.getElementById('start').classList.add('hidden');
  document.getElementById('over').classList.add('hidden');
  document.getElementById('pause').classList.add('hidden');

  G.monsters = [];
  G.projs = [];
  G.effects = [];
  G.particles = [];
  G.loot = [];
  G.kills = 0;
  G.gems = 0;
  G.coins = 0;
  G.wave = 0;
  G.time = 0;
  G.player = new Player(selectedChar);
  G.cam.x = 0;
  G.cam.y = 0;
  G.running = true;
  G.paused = false;

  document.getElementById('port').style.background =
    `linear-gradient(135deg, ${CHARS[selectedChar].color}, #000)`;

  startWave(1);
  updateHUD();
  updateSkillUI();
  lastT = performance.now();
}

function endGame() {
  G.running = false;
  document.getElementById('fWave').textContent  = G.wave;
  document.getElementById('fKills').textContent = G.kills;
  document.getElementById('over').classList.remove('hidden');
}

function togglePause() {
  if (!G.running) return;
  G.paused = !G.paused;
  document.getElementById('pause').classList.toggle('hidden', !G.paused);
  if (!G.paused) lastT = performance.now();
}

// ---------- LOOP ----------
function loop(t) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;
  if (!G.running || G.paused) return;
  G.time += dt;
  update(dt);
  render();
}

function update(dt) {
  const p = G.player;

  G.cam.x = lerp(G.cam.x, p.x, 0.12);
  G.cam.y = lerp(G.cam.y, p.y, 0.12);

  mouse.wx = mouse.x - G.W/2 + G.cam.x;
  mouse.wy = mouse.y - G.H/2 + G.cam.y;

  p.update(dt);

  for (let i = G.monsters.length - 1; i >= 0; i--) G.monsters[i].update(dt);

  for (let i = G.projs.length - 1; i >= 0; i--) {
    const pr = G.projs[i];
    pr.update(dt);
    if (pr.life <= 0) G.projs.splice(i, 1);
  }

  // Effects update
  for (let i = G.effects.length - 1; i >= 0; i--) {
    const e = G.effects[i];
    e.life -= dt;

    if (e.t === 'meteor' && !e.hit && e.life < 0.4) {
      e.hit = true;
      G.particles.push(...burst(e.x, e.y, e.c, 40));
      for (const m of G.monsters) {
        if (dist(e, m) < e.r + m.r) m.dmg(e.dmg, true);
      }
    }
    if (e.t === 'zone') {
      e.tick -= dt;
      if (e.tick <= 0) {
        e.tick = 0.35;
        for (const m of G.monsters) {
          if (dist(e, m) < e.r + m.r) {
            m.dmg(e.dmg * 0.15, false);
            m.slow = 0.8;
          }
        }
      }
    }
    if (e.life <= 0) G.effects.splice(i, 1);
  }

  // Particles
  for (let i = G.particles.length - 1; i >= 0; i--) {
    const pt = G.particles[i];
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vx *= 0.95;
    pt.vy *= 0.95;
    pt.life -= dt;
    if (pt.life <= 0) G.particles.splice(i, 1);
  }

  updateLoot(dt);
  updateSpawner(dt);
  updateSkillUI();
}

// ---------- RENDER ----------
function render() {
  ctx.clearRect(0, 0, G.W, G.H);
  ctx.save();
  ctx.translate(G.W/2 - G.cam.x, G.H/2 - G.cam.y);

  drawGrid();
  drawLoot(ctx);
  for (const e of G.effects) drawEffect(e);
  for (const m of G.monsters) m.draw(ctx);
  for (const p of G.projs)   p.draw(ctx);
  if (G.player) G.player.draw(ctx);

  for (const pt of G.particles) {
    ctx.globalAlpha = clamp(pt.life / pt.max, 0, 1);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI*2);
    ctx.fillStyle = pt.c;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.restore();
  drawMinimap();
}

function drawGrid() {
  const size = 100;
  const cx = G.cam.x, cy = G.cam.y;
  const sx = Math.floor((cx - G.W/2) / size) * size;
  const sy = Math.floor((cy - G.H/2) / size) * size;
  ctx.strokeStyle = 'rgba(100,120,180,0.08)';
  ctx.lineWidth = 1;
  for (let x = sx; x < cx + G.W/2 + size; x += size) {
    ctx.beginPath(); ctx.moveTo(x, cy - G.H); ctx.lineTo(x, cy + G.H); ctx.stroke();
  }
  for (let y = sy; y < cy + G.H/2 + size; y += size) {
    ctx.beginPath(); ctx.moveTo(cx - G.W, y); ctx.lineTo(cx + G.W, y); ctx.stroke();
  }
}

function drawEffect(e) {
  const a = clamp(e.life / e.max, 0, 1);
  ctx.save();
  if (e.t === 'slash') {
    ctx.translate(e.x, e.y);
    ctx.rotate(e.a);
    ctx.beginPath();
    ctx.arc(0, 0, e.r, -0.6, 0.6);
    ctx.strokeStyle = `rgba(255,255,255,${a})`;
    ctx.lineWidth = 8*a + 2;
    ctx.stroke();
  }
  else if (e.t === 'aoe') {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r * (1.2 - a*0.4), 0, Math.PI*2);
    ctx.strokeStyle = e.c;
    ctx.lineWidth = 6;
    ctx.globalAlpha = a;
    ctx.stroke();
    ctx.fillStyle = e.c;
    ctx.globalAlpha = a * 0.25;
    ctx.fill();
  }
  else if (e.t === 'meteor') {
    if (!e.hit) {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * a, 0, Math.PI*2);
      ctx.strokeStyle = e.c;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * a, 0, Math.PI*2);
      ctx.fillStyle = e.c;
      ctx.globalAlpha = a * 0.6;
      ctx.fill();
    }
  }
  else if (e.t === 'zone') {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI*2);
    ctx.fillStyle = e.c;
    ctx.globalAlpha = a * 0.2;
    ctx.fill();
    ctx.strokeStyle = e.c;
    ctx.globalAlpha = a * 0.6;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  else if (e.t === 'chain') {
    ctx.beginPath();
    ctx.moveTo(e.x1, e.y1);
    ctx.lineTo(e.x2, e.y2);
    ctx.strokeStyle = e.c;
    ctx.lineWidth = 4;
    ctx.globalAlpha = a;
    ctx.shadowColor = e.c;
    ctx.shadowBlur = 15;
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- BOOT ----------
initInput(cv);
requestAnimationFrame(loop);
