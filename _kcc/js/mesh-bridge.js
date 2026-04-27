/**
 * Mesh bridge — BroadcastChannel cross-tab + ASS-OS interop
 * Shared by all KCC projects for P2P coordination.
 */
const CHANNELS = ['kcc-mesh', 'onlybrains-mesh', 'ass-os-mesh'];

function open(name) { try { return new BroadcastChannel(name); } catch { return null; } }
const channels = CHANNELS.map(open).filter(Boolean);

export const bridge = {
  publish(source, type, extra = {}) {
    const env = { source, type, ts: Date.now(), ...extra };
    channels.forEach(ch => { try { ch.postMessage(env); } catch {} });
    return env;
  },
  subscribe(fn) {
    const unsubs = [];
    channels.forEach(ch => {
      const h = e => { const d = e?.data; if (d?.source && d?.type) fn(d); };
      ch.addEventListener('message', h);
      unsubs.push(() => ch.removeEventListener('message', h));
    });
    return () => unsubs.forEach(u => u());
  },
};
