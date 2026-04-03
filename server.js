const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const TICK_RATE = 30;
const MAP_W = 3200;
const MAP_H = 3200;
const PLAYER_RADIUS = 18;
const BULLET_RADIUS = 5;
const MAX_HP = 100;
const RESPAWN_MS = 2500;
const FOOD_COUNT = 60;

app.use(express.static(path.join(__dirname, 'public')));

const players = new Map();
const bullets = [];
const foods = [];
let nextBulletId = 1;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function spawnFood() {
  return {
    id: Math.random().toString(36).slice(2),
    x: rand(50, MAP_W - 50),
    y: rand(50, MAP_H - 50),
    value: Math.random() < 0.15 ? 20 : 10,
    r: Math.random() < 0.15 ? 10 : 7
  };
}

function resetFoods() {
  foods.length = 0;
  for (let i = 0; i < FOOD_COUNT; i++) foods.push(spawnFood());
}
resetFoods();

function safeSend(ws, obj) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

function makePlayer(id, name) {
  return {
    id,
    name: (name || 'Joueur').slice(0, 16),
    x: rand(200, MAP_W - 200),
    y: rand(200, MAP_H - 200),
    vx: 0,
    vy: 0,
    angle: 0,
    hp: MAX_HP,
    score: 0,
    kills: 0,
    deaths: 0,
    color: `hsl(${Math.floor(rand(0, 360))} 90% 65%)`,
    input: { up: false, down: false, left: false, right: false, shooting: false, angle: 0 },
    shootCd: 0,
    alive: true,
    respawnAt: 0,
    lastHitBy: null
  };
}

function respawnPlayer(p) {
  p.x = rand(200, MAP_W - 200);
  p.y = rand(200, MAP_H - 200);
  p.vx = 0;
  p.vy = 0;
  p.hp = MAX_HP;
  p.alive = true;
  p.lastHitBy = null;
}

function addBullet(owner) {
  const speed = 900;
  bullets.push({
    id: nextBulletId++,
    ownerId: owner.id,
    x: owner.x + Math.cos(owner.angle) * 24,
    y: owner.y + Math.sin(owner.angle) * 24,
    vx: Math.cos(owner.angle) * speed,
    vy: Math.sin(owner.angle) * speed,
    life: 0.9,
    r: BULLET_RADIUS,
    damage: 20
  });
}

function distanceSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).slice(2);
  let joined = false;

  safeSend(ws, { type: 'hello', id, map: { w: MAP_W, h: MAP_H }, maxHp: MAX_HP });

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'join' && !joined) {
      joined = true;
      const p = makePlayer(id, msg.name);
      players.set(id, { ws, data: p });
      safeSend(ws, { type: 'joined', id });
      return;
    }

    const entry = players.get(id);
    if (!entry) return;
    const p = entry.data;

    if (msg.type === 'input') {
      p.input = {
        up: !!msg.up,
        down: !!msg.down,
        left: !!msg.left,
        right: !!msg.right,
        shooting: !!msg.shooting,
        angle: Number(msg.angle) || 0
      };
    }
  });

  ws.on('close', () => {
    players.delete(id);
  });
});

function update(dt) {
  for (const { data: p } of players.values()) {
    if (!p.alive) {
      if (Date.now() >= p.respawnAt) respawnPlayer(p);
      continue;
    }

    let ax = 0;
    let ay = 0;
    if (p.input.up) ay -= 1;
    if (p.input.down) ay += 1;
    if (p.input.left) ax -= 1;
    if (p.input.right) ax += 1;

    const len = Math.hypot(ax, ay) || 1;
    const speed = 320;
    p.vx = (ax / len) * speed * (ax || ay ? 1 : 0);
    p.vy = (ay / len) * speed * (ax || ay ? 1 : 0);
    p.x = clamp(p.x + p.vx * dt, PLAYER_RADIUS, MAP_W - PLAYER_RADIUS);
    p.y = clamp(p.y + p.vy * dt, PLAYER_RADIUS, MAP_H - PLAYER_RADIUS);
    p.angle = p.input.angle;

    p.shootCd -= dt;
    if (p.input.shooting && p.shootCd <= 0) {
      p.shootCd = 0.18;
      addBullet(p);
    }

    for (let i = foods.length - 1; i >= 0; i--) {
      const f = foods[i];
      const rr = (PLAYER_RADIUS + f.r) * (PLAYER_RADIUS + f.r);
      if (distanceSq(p, f) <= rr) {
        p.score += f.value;
        p.hp = Math.min(MAX_HP, p.hp + Math.round(f.value / 5));
        foods.splice(i, 1);
        foods.push(spawnFood());
      }
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;

    if (b.life <= 0 || b.x < -50 || b.y < -50 || b.x > MAP_W + 50 || b.y > MAP_H + 50) {
      bullets.splice(i, 1);
      continue;
    }

    for (const { data: p } of players.values()) {
      if (!p.alive || p.id === b.ownerId) continue;
      const rr = (PLAYER_RADIUS + b.r) * (PLAYER_RADIUS + b.r);
      if (distanceSq(p, b) <= rr) {
        p.hp -= b.damage;
        p.lastHitBy = b.ownerId;
        bullets.splice(i, 1);
        if (p.hp <= 0) {
          p.alive = false;
          p.deaths += 1;
          p.respawnAt = Date.now() + RESPAWN_MS;
          const killer = players.get(p.lastHitBy)?.data;
          if (killer) {
            killer.kills += 1;
            killer.score += 100;
          }
        }
        break;
      }
    }
  }
}

function buildSnapshot() {
  const plist = [];
  for (const { data: p } of players.values()) {
    plist.push({
      id: p.id,
      name: p.name,
      x: Math.round(p.x),
      y: Math.round(p.y),
      angle: p.angle,
      hp: p.hp,
      maxHp: MAX_HP,
      score: p.score,
      kills: p.kills,
      deaths: p.deaths,
      color: p.color,
      alive: p.alive,
      respawnAt: p.respawnAt
    });
  }

  const leaderboard = plist
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((p, index) => ({ rank: index + 1, name: p.name, score: p.score, kills: p.kills }));

  return {
    type: 'state',
    players: plist,
    bullets: bullets.map((b) => ({ x: Math.round(b.x), y: Math.round(b.y) })),
    foods,
    leaderboard,
    now: Date.now()
  };
}

setInterval(() => {
  update(1 / TICK_RATE);
  const snapshot = JSON.stringify(buildSnapshot());
  for (const { ws } of players.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(snapshot);
  }
}, 1000 / TICK_RATE);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
