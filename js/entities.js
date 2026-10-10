// ============================================================
// ENTITIES - Player, Monster, Projectile
// ============================================================
'use strict';

class Player {
  constructor(key) {
    const c = CHARS[key];
    this.key = key; this.def = c;
    this.x = 0; this.y = 0; this.r = 20;
    this.hp = c.hp; this.maxHp = c.hp;
    this.en = 0; this.maxEn = 100;
    this.lv = 1; this.xp = 0; this.xpNext = 50;
    this.face = 0; this.atkCd = 0; this.dash = 0; this.inv = 0;
    this.bonusAtk = 0;
    this.skills = c.skills.map(s => ({...s, cdL:0}));
  }

  gainXp(n) {
    this.xp += n;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.lv++;
      this.xpNext = Math.floor(this.xpNext * 1.45);
      this.maxHp += 15;
      this.hp = this.maxHp;
      this.def.atk += 3;
      float(this.x, this.y-40, 'LEVEL UP!', '#ffd700', true);
    }
    updateHUD();
  }

  attack() {
    if (this.atkCd > 0) return;
    this.atkCd = this.def.atkCd;
    const range = 65, arc = 0.9;
    for (const m of G.monsters) {
      const d = dist(this, m);
      if (d > range + m.r) continue;
      const ang = Math.atan2(m.y-this.y, m.x-this.x);
      let diff = Math.abs(ang - this.face);
      if (diff > Math.PI) diff = Math.PI*2 - diff;
      if (diff < arc) {
        const crit = Math.random() < 0.15;
        let dm = this.def.atk + this.bonusAtk;
        if (crit) dm *= 1.8;
        m.dmg(dm, crit);
      }
    }
    G.effects.push({
      t:'slash', x:this.x, y:this.y, a:this.face,
      life:.18, max:.18, r:range, c:this.def.color
    });
  }

  useSkill(i) {
    const s = this.skills[i];
    if (!s || s.cdL > 0 || this.en < s.cost) return;
    s.cdL = s.cd;
    this.en -= s.cost;
    castSkill(this, s);
    updateSkillUI();
  }

  update(dt) {
    let mx = 0, my = 0;
    if (keys['w']||keys['arrowup'])    my--;
    if (keys['s']||keys['arrowdown'])  my++;
    if (keys['a']||keys['arrowleft'])  mx--;
    if (keys['d']||keys['arrowright']) mx++;
    const l = Math.hypot(mx,my)||1; mx/=l; my/=l;

    let sp = this.def.speed;
    if (keys['shift']) sp *= 1.5;
    if (this.dash > 0) { sp = 14; this.dash -= dt; }

    this.x += mx*sp*60*dt;
    this.y += my*sp*60*dt;
    this.face = Math.atan2(mouse.wy - this.y, mouse.wx - this.x);

    if (mouse.down) this.attack();
    if (this.atkCd > 0) this.atkCd -= dt*1000;
    for (const s of this.skills) if (s.cdL > 0) s.cdL -= dt*1000;
    if (this.inv > 0) this.inv -= dt;
    this.en = Math.min(this.maxEn, this.en + dt*6);

    if (keys[' '] && this.dash <= 0 && this.inv <= 0) {
      this.dash = 0.18;
      this.inv = 0.3;
    }

    for (const m of G.monsters) {
      const d = dist(this, m), min = this.r + m.r;
      if (d < min && d > 0) {
        const nx = (this.x-m.x)/d, ny = (this.y-m.y)/d, ov = min-d;
        this.x += nx*ov*.5; this.y += ny*ov*.5;
        m.x  -= nx*ov*.5;   m.y  -= ny*ov*.5;
      }
    }
    updateHUD();
  }

  hurt(d) {
    if (this.inv > 0) return;
    this.hp -= d; this.inv = 0.5;
    float(this.x, this.y-30, '-'+Math.round(d), '#ff3b3b');
    G.particles.push(...burst(this.x, this.y, '#ff3b3b', 12));
    if (this.hp <= 0) { this.hp = 0; endGame(); }
    updateHUD();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.ellipse(0, this.r*.9, this.r*1.1, this.r*.4, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill();

    const g = ctx.createRadialGradient(-6,-6,4,0,0,this.r);
    g.addColorStop(0,'#fff');
    g.addColorStop(.4, this.def.color);
    g.addColorStop(1,'#111');
    ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.def.color; ctx.stroke();

    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(this.face)*(this.r+12), Math.sin(this.face)*(this.r+12));
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();

    if (this.inv > 0) {
      ctx.beginPath();
      ctx.arc(0,0,this.r+8,0,Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,.7)';
      ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
  }
}

