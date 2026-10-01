/**
 * Small, dependency-free id generator.
 * `crypto.randomUUID` is not guaranteed on every RN runtime, so we don't use it.
 */
let counter = 0;

export function createId(prefix = 'n'): string {
  counter = (counter + 1) % 100000;
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${time}${counter.toString(36)}${rand}`;
}
