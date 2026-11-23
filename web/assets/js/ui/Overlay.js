/** Accessible modal host; only approved home SVG changes are event listeners. */
export class Overlay {
    previousFocus = null;
    backdrop = document.getElementById('panel-backdrop');
    content = document.getElementById('panel-content');
    closeButton = document.getElementById('close-panel');
    toast = document.getElementById('toast');
    toastTimer;
    constructor() {
        this.closeButton.addEventListener('click', () => this.close());
        this.backdrop.addEventListener('pointerdown', (event) => { if (event.target === this.backdrop)
            this.close(); });
        document.addEventListener('keydown', (event) => {
            if (!this.isOpen())
                return;
            if (event.key === 'Escape') {
                event.preventDefault();
                this.close();
                return;
            }
            if (event.key !== 'Tab')
                return;
            const focusable = Array.from(this.backdrop.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href], [tabindex="0"]')).filter(el => el.getClientRects().length);
            if (!focusable.length)
                return;
            const index = focusable.indexOf(document.activeElement);
            if (event.shiftKey && index <= 0) {
                event.preventDefault();
                focusable.at(-1)?.focus();
            }
            else if (!event.shiftKey && (index === focusable.length - 1 || index === -1)) {
                event.preventDefault();
                focusable[0]?.focus();
            }
        });
    }
    isOpen() { return this.backdrop.classList.contains('open'); }
    open(title, markup) {
        this.previousFocus = document.activeElement;
        const h = document.createElement('h2');
        h.id = 'panel-title';
        h.textContent = title;
        this.content.replaceChildren();
        const header = document.createElement('header');
        header.className = 'panel-head';
        header.appendChild(h);
        this.content.appendChild(header);
        const body = document.createElement('div');
        body.innerHTML = markup;
        this.content.appendChild(body);
        this.backdrop.classList.add('open');
        this.backdrop.setAttribute('aria-hidden', 'false');
        this.closeButton.focus();
        return body;
    }
    close() { this.backdrop.classList.remove('open'); this.backdrop.setAttribute('aria-hidden', 'true'); this.content.replaceChildren(); this.previousFocus?.focus(); }
    alert(text) { this.toast.textContent = text; this.toast.classList.add('show'); clearTimeout(this.toastTimer); this.toastTimer = window.setTimeout(() => this.toast.classList.remove('show'), 2100); }
}
