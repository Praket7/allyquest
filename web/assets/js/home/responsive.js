/* Approved responsive composition from most recently accepted home. */
export function attachHomeResponsive(scene) {
    const get = (id) => {
        const node = scene.querySelector(`#${id}`);
        if (!node)
            throw new Error(`Ally Quest scene missing ${id}`);
        return node;
    };
    const keys = ['landscape', 'tree-left', 'tree-right', 'brand', 'stars', 'nav-settings', 'main-logo', 'friends', 'foreground-grounding', 'nav-play', 'nav-map', 'nav-crew', 'nav-workshop', 'nav-daily'];
    const nodes = Object.fromEntries(keys.map(k => [k, get(k)]));
    const set = (key, transform) => nodes[key].setAttribute('transform', transform);
    let frame = 0;
    function resize() {
        frame = 0;
        const width = Math.max(250, window.innerWidth);
        const height = Math.max(300, window.innerHeight);
        const ratio = width / height;
        if (ratio >= 1.08) {
            document.body.classList.remove('portrait');
            const virtualWidth = Math.max(544, 350 * ratio);
            scene.setAttribute('viewBox', `${(544 - virtualWidth) / 2} 0 ${virtualWidth} 350`);
            scene.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            set('landscape', 'translate(0 0)');
            set('tree-left', 'translate(-20 109) scale(1 1)');
            set('tree-right', 'translate(562 94) scale(-1 1)');
            // HUD corners are anchored to the visible viewBox edges, not to
            // the original 544 px artwork. This keeps them in the corners
            // even on 21:9 and other wide displays.
            const visibleLeft = (544 - virtualWidth) / 2;
            const visibleRight = visibleLeft + virtualWidth;
            const hudLeft = visibleLeft + 9;
            const hudRight = visibleRight - 20;
            set('brand', `translate(${hudLeft - 24} 0)`);
            set('stars', `translate(${hudRight - 513 - 7} 0)`);
            set('nav-settings', `translate(${hudRight - 513} 0)`);
            set('main-logo', 'translate(39 7) scale(.85)');
            set('friends', 'translate(0 0)');
            set('foreground-grounding', 'translate(0 0)');
            // Equispaced navigation. Expanded on widescreens; the art stays editable.
            const spread = Math.min(1, Math.max(0, (virtualWidth - 544) / 142));
            set('nav-play', `translate(${-24 - 20 * spread} 0)`);
            set('nav-map', `translate(${-10 - 10 * spread} 0)`);
            set('nav-crew', 'translate(0 0)');
            set('nav-workshop', `translate(${10 + 10 * spread} 0)`);
            set('nav-daily', `translate(${21 + 23 * spread} 0)`);
        }
        else {
            document.body.classList.add('portrait');
            const h = 360 / ratio;
            scene.setAttribute('viewBox', `0 0 360 ${h}`);
            scene.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            set('landscape', 'translate(-110 145) scale(1.05)');
            // Re-anchor the illustrated trees to the ground on the portrait edges.
            set('tree-left', 'translate(100 109) scale(1 1)');
            set('tree-right', 'translate(450 94) scale(-1 1)');
            // On portrait displays the badge remains safely inside the left
            // edge; the two score/settings controls share a top baseline.
            set('brand', 'translate(-11 11) scale(.78)');
            set('stars', 'translate(-74 15) scale(.80)');
            set('nav-settings', 'translate(-63 14) scale(.78)');
            set('main-logo', `translate(-40 ${h * .125}) scale(.77)`);
            const charsY = Math.max(292, h * .40);
            set('friends', `translate(-5 ${charsY}) scale(.68)`);
            set('foreground-grounding', `translate(-5 ${charsY}) scale(.68)`);
            set('nav-play', `translate(29 ${h - 525}) scale(1.25)`);
            const rowY = h - 406;
            set('nav-map', `translate(-224 ${rowY}) scale(1.15)`);
            set('nav-crew', `translate(-228 ${rowY}) scale(1.15)`);
            set('nav-workshop', `translate(-234 ${rowY}) scale(1.15)`);
            set('nav-daily', `translate(-251 ${rowY}) scale(1.15)`);
        }
        scene.dataset.layout = ratio >= 1.08 ? 'landscape' : 'portrait';
        scene.dataset.viewport = `${width}x${height}`;
    }
    const observer = () => {
        if (!frame) {
            frame = requestAnimationFrame(() => { frame = 0; resize(); });
        }
    };
    window.addEventListener('resize', observer, { passive: true });
    resize();
    return () => {
        window.removeEventListener('resize', observer);
        if (frame)
            cancelAnimationFrame(frame);
    };
}
