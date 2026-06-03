import { CANVAS_W, CANVAS_H } from './game.js';

export function drawStart(ctx) {
    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
    ctx.lineWidth   = 1;
    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bg.addColorStop(0, '#0d1b2a');
    bg.addColorStop(0.6, '#1a2d4a');
    bg.addColorStop(1, '#0a1520');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const stars = [
        [80,60],[200,30],[350,90],[500,20],[650,70],[740,40],
        [120,180],[430,150],[580,200],[700,160],[50,280],[760,260],
        [160,340],[620,310],[90,450],[710,400],[300,480],[550,510],
    ];
    for (const [sx, sy] of stars) ctx.fillRect(sx, sy, 2, 2);

    ctx.textAlign = 'center';

    // Title
    ctx.shadowColor = 'rgba(255,215,0,0.5)';
    ctx.shadowBlur  = 18;
    ctx.fillStyle   = '#FFD700';
    ctx.font        = 'bold 52px serif';
    ctx.fillText('Legendary Adventures', CANVAS_W / 2, 180);
    ctx.shadowBlur  = 0;

    // Subtitle
    ctx.fillStyle = '#a8c8e8';
    ctx.font      = '15px monospace';
    ctx.fillText('Ayuda a Oliver a explorar el bosque encantado y completar su leyenda', CANVAS_W / 2, 220);

    // Separator
    ctx.strokeStyle = 'rgba(255,215,0,0.25)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2 - 230, 240);
    ctx.lineTo(CANVAS_W / 2 + 230, 240);
    ctx.stroke();

    // Controls — 4 lines at 18px spacing
    ctx.fillStyle = '#7a9ab8';
    ctx.font      = '14px monospace';
    ctx.fillText('Movimiento: WASD  ó  ← ↑ ↓ →',          CANVAS_W / 2, 268);
    ctx.fillText('Espacio: atacar con la espada',           CANVAS_W / 2, 286);
    ctx.fillText('P: pausar / reanudar la partida',         CANVAS_W / 2, 304);
    ctx.fillText('R: reiniciar partida en cualquier momento', CANVAS_W / 2, 322);

    // Quest summary
    ctx.fillStyle = '#c8e8a8';
    ctx.font      = '14px monospace';
    ctx.fillText('Recorre las 4 habitaciones del bosque y recoge las 3 gemas', CANVAS_W / 2, 350);
    ctx.fillText('Al reunirlas todas, la Puerta del Santuario se abrirá',      CANVAS_W / 2, 370);

    // Gem decorations x3
    for (let i = 0; i < 3; i++) {
        const cx = CANVAS_W / 2 - 40 + i * 40;
        ctx.strokeStyle = 'rgba(0,200,255,0.3)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.arc(cx, 408, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.save();
        ctx.translate(cx, 408);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = '#00BFFF';
        ctx.fillRect(-7, -7, 14, 14);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(-2, -7, 3, 7);
        ctx.restore();
    }

    // Story — 3 italic lines
    ctx.fillStyle = 'rgba(180,210,240,0.62)';
    ctx.font      = 'italic 13px serif';
    ctx.fillText('"Un bosque mágico oculta un antiguo secreto..."',    CANVAS_W / 2, 446);
    ctx.fillText('"Oliver, joven explorador, emprende su leyenda"',    CANVAS_W / 2, 464);
    ctx.fillText('"Tres gemas esperan ser halladas en la oscuridad"',  CANVAS_W / 2, 482);

    // CTA
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 20px monospace';
    ctx.fillText('▶  Presiona Enter para comenzar tu aventura', CANVAS_W / 2, 526);

    // Version
    ctx.fillStyle = 'rgba(100,130,160,0.45)';
    ctx.font      = '11px monospace';
    ctx.fillText('v1.5 · Legendary Adventures', CANVAS_W / 2, 578);

    ctx.textAlign = 'left';
}

