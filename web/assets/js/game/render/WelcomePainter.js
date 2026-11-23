/* Procedural 2.5D Welcome Street scenery. It paints no collision geometry: the
   SideWorld physics objects remain the sole source of truth for gameplay. */
const PI2 = Math.PI * 2;
function noise(n) { const v = Math.sin(n * 113.7 + 67.3) * 72348.923; return v - Math.floor(v); }
export class WelcomePainter {
    c;
    constructor(c) {
        this.c = c;
    }
    box(x, y, w, h, fill, r = 0) { const c = this.c; c.fillStyle = fill; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
    oval(x, y, rx, ry, fill) { const c = this.c; c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, PI2); c.fill(); }
    line(x, y, xx, yy, col, width = 2) { const c = this.c; c.strokeStyle = col; c.lineWidth = width; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(xx, yy); c.stroke(); }
    poly(coords, color) { const c = this.c; c.fillStyle = color; c.beginPath(); coords.forEach(([x, y], i) => i === 0 ? c.moveTo(x, y) : c.lineTo(x, y)); c.closePath(); c.fill(); }
    background(w, h, cx, t, quiet) {
        const c = this.c;
        const g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#72bdf1');
        g.addColorStop(.55, '#bfe5ff');
        g.addColorStop(1, '#eff7d4');
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
        // Cloud silhouettes drift very slowly, with depth differing from game space.
        for (let i = 0; i < 12; i++) {
            const x = ((i * 269 + noise(i) * 72 - cx * .045 - (quiet ? 0 : t * 3.5)) % (w + 350) + (w + 350)) % (w + 350) - 110, y = h * .13 + noise(i + 12) * h * .22;
            const a = .34 + noise(i + 31) * .24;
            c.globalAlpha = a;
            this.oval(x, y, 72, 20, '#fff');
            this.oval(x - 33, y - 16, 34, 27, '#fff');
            this.oval(x + 12, y - 26, 40, 35, '#fff');
            this.oval(x + 58, y - 6, 28, 21, '#fff');
        }
        c.globalAlpha = 1;
        for (let layer = 0; layer < 3; layer++) {
            const factor = [.065, .11, .19][layer];
            const base = h * [.62, .71, .8][layer];
            const cols = ['#a6d7de', '#93cbbf', '#7fbe9c'];
            c.beginPath();
            c.moveTo(0, h);
            for (let x = -10; x <= w + 25; x += 24) {
                const y = base + Math.sin((x + cx * factor) * .004 + layer) * 18 + Math.sin((x + cx * factor) * .008) * 12;
                c.lineTo(x, y);
            }
            c.lineTo(w, h);
            c.closePath();
            c.fillStyle = cols[layer];
            c.fill();
            if (layer === 2) {
                for (let i = 0; i < 34; i++) {
                    let x = ((i * 111 - cx * .22) % (w + 260) + (w + 260)) % (w + 260) - 45;
                    const y = base - 12 + noise(i * 3) * 45;
                    this.line(x, y + 20, x, y - 13, '#729f8f', 4);
                    this.poly([[x - 15, y + 3], [x, y - 43], [x + 15, y + 3]], '#6eb496');
                    this.poly([[x - 12, y - 10], [x, y - 53], [x + 12, y - 10]], '#75bc97');
                }
            }
        }
    }
    // Buildings use a visible side face, pitched roof, trim, perspective shadows.
    building(x, y, w, h, type, t) {
        const c = this.c, d = 18;
        const wall = ['#f0d3a0', '#d98967', '#a9c9d9', '#e8c9ac', '#deb39d'][type % 5];
        const side = ['#c69e77', '#ae634c', '#739faf', '#b28e79', '#b78d7d'][type % 5];
        this.box(x - 12, y + h, w + 38, 8, 'rgba(34,75,72,.17)', 5);
        this.poly([[x + w, y], [x + w + d, y - 11], [x + w + d, y + h - 7], [x + w, y + h]], side);
        this.box(x, y, w, h, wall, 2);
        // Scaled masonry joints and bottom foundation.
        for (let yy = y + 24; yy < y + h - 8; yy += 22) {
            this.line(x + 7, yy, x + w - 6, yy, 'rgba(112,75,58,.12)', 1);
            for (let xx = x + 12 + ((yy - y) % 44 ? 11 : 0); xx < x + w; xx += 33)
                this.line(xx, yy, xx, yy + 10, 'rgba(112,75,58,.1)', 1);
        }
        this.box(x, y + h - 13, w, 13, '#b3a18c');
        this.line(x, y + h - 14, x + w, y + h - 14, '#fce5c7', 3);
        // The roof is a filled 2.5D volume rather than a floating roof outline.
        this.poly([[x - 19, y + 2], [x + w / 2, y - 43], [x + w + 20, y + 2]], '#516d8e');
        this.poly([[x - 19, y + 2], [x + w / 2, y - 43], [x + w / 2, y - 34], [x - 13, y + 11]], '#718faa');
        this.poly([[x + w / 2, y - 43], [x + w + 20, y + 2], [x + w + 11, y + 11], [x + w / 2, y - 34]], '#3d587a');
        for (let row = 0; row < 3; row++) {
            const yy = y - 31 + row * 9;
            this.line(x + w / 2 - (35 - row * 13), yy, x + w / 2 + (35 - row * 13), yy, 'rgba(220,236,245,.18)', 1.1);
        }
        this.line(x - 16, y + 1, x + w + 16, y + 1, '#f8efdc', 5);
        this.poly([[x + w + 15, y], [x + w + 28, y - 7], [x + w + 25, y + 1], [x + w + 15, y + 8]], '#38516d');
        this.box(x + 7, y + 5, w - 14, 8, 'rgba(255,250,223,.22)', 4);
        for (let k = 0; k < 3; k++) {
            const winx = x + 20 + k * (w - 40) / 3, wy = y + 42;
            this.box(winx, wy, 28, 45, '#fff7dd', 3);
            this.box(winx + 4, wy + 4, 20, 35, '#68b3c9', 2);
            this.line(winx + 14, wy + 3, winx + 14, wy + 40, '#fff8dd', 2);
            this.line(winx + 3, wy + 21, winx + 26, wy + 21, '#fff9e4', 2);
            this.poly([[winx + 4, wy + 5], [winx + 10, wy + 5], [winx + 4, wy + 18]], 'rgba(255,255,255,.5)');
        }
        const doorX = x + w * .59, doorY = y + h - 69;
        this.box(doorX, doorY, 38, 58, '#fff5df', 5);
        this.box(doorX + 4, doorY + 5, 30, 50, '#527f91', 3);
        this.oval(doorX + 26, doorY + 34, 2.5, 2.5, '#f8c959');
        this.line(x - 14, y + 22, x + w + 18, y + 22, '#fff3dc', 6);
        if (type % 2) {
            this.box(x + 26, y + 101, w * .55, 12, '#fff4e6', 2);
            for (let k = 0; k < 7; k++)
                this.poly([[x + 27 + k * (w * .55 / 7), y + 101], [x + 27 + (k + .5) * (w * .55 / 7), y + 113], [x + 27 + (k + 1) * (w * .55 / 7), y + 101]], k % 2 ? '#f9efe3' : '#df8268');
        }
        for (let i = 0; i < Math.floor(w / 17); i++) {
            const xx = x + 7 + i * 17;
            this.oval(xx, y + h - 4, 14, 12, i % 2 ? '#4b976a' : '#6bb171');
        }
    }
    worldBehind(t, quiet, minX = -9999, maxX = 9999) {
        const c = this.c;
        // Architecture is scenic only and sits behind the actual gameplay colliders.
        if (-155 + 260 > minX && -155 < maxX)
            this.building(-155, 343, 260, 195, 0, t);
        if (290 + 245 > minX && 290 < maxX)
            this.building(290, 325, 245, 215, 1, t);
        if (740 + 224 > minX && 740 < maxX)
            this.building(740, 352, 224, 177, 2, t);
        if (1155 + 390 > minX && 1155 < maxX)
            this.school(1155, 256, 390, 283, t);
        if (1680 + 255 > minX && 1680 < maxX)
            this.building(1680, 341, 255, 204, 0, t);
        if (2210 + 285 > minX && 2210 < maxX)
            this.building(2210, 330, 285, 212, 4, t);
        if (2710 + 286 > minX && 2710 < maxX)
            this.building(2710, 346, 286, 195, 2, t);
        // Two-tier fence spans the empty spaces and grounds the structures.
        for (let i = Math.max(0, Math.floor((minX + 50) / 19)); i < Math.min(190, Math.ceil((maxX + 50) / 19)); i++) {
            const x = i * 19 - 50;
            this.line(x, 538, x, 503, '#f1e2c9', 6);
            this.poly([[x - 4, 504], [x, 494], [x + 4, 504]], '#fbefdb');
        }
        this.box(-50, 519, 3400, 7, '#ebdeca', 2);
        this.box(-50, 535, 3400, 7, '#ebdeca', 2);
        // Trees pivot at the roots, with separated canopies and subtle wind rotation.
        for (let i = 0; i < 29; i++) {
            const x = 100 + i * 117 + noise(i * 13) * 39;
            if (x < minX - 60 || x > maxX + 60)
                continue;
            const y = 543;
            const height = 125 + noise(i * 3) * 40;
            const size = 25 + noise(i + 7) * 12;
            this.tree(x, y, height, size, t + i * .43, quiet, i % 4 === 0);
        }
        for (let i = 0; i < 65; i++) {
            const x = 42 + i * 51, y = 551 + noise(i * 31) * 8;
            if (x < minX - 20 || x > maxX + 20)
                continue;
            this.oval(x, y, 10 + noise(i + 4) * 10, 7, i % 3 ? '#69b97a' : '#4d9f70');
        }
    }
    school(x, y, w, h, t) {
        const c = this.c;
        this.box(x - 35, y + h, w + 75, 10, 'rgba(44,74,72,.18)', 7);
        this.poly([[x + w, y], [x + w + 30, y - 23], [x + w + 30, y + h], [x + w, y + h]], '#a35547');
        this.box(x, y, w, h, '#bb6e56', 3);
        for (let yy = y + 19; yy < y + h; yy += 16) {
            this.line(x, yy, x + w, yy, '#cf876b', 1);
            for (let xx = x + ((yy - y) % 32 ? 11 : 0); xx < x + w; xx += 38)
                this.line(xx, yy, xx, yy + 13, '#a95e50', 1);
        }
        this.box(x + 14, y + 13, w - 28, 26, '#e4c4a2', 1);
        this.box(x - 8, y + 40, w + 16, 8, '#f6dfc0', 3);
        this.poly([[x - 26, y + 12], [x + w * .5, y - 64], [x + w + 24, y + 12]], '#536b86');
        this.poly([[x - 10, y + 5], [x + w * .5, y - 43], [x + w + 12, y + 5]], '#687d96');
        this.line(x - 23, y + 11, x + w + 23, y + 11, '#f8e2bf', 7);
        this.oval(x + w * .5, y + 20, 24, 24, '#fff8e5');
        this.oval(x + w * .5, y + 20, 19, 19, '#3b7097');
        this.oval(x + w * .5, y + 20, 15, 15, '#fbefd8');
        this.line(x + w * .5, y + 20, x + w * .5, y + 10, '#384e6c', 2);
        this.line(x + w * .5, y + 20, x + w * .5 + 8, y + 24, '#384e6c', 2);
        for (let i = 0; i < 5; i++) {
            const wx = x + 31 + i * 66;
            this.box(wx, y + 80, 36, 68, '#fff3d8', 3);
            this.box(wx + 5, y + 5 + 80, 26, 58, '#70b4c5', 2);
            this.line(wx + 18, y + 84, wx + 18, y + 146, '#f8f1d9', 3);
            this.line(wx + 5, y + 118, wx + 31, y + 118, '#f8f1d9', 3);
        }
        this.box(x + w * .41, y + h - 120, w * .2, 120, '#f4dbc0', 4);
        this.box(x + w * .43, y + h - 112, w * .16, 112, '#426d89', 3);
        this.box(x + w * .38, y + h - 15, w * .26, 15, '#ead2b4');
        for (let j = 0; j < 4; j++) {
            this.box(x + w * .33 - j * 7, y + h - 1 + j * 7, w * .36 + j * 14, 7, '#d3c3a9', 2);
        }
        this.box(x + w * .30, y + 147, w * .4, 34, '#f5e4c7', 6);
        c.font = '900 20px ui-rounded, system-ui';
        c.fillStyle = '#29476b';
        c.textAlign = 'center';
        c.fillText('WELCOME STREET', x + w / 2, y + 171);
        c.textAlign = 'start';
        const sway = Math.sin(t * 2) * 3;
        this.line(x + w * .5, y - 63, x + w * .5, y - 98, '#886748', 3);
        this.poly([[x + w * .5, y - 97], [x + w * .5 + 48, y - 97 + sway], [x + w * .5 + 44, y - 85 + sway], [x + w * .5, y - 85]], '#ffbb56');
    }
    tree(x, y, h, r, t, quiet, pine) {
        const c = this.c;
        const sway = quiet ? 0 : Math.sin(t * .8) * 2.6;
        this.oval(x + 6, y + 2, r * .9, 5, 'rgba(49,79,48,.16)');
        this.poly([[x - 7, y], [x - 5, y - h * .8], [x + 3 + sway, y - h * .94], [x + 10, y], [x + 4, y + 3]], '#92653e');
        this.line(x, y - h * .65, x - r * .8 + sway, y - h * .80, '#86613c', 5);
        this.line(x, y - h * .6, x + r * .7 + sway, y - h * .79, '#86613c', 4);
        c.save();
        c.translate(sway, 0);
        if (pine) {
            for (let k = 0; k < 4; k++) {
                const yy = y - h * .95 + k * 21;
                this.poly([[x, yy - 37], [x - r * (1 + k * .22), yy + 18], [x + r * (1 + k * .22), yy + 18]], k % 2 ? '#318d66' : '#4caa78');
            }
        }
        else {
            const leaves = ['#3b9862', '#51a96e', '#65b975', '#78c57b', '#8ccc7b', '#a4d987'];
            const clusters = [[-.58, -.86, .73], [-.08, -1.10, .8], [.57, -.94, .8], [.9, -.75, .65], [-.9, -.69, .55], [.02, -.77, .92], [.3, -1.25, .6], [-.4, -1.2, .55], [.1, -.55, .54]];
            for (let k = 0; k < clusters.length; k++) {
                const [px, py, scale] = clusters[k];
                const xx = x + px * r, yy = y + py * h;
                const gr = c.createRadialGradient(xx - r * .25, yy - r * .28, 2, xx, yy, r * scale);
                gr.addColorStop(0, leaves[Math.min(5, k % 6 + 1)]);
                gr.addColorStop(.65, leaves[k % 5]);
                gr.addColorStop(1, leaves[Math.max(0, k % 4)]);
                this.oval(xx, yy, r * scale, r * scale * .76, gr);
            }
            for (let k = 0; k < 22; k++) {
                const xx = x + (noise(k * 7 + x) - .5) * r * 2.3, yy = y - h * (.60 + .63 * noise(k * 11 + x));
                this.oval(xx, yy, 2 + noise(k + 9) * 2.7, 1.1 + noise(k + 13) * 1.2, k % 4 ? '#b3db7b' : '#e2eaa3');
            }
        }
        c.restore();
    }
    platform(p) {
        const moving = Boolean(p.moving), ground = p.id.startsWith('ground');
        const c = this.c;
        if (ground) {
            this.box(p.x, p.y, p.w, Math.max(p.h, 900), '#916c54', 1);
            this.box(p.x, p.y, p.w, 8, '#8ccc4b', 2);
            const g = c.createLinearGradient(0, p.y, 0, p.y + 70);
            g.addColorStop(0, '#bca07c');
            g.addColorStop(1, '#936e55');
            this.box(p.x, p.y + 8, p.w, 90, '#ad8564');
            for (let yy = p.y + 17; yy < p.y + Math.max(p.h, 650); yy += 28) {
                this.line(p.x + 3, yy, p.x + p.w - 3, yy, 'rgba(75,55,47,.27)', 2);
                for (let xx = p.x + (yy % 56 ? 10 : 24); xx < p.x + p.w; xx += 68)
                    this.line(xx, yy, xx + 10, yy + 27, 'rgba(68,55,47,.23)', 2);
            }
            this.box(p.x, p.y + 3, p.w, 10, '#599e52', 2);
            for (let i = Math.ceil(p.x / 29) * 29; i < p.x + p.w; i += 29) {
                this.oval(i, p.y + 3, 17, 6, i % 3 === 0 ? '#8bcd55' : '#6bb34f');
            }
            for (let i = Math.ceil(p.x / 62) * 62; i < p.x + p.w; i += 62) {
                this.oval(i, p.y + 40, 6, 3, 'rgba(255,237,197,.2)');
                this.oval(i + 18, p.y + 84, 4, 2, 'rgba(74,55,50,.16)');
            }
        }
        else {
            this.box(p.x + 8, p.y + 11, p.w - 11, 14, 'rgba(38,67,55,.24)', 4);
            this.poly([[p.x, p.y + 9], [p.x + 9, p.y + 16], [p.x + p.w + 8, p.y + 16], [p.x + p.w, p.y + 9]], moving ? '#347da4' : '#795a49');
            this.box(p.x, p.y + 5, p.w, 15, moving ? '#4189a6' : '#936c53', 5);
            this.box(p.x, p.y, p.w, 11, moving ? '#60c5d7' : '#83bf51', 6);
            for (let i = 0; i < 3; i++) {
                this.oval(p.x + 15 + i * (p.w - 30) / 2, p.y + 16, 2.3, 2.3, '#e8f5d3');
            }
            if (!moving) {
                for (let i = 1; i < 6; i++)
                    this.line(p.x + i * p.w / 6, p.y + 8, p.x + i * p.w / 6 - 3, p.y + 18, 'rgba(77,58,47,.3)', 1);
            }
        }
    }
    spring(x, y, w, t) {
        this.box(x - 3, y + 10, w + 6, 8, '#415b72', 3);
        for (let i = 0; i < 4; i++)
            this.line(x + 5 + i * 13, y + 10, x + 11 + i * 13, y - 2, '#d99a3c', 3);
        this.box(x, y - 6, w, 12, '#4189c6', 7);
        this.box(x + 4, y - 9, w - 8, 7, '#ffd569', 4);
        this.line(x + 10, y - 6, x + w - 12, y - 6, '#fffbd0', 2);
    }
    hero(p, grounded, t) {
        const c = this.c;
        const running = Math.abs(p.vx) > 50;
        const air = !grounded;
        const cycle = t * (running ? 16 : 3);
        const step = running ? Math.sin(cycle) : 0;
        const bob = running ? Math.abs(step) * 1.7 : Math.sin(t * 2) * .7;
        c.save();
        c.translate(p.x, p.y - bob);
        c.scale(p.vx < -10 ? -1 : 1, 1);
        this.oval(0, 3, 23, 6, 'rgba(35,67,60,.24)');
        c.save();
        c.translate(0, -22);
        if (air) {
            this.line(-7, 9, -21, 21, '#f3b78d', 7);
            this.line(6, 9, 23, 17, '#f3b78d', 7);
        }
        else {
            this.line(-7, 10, -9 - step * 10, 25 - Math.max(0, step) * 8, '#ad7048', 8);
            this.line(7, 10, 9 + step * 10, 25 - Math.max(0, -step) * 8, '#ad7048', 8);
        }
        const feet = air ? [[-22, 22], [21, 17]] : [[-9 - step * 10, 25 - Math.max(0, step) * 8], [9 + step * 10, 25 - Math.max(0, -step) * 8]];
        for (const [x, y] of feet) {
            this.box(x - 8, y - 6, 19, 10, '#eaf6fc', 5);
            this.box(x - 8, y, 19, 5, '#285b92', 4);
        }
        c.restore();
        // backpack with highlights and layered clothing
        this.box(-24, -50, 22, 36, '#245c90', 9);
        this.box(-26, -41, 9, 22, '#1c416c', 4);
        this.box(-23, -48, 8, 9, '#ecb254', 3);
        const cloth = c.createLinearGradient(-12, -49, 22, -8);
        cloth.addColorStop(0, '#50b2c8');
        cloth.addColorStop(.62, '#2796b3');
        cloth.addColorStop(1, '#186d9c');
        this.box(-15, -48, 35, 38, cloth, 13); // overwritten below by gradient fill through c
        c.fillStyle = cloth;
        c.beginPath();
        c.roundRect(-15, -48, 35, 38, 13);
        c.fill();
        this.line(-7, -44, 2, -32, '#8cdae1', 2);
        this.line(8, -44, 12, -34, '#8cdae1', 2);
        this.line(-10, -37, -20 + (running ? step * 9 : 0), -22 + (air ? -9 : 0), '#f0b58e', 7);
        this.line(14, -37, 22 - (running ? step * 9 : 0), -22 + (air ? -13 : 0), '#f1b991', 7);
        this.oval(-20 + (running ? step * 9 : 0), -22 + (air ? -9 : 0), 4.4, 4.5, '#f5c39b');
        this.oval(22 - (running ? step * 9 : 0), -22 + (air ? -13 : 0), 4.2, 4.4, '#f5c39b');
        // fully rounded child-like head
        const face = c.createRadialGradient(-5, -71, 3, 4, -68, 28);
        face.addColorStop(0, '#ffe4bf');
        face.addColorStop(.67, '#f9c79b');
        face.addColorStop(1, '#e8a77c');
        this.oval(0, -66, 24, 25, face);
        c.fillStyle = face;
        c.beginPath();
        c.ellipse(0, -66, 24, 25, 0, 0, PI2);
        c.fill();
        this.oval(-22, -62, 5.7, 7, '#f5bd8e');
        this.oval(20, -64, 4.5, 6, '#edb18a');
        this.oval(-12, -58, 5, 3, 'rgba(235,116,95,.22)');
        this.oval(13, -56, 5, 3, 'rgba(229,103,92,.20)');
        // messy hair has nested volume, no oval skin above it.
        this.oval(-7, -86, 22, 12, '#653923');
        this.oval(7, -87, 19, 11, '#6e3c25');
        this.oval(-18, -80, 10, 10, '#78432b');
        this.oval(18, -80, 9, 9, '#6e3e2b');
        for (let k = 0; k < 5; k++) {
            const xx = -17 + k * 9;
            this.oval(xx, -90 + noise(k + 2) * 5, 7 + noise(k) * 4, 7, '#844c2e');
            this.line(xx - 3, -92, xx + 1, -95, '#b97943', 1.7);
        }
        for (let k = 0; k < 2; k++) {
            const x = -7 + k * 13;
            this.oval(x, -66, 5, 7, '#fffdf6');
            this.oval(x + 1, -66, 2.4, 3.8, '#54332c');
            this.oval(x + 1.5, -68, 1.1, 1.4, 'white');
        }
        this.line(-11, -77, -5, -78, '#744532', 2);
        this.line(5, -77, 12, -75, '#744532', 2);
        this.oval(3, -59, 2.2, 1.5, '#e3a07b');
        c.fillStyle = '#843f3c';
        c.beginPath();
        c.moveTo(-5, -53);
        c.quadraticCurveTo(2, -46, 12, -54);
        c.quadraticCurveTo(8, -43, 2, -43);
        c.quadraticCurveTo(-5, -44, -5, -53);
        c.fill();
        this.line(-4, -53, 11, -53, '#fff6e8', 2.4);
        c.restore();
    }
    npc(x, y, t, id = 'maya') {
        const c = this.c;
        c.save();
        c.translate(x, y + Math.sin(t * 2 + id.length) * 1.5);
        this.oval(0, 1, 23, 5, 'rgba(21,72,54,.2)');
        this.line(-8, -18, -8, 0, '#424c70', 7);
        this.line(9, -18, 9, 0, '#424c70', 7);
        this.box(-18, -50, 35, 34, id === 'maya' ? '#ab77cc' : id === 'leo' ? '#61b2b6' : '#b1a5e6', 11);
        this.line(-16, -37, -26, -24, '#b37c5c', 8);
        this.line(17, -37, 24, -27, '#bb8967', 8);
        this.oval(0, -67, 23, 24, id === 'maya' ? '#dca77c' : '#f7c79d');
        const hair = id === 'maya' ? '#493026' : id === 'leo' ? '#ad6131' : '#29232d';
        if (id === 'maya') {
            for (let i = 0; i < 8; i++)
                this.oval(-23 + i * 6, -83 + Math.sin(i * 2) * 3, 10, 9, hair);
            this.line(-20, -88, 18, -88, '#a577d1', 4);
        }
        else if (id === 'leo') {
            this.oval(0, -87, 26, 9, '#2469b1');
            this.box(-24, -87, 42, 8, '#237cc1', 5);
        }
        else {
            this.oval(0, -84, 24, 12, hair);
            this.oval(-17, -66, 7, 25, hair);
        }
        for (const xx of [-8, 8]) {
            this.oval(xx, -66, 5, 6, 'white');
            this.oval(xx + 1, -65, 2.5, 3.6, '#50352c');
        }
        if (id === 'maya') {
            for (const xx of [-8, 8]) {
                c.strokeStyle = '#9366ca';
                c.lineWidth = 3;
                c.beginPath();
                c.arc(xx, -66, 8, 0, PI2);
                c.stroke();
            }
            this.line(-1, -66, 1, -66, '#9e78d7', 3);
        }
        this.line(-7, -53, 6, -52, '#85463d', 2);
        c.restore();
    }
    foreground(w, h, t, quiet) {
        const c = this.c;
        // Restricted to thin bottom corners so interactive objects remain unobstructed.
        for (let i = 0; i < 24; i++) {
            const x = (i < 12 ? i * 28 : w - (i - 11) * 25), y = h + 5;
            c.save();
            c.translate(x, y);
            c.rotate((i % 2 ? 1 : -1) * .2 + (quiet ? 0 : Math.sin(t * .75 + i) * .03));
            this.poly([[0, 0], [-7, -14], [-4, -31], [5, -17], [11, -28], [10, 0]], i % 3 ? 'rgba(37,117,73,.58)' : 'rgba(82,155,74,.55)');
            c.restore();
        }
    }
}
