// ============================================================
// SKILLS - Sistem cast skill
// ============================================================
'use strict';

function skillKey(k) {
  if (!G.running || G.paused) return;
  const map = { 'q':0, 'e':1, 'r':2, 'f':3 };
  if (k in map) G.player.useSkill(map[k]);
}

function castSkill(p, s) {
  const dx = Math.cos(p.face), dy = Math.sin(p.face);
  const ox = p.x + dx*20, oy = p.y + dy*20;
  const dmg = s.dmg + p.bonusAtk;

  if (s.t === 'aoe') {
    G.effects.push({ t:'aoe', x:p.x, y:p.y, r:s.r, life:.5, max:.5, c:s.c });
    for (const m of G.monsters) {
      if (dist(p, m) < s.r + m.r) {
        m.dmg(dmg, false);
        if (s.slow) m.slow = 2;
      }
    }
  }
  else if (s.t === 'proj') {
    G.projs.push(new Proj(ox, oy, dx*s.sp, dy*s.sp, dmg, s.c, 9, 1.6));
  }
  else if (s.t === 'meteor') {
    G.effects.push({
      t:'meteor', x:mouse.wx, y:mouse.wy,
      r:s.r, life:1.0, max:1.0, c:s.c, dmg, hit:false
    });
  }
  else if (s.t === 'zone') {
    G.effects.push({
      t:'zone', x:mouse.wx, y:mouse.wy,
      r:s.r, life:s.dur||2.5, max:s.dur||2.5,
      c:s.c, dmg, tick:0
    });
  }
  else if (s.t === 'chain') {
    let target = null, bestD = 9999;
    for (const m of G.monsters) {
      const d = dist(p, m);
      if (d < 400 && d < bestD) { bestD = d; target = m; }
    }
    if (target) {
      let curr = target;
      const hit = new Set();
      for (let i = 0; i < s.tgts; i++) {
        if (!curr) break;
        hit.add(curr);
        curr.dmg(dmg, false);
        G.effects.push({
          t:'chain', x1:p.x, y1:p.y,
          x2:curr.x, y2:curr.y,
          life:.25, max:.25, c:s.c
        });
        let next = null, bd = 260;
        for (const m of G.monsters) {
          if (hit.has(m)) continue;
          const d = dist(curr, m);
          if (d < bd) { bd = d; next = m; }
        }
        curr = next;
      }
    }
  }
  else if (s.t === 'dash') {
    p.dash = 0.22;
    p.inv = 0.35;
    for (const m of G.monsters) {
      if (dist(p, m) < 100 + m.r) {
        m.dmg(dmg, false);
        if (s.stun)   m.stun = 1.0;
        if (s.freeze) m.stun = 1.2;
      }
    }
    G.particles.push(...burst(p.x, p.y, s.c, 25));
  }
}
