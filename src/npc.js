import { CANVAS_W } from './game.js';

const DIALOG_RANGE = 55;

export const npc = {
    room: 'H1',
    cx: 200,
    cy: 150,
    _chimed: false,

    isNear(player) {
        const dx = (player.x + player.w / 2) - this.cx;
        const dy = (player.y + player.h / 2) - this.cy;
        return dx * dx + dy * dy < DIALOG_RANGE * DIALOG_RANGE;
    },

    draw(ctx) {
        const t   = performance.now() / 1000;
        const bob = Math.sin(t * 1.4) * 1.5;
        const cx  = this.cx, cy = this.cy;

        // Shadow at feet
        ctx.strokeStyle = 'rgba(160,120,255,0.28)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 15 + bob, 10, 4, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Staff (wooden shaft)
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(cx + 9, cy - 16 + bob, 3, 30);

        // Staff orb — glowing tip
        ctx.shadowColor = '#a0e0ff';
        ctx.shadowBlur  = 8;
        ctx.fillStyle   = '#a0e0ff';
        ctx.fillRect(cx + 8, cy - 21 + bob, 5, 6);
        ctx.shadowBlur  = 0;

        // Robe (body)
        ctx.fillStyle = '#2a1560';
        ctx.fillRect(cx - 7, cy - 4 + bob, 16, 19);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(cx - 6, cy - 3 + bob, 4, 10);

        // Head (flesh)
        ctx.fillStyle = '#c8845a';
        ctx.fillRect(cx - 5, cy - 16 + bob, 11, 14);

        // Hood
        ctx.fillStyle = '#1a0060';
        ctx.fillRect(cx - 6, cy - 18 + bob, 14, 7);

        // Beard
        ctx.fillStyle = 'rgba(235,235,235,0.85)';
        ctx.fillRect(cx - 3, cy - 5 + bob, 8, 4);

        // Eyes
        ctx.fillStyle = '#1a0a00';
        ctx.fillRect(cx - 2, cy - 13 + bob, 2, 2);
        ctx.fillRect(cx + 3, cy - 13 + bob, 2, 2);

        ctx.lineWidth = 1;
    },

    drawDialog(ctx) {
        const bw = 380, bh = 64;
        const rx = Math.max(8, Math.min(this.cx - Math.floor(bw / 2), CANVAS_W - bw - 8));
        const ry = Math.max(8, this.cy - 98);

        // Box background + border
        ctx.fillStyle   = 'rgba(0,0,0,0.82)';
        ctx.fillRect(rx, ry, bw, bh);
        ctx.strokeStyle = 'rgba(160,120,255,0.65)';
        ctx.lineWidth   = 1.5;
        ctx.strokeRect(rx, ry, bw, bh);
        ctx.lineWidth   = 1;

        // Arrow pointing down toward the NPC
        const ax = Math.min(Math.max(this.cx, rx + 14), rx + bw - 14);
        ctx.fillStyle = 'rgba(0,0,0,0.82)';
        ctx.beginPath();
        ctx.moveTo(ax - 7, ry + bh);
        ctx.lineTo(ax + 7, ry + bh);
        ctx.lineTo(ax,     ry + bh + 9);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(160,120,255,0.65)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(ax - 7, ry + bh);
        ctx.lineTo(ax,     ry + bh + 9);
        ctx.lineTo(ax + 7, ry + bh);
        ctx.stroke();

        // NPC name
        ctx.fillStyle  = '#c8a0ff';
        ctx.font       = 'bold 11px monospace';
        ctx.textAlign  = 'left';
        ctx.fillText('Anciano del Bosque', rx + 10, ry + 16);

        // Dialog lines
        ctx.fillStyle = '#e8e8e8';
        ctx.font      = '12px monospace';
        ctx.fillText('“Tres gemas aguardan en el bosque…”',             rx + 10, ry + 35);
        ctx.fillText('“Reúnelas y la Puerta del Santuario se abrirá.”', rx + 10, ry + 53);

        ctx.textAlign = 'left';
    },

    reset() {
        this._chimed = false;
    },
};
