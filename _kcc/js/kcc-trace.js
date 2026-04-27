/**
 * KCC Trace Client — shared by all KCC projects
 * Sends structured traces to the OnlyBrains API for dataset collection.
 *
 * Usage:
 *   import { trace, traceReason, tracePipe, traceSing, traceD2R } from './kcc-trace.js';
 */
const API = typeof location !== 'undefined' && location.hostname === 'localhost'
  ? 'http://localhost:3001' : 'https://onlybrains.onrender.com';

let _key = null;
try {
  _key = localStorage.getItem('kcc-key');
  if (!_key) {
    _key = 'kcc-' + Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem('kcc-key', _key);
  }
} catch { _key = 'kcc-anon'; }

async function post(path, body) {
  try {
    const r = await fetch(`${API}${path}?key=${_key}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(5000),
    });
    return r.json();
  } catch { return { error: 'offline' }; }
}

export const getKey = () => _key;
export const trace = (source, data) => post('/api/trace/' + source, data);
export const traceReason = (problem, strategy) => post('/api/reason', { problem, strategy, key: _key });
export const tracePipe = (pipe, question, response) => post('/api/trace/pipe', { pipe, question, response });
export const traceSing = (proof) => post('/api/sing', { proof, key: _key });
export const traceD2R = (phase, event, metrics) => post('/api/trace/d2r', { phase, event, metrics });
export const getWallet = () => fetch(`${API}/api/wallet?key=${_key}`).then(r => r.json()).catch(() => ({}));
export const getChain = () => fetch(`${API}/api/chain`).then(r => r.json()).catch(() => ({}));
export const getStats = () => fetch(`${API}/api/trace/stats`).then(r => r.json()).catch(() => ({}));
