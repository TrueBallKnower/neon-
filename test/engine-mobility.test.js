const { test } = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../public/engine');

const oracle = board => board.includes(0) || ['left', 'right', 'up', 'down'].some(direction => rules.move(board, direction).changed);

test('mobility scans every board edge and never joins opposite row ends', () => {
 const blocked = Array.from({ length: 16 }, (_, i) => 2 ** (i + 1));
 assert.equal(rules.canMove(Object.freeze([...blocked])), false);
 const wrap = [...blocked];wrap[4] = wrap[3];
 assert.equal(rules.canMove(Object.freeze(wrap)), false, 'indices 3 and 4 share no edge');
 for (let i = 0; i < 16; i++) {
  const empty = [...blocked];empty[i] = 0;
  assert.equal(rules.canMove(Object.freeze(empty)), true, 'empty cell ' + i);
  for (const neighbor of [i % 4 < 3 ? i + 1 : -1, i < 12 ? i + 4 : -1]) {
   if (neighbor < 0) continue;
   const merge = [...blocked];merge[neighbor] = merge[i];
   assert.equal(rules.canMove(Object.freeze(merge)), true, `adjacent pair ${i}, ${neighbor}`);
  }
 }
 assert.equal(rules.canMove(Object.freeze(Array(16).fill(0))), true);
});

test('allocation-free mobility agrees with actual legal moves on 3000 deterministic boards', () => {
 let seed = 314159;
 const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
 for (let sample = 0; sample < 3000; sample++) {
  const full = sample % 3 !== 0;
  const board = Object.freeze(Array.from({ length: 16 }, () => {
   const n = random();return !full && (n >>> 12) % 5 === 0 ? 0 : 2 ** (1 + ((n >>> 8) % 19));
  }));
  assert.equal(rules.canMove(board), oracle(board), `board ${sample}: ${board}`);
 }
});
