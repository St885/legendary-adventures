import { game, CANVAS_W, CANVAS_H } from './game.js';
import { player } from './player.js';

export function drawHUD(ctx) {
    _drawHealth(ctx);
    _drawItems(ctx);
    _drawCrystals(ctx);
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
    const hasSword  = player.hasSword;
    const hasShield = player.hasShield;
    const recharging = hasShield && player.shieldCooldown > 0;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 48, 96, 40);

    // --- Sword icon ---
    ctx.save();
    ctx.translate(34, 68);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = hasSword ? '#f0c040' : 'rgba(110,110,110,0.4)';
    ctx.fillRect(-2, -12, 4, 22);   // blade
    ctx.fillStyle = hasSword ? '#c89820' : 'rgba(90,90,90,0.4)';
    ctx.fillRect(-7, -1, 14, 3);    // guard
    ctx.fillStyle = hasSword ? '#8b5e2a' : 'rgba(80,80,80,0.35)';
    ctx.fillRect(-2, 9, 4, 6);      // handle
    if (hasSword) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(-1, -12, 2, 9); // highlight
    }
    ctx.restore();

    // --- Shield icon (heater shape) ---
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
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = hasSword ? '#f0e090' : 'rgba(140,140,140,0.55)';
    ctx.fillText('ESP', 34, 83);
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

function _drawControls(ctx) {
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.font = '11px monospace';
    ctx.fillText('WASD/↑↓←→   Space: espada   P: pausa   R: reiniciar', 10, CANVAS_H - 10);
}
