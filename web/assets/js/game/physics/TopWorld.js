import { approach, clamp, distance } from './types.js';
/** Independent top-down prototype for a fair side-view-vs-top-down comparison. */
export class TopWorld {
    mode = 'top';
    width = 2250;
    height = 1040;
    player = { x: 115, y: 465, vx: 0, vy: 0 };
    ball = { x: 1330, y: 555, vx: 0, vy: 0 };
    checkpoint = { x: 115, y: 465 };
    events = [];
    stats = { ribbons: 0, attempts: 0, finished: false, elapsed: 0, interactions: 0 };
    ribbons = [{ id: 1, x: 335, y: 300, got: false }, { id: 2, x: 700, y: 735, got: false }, { id: 3, x: 1040, y: 305, got: false }, { id: 4, x: 1560, y: 700, got: false }, { id: 5, x: 1930, y: 335, got: false }];
    obstacles = [{ x: 230, y: 60, w: 110, h: 195 }, { x: 470, y: 385, w: 210, h: 100 }, { x: 835, y: 160, w: 90, h: 285 }, { x: 1100, y: 700, w: 155, h: 150 }, { x: 1390, y: 180, w: 150, h: 110 }, { x: 1690, y: 415, w: 125, h: 240 }, { x: 1900, y: 705, w: 115, h: 185 }];
    movingObstacles = [{ x: 740, y: 570, w: 100, h: 33 }, { x: 1500, y: 465, w: 90, h: 32 }];
    gate = { x: 1872, y: 430, w: 22, h: 260 };
    gateOpen = false;
    time = 0;
    dashTime = 0;
    facing = { x: 1, y: 0 };
    get clock() { return this.time; }
    get facingVector() { return this.facing; }
    reset() { Object.assign(this.player, { x: 115, y: 465, vx: 0, vy: 0 }); Object.assign(this.ball, { x: 1330, y: 555, vx: 0, vy: 0 }); Object.assign(this.checkpoint, { x: 115, y: 465 }); Object.assign(this.stats, { ribbons: 0, attempts: 0, finished: false, elapsed: 0, interactions: 0 }); this.events.length = 0; this.time = 0; this.dashTime = 0; this.gateOpen = false; this.ribbons.forEach(r => r.got = false); }
    emit(type, x = this.player.x, y = this.player.y) { this.events.push({ type, x, y }); }
    step(dt, input) {
        if (this.stats.finished)
            return;
        dt = clamp(dt, 0, 1 / 30);
        this.events.length = 0;
        this.time += dt;
        this.stats.elapsed += dt;
        const p = this.player;
        let axis = { x: clamp(input.x, -1, 1), y: clamp(input.y, -1, 1) };
        const len = Math.hypot(axis.x, axis.y);
        if (len > 1) {
            axis.x /= len;
            axis.y /= len;
        }
        if (len > .12)
            this.facing = { x: axis.x, y: axis.y };
        if (input.dash && this.dashTime <= 0) {
            this.dashTime = .16;
            p.vx = this.facing.x * 640;
            p.vy = this.facing.y * 640;
            this.emit('dash');
        }
        if (this.dashTime > 0)
            this.dashTime = Math.max(0, this.dashTime - dt);
        else {
            p.vx = approach(p.vx, axis.x * 255, (len > .05 ? 1600 : 2200) * dt);
            p.vy = approach(p.vy, axis.y * 255, (len > .05 ? 1600 : 2200) * dt);
        }
        const oldX = p.x, oldY = p.y;
        p.x = clamp(p.x + p.vx * dt, 20, this.width - 20);
        this.resolve(p, oldX, true);
        p.y = clamp(p.y + p.vy * dt, 20, this.height - 20);
        this.resolve(p, oldY, false);
        this.movingObstacles[0].x = 740 + Math.sin(this.time * 1.1) * 130;
        this.movingObstacles[1].y = 465 + Math.sin(this.time * 1.4) * 115;
        if (input.interact && distance(p, { x: 1790, y: 550 }) < 100) {
            this.gateOpen = true;
            this.stats.interactions++;
            this.emit('gate', this.gate.x, this.gate.y);
        }
        this.updateBall(dt);
        if (distance(this.ball, { x: 1760, y: 620 }) < 65 && !this.gateOpen) {
            this.gateOpen = true;
            this.emit('gate', this.gate.x, this.gate.y);
        }
        for (const r of this.ribbons)
            if (!r.got && distance(p, r) < 43) {
                r.got = true;
                this.stats.ribbons++;
                this.emit('ribbon', r.x, r.y);
            }
        if (p.x > 1230 && this.checkpoint.x < 900) {
            this.checkpoint.x = 1250;
            this.checkpoint.y = 440;
            this.emit('checkpoint');
        }
        if (distance(p, { x: 2110, y: 490 }) < 85) {
            this.stats.finished = true;
            this.emit('finish');
        }
    }
    resolve(p, old, horizontal) {
        const colliders = [...this.obstacles, ...this.movingObstacles, ...(!this.gateOpen ? [this.gate] : [])];
        for (const r of colliders) {
            if (!this.overlapCircleRect(p, 17, r))
                continue;
            if (horizontal) {
                p.x = old;
                p.vx = 0;
            }
            else {
                p.y = old;
                p.vy = 0;
            }
            break;
        }
    }
    overlapCircleRect(p, radius, r) { const x = clamp(p.x, r.x, r.x + r.w), y = clamp(p.y, r.y, r.y + r.h); return (p.x - x) ** 2 + (p.y - y) ** 2 < radius * radius; }
    updateBall(dt) {
        const b = this.ball, p = this.player;
        const d = distance(p, b);
        if (d < 47) {
            const n = { x: (b.x - p.x) / (d || 1), y: (b.y - p.y) / (d || 1) };
            b.vx += n.x * 210 * dt + Math.max(0, p.vx * n.x + p.vy * n.y) * n.x * .15;
            b.vy += n.y * 210 * dt + Math.max(0, p.vx * n.x + p.vy * n.y) * n.y * .15;
            this.emit('push', b.x, b.y);
        }
        b.vx = approach(b.vx, 0, 110 * dt);
        b.vy = approach(b.vy, 0, 110 * dt);
        const oldX = b.x, oldY = b.y;
        b.x = clamp(b.x + b.vx * dt, 18, this.width - 18);
        b.y = clamp(b.y + b.vy * dt, 18, this.height - 18);
        if (this.obstacles.some(r => this.overlapCircleRect(b, 20, r))) {
            b.x = oldX;
            b.y = oldY;
            b.vx = b.vy = 0;
        }
    }
}
