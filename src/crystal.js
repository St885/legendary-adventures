import { game } from './game.js';
import { overlaps } from './collision.js';

// Safe spawn positions per room — manually validated against all obstacles,
// exit zones (80px buffer) and fixed pickup locations.
const POOLS = {
    H1: [[180,180],[672,126],[444,414],[264,306],[816,288],[504,126],[264,441]],
    H2: [[240,162],[672,180],[234,324],[678,324],[480,144],[192,477],[672,387]],
    H3: [[420,279],[240,279],[660,279],[360,144],[576,140],[240,432],[660,441]],
};

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeGem(id) {
    return {
        id,
        room: null,
        cx: 0,
        cy: 0,

        get collected() { return game.collectedIds.has(this.id); },
        get aabb() { return { x: this.cx - 10, y: this.cy - 10, w: 20, h: 20 }; },

        draw(ctx) {
            if (this.collected) return;
            const cx = this.cx, cy = this.cy;
            const t = performance.now() / 1000;
            const pulse = 0.5 + Math.sin(t * 2.8) * 0.3;

            // Pulsing outer ring
            ctx.strokeStyle = `rgba(0,191,255,${0.15 + pulse * 0.25})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, 15 + pulse * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 1;

            // Gem glow
            ctx.shadowColor = '#00BFFF';
            ctx.shadowBlur = 8 + pulse * 10;

            // Gem body — 6-point cut diamond
            ctx.beginPath();
            ctx.moveTo(cx,     cy - 11);
            ctx.lineTo(cx + 8, cy - 3);
            ctx.lineTo(cx + 9, cy + 2);
            ctx.lineTo(cx,     cy + 12);
            ctx.lineTo(cx - 9, cy + 2);
            ctx.lineTo(cx - 8, cy - 3);
            ctx.closePath();
            ctx.fillStyle = '#00BFFF';
            ctx.fill();
            ctx.shadowBlur = 0;

            // Upper facet (lighter)
            ctx.beginPath();
            ctx.moveTo(cx,     cy - 11);
            ctx.lineTo(cx + 8, cy - 3);
            ctx.lineTo(cx,     cy - 3);
            ctx.lineTo(cx - 8, cy - 3);
            ctx.closePath();
            ctx.fillStyle = 'rgba(180,240,255,0.65)';
            ctx.fill();

            // Top highlight
            ctx.beginPath();
            ctx.moveTo(cx - 3, cy - 3);
            ctx.lineTo(cx + 3, cy - 3);
            ctx.lineTo(cx,     cy - 9);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255,255,255,0.70)';
            ctx.fill();

            // Bottom facet (darker)
            ctx.beginPath();
            ctx.moveTo(cx - 9, cy + 2);
            ctx.lineTo(cx + 9, cy + 2);
            ctx.lineTo(cx,     cy + 12);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0,80,140,0.35)';
            ctx.fill();
        },

        checkCollect(player) {
            if (this.collected) return false;
            if (overlaps(player, this.aabb)) {
                game.collectedIds.add(this.id);
                game.crystalsCollected = game.collectedIds.size;
                return true;
            }
            return false;
        },
    };
}

// One gem per room (H1/H2/H3) — assigned on each reset via resetCrystals()
export const crystals = [
    makeGem('C1'),
    makeGem('C2'),
    makeGem('C3'),
];

export function resetCrystals() {
    const rooms = ['H1', 'H2', 'H3'];
    rooms.forEach((room, i) => {
        const [cx, cy] = shuffle([...POOLS[room]])[0];
        crystals[i].room = room;
        crystals[i].cx   = cx;
        crystals[i].cy   = cy;
    });
}
