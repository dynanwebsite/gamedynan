// ============================================================
// WAVES - Sistem gelombang & spawn monster
// ============================================================
'use strict';

function startWave(n) {
  G.wave = n;
  G.queue = 4 + Math.floor(n * 1.6);
  G.spawnInt = Math.max(700, 2400 - n * 80);
  G.lastSpawn = 0;
  float(G.player.x, G.player.y - 60, 'WAVE ' + n, '#ffd700', true);
  updateHUD();
}

function pickMonsterType(wave) {
  const pool = ['slime'];
  if (wave >= 2)  pool.push('goblin');
  if (wave >= 3)  pool.push('skeleton');
  if (wave >= 5)  pool.push('orc', 'wraith');
  if (wave >= 7)  pool.push('golem');
  if (wave >= 10) pool.push('demon', 'dragon');
  if (wave >= 14) pool.push('lich');
  if (wave >= 20) pool.push('titan');
  return pool[Math.floor(Math.random() * pool.length)];
}

function spawnMonster() {
  const p = G.player;
  const ang = Math.random() * Math.PI * 2;
  const r = 700 + Math.random() * 200;
  const x = p.x + Math.cos(ang) * r;
  const y = p.y + Math.sin(ang) * r;
  const type = pickMonsterType(G.wave);
  const hpM  = 1 + (G.wave - 1) * 0.18;
  const dmgM = 1 + (G.wave - 1) * 0.12;
  G.monsters.push(new Monster(type, x, y, hpM, dmgM));
}

function updateSpawner(dt) {
  if (G.queue > 0) {
    G.lastSpawn -= dt * 1000;
    if (G.lastSpawn <= 0) {
      spawnMonster();
      G.queue--;
      G.lastSpawn = G.spawnInt;
    }
  } else if (G.monsters.length === 0) {
    startWave(G.wave + 1);
  }
}

function updateLoot(dt) {
  const p = G.player;
  for (let i = G.loot.length - 1; i >= 0; i--) {
    const l = G.loot[i];
    l.life -= dt;
    const d = dist(p, l);
    if (d < 200) {
      l.x = lerp(l.x, p.x, 0.08);
      l.y = lerp(l.y, p.y, 0.08);
    }
    if (d < p.r + 10) {
      if (l.t === 'hp') {
        p.hp = Math.min(p.maxHp, p.hp + 25);
        float(p.x, p.y-30, '+25 HP', '#4caf50');
      } else {
        p.en = Math.min(p.maxEn, p.en + 30);
        float(p.x, p.y-30, '+30 EN', '#4fc3f7');
      }
      G.loot.splice(i, 1);
      continue;
    }
    if (l.life <= 0) G.loot.splice(i, 1);
  }
}

function drawLoot(ctx) {
  for (const l of G.loot) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(l.x, l.y, 10, 0, Math.PI*2);
    ctx.fillStyle = l.t === 'hp' ? '#4caf50' : '#4fc3f7';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(l.t === 'hp' ? '❤' : '⚡', l.x, l.y + 1);
    ctx.restore();
  }
}