export function drawWin(ctx, stats = {}, t = 0) {
    const { hp = 0, maxHp = 3, kills = 0, crystals = 3, talked = false, chestsOpened = 0 } = stats;

    // Full-screen dark overlay
    ctx.globalAlpha = 1;
    ctx.fillStyle   = '#000000';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Gold dots decoration
    ctx.fillStyle = 'rgba(255,215,0,0.45)';
    const dots = [
        [300,150],[500,130],[200,280],[600,260],[350,120],
        [450,320],[150,200],[650,180],[400,410],[250,370],
        [560,440],[170,460],[700,420],[420,90],[280,500],[600,500],
    ];
    for (const [px, py] of dots) ctx.fillRect(px, py, 3, 3);

    ctx.textAlign = 'center';

    // Title
    ctx.shadowColor = 'rgba(255,215,0,0.6)';
    ctx.shadowBlur  = 22;
    ctx.fillStyle   = '#FFD700';
    ctx.font        = 'bold 40px serif';
    ctx.fillText('¡Oliver ha completado su leyenda!', CANVAS_W / 2, 168);
    ctx.shadowBlur  = 0;

    // Subtitle
    ctx.fillStyle = '#a8d8ff';
    ctx.font      = '16px monospace';
    ctx.fillText('Las 3 gemas del bosque magico han sido reunidas', CANVAS_W / 2, 208);

    // Separator
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2 - 210, 230);
    ctx.lineTo(CANVAS_W / 2 + 210, 230);
    ctx.stroke();

    // Hearts label
    ctx.fillStyle = '#b8b8c8';
    ctx.font      = '13px monospace';
    ctx.fillText('Vida restante', CANVAS_W / 2, 256);

    // Hearts
    const hW = 18, hGap = 7;
    const hTotalW = maxHp * (hW + hGap) - hGap;
    const hx0 = Math.round(CANVAS_W / 2 - hTotalW / 2);
    for (let i = 0; i < maxHp; i++) {
        const hx = hx0 + i * (hW + hGap);
        ctx.fillStyle = i < hp ? '#ff3030' : '#2a2a3a';
        ctx.fillRect(hx, 264, hW, hW);
        if (i < hp) {
            ctx.fillStyle = 'rgba(255,255,255,0.28)';
            ctx.fillRect(hx + 2, 266, 6, 5);
        }
    }

    // Stats
    ctx.fillStyle = '#00d8ff';
    ctx.font      = '15px monospace';
    ctx.fillText('Gemas recogidas:     ' + crystals + ' / 3', CANVAS_W / 2, 306);
    ctx.fillStyle = '#ffaa44';
    ctx.fillText('Enemigos derrotados: ' + kills   + ' / 10', CANVAS_W / 2, 330);

    // Second separator
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2 - 210, 352);
    ctx.lineTo(CANVAS_W / 2 + 210, 352);
    ctx.stroke();

    // Three gem decorations (no save/rotate — use fillRect directly)
    const gemOffsets = [-50, 0, 50];
    for (const off of gemOffsets) {
        const gx = CANVAS_W / 2 + off;
        const gy = 396;
        ctx.strokeStyle = 'rgba(0,200,255,0.5)';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.arc(gx, gy, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
        // Diamond via polygon (no rotation transform needed)
        ctx.fillStyle = '#00BFFF';
        ctx.beginPath();
        ctx.moveTo(gx,      gy - 13);
        ctx.lineTo(gx + 13, gy);
        ctx.lineTo(gx,      gy + 13);
        ctx.lineTo(gx - 13, gy);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillRect(gx - 2, gy - 8, 4, 8);
    }

    // Performance message
    let perfColor, perfMsg;
    if (kills >= 10 && hp >= maxHp) {
        perfColor = '#FFD700';
        perfMsg   = 'Leyenda perfecta: todos vencidos sin perder vida';
    } else if (kills >= 10) {
        perfColor = '#ffaa44';
        perfMsg   = 'Cazador valiente: derrotaste a todos los enemigos';
    } else if (hp >= maxHp) {
        perfColor = '#80ff80';
        perfMsg   = 'Explorador intacto: llegaste sin recibir dano';
    } else {
        perfColor = '#a8d8ff';
        perfMsg   = 'La leyenda de Oliver perdurara en el bosque';
    }
    ctx.fillStyle = perfColor;
    ctx.font      = '14px monospace';
    ctx.fillText(perfMsg, CANVAS_W / 2, 438);

    // Optional lines — dynamic Y so they never overlap
    let nextY = 458;

    if (talked) {
        ctx.fillStyle = '#c8a0ff';
        ctx.font      = '13px monospace';
        ctx.fillText('Escuchaste la sabiduria del Anciano del Bosque', CANVAS_W / 2, nextY);
        nextY += 18;
    }

    if (kills >= 10) {
        ctx.fillStyle = '#FFD700';
        ctx.font      = 'bold 13px monospace';
        ctx.fillText('Logro: Cazador legendario', CANVAS_W / 2, nextY);
        nextY += 15;
        ctx.fillStyle = '#e8e8e8';
        ctx.font      = '12px monospace';
        ctx.fillText('Derrotaste a todas las criaturas del bosque.', CANVAS_W / 2, nextY);
        nextY += 18;
    }

    if (chestsOpened >= 2) {
        ctx.fillStyle = '#c8a040';
        ctx.font      = 'bold 13px monospace';
        ctx.fillText('Explorador completo', CANVAS_W / 2, nextY);
        nextY += 15;
        ctx.fillStyle = '#e8e8e8';
        ctx.font      = '12px monospace';
        ctx.fillText('Abriste todos los cofres del bosque.', CANVAS_W / 2, nextY);
        nextY += 18;
    }

    // CTA — at least y=510, pushed down if optional lines need space
    const ctaY    = Math.max(510, nextY + 14);
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 20px monospace';
    ctx.fillText('Presiona R para jugar de nuevo', CANVAS_W / 2, ctaY);

    // Footer
    ctx.fillStyle = 'rgba(200,200,200,0.35)';
    ctx.font      = '12px monospace';
    ctx.fillText('v1.5 · Legendary Adventures', CANVAS_W / 2, Math.max(572, ctaY + 28));

    ctx.textAlign = 'left';
}

