import { overlaps } from './collision.js';

const HITBOX = 16;

function makePickup(id, room, cx, cy) {
    return {
        id, room, cx, cy,
        collected: false,

        get aabb() {
            return { x: this.cx - HITBOX, y: this.cy - HITBOX, w: HITBOX * 2, h: HITBOX * 2 };
        },

        draw(ctx) {
            if (this.collected) return;
            const t = performance.now() / 1000;
            const pulse = 0.5 + Math.sin(t * 2.2) * 0.4;

            if (this.id === 'sword') {
                // Pulsing glow rings
                ctx.strokeStyle = `rgba(240,192,64,${0.2 + pulse * 0.3})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.cx, this.cy, 16 + pulse * 4, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = `rgba(240,192,64,${0.08 + pulse * 0.12})`;
                ctx.beginPath();
                ctx.arc(this.cx, this.cy, 23 + pulse * 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.lineWidth = 1;

                ctx.shadowColor = '#f0c040';
                ctx.shadowBlur = 6 + pulse * 6;
                ctx.save();
                ctx.translate(this.cx, this.cy);
                ctx.rotate(-Math.PI / 4);
                // Blade
                ctx.fillStyle = '#f0c040';
                ctx.fillRect(-2, -14, 4, 24);
                // Guard
                ctx.fillStyle = '#c89820';
                ctx.fillRect(-8, -1, 16, 4);
                // Handle
                ctx.fillStyle = '#8b5e2a';
                ctx.fillRect(-2, 10, 4, 8);
                // Pommel
                ctx.fillStyle = '#c89820';
                ctx.fillRect(-3, 17, 6, 4);
                // Blade highlight
                ctx.fillStyle = 'rgba(255,255,255,0.55)';
                ctx.fillRect(-1, -14, 2, 10);
                ctx.restore();
                ctx.shadowBlur = 0;

            } else if (this.id === 'shield') {
                // Pulsing glow rings
                ctx.strokeStyle = `rgba(64,128,192,${0.2 + pulse * 0.3})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.cx, this.cy, 16 + pulse * 4, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = `rgba(64,128,192,${0.08 + pulse * 0.12})`;
                ctx.beginPath();
                ctx.arc(this.cx, this.cy, 23 + pulse * 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.lineWidth = 1;

                ctx.shadowColor = '#4080c0';
                ctx.shadowBlur = 6 + pulse * 6;
                ctx.fillStyle = '#4080c0';
                ctx.beginPath();
                ctx.moveTo(this.cx - 10, this.cy - 11);
                ctx.lineTo(this.cx + 10, this.cy - 11);
                ctx.lineTo(this.cx + 10, this.cy + 3);
                ctx.lineTo(this.cx,      this.cy + 13);
                ctx.lineTo(this.cx - 10, this.cy + 3);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;

                // Inner cross
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(this.cx - 1, this.cy - 9, 2, 18);
                ctx.fillRect(this.cx - 7, this.cy - 2, 14, 2);

                // Rim highlight
                ctx.strokeStyle = 'rgba(140,200,255,0.5)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(this.cx - 10, this.cy - 11);
                ctx.lineTo(this.cx + 10, this.cy - 11);
                ctx.lineTo(this.cx + 10, this.cy + 3);
                ctx.stroke();
                ctx.lineWidth = 1;

                // Center jewel
                ctx.fillStyle = '#ff6060';
                ctx.fillRect(this.cx - 2, this.cy - 4, 4, 4);
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.fillRect(this.cx - 1, this.cy - 4, 2, 2);
            }
        },

        checkPickup(player) {
            if (this.collected) return false;
            if (overlaps(player, this.aabb)) {
                this.collected = true;
                return true;
            }
            return false;
        },

        reset() {
            this.collected = false;
        },
    };
}

// Espada en H1 — recogida segura antes del primer combate
// Escudo en H3 — recompensa explorar la habitación más difícil
export const swordPickup  = makePickup('sword',  'H1', 500, 300);
export const shieldPickup = makePickup('shield', 'H3', 430, 380);
