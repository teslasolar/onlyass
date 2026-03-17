/**
 * A.S.S. Logger — Prime-factored error & state machine IDs
 *
 * Each directory owns a prime. Every log entry from that directory
 * gets an ID = prime × sequence_number. Factor any ID to trace it
 * back to its source pipe.
 *
 * Composite events (spanning multiple pipes) get the product of
 * those primes × sequence. The ceiling is 510510 (2×3×5×7×11×13×17).
 *
 * Usage:
 *   const log = ASSLogger.pipe(7);       // heart pipe
 *   log.error('valve stuck');            // id: 7
 *   log.error('pressure drop');          // id: 14
 *   log.state('idle', 'active');         // id: 21
 *
 *   // composite (cross-pipe event):
 *   ASSLogger.composite([2,7], 'ground shook the heart'); // id: 14 * seq
 *
 *   // factor any id back to source:
 *   ASSLogger.factor(42);  // → { primes: [2,3,7], pipes: ['ground','signal','heart'] }
 */
const ASSLogger = (function () {
  'use strict';

  const FOLD = 510510;
  const PRIMES = [2, 3, 5, 7, 11, 13, 17];

  const PIPES = {
    2:  { ring: 'R0', name: 'ground',  color: '#B42838' },
    3:  { ring: 'R1', name: 'signal',  color: '#008CC8' },
    5:  { ring: 'R2', name: 'gate',    color: '#DCA030' },
    7:  { ring: 'R3', name: 'heart',   color: '#28B450' },
    11: { ring: 'R4', name: 'voice',   color: '#5078DC' },
    13: { ring: 'R5', name: 'mirror',  color: '#8C50C8' },
    17: { ring: 'R6', name: 'watcher', color: '#787878' }
  };

  // sequence counters per prime base
  const _seq = {};
  // full log buffer (ring buffer, max 510 entries — 510 = 510510 / 1001)
  const _buffer = [];
  const MAX_BUFFER = 510;

  // state machines per pipe: { prime: currentState }
  const _states = {};

  function _nextId(base) {
    if (!_seq[base]) _seq[base] = 0;
    _seq[base]++;
    const id = base * _seq[base];
    if (id > FOLD) {
      console.warn(`[ASS] id ${id} exceeds fold ${FOLD} — pipe ${base} overflowing`);
    }
    return id;
  }

  function _push(entry) {
    _buffer.push(entry);
    if (_buffer.length > MAX_BUFFER) _buffer.shift();
    // emit to console with pipe color
    const p = PIPES[entry.prime] || PIPES[entry.primes?.[0]];
    const style = `color:${p?.color || '#888'};font-weight:bold`;
    const tag = entry.type === 'state'
      ? `[${p?.name}] ${entry.from} → ${entry.to}`
      : `[${p?.name}] ${entry.msg}`;
    console.log(`%c[ASS:${entry.id}] ${tag}`, style);
    return entry;
  }

  /**
   * Factor an ID back into its source primes/pipes
   */
  function factor(id) {
    const found = [];
    let n = id;
    for (const p of PRIMES) {
      while (n % p === 0) {
        found.push(p);
        n = n / p;
      }
    }
    // remainder means something outside the 7 pipes touched it
    const result = {
      id,
      primes: [...new Set(found)],
      pipes: [...new Set(found)].map(p => PIPES[p]?.name || '???'),
      factors: found,
      remainder: n > 1 ? n : null
    };
    return result;
  }

  /**
   * Get a pipe-scoped logger
   */
  function pipe(prime) {
    if (!PIPES[prime]) {
      console.warn(`[ASS] unknown prime ${prime}, valid: ${PRIMES.join(',')}`);
    }

    return {
      prime,
      name: PIPES[prime]?.name || `pipe-${prime}`,

      /**
       * Log an error. Returns the entry with its unique ID.
       */
      error(msg, data) {
        const id = _nextId(prime);
        return _push({
          type: 'error',
          id,
          prime,
          msg,
          data: data || null,
          ts: Date.now()
        });
      },

      /**
       * Log a warning.
       */
      warn(msg, data) {
        const id = _nextId(prime);
        return _push({
          type: 'warn',
          id,
          prime,
          msg,
          data: data || null,
          ts: Date.now()
        });
      },

      /**
       * Log an info event.
       */
      info(msg, data) {
        const id = _nextId(prime);
        return _push({
          type: 'info',
          id,
          prime,
          msg,
          data: data || null,
          ts: Date.now()
        });
      },

      /**
       * State machine transition.
       * Validates that `from` matches current state (if state exists).
       * Returns the entry, or null if transition is invalid.
       */
      state(from, to, data) {
        const current = _states[prime];
        if (current !== undefined && current !== from) {
          // invalid transition — log as error instead
          const id = _nextId(prime);
          return _push({
            type: 'error',
            id,
            prime,
            msg: `invalid transition: expected state="${current}" but got from="${from}"`,
            data: { attempted: { from, to }, actual: current, ...data },
            ts: Date.now()
          });
        }
        _states[prime] = to;
        const id = _nextId(prime);
        return _push({
          type: 'state',
          id,
          prime,
          from: from || null,
          to,
          data: data || null,
          ts: Date.now()
        });
      },

      /**
       * Get current state for this pipe
       */
      getState() {
        return _states[prime] || null;
      },

      /**
       * Reset state machine for this pipe
       */
      resetState() {
        delete _states[prime];
      }
    };
  }

  /**
   * Composite event — spans multiple pipes.
   * ID = product(primes) × sequence
   */
  function composite(primes, msg, data) {
    const base = primes.reduce((a, b) => a * b, 1);
    if (base > FOLD) {
      console.warn(`[ASS] composite base ${base} exceeds fold ${FOLD}`);
    }
    const id = _nextId(base);
    return _push({
      type: 'composite',
      id,
      primes,
      prime: primes[0],
      msg,
      data: data || null,
      ts: Date.now()
    });
  }

  /**
   * Dump the full log buffer
   */
  function dump() {
    return [..._buffer];
  }

  /**
   * Filter logs by pipe prime
   */
  function logsFor(prime) {
    return _buffer.filter(e => e.prime === prime || (e.primes && e.primes.includes(prime)));
  }

  /**
   * Get all state machine snapshots
   */
  function states() {
    const out = {};
    for (const p of PRIMES) {
      if (_states[p] !== undefined) {
        out[p] = { pipe: PIPES[p]?.name, state: _states[p] };
      }
    }
    return out;
  }

  /**
   * Clear everything — hard reset
   */
  function flush() {
    _buffer.length = 0;
    for (const k of Object.keys(_seq)) delete _seq[k];
    for (const k of Object.keys(_states)) delete _states[k];
  }

  return {
    FOLD,
    PRIMES,
    PIPES,
    pipe,
    composite,
    factor,
    dump,
    logsFor,
    states,
    flush
  };
})();

// Export for module environments, noop for browsers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ASSLogger;
}
