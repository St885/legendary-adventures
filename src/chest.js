import { overlaps } from './collision.js';

const W = 24, H = 16;

function makeChest(room, cx, cy) {
    return {
        room, cx, cy,
        w: W, h: H,
        open: false,

        get x() { return this.cx - W / 2; },
        get y() { return this.cy - H / 2; },

        checkOpen(player) {
            if (this.open) return false;
            if (overlaps(player, this)) {
                this.open = true;
                return true;
            }
            return false;
        },

        draw(ctx) {
            const { cx, cy, open } = this;

            if (!open) {
                const t     = performance.now() / 1000;
                const pulse = 0.5 + Math.sin(t * 1.8) * 0.4;

                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.32)';
                ctx.fillRect(cx - 12, cy + 9, 24, 5);

                // Body
                ctx.fillStyle = '#7a4010';
                ctx.fillRect(cx - 12, cy - 2, 24, 14);
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(cx - 4,  cy - 2, 3, 14);
                ctx.fillRect(cx + 3,  cy - 2, 3, 14);

                // Lid
                ctx.fillStyle = '#5a2e08';
                ctx.fillRect(cx - 12, cy - 12, 24, 10);
                ctx.fillStyle = 'rgba(255,255,255,0.14)';
                ctx.fillRect(cx - 11, cy - 11, 22, 3);

                // Rim strip
                ctx.fillStyle = '#c8a040';
                ctx.fillRect(cx - 12, cy - 2, 24, 3);

                // Lock
                ctx.fillStyle = '#c8a040';
                ctx.fillRect(cx - 3, cy - 6, 6, 7);
                ctx.fillStyle = '#5a2e08';
                ctx.fillRect(cx - 1, cy - 4, 3, 4);

                // Pulse glow ring
                ctx.strokeStyle = `rgba(200,160,64,${0.12 + pulse * 0.22})`;
                ctx.lineWidth   = 1.5;
                ctx.beginPath();
                ctx.arc(cx, cy - 1, 20 + pulse * 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.lineWidth = 1;

            } else {
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.32)';
                ctx.fillRect(cx - 12, cy + 9, 24, 5);

                // Lid open (leaning back)
                ctx.fillStyle = '#5a2e08';
                ctx.fillRect(cx - 12, cy - 26, 24, 9);
                ctx.fillStyle = 'rgba(255,215,0,0.15)';
                ctx.fillRect(cx - 11, cy - 25, 22, 7);
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(cx - 11, cy - 26, 22, 2);

                // Body
                ctx.fillStyle = '#7a4010';
                ctx.fillRect(cx - 12, cy - 2, 24, 14);

                // Interior
                ctx.fillStyle = '#1a0800';
                ctx.fillRect(cx - 10, cy - 1, 20, 11);
                ctx.fillStyle = 'rgba(255,215,0,0.28)';
                ctx.fillRect(cx - 7,  cy + 2, 10, 4);
                ctx.fillStyle = 'rgba(255,255,255,0.18)';
                ctx.fillRect(cx - 5,  cy + 2,  4, 2);

                // Rim strip
                ctx.fillStyle = '#c8a040';
                ctx.fillRect(cx - 12, cy - 2, 24, 3);
            }
        },

        reset() {
            this.open = false;
        },
    };
}

// H2: curación si HP < máximo  |  H3: efecto visual / atmosférico
export const chestH2 = makeChest('H2', 560, 300);
export const chestH3 = makeChest('H3', 130, 290);
