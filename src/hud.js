import { game, CANVAS_W, CANVAS_H } from './game.js';
import { player } from './player.js';

export function drawHUD(ctx, { chestsOpened = 0 } = {}) {
    _drawHealth(ctx);
    _drawItems(ctx);
    _drawCrystals(ctx);
    _drawChests(ctx, chestsOpened);
    _drawControls(ctx);
}

function _drawHealth(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 96, 34);

    for (let i = 0; i < player.maxHp; i++) {
        const cx = 28 + i * 28;
        const cy = 27;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 4);
        if (i < player.hp) {
            ctx.fillStyle = '#e83030';
            ctx.fillRect(-8, -8, 16, 16);
            ctx.fillStyle = 'rgba(255,180,180,0.45)';
            ctx.fillRect(-2, -8, 4, 8);
        } else {
            ctx.strokeStyle = 'rgba(200,80,80,0.45)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-8, -8, 16, 16);
            ctx.lineWidth = 1;
        }
        ctx.restore();
    }
    ctx.restore();
}

function _drawItems(ctx) {
    const weapon     = player.weapon;
    const hasShield  = player.hasShield;
    const recharging = hasShield && player.shieldCooldown > 0;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 48, 96, 40);

    // --- Active weapon icon (left slot) ---
    ctx.save();
    ctx.translate(34, 68);
    if (weapon === 'sword') {
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#f0c040';
        ctx.fillRect(-2, -12, 4, 22);
        ctx.fillStyle = '#c89820';
        ctx.fillRect(-7,  -1, 14,  3);
        ctx.fillStyle = '#8b5e2a';
        ctx.fillRect(-2,   9,  4,  6);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(-1, -12,  2,  9);
    } else if (weapon === 'bow') {
        ctx.strokeStyle = '#8b5e2a';
        ctx.lineWidth   = 2.5;
        ctx.beginPath();
        ctx.moveTo(-3, -11);
        ctx.quadraticCurveTo(8, 0, -3, 11);
        ctx.stroke();
        ctx.strokeStyle = '#e8d8a0';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(-3, -11);
        ctx.lineTo(-3, 11);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.fillStyle = '#c8a040';
        ctx.fillRect(-10, -1, 14, 2);
        ctx.fillStyle = '#e8e8c0';
        ctx.fillRect(  4, -2,  3, 4);
    } else if (weapon === 'staff') {
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(-2, -12, 4, 24);
        ctx.shadowColor = '#a060ff';
        ctx.shadowBlur  = 6;
        ctx.fillStyle   = '#a060ff';
        ctx.beginPath();
        ctx.arc(0, -14, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(-2, -16, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    } else {
        // No weapon — dim dash
        ctx.strokeStyle = 'rgba(120,120,120,0.3)';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo( 7, 0);
        ctx.stroke();
        ctx.lineWidth = 1;
    }
    ctx.restore();

    // --- Shield icon (unchanged) ---
    const shieldColor = !hasShield  ? 'rgba(90,90,90,0.35)'
                      : recharging  ? 'rgba(64,128,192,0.35)'
                      :               '#4080c0';
    ctx.save();
    ctx.translate(72, 68);
    ctx.fillStyle = shieldColor;
    ctx.beginPath();
    ctx.moveTo(-9, -11);
    ctx.lineTo( 9, -11);
    ctx.lineTo( 9,   3);
    ctx.lineTo( 0,  12);
    ctx.lineTo(-9,   3);
    ctx.closePath();
    ctx.fill();
    if (hasShield && !recharging) {
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fillRect(-1, -9, 2, 17);
        ctx.fillRect(-7, -2, 14, 2);
    }
    ctx.restore();

    // Labels
    const weaponLabel = weapon === 'sword' ? 'ESP'
                      : weapon === 'bow'   ? 'ARC'
                      : weapon === 'staff' ? 'BAS'
                      : '  -';
    const weaponColor = weapon === 'sword' ? '#f0e090'
                      : weapon === 'bow'   ? '#e0a060'
                      : weapon === 'staff' ? '#c090ff'
                      : 'rgba(140,140,140,0.55)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = weaponColor;
    ctx.fillText(weaponLabel, 34, 83);
    ctx.fillStyle = !hasShield  ? 'rgba(140,140,140,0.55)'
                  : recharging  ? 'rgba(100,150,200,0.6)'
                  :               '#80c0ff';
    ctx.fillText('ESC', 72, 83);
    ctx.textAlign = 'left';

    ctx.restore();
}

function _drawCrystals(ctx) {
    const total = 3;
    const n = game.crystalsCollected;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(CANVAS_W - 140, 10, 130, 40);

    for (let i = 0; i < total; i++) {
        const cx = CANVAS_W - 118 + i * 30;
        const cy = 30;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 4);
        if (i < n) {
            ctx.fillStyle = '#00BFFF';
            ctx.fillRect(-7, -7, 14, 14);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(-2, -7, 3, 7);
        } else {
            ctx.strokeStyle = 'rgba(150,160,200,0.6)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-7, -7, 14, 14);
            ctx.lineWidth = 1;
        }
        ctx.restore();
    }

    ctx.fillStyle = n === total ? '#FFD700' : '#c0d0ff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${n}/${total}`, CANVAS_W - 12, 35);
    ctx.textAlign = 'left';
    ctx.restore();
}

function _drawChests(ctx, chestsOpened) {
    const total = 2;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(CANVAS_W - 140, 54, 130, 30);

    for (let i = 0; i < total; i++) {
        const cx = CANVAS_W - 118 + i * 30;
        const cy = 69;

        if (i < chestsOpened) {
            // Open chest (mini)
            ctx.fillStyle = '#7a4010';
            ctx.fillRect(cx - 7, cy - 1, 14, 9);
            ctx.fillStyle = '#1a0800';
            ctx.fillRect(cx - 6, cy,     12, 7);
            ctx.fillStyle = 'rgba(255,215,0,0.55)';
            ctx.fillRect(cx - 3, cy + 2,  6, 3);
            ctx.fillStyle = '#5a2e08';
            ctx.fillRect(cx - 7, cy - 12, 14, 5);
            ctx.fillStyle = '#c8a040';
            ctx.fillRect(cx - 7, cy - 1,  14, 2);
        } else {
            // Closed chest (mini, dimmed)
            ctx.fillStyle = 'rgba(70,40,10,0.55)';
            ctx.fillRect(cx - 7, cy - 1, 14, 9);
            ctx.fillStyle = 'rgba(50,28,6,0.55)';
            ctx.fillRect(cx - 7, cy - 7, 14, 6);
            ctx.fillStyle = 'rgba(150,120,40,0.5)';
            ctx.fillRect(cx - 7, cy - 1, 14, 2);
            ctx.fillRect(cx - 2, cy - 4,  4, 5);
        }
    }

    ctx.fillStyle = chestsOpened === total ? '#FFD700' : '#c8a040';
    ctx.font      = 'bold 13px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${chestsOpened}/${total}`, CANVAS_W - 12, 73);
    ctx.textAlign = 'left';
    ctx.restore();
}

function _drawControls(ctx) {
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.font = '11px monospace';
    ctx.fillText('WASD/↑↓←→   Space: espada   P: pausa   R: reiniciar', 10, CANVAS_H - 10);
}
