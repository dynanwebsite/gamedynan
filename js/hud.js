// ============================================================
// HUD - Update UI & Minimap
// ============================================================
'use strict';

function updateHUD() {
  const p = G.player;
  if (!p) return;
  document.getElementById('hpFill').style.width  = (p.hp / p.maxHp * 100) + '%';
  document.getElementById('hpText').textContent  = Math.ceil(p.hp) + '/' + p.maxHp;
  document.getElementById('enFill').style.width  = (p.en / p.maxEn * 100) + '%';
  document.getElementById('xpFill').style.width  = (p.xp / p.xpNext * 100) + '%';
  document.getElementById('levelText').textContent = p.lv;
  document.getElementById('gems').textContent    = G.gems;
  document.getElementById('coins').textContent   = G.coins;
  document.getElementById('waveText').textContent = G.wave;
}

function updateSkillUI() {
  const p = G.player;
  if (!p) return;
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('skill' + i);
    const s = p.skills[i];
    if (s.cdL > 0) {
      el.classList.add('cooling');
      el.querySelector('.cd').textContent = Math.ceil(s.cdL / 1000);
    } else {
      el.classList.remove('cooling');
    }
    el.querySelector('.icon').textContent = s.i;
  }
}

function drawMinimap() {
  const mm = document.getElementById('minimap');
  const size = mm.clientWidth;
  mm.innerHTML = '';
  const scale = 0.08;
  const p = G.player;
  const cx = size / 2, cy = size / 2;

  for (const m of G.monsters) {
    const mx = cx + (m.x - p.x) * scale;
    const my = cy + (m.y - p.y) * scale;
    if (mx < 0 || mx > size || my < 0 || my > size) continue;
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.cssText = `left:${mx-3}px;top:${my-3}px;background:${m.c};`;
    mm.appendChild(dot);
  }
  const pd = document.createElement('div');
  pd.className = 'dot';
  pd.style.cssText = `left:${cx-4}px;top:${cy-4}px;width:8px;height:8px;background:#ffd700;box-shadow:0 0 8px #ffd700;`;
  mm.appendChild(pd);
}
