// ============================================================
// CONFIG - Data Karakter & Monster
// ============================================================
'use strict';

const CHARS = {
  pyro: {
    name:'Ignis', color:'#ff4d1f', hp:120, speed:3.2, atk:18, atkCd:380,
    skills:[
      {n:'Flame Burst', i:'🔥', cd:4000, cost:20, t:'aoe',   dmg:45, r:140, c:'#ff4d1f'},
      {n:'Fireball',    i:'❄️', cd:2500, cost:15, t:'proj',  dmg:32, sp:9,  c:'#ff8c42'},
      {n:'Meteor',      i:'⚡', cd:9000, cost:45, t:'meteor',dmg:90, r:180, c:'#ff2d00'},
      {n:'Inferno Dash',i:'🌀', cd:6000, cost:30, t:'dash',  dmg:40,       c:'#ff6b00'}
    ]
  },
  cryo: {
    name:'Glacies', color:'#4fc3f7', hp:100, speed:3.0, atk:22, atkCd:450,
    skills:[
      {n:'Frost Nova', i:'🔥', cd:5000, cost:22, t:'aoe',  dmg:40, r:160, c:'#4fc3f7', slow:true},
      {n:'Ice Shard',  i:'❄️', cd:2200, cost:12, t:'proj', dmg:36, sp:11, c:'#80deea'},
      {n:'Blizzard',   i:'⚡', cd:10000,cost:50, t:'zone', dmg:70, r:220, c:'#00bcd4', dur:2.5},
      {n:'Frost Step', i:'🌀', cd:5000, cost:25, t:'dash', dmg:25,       c:'#4fc3f7', freeze:true}
    ]
  },
  electro: {
    name:'Voltaris', color:'#c77dff', hp:110, speed:3.8, atk:16, atkCd:300,
    skills:[
      {n:'Chain Lightning', i:'🔥', cd:3500, cost:18, t:'chain',dmg:28, tgts:4, c:'#c77dff'},
      {n:'Spark',           i:'❄️', cd:1800, cost:10, t:'proj', dmg:24, sp:13,  c:'#e0aaff'},
      {n:'Thunderstorm',    i:'⚡', cd:8000, cost:42, t:'zone', dmg:60, r:200, c:'#9d4edd', dur:3},
      {n:'Volt Dash',       i:'🌀', cd:4000, cost:22, t:'dash', dmg:35,       c:'#c77dff', stun:true}
    ]
  }
};

const MTYPES = {
  slime:    {n:'Slime',    hp:40,  sp:1.1, dmg:6,  c:'#7ddb7d', sz:16, xp:8,  coin:2,  e:'🟢'},
  goblin:   {n:'Goblin',   hp:60,  sp:1.8, dmg:10, c:'#c47a3d', sz:18, xp:14, coin:4,  e:'👺'},
  skeleton: {n:'Skeleton', hp:80,  sp:1.4, dmg:14, c:'#e0e0e0', sz:20, xp:20, coin:6,  e:'💀'},
  orc:      {n:'Orc',      hp:150, sp:1.0, dmg:22, c:'#4a8f4a', sz:26, xp:35, coin:10, e:'👹'},
  wraith:   {n:'Wraith',   hp:110, sp:2.2, dmg:18, c:'#8a2be2', sz:22, xp:30, coin:9,  e:'👻'},
  golem:    {n:'Golem',    hp:300, sp:0.7, dmg:35, c:'#696969', sz:34, xp:70, coin:22, e:'🗿'},
  dragon:   {n:'Dragon',   hp:600, sp:1.3, dmg:50, c:'#ff2d00', sz:44, xp:150,coin:50, e:'🐉'},
  demon:    {n:'Demon',    hp:450, sp:1.6, dmg:42, c:'#ff0040', sz:38, xp:120,coin:40, e:'😈'},
  lich:     {n:'Lich',     hp:800, sp:1.2, dmg:60, c:'#5d00ff', sz:42, xp:200,coin:70, e:'🧙'},
  titan:    {n:'Titan',    hp:1500,sp:0.6, dmg:80, c:'#ffd700', sz:60, xp:400,coin:150,e:'👾'}
};

// State global game
const G = {
  running:false, paused:false, player:null,
  monsters:[], projs:[], effects:[], particles:[], loot:[],
  cam:{x:0,y:0}, wave:0, kills:0, gems:0, coins:0,
  lastSpawn:0, spawnInt:2500, queue:0, time:0,
  W:0, H:0
};
