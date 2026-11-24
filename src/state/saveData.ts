/** No profiles, identifiers, trackers, network or child personal data. */
export const STORAGE_KEY = 'allyquest.progress.v1';
export interface SaveData { version: 1; totalStars: number; completedLevels: string[]; chairColor: string; motionEnabled: boolean }
function safeStorage(): Pick<Storage, 'getItem'|'setItem'> | null {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}
const defaultSave = (): SaveData => ({ version: 1, totalStars: 0, completedLevels: [], chairColor: '#f2c365', motionEnabled: true });
const safeColors = ['#f2c365','#80c8d8','#b69add','#9bcf91'] as const;
export const SWATCHES = safeColors;
export function sanitizeSave(value: unknown): SaveData {
  const d = defaultSave();
  if (!value || typeof value !== 'object') return d;
  const x = value as Record<string, unknown>;
  if (x.version !== 1) return d;
  const stars = Number(x.totalStars);
  return {
    version: 1,
    totalStars: Number.isSafeInteger(stars) && stars >= 0 && stars <= 900 ? stars : 0,
    completedLevels: Array.isArray(x.completedLevels) ? x.completedLevels.filter((v): v is string => typeof v === 'string' && /^[a-z0-9-]{1,48}$/.test(v)).slice(0,300) : [],
    chairColor: typeof x.chairColor === 'string' && (safeColors as readonly string[]).includes(x.chairColor) ? x.chairColor : d.chairColor,
    motionEnabled: typeof x.motionEnabled === 'boolean' ? x.motionEnabled : d.motionEnabled,
  };
}
export class SaveStore {
  private data: SaveData;
  constructor(private readonly storage: Pick<Storage,'getItem'|'setItem'> | null = safeStorage()) {
    let data: unknown;
    try {data = JSON.parse(this.storage?.getItem(STORAGE_KEY) ?? 'null');} catch {data = null;}
    this.data = sanitizeSave(data);
  }
  get snapshot(): Readonly<SaveData> { return { ...this.data, completedLevels: [...this.data.completedLevels] }; }
  update(next: Partial<Omit<SaveData, 'version'>>): void {
    this.data = sanitizeSave({ ...this.data, ...next, version: 1 });
    try {this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.data));} catch { /* private browsing / storage disabled */ }
  }
  /** Called only by future, real LevelCompleted events. Never grant stars from a menu. */
  finishLevel(levelId: string, earnedStars: number): void {
    if (!/^[a-z0-9-]{1,48}$/.test(levelId)) throw new Error('Invalid level ID');
    const points = Math.min(3, Math.max(0, Math.floor(earnedStars)));
    if (!this.data.completedLevels.includes(levelId)) this.update({totalStars: this.data.totalStars + points, completedLevels: [...this.data.completedLevels, levelId]});
  }
}
