export const QUEST_STORAGE_KEY = 'allyquest.welcome.quest.v1';
export const freshQuest = () => ({ version: 1, metMaya: false, crossedCreek: false, bannerFound: false, checkpoint: 0, secrets: [], completed: false });
const SECRET_IDS = ['garden-kite', 'bridge-ribbon'];
export function sanitizeQuest(data) {
    const s = freshQuest();
    if (!data || typeof data !== 'object')
        return s;
    const v = data;
    if (v.version !== 1)
        return s;
    s.metMaya = v.metMaya === true;
    s.crossedCreek = v.crossedCreek === true;
    s.bannerFound = v.bannerFound === true;
    s.completed = v.completed === true;
    s.checkpoint = v.checkpoint === 1590 || v.checkpoint === 2095 ? v.checkpoint : 0;
    s.secrets = Array.isArray(v.secrets) ? SECRET_IDS.filter(id => v.secrets.includes(id)) : [];
    return s;
}
export class QuestStore {
    storage;
    data;
    constructor(storage = (() => { try {
        return window.localStorage;
    }
    catch {
        return null;
    } })()) {
        this.storage = storage;
        let raw = null;
        try {
            raw = JSON.parse(this.storage?.getItem(QUEST_STORAGE_KEY) ?? 'null');
        }
        catch { }
        this.data = sanitizeQuest(raw);
    }
    get snapshot() { return { ...this.data, secrets: [...this.data.secrets] }; }
    save(s) { this.data = sanitizeQuest(s); try {
        this.storage?.setItem(QUEST_STORAGE_KEY, JSON.stringify(this.data));
    }
    catch { /* private browsing */ } }
}
export class WelcomeQuest {
    store;
    data;
    events = [];
    constructor(store = new QuestStore()) {
        this.store = store;
        this.data = store.snapshot;
        if (this.data.completed) {
            this.data = freshQuest();
            this.store.save(this.data);
        }
    }
    get snapshot() { return { ...this.data, secrets: [...this.data.secrets] }; }
    get objective() {
        if (this.data.completed)
            return 'celebrate';
        if (this.data.bannerFound)
            return 'deliver-banner';
        if (this.data.crossedCreek)
            return 'find-banner';
        return this.data.metMaya ? 'follow-clues' : 'talk-to-maya';
    }
    get description() {
        return {
            'talk-to-maya': 'Ask Maya about the missing banner',
            'follow-clues': 'Follow the golden threads toward the creek',
            'find-banner': 'Search near the celebration garden',
            'deliver-banner': 'Bring the banner to the celebration!',
            'celebrate': 'The Ally Crew is celebrating!'
        }[this.objective];
    }
    get secretsFound() { return this.data.secrets.length; }
    drainEvents() { return this.events.splice(0); }
    save() { this.store.save(this.data); }
    meetMaya() { if (this.data.metMaya)
        return false; this.data.metMaya = true; this.save(); this.events.push({ type: 'clue', label: 'Maya shared a clue!', x: 1185, y: 465 }); return true; }
    updateCheckpoint(x) {
        const next = x >= 2095 ? 2095 : x >= 1590 ? 1590 : 0;
        if (next > this.data.checkpoint) {
            this.data.checkpoint = next;
            this.save();
            this.events.push({ type: 'checkpoint', label: 'Progress saved', x: next, y: 565 });
            return true;
        }
        return false;
    }
    /** Optional finds are tied to reachable gameplay locations, never to a quiz. */
    observe(x, y) {
        if (!this.data.crossedCreek && x >= 1920) {
            this.data.crossedCreek = true;
            this.save();
            this.events.push({ type: 'clue', label: 'A golden trail leads east!', x, y });
        }
        if (!this.data.bannerFound && x >= 2912) {
            this.data.bannerFound = true;
            this.save();
            this.events.push({ type: 'banner', label: 'You found the banner!', x: 2920, y: 460 });
        }
        if (x >= 1510 && x <= 1660 && y < 455)
            this.findSecret('garden-kite', 1575, 385);
        if (x >= 2310 && x <= 2420 && y < 510)
            this.findSecret('bridge-ribbon', 2370, 445);
    }
    findSecret(id, x, y) { if (this.data.secrets.includes(id))
        return; this.data.secrets.push(id); this.save(); this.events.push({ type: 'secret', label: 'Secret discovered!', x, y }); }
    finish() { if (this.data.completed)
        return; this.data.completed = true; this.save(); this.events.push({ type: 'complete', label: 'The celebration can begin!', x: 3088, y: 430 }); }
    resetRun() { this.data = freshQuest(); this.events = []; this.save(); }
}