class Monster {
  constructor(type, x, y, hpM=1, dmgM=1) {
    const t = MTYPES[type];
    this.type = type; this.def = t;
    this.x = x; this.y = y; this.r = t.sz;
    this.hp = t.hp * hpM; this.maxHp = this.hp;
    this.dmg = t.dmg * dmgM; this.sp = t.sp;
    this.c = t.c; this.atkCd = 0; this.hitF = 0;
    this.slow = 0; this.stun = 0;
  }

  dmg(d, crit) {
    this.hp -= d; this.hitF = 0.15;
    float(this.x, this.y-this.r,
      Math.round(d)+(crit?'!':''),
      crit?'#ffd700':'#fff', crit);
    G.particles.push(...burst(this.x, this.y, this.c, 6));
    if (this.hp <= 0) this.die();
  }

  die() {
    G.kills++;
    G.gems += this.def.xp;
    G.coins += this.def.coin;
    G.player.gainXp(this.def.xp);
    G.particles.push(...burst(this.x, this.y, this.c, 20));
    if (Math.random() < .15) {
      G.loot.push({ x:this.x, y:this.y, t:Math.random()<.5?'hp':'en', life:15 });
    }
    const i = G.monsters.indexOf(this);
    if (i >= 0) G.monsters.splice(i, 1);
    updateHUD();
  }

  update(dt) {
    if (this.stun > 0) { this.stun -= dt; return; }
    if (this.slow > 0) this.slow -= dt;
    const p = G.player;
    const dx = p.x-this.x, dy = p.y-this.y;
    const d = Math.hypot(dx,dy)||1;
    const sp = this.sp * (this.slow > 0 ? .45 : 1);
    if (d > this.r + p.r) {
      this.x += (dx/d)*sp*60*dt;
      this.y += (dy/d)*sp*60*dt;
    } else if (this.atkCd <= 0) {
      p.hurt(this.dmg);
      this.atkCd = 1.0;
    }
    if (this.atkCd > 0) this.atkCd -= dt;
    if (this.hitF > 0) this.hitF -= dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.ellipse(0, this.r*.85, this.r*1.1, this.r*.4, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill();

    const g = ctx.createRadialGradient(-5,-5,3,0,0,this.r);
    g.addColorStop(0,'#fff');
    g.addColorStop(.3,this.c);
    g.addColorStop(1,'#222');
    ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();

    if (this.hitF > 0) {
      ctx.beginPath(); ctx.arc(0,0,this.r,0,Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,'+(this.hitF*4)+')'; ctx.fill();
    }
    ctx.font = (this.r*1.1)+'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.def.e, 0, 2);

    const w = this.r*2, hpr = this.hp/this.maxHp;
    ctx.fillStyle = 'rgba(0,0,0,.7)';
    ctx.fillRect(-w/2, -this.r-12, w, 5);
    ctx.fillStyle = hpr>.5?'#4caf50':hpr>.25?'#ff9800':'#f44336';
    ctx.fillRect(-w/2, -this.r-12, w*hpr, 5);
    ctx.restore();
  }
}

class Proj {
  constructor(x,y,vx,vy,d,c,r,life) {
    this.x=x; this.y=y;
    this.vx=vx; this.vy=vy;
    this.d=d; this.c=c;
    this.r=r||9; this.life=life||1.6;
    this.hit = new Set();
  }
  update(dt) {
    this.x += this.vx*60*dt;
    this.y += this.vy*60*dt;
    this.life -= dt;
    for (const m of G.monsters) {
      if (this.hit.has(m)) continue;
      if (dist(this,m) < this.r + m.r) {
        m.dmg(this.d, false);
        this.hit.add(m);
        this.life = 0;
        return;
      }
    }
    G.particles.push({
      x:this.x, y:this.y,
      vx:rand(-15,15), vy:rand(-15,15),
      life:.3, max:.3, c:this.c, r:3
    });
  }
  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fillStyle = this.c;
    ctx.shadowColor = this.c;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();
  }
}
