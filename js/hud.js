// ============================================================
// HUD - Update UI & Minimap
// ============================================================
'use strict';

function updateHUD() {
  const p = G.player;
  if (!p) return;
  const hpf = document.getElementById('hpf');
  const hpt = document.getElementById('hpt');
  const enf = document.getElementById('enf');
  const xpf = document.getElementById('xpf');
  const lv  = document.getElementById('lv');

  if (hpf) hpf.style.width = (p.hp / p.maxHp * 100) + '%';
  if (hpt) hpt.textContent = Math.ceil(p.hp) + '/' + p.maxHp;
  if (enf) enf.style.width = (p.en / p.maxEn * 100) + '%';
  if (xpf) xpf.style.width = (p.xp / p.xpNext * 100) + '%';
  if (lv)  lv.textContent  = p.lv;

  const gems  = document.getElementById('gems');
  const coins = document.getElementById('coins');
  const wave  = document.getElementById('wave');
  if (gems)  gems.textContent  = G.gems;
  if (coins) coins.textContent = G.coins;
  if (wave)  wave.textContent  = G.wave;
}

function updateSkillUI() {
  const p = G.player;
  if (!p) return;
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('sk' + i);
    if (!el) continue;
    const s = p.skills[i];
    const cd = el.querySelector('.cd');
    const ic = el.querySelector('.icon');
    if (s.cdL > 0) {
      el.classList.add('cooling');
      if (cd) cd.textContent = Math.ceil(s.cdL / 1000);
    } else {
      el.classList.remove('cooling');
    }
    if (ic) ic.textContent = s.i;
  }
}

function drawMinimap() {
  const mm = document.getElementById('mm');
  if (!mm) return;
  const size = mm.clientWidth;
  mm.innerHTML = '';
  const scale = 0.08;
  const p = G.player;
  if (!p) return;
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