export function drawDead(ctx, stats = {}) {
    const { kills = 0, crystals = 0 } = stats;

    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = 'rgba(200,50,50,0.38)';
    const sparks = [
        [300,150],[500,130],[200,280],[600,260],[350,120],
        [450,320],[150,200],[650,180],[400,410],[250,370],
        [560,440],[170,460],[700,420],[420,90],
    ];
    for (const [px, py] of sparks) ctx.fillRect(px, py, 3, 3);

    ctx.textAlign = 'center';

    ctx.shadowColor = 'rgba(200,50,50,0.6)';
    ctx.shadowBlur  = 18;
    ctx.fillStyle   = '#e83030';
    ctx.font        = 'bold 44px serif';
    ctx.fillText('Oliver ha caído en combate', CANVAS_W / 2, 188);
    ctx.shadowBlur  = 0;

    ctx.fillStyle = '#c8a0a0';
    ctx.font      = '16px monospace';
    ctx.fillText('El bosque mágico aún necesita un héroe', CANVAS_W / 2, 234);

    // Separator
    ctx.strokeStyle = 'rgba(200,50,50,0.28)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2 - 200, 256);
    ctx.lineTo(CANVAS_W / 2 + 200, 256);
    ctx.stroke();

    // Stats
    ctx.fillStyle = '#88ccdd';
    ctx.font      = '15px monospace';
    ctx.fillText(`Gemas recogidas:     ${crystals} / 3`, CANVAS_W / 2, 288);
    ctx.fillStyle = '#ffaa44';
    ctx.fillText(`Enemigos derrotados: ${kills} / 10`,  CANVAS_W / 2, 312);

    // Second separator
    ctx.strokeStyle = 'rgba(200,50,50,0.28)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2 - 200, 334);
    ctx.lineTo(CANVAS_W / 2 + 200, 334);
    ctx.stroke();

    // Empty gem outlines (gems not collected)
    for (let i = 0; i < 3; i++) {
        const cx = CANVAS_W / 2 - 40 + i * 40;
        ctx.save();
        ctx.translate(cx, 372);
        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = i < crystals ? 'rgba(0,191,255,0.6)' : 'rgba(200,80,80,0.4)';
        ctx.lineWidth   = 2;
        ctx.strokeRect(-10, -10, 20, 20);
        if (i < crystals) {
            ctx.fillStyle = 'rgba(0,191,255,0.25)';
            ctx.fillRect(-10, -10, 20, 20);
        }
        ctx.lineWidth = 1;
        ctx.restore();
    }

    // CTA
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 20px monospace';
    ctx.fillText('Presiona R para intentarlo de nuevo', CANVAS_W / 2, 438);

    // Footer
    ctx.fillStyle = 'rgba(200,200,200,0.35)';
    ctx.font      = '12px monospace';
    ctx.fillText('v1.5 · Legendary Adventures', CANVAS_W / 2, 572);

    ctx.textAlign = 'left';
}
