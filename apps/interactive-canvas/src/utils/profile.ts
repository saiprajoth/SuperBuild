// src/utils/profile.ts
type Bucket = { n: number; total: number; last: number };

const buckets = new Map<string, Bucket>();

function enabled() {
  return typeof window !== "undefined" && Boolean((window as any).__SB_PROFILE);
}

export function profileSpan<T>(name: string, fn: () => T): T {
  if (!enabled()) return fn();

  const t0 = performance.now();
  const out = fn();
  const dt = performance.now() - t0;

  const b = buckets.get(name) ?? { n: 0, total: 0, last: 0 };
  b.n += 1;
  b.total += dt;
  b.last = dt;
  buckets.set(name, b);

  // log occasionally
  if (b.n % 60 === 0) {
    const avg = b.total / b.n;
    // eslint-disable-next-line no-console
    console.log(`[PROFILE] ${name}: avg=${avg.toFixed(2)}ms last=${b.last.toFixed(2)}ms n=${b.n}`);
  }

  return out;
}

export function profileCount(name: string, count: number) {
  if (!enabled()) return;

  const key = `count:${name}`;
  const b = buckets.get(key) ?? { n: 0, total: 0, last: 0 };
  b.n += 1;
  b.total += count;
  b.last = count;
  buckets.set(key, b);

  if (b.n % 60 === 0) {
    const avg = b.total / b.n;
    // eslint-disable-next-line no-console
    console.log(`[PROFILE] ${name}: avg=${avg.toFixed(1)} last=${b.last} n=${b.n}`);
  }
}
