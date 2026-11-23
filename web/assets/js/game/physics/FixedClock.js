/** Frame-rate-independent physics tick with bounded catch-up on tab switching. */
export class FixedClock {
    maxSteps;
    dt;
    accumulator = 0;
    previous = null;
    constructor(hz = 60, maxSteps = 5) {
        this.maxSteps = maxSteps;
        this.dt = 1 / hz;
    }
    reset() { this.accumulator = 0; this.previous = null; }
    advance(ms, update) {
        if (this.previous === null) {
            this.previous = ms;
            return 0;
        }
        const elapsed = Math.max(0, Math.min(.12, (ms - this.previous) / 1000));
        this.previous = ms;
        this.accumulator += elapsed;
        let n = 0;
        while (this.accumulator + 1e-10 >= this.dt && n < this.maxSteps) {
            update(this.dt);
            this.accumulator -= this.dt;
            n++;
        }
        if (n >= this.maxSteps)
            this.accumulator = Math.min(this.accumulator, this.dt);
        return this.accumulator / this.dt;
    }
}
