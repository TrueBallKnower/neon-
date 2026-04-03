const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const playBtn = document.getElementById('playBtn');
const nameInput = document.getElementById('nameInput');
const hud = document.getElementById('hud');
const leader = document.getElementById('leader');
const hpFill = document.getElementById('hpFill');
const hpText = document.getElementById('hpText');
const scoreText = document.getElementById('scoreText');
const killsText = document.getElementById('killsText');
const deathsText = document.getElementById('deathsText');
const leaderboardEl = document.getElementById('leaderboard');
const myNameEl = document.getElementById('myName');
const respawnEl = document.getElementById('respawn');
const crosshair = document.getElementById('crosshair');

let W = innerWidth;
let H = innerHeight;
canvas.width = W;
canvas.height = H;
addEventListener('resize', () => {
  W = innerWidth;
  H = innerHeight;
  canvas.width = W;
  canvas.height = H;
});

const state = {
  id: null,
  map: { w: 3200, h: 3200 },
  players: [],
  bullets: [],
  foods: [],
  leaderboard: [],
  connected: false
};

const keys = { w: false, a: false, s: false, d: false };
const mouse = { x: W / 2, y: H / 2, shooting: false };

addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  crosshair.style.left = `${e.clientX}px`;
  crosshair.style.top = `${e.clientY}px`;
});
addEventListener('mousedown', (e) => { if (e.button === 0) mouse.shooting = true; });
addEventListener('mouseup', (e) => { if (e.button === 0) mouse.shooting = false; });
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = true;
});
addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = false;
});

let socket = null;

function connect() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  socket = new WebSocket(`${proto}//${location.host}`);

  socket.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'hello') {
      state.id = msg.id;
      state.map = msg.map;
      socket.send(JSON.stringify({ type: 'join', name: nameInput.value.trim() || 'Joueur' }));
      return;
    }

    if (msg.type === 'joined') {
      state.connected = true;
      menu.style.display = 'none';
      hud.style.display = 'block';
      leader.style.display = 'block';
      myNameEl.textContent = nameInput.value.trim() || 'Joueur';
      return;
    }

    if (msg.type === 'state') {
      state.players = msg.players;
      state.bullets = msg.bullets;
      state.foods = msg.foods;
      state.leaderboard = msg.leaderboard;
      refreshUi();
    }
  });

  socket.addEventListener('close', () => {
    state.connected = false;
    menu.style.display = 'flex';
    hud.style.display = 'none';
    leader.style.display = 'none';
    alert('Connexion perdue. Recharge la page ou relance.');
  });
}

playBtn.addEventListener('click', connect);

function getMe() {
  return state.players.find((p) => p.id === state.id) || null;
}

function refreshUi() {
  const me = getMe();
  if (!me) return;

  hpFill.style.width = `${Math.max(0, me.hp / me.maxHp) * 100}%`;
  hpText.textContent = `${Math.max(0, Math.round(me.hp))} / ${me.maxHp}`;
  scoreText.textContent = me.score;
  killsText.textContent = me.kills;
  deathsText.textContent = me.deaths;

  if (!me.alive) {
    const left = Math.max(0, Math.ceil((me.respawnAt - Date.now()) / 1000));
    respawnEl.style.display = 'block';
    respawnEl.textContent = `Respawn dans ${left}s`;
  } else {
    respawnEl.style.display = 'none';
  }

  leaderboardEl.innerHTML = state.leaderboard
    .map((p) => `<div class="entry"><span>${p.rank}. ${escapeHtml(p.name)}</span><b>${p.score}</b></div>`)
    .join('');
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function sendInput() {
  if (!socket || socket.readyState !== WebSocket.OPEN || !state.connected) return;
  const me = getMe();
  let angle = 0;
  if (me) {
    const cam = getCamera();
    const mx = mouse.x - (me.x - cam.x);
    const my = mouse.y - (me.y - cam.y);
    angle = Math.atan2(my, mx);
  }
  socket.send(JSON.stringify({
    type: 'input',
    up: keys.w,
    down: keys.s,
    left: keys.a,
    right: keys.d,
    shooting: mouse.shooting,
    angle
  }));
}
setInterval(sendInput, 1000 / 30);

function getCamera() {
  const me = getMe();
  if (!me) return { x: 0, y: 0 };
  return {
    x: Math.max(0, Math.min(state.map.w - W, me.x - W / 2)),
    y: Math.max(0, Math.min(state.map.h - H, me.y - H / 2))
  };
}

function drawGrid(cam) {
  ctx.strokeStyle = 'rgba(99,214,255,0.08)';
  ctx.lineWidth = 1;
  const step = 100;
  for (let x = Math.floor(cam.x / step) * step; x < cam.x + W; x += step) {
    ctx.beginPath();
    ctx.moveTo(x - cam.x, 0);
    ctx.lineTo(x - cam.x, H);
    ctx.stroke();
  }
  for (let y = Math.floor(cam.y / step) * step; y < cam.y + H; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y - cam.y);
    ctx.lineTo(W, y - cam.y);
    ctx.stroke();
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);
  const cam = getCamera();

  drawGrid(cam);

  ctx.strokeStyle = 'rgba(255,255,255,.15)';
  ctx.strokeRect(-cam.x, -cam.y, state.map.w, state.map.h);

  for (const f of state.foods) {
    ctx.beginPath();
    ctx.fillStyle = f.value >= 20 ? '#ffd36f' : '#7bffbc';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 14;
    ctx.arc(f.x - cam.x, f.y - cam.y, f.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  for (const b of state.bullets) {
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#63d6ff';
    ctx.shadowBlur = 10;
    ctx.arc(b.x - cam.x, b.y - cam.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  for (const p of state.players) {
    const sx = p.x - cam.x;
    const sy = p.y - cam.y;

    if (!p.alive) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,111,141,.55)';
      ctx.lineWidth = 3;
      ctx.arc(sx, sy, 24, 0, Math.PI * 2);
      ctx.stroke();
      continue;
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(p.angle);

    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 18;
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.fillRect(10, -3, 16, 6);
    ctx.restore();

    ctx.fillStyle = '#ebf5ff';
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(p.name, sx, sy - 28);

    ctx.fillStyle = 'rgba(255,255,255,.15)';
    ctx.fillRect(sx - 20, sy + 24, 40, 6);
    ctx.fillStyle = p.id === state.id ? '#63d6ff' : '#ff6f8d';
    ctx.fillRect(sx - 20, sy + 24, 40 * Math.max(0, p.hp / p.maxHp), 6);
  }

  requestAnimationFrame(render);
}
render();
