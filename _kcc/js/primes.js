/**
 * Prime constants + golden ratio — shared across all KCC projects
 */
export const PRIMES = [2, 3, 5, 7, 11, 13, 17];
export const PRIMORIAL = 510510;
export const PHI = 1.618033988749895;
export const INV_PHI = 0.6180339887498949;

export const RING_NAMES = ['Ground', 'Signal', 'Gate', 'Heart', 'Voice', 'Mirror', 'Watcher'];
export const RING_COLORS = ['#993366', '#00aadd', '#ffaa00', '#ff4444', '#44aa44', '#aa44ff', '#cccccc'];

export const KONOMI_COLORS = [
  '#2d5016', '#7b2d8e', '#3a6b1e', '#5c1a6e',
  '#4a8028', '#8e3da3', '#1a4a0a',
];

export const VAGAL_NAMES = ['Diaphragm', 'Larynx', 'Breath', 'Thoracic', 'Nasal', 'Oral', 'Observer'];
export const VAGAL_COLORS = ['#ff3366', '#ff8833', '#ffcc33', '#33cccc', '#3366ff', '#9933ff', '#ff33cc'];

export function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6)
    if (n % i === 0 || n % (i + 2) === 0) return false;
  return true;
}

export function nthPrime(n) {
  let count = 0, c = 1;
  while (count < n) { c++; if (isPrime(c)) count++; }
  return c;
}
