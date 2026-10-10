// ============================================================
// UTILS - Fungsi bantu (helper functions)
// ============================================================
'use strict';

// ---------- MATH HELPERS ----------
const rand  = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist  = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp  = (a, b, t) => a + (b - a) * t;

// ---------- PARTICLE BURST ----------
// Menghasilkan array partikel ledakan di titik (x,y)
function burst(x, y, c, n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const s = rand(40, 200);
    arr.push({
      x: x,
      y: y,
      vx: Math.cos(ang) * s,
      vy: Math.sin(ang) * s,
      life: rand(0.3, 0.8),
      max: 0.8,
      c: c,
      r: rand(2, 5)
    });
  }
  return arr;
}

// ---------- FLOATING DAMAGE TEXT ----------
// Menampilkan angka damage melayang di atas musuh
// wx, wy = koordinat world (bukan screen)
function float(wx, wy, text, color, crit) {
  const el = document.createElement('div');
  el.className = 'dn' + (crit ? ' crit' : '');
  el.textContent = text;
  el.style.color = color;
  el.style.left = (wx - G.cam.x + G.W / 2) + 'px';
  el.style.top  = (wy - G.cam.y + G.H / 2) + 'px';

  const layer = document.getElementById('dmg');
  if (layer) layer.appendChild(el);

  setTimeout(() => el.remove(), 900);
}
