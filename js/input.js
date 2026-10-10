// ============================================================
// INPUT - Keyboard, Mouse, Touch
// ============================================================
'use strict';

const keys = {};
const mouse = { x:0, y:0, down:false, wx:0, wy:0 };
let touchId = null;

function initInput(cv) {
  mouse.x = G.W / 2;
  mouse.y = G.H / 2;

  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (k === ' ') e.preventDefault();
    if (k === 'escape') togglePause();
    skillKey(k);
  });
  window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

  cv.addEventListener('mousemove', e => setMouse(e.clientX, e.clientY));
  cv.addEventListener('mousedown', e => { if (e.button === 0) mouse.down = true; });
  window.addEventListener('mouseup', () => mouse.down = false);
  cv.addEventListener('contextmenu', e => e.preventDefault());

  // Touch
  cv.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    if (touchId === null) { touchId = t.identifier; setMouse(t.clientX, t.clientY); mouse.down = true; }
  }, {passive:false});
  cv.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches)
      if (t.identifier === touchId) setMouse(t.clientX, t.clientY);
  }, {passive:false});
  cv.addEventListener('touchend', e => {
    for (const t of e.changedTouches)
      if (t.identifier === touchId) { touchId = null; mouse.down = false; }
  }, {passive:false});
}

function setMouse(x, y) { mouse.x = x; mouse.y = y; }
