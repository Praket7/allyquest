/** Keyboard/gamepad/touch feed exactly the same deterministic simulation input. */
export class Controls {
    down = new Set();
    tapJump = false;
    tapAction = false;
    tapDash = false;
    lastPadJump = false;
    lastPadAction = false;
    lastPadDash = false;
    touchKeys = new Set();
    attached = false;
    keyDown = (event) => {
        const key = event.code;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyE', 'KeyR', 'KeyP', 'Escape', 'ShiftLeft', 'ShiftRight'].includes(key)) {
            event.preventDefault();
        }
        if (!this.down.has(key)) {
            if (['Space', 'ArrowUp', 'KeyW'].includes(key))
                this.tapJump = true;
            if (key === 'KeyE')
                this.tapAction = true;
            if (key.startsWith('Shift'))
                this.tapDash = true;
        }
        this.down.add(key);
    };
    keyUp = (event) => { this.down.delete(event.code); };
    blur = () => this.release();
    attach() { if (this.attached)
        return; this.attached = true; window.addEventListener('keydown', this.keyDown, { passive: false }); window.addEventListener('keyup', this.keyUp); window.addEventListener('blur', this.blur); }
    detach() { if (!this.attached)
        return; this.attached = false; window.removeEventListener('keydown', this.keyDown); window.removeEventListener('keyup', this.keyUp); window.removeEventListener('blur', this.blur); this.release(); }
    release() { this.down.clear(); this.touchKeys.clear(); this.tapJump = false; this.tapAction = false; this.tapDash = false; this.lastPadJump = this.lastPadAction = this.lastPadDash = false; }
    touchControl(code, isDown) { if (isDown) {
        if (!this.touchKeys.has(code)) {
            if (code === 'jump')
                this.tapJump = true;
            if (code === 'action')
                this.tapAction = true;
            if (code === 'dash')
                this.tapDash = true;
        }
        this.touchKeys.add(code);
    }
    else
        this.touchKeys.delete(code); }
    frame(mode) {
        const k = (code) => this.down.has(code) || this.touchKeys.has(code);
        let x = Number(k('ArrowRight') || k('KeyD') || k('right')) - Number(k('ArrowLeft') || k('KeyA') || k('left'));
        let y = Number(k('ArrowDown') || k('KeyS') || k('down')) - Number(k('ArrowUp') || k('KeyW') || k('up'));
        let jump = this.tapJump, action = this.tapAction, dash = this.tapDash;
        let held = k('Space') || k('ArrowUp') || k('KeyW') || k('jump');
        const pad = navigator.getGamepads?.()?.find(Boolean);
        if (pad) {
            const px = pad.axes[0] ?? 0, py = pad.axes[1] ?? 0;
            if (Math.abs(px) > .18)
                x = px;
            if (Math.abs(py) > .18)
                y = py;
            const pj = !!pad.buttons[0]?.pressed, pa = !!pad.buttons[2]?.pressed, pd = !!pad.buttons[1]?.pressed;
            jump ||= pj && !this.lastPadJump;
            action ||= pa && !this.lastPadAction;
            dash ||= pd && !this.lastPadDash;
            held ||= pj;
            this.lastPadJump = pj;
            this.lastPadAction = pa;
            this.lastPadDash = pd;
        }
        if (mode === 'top')
            jump = false;
        this.tapJump = this.tapAction = this.tapDash = false;
        return { x, y, jump, jumpHeld: held, interact: action, dash };
    }
}
