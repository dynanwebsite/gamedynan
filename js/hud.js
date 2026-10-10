// ============================================================
// HUD - Update UI & Minimap
// ============================================================
'use strict';

// ---------- UPDATE HUD UTAMA ----------
function updateHUD() {
  const p = G.player;
  if (!p) return;

  // HP bar
  const hpf = document.getElementById('hpf');
  const hpt = document.getElementById('hpt');
  if (hpf) hpf.style.width = (p.hp / p.maxHp * 100) + '%';
  if (hpt) hpt.textContent = Math.ceil(p.hp) + '/' + p.maxHp;

  // Energy bar
  const enf = document.getElementById('enf');
  if (enf) enf.style.width = (p.en / p.maxEn * 100) + '%';

  // XP bar
  const xpf = document.getElementById('xpf');
  if (xpf) xpf.style.width = (p.xp / p.xpNext * 100) + '%';

  // Level
  const lv = document.getElementById('lv');
  if (lv) lv.textContent = p.lv;

  // Currency & Wave
  const gems  = document.getElementById('gems');
  const coins = document.getElementById('coins');
  const wave  = document.getElementById('wave');
  if (gems)  gems.textContent  = G.gems;
  if (coins) coins.textContent = G.coins;
  if (wave)  wave.textContent  = G.wave;
}

// ---------- UPDATE SKILL UI ----------
function updateSkillUI() {
  const p = G.player;
  if (!p) return;

  // --- Skill desktop (Q/E/R/F) ---
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('sk' + i);
    if (!el) continue;

    const s = p.skills[i];
    if (!s) continue;

    const cdEl = el.querySelector('.cd');
    const icEl = el.querySelector('.icon');

    if (s.cdL > 0) {
      el.classList.add('cooling');
      if (cdEl) cdEl.textContent = Math.ceil(s.cdL / 1000);
    } else {
      el.classList.remove('cooling');
    }
    if (icEl) icEl.textContent = s.i;
  }

  // --- Skill mobile (tombol kanan bawah) ---
  for (let i = 0; i < 4; i++) {
    const mb = document.querySelector('.mob-btn[data-skill="' + i + '"]');
    if (!mb) continue;

    const s = p.skills[i];
    if (!s) continue;

    const cdEl = mb.querySelector('.mcd');

    if (s.cdL > 0) {
      mb.classList.add('cooling');
      if (cdEl) cdEl.textContent = Math.ceil(s.cdL / 1000);
    } else {
      mb.classList.remove('cooling');
      if (cdEl) cdEl.textContent = '';
    }
  }
}

// ---------- MINIMAP ----------
function drawMinimap() {
  const mm = document.getElementById('mm');
  if (!mm) return;

  const p = G.player;
  if (!p) return;

  const size = mm.clientWidth || 140;
  mm.innerHTML = '';

  const scale = 0.08;
  const cx = size / 2;
  const cy = size / 2;

  // Titik monster
  for (const m of G.monsters) {
    const mx = cx + (m.x - p.x) * scale;
    const my = cy + (m.y - p.y) * scale;
    if (mx < -6 || mx > size + 6 || my < -6 || my > size + 6) continue;

    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.cssText =
      'left:' + (mx - 3) + 'px;' +
      'top:'  + (my - 3) + 'px;' +
      'background:' + m.c + ';';
    mm.appendChild(dot);
  }

  // Titik player (di tengah)
  const pd = document.createElement('div');
  pd.className = 'dot';
  pd.style.cssText =
    'left:' + (cx - 4) + 'px;' +
    'top:'  + (cy - 4) + 'px;' +
    'width:8px;height:8px;' +
    'background:#ffd700;' +
    'box-shadow:0 0 8px #ffd700;';
  mm.appendChild(pd);
}
