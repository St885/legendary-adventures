import { game } from './game.js';
import { overlaps } from './collision.js';

export const door = {
    x: 420, y: 190, w: 120, h: 160,

    get isOpen() { return game.crystalsCollected >= 3 && game.bossDefeated; },

    draw(ctx) {
        if (this.isOpen) {
            const t = performance.now() / 1000;
            const pulse = 0.5 + Math.sin(t * 1.8) * 0.4;

            ctx.fillStyle = `rgba(255,215,0,${0.07 + pulse * 0.10})`;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = `rgba(255,255,200,${0.04 + pulse * 0.05})`;
            ctx.fillRect(this.x + 14, this.y + 14, this.w - 28, this.h - 28);

            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10 + pulse * 16;
            ctx.fillStyle = '#c8960a';
            ctx.fillRect(this.x,               this.y, 14,     this.h);
            ctx.fillRect(this.x + this.w - 14, this.y, 14,     this.h);
            ctx.fillRect(this.x,               this.y, this.w, 14);
            ctx.fillStyle = '#f0c040';
            ctx.fillRect(this.x + 5,          this.y + 5, 4, this.h - 10);
            ctx.fillRect(this.x + this.w - 9, this.y + 5, 4, this.h - 10);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.w, this.h);
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;

            const ex = this.x + this.w / 2;
            const ey = this.y + this.h / 2;
            ctx.save();
            ctx.translate(ex, ey);
            ctx.rotate(t * 0.6);
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#FFD700';
            for (let i = 0; i < 4; i++) {
                ctx.save();
                ctx.rotate(i * Math.PI / 2);
                ctx.fillRect(-2, -18, 4, 14);
                ctx.restore();
            }
            ctx.shadowBlur = 0;
            ctx.restore();

            ctx.save();
            ctx.translate(ex, ey);
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 8 + pulse * 6;
            ctx.fillStyle = '#FFF8C0';
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(7, 0);
            ctx.lineTo(0,  8);
            ctx.lineTo(-7, 0);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        } else {
            ctx.fillStyle = '#302410';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeStyle = '#5a4a20';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.w, this.h);
            ctx.lineWidth = 1;
            ctx.fillStyle = '#5a4520';
            ctx.fillRect(this.x + 53, this.y + 90, 14, 30);
            ctx.fillStyle = '#7a6030';
            ctx.fillRect(this.x + 50, this.y + 64, 20, 16);
            ctx.strokeStyle = '#9a7840';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + 60, this.y + 65, 9, Math.PI, 0);
            ctx.stroke();
            ctx.lineWidth = 1;
        }
    },

    toObstacle() {
        return this.isOpen ? null : { x: this.x, y: this.y, w: this.w, h: this.h };
    },

    checkVictory(player) {
        if (!this.isOpen) return;
        if (overlaps(player, this)) {
            game.state = 'WIN';
        }
    },
};
