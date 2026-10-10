// ============================================================
// UTILS - Fungsi bantu
// ============================================================
'use strict';

const rand = (a,b) => a + Math.random()*(b-a);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const dist = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);
const lerp = (a,b,t) => a + (b-a)*t;

function burst(x,y,c,n) {
  const a = [];
  for (let i=0;i<n;i++) {
    const ang = Math.random()*Math.PI*2, s = rand(40,200);
    a.push({
      x, y,
      vx:Math.cos(ang)*s, vy:Math.sin(ang)*s,
      life:rand(.3,.8), max:.8,
      c, r:rand(2,5)
    });
  }
  return a;
}

function float(wx, wy, text, color, crit) {
  const el = document.createElement('div');
  el.className = 'dn' + (crit?' crit':'');
  el.textContent = text;
  el.style.color = color;
  el.style.left = (wx - G.cam.x + G.W/2)+'px';
  el.style.top  = (wy - G.cam.y + G.H/2)+'px';
  document.getElementById('dmg').appendChild(el);
  setTimeout(()=>el.remove(), 900);
}
