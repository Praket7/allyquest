export const EMPTY_INPUT = { x: 0, y: 0, jump: false, jumpHeld: false, interact: false, dash: false };
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const approach = (v, t, d) => v < t ? Math.min(t, v + d) : Math.max(t, v - d);
export const intersect = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
