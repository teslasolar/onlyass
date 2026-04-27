/**
 * KCC Mining Widget — shared overlay for any KCC project
 * Shows KCC earned, ψ level, mining status.
 *
 * Usage:
 *   import { initMiningWidget, tickMining } from './kcc-mine.js';
 *   initMiningWidget();
 *   // in your render loop: tickMining({ coherence, vagalTone, psiLevel });
 */
import { traceSing, getKey } from './kcc-trace.js';

const PHI = 0.6180339887498949;
const MINE_INTERVAL = 10000;
let lastMine = 0, sessionKcc = 0, sessionBlocks = 0;

export function getSession() { return { kcc: sessionKcc, blocks: sessionBlocks, key: getKey() }; }

export function initMiningWidget() {
  const el = document.createElement('div');
  el.id = 'kcc-mine-widget';
  el.innerHTML = `<span class="km-label">KCC</span><span class="km-val" id="km-val">0</span><span class="km-psi" id="km-psi">ψ —</span><span class="km-status" id="km-status">idle</span>`;
  document.body.appendChild(el);

  const s = document.createElement('style');
  s.textContent = `#kcc-mine-widget{position:fixed;bottom:8px;right:8px;z-index:9999;background:rgba(6,6,12,0.9);border:1px solid rgba(212,175,55,0.3);border-radius:6px;padding:4px 10px;display:flex;gap:8px;align-items:center;font:10px 'JetBrains Mono',monospace;color:#aac;pointer-events:none}.km-label{color:#d4af37;font-weight:700}.km-val{color:#22c55e;font-weight:700}.km-psi{color:#8b5cf6;font-size:9px}.km-status{font-size:8px;padding:1px 5px;border-radius:3px}.km-status.mining{color:#d4af37;background:rgba(212,175,55,0.15)}.km-status.mined{color:#22c55e;background:rgba(34,197,94,0.15)}.km-status.idle{color:#556}`;
  document.head.appendChild(s);
}

export async function tickMining(metrics) {
  if (!metrics) return null;
  const { coherence = 0, psiLevel = 0 } = metrics;

  const psiEl = document.getElementById('km-psi');
  const statusEl = document.getElementById('km-status');
  if (psiEl) psiEl.textContent = `ψ ${psiLevel.toFixed(3)}`;
  if (statusEl) {
    statusEl.textContent = coherence >= 0.3 ? 'mining' : 'idle';
    statusEl.className = 'km-status ' + (coherence >= 0.3 ? 'mining' : 'idle');
  }

  const now = Date.now();
  if (now - lastMine < MINE_INTERVAL || coherence < 0.3) return null;
  lastMine = now;

  const reward = psiLevel >= PHI ? 4 : coherence >= PHI ? 3 : coherence >= 0.5 ? 2 : 1;
  const proof = `PoVW|coherence=${coherence.toFixed(4)}|psi=${psiLevel.toFixed(4)}`;
  const r = await traceSing(proof);

  if (!r.error) {
    sessionKcc += reward;
    sessionBlocks++;
    const valEl = document.getElementById('km-val');
    if (valEl) valEl.textContent = sessionKcc;
    if (statusEl) { statusEl.textContent = `+${reward}`; statusEl.className = 'km-status mined'; }
    return { reward, block: r.block };
  }
  return null;
}
