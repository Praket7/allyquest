/** No profiles, identifiers, trackers, network or child personal data. */
export const STORAGE_KEY = 'allyquest.progress.v1';
function safeStorage() {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    }
    catch {
        return null;
    }
}
const defaultSave = () => ({ version: 1, totalStars: 0, completedLevels: [], chairColor: '#f2c365', motionEnabled: true });
const safeColors = ['#f2c365', '#80c8d8', '#b69add', '#9bcf91'];
export const SWATCHES = safeColors;
export function sanitizeSave(value) {
    const d = defaultSave();
    if (!value || typeof value !== 'object')
        return d;
    const x = value;
    if (x.version !== 1)
        return d;
    const stars = Number(x.totalStars);
    return {
        version: 1,
        totalStars: Number.isSafeInteger(stars) && stars >= 0 && stars <= 900 ? stars : 0,
        completedLevels: Array.isArray(x.completedLevels) ? x.completedLevels.filter((v) => typeof v === 'string' && /^[a-z0-9-]{1,48}$/.test(v)).slice(0, 300) : [],
        chairColor: typeof x.chairColor === 'string' && safeColors.includes(x.chairColor) ? x.chairColor : d.chairColor,
        motionEnabled: typeof x.motionEnabled === 'boolean' ? x.motionEnabled : d.motionEnabled,
    };
}
export class SaveStore {
    storage;
    data;
    constructor(storage = safeStorage()) {
        this.storage = storage;
        let data;
        try {
            data = JSON.parse(this.storage?.getItem(STORAGE_KEY) ?? 'null');
        }
        catch {
            data = null;
        }
        this.data = sanitizeSave(data);
    }
    get snapshot() { return { ...this.data, completedLevels: [...this.data.completedLevels] }; }
    update(next) {
        this.data = sanitizeSave({ ...this.data, ...next, version: 1 });
        try {
            this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.data));
        }
        catch { /* private browsing / storage disabled */ }
    }
    /** Called only by future, real LevelCompleted events. Never grant stars from a menu. */
    finishLevel(levelId, earnedStars) {
        if (!/^[a-z0-9-]{1,48}$/.test(levelId))
            throw new Error('Invalid level ID');
        const points = Math.min(3, Math.max(0, Math.floor(earnedStars)));
        if (!this.data.completedLevels.includes(levelId))
            this.update({ totalStars: this.data.totalStars + points, completedLevels: [...this.data.completedLevels, levelId] });
    }
}
