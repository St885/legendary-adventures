import { CANVAS_W, CANVAS_H } from './game.js';

const EDGE = 12;

export const ROOMS = {
    H1: {
        name: 'Claro del Bosque',
        bgColor: '#3d6e28',
        obstacles: [
            { x:  60, y:  45, w: 55, h: 65, color: '#5c3a1e' },
            { x: 816, y:  54, w: 55, h: 65, color: '#5c3a1e' },
            { x: 120, y: 360, w: 65, h: 60, color: '#5c3a1e' },
            { x: 732, y: 351, w: 60, h: 70, color: '#5c3a1e' },
            { x: 372, y:  36, w: 50, h: 55, color: '#5c3a1e' },
            { x: 576, y: 414, w: 55, h: 55, color: '#5c3a1e' },
        ],
        exits: [
            { zone: { x: CANVAS_W - EDGE, y: 130, w: EDGE, h: 280 }, targetRoom: 'H2', spawnX: 30,             spawnY: 270 },
            { zone: { x: 280, y: CANVAS_H - EDGE, w: 400, h: EDGE }, targetRoom: 'H4', spawnX: 480,            spawnY: 30  },
        ],
    },
    H2: {
        name: 'Fuente Mágica',
        bgColor: '#1e4d6b',
        obstacles: [
            { x: 384, y: 198, w: 160, h: 100, color: '#163a52' },
            { x:  84, y:  81, w: 75,  h: 55,  color: '#3a5060' },
            { x: 756, y:  90, w: 80,  h: 60,  color: '#3a5060' },
            { x:  96, y: 369, w: 65,  h: 65,  color: '#3a5060' },
            { x: 768, y: 360, w: 70,  h: 65,  color: '#3a5060' },
            { x: 324, y: 423, w: 90,  h: 55,  color: '#3a5060' },
        ],
        exits: [
            { zone: { x: 0,   y: 130,            w: EDGE, h: 280 }, targetRoom: 'H1', spawnX: CANVAS_W - 50, spawnY: 270 },
            { zone: { x: 280, y: CANVAS_H - EDGE, w: 400, h: EDGE }, targetRoom: 'H3', spawnX: 480,            spawnY: 30  },
        ],
    },
    H3: {
        name: 'Caverna de los Cristales',
        bgColor: '#1a1030',
        obstacles: [
            { x:  48, y:  36, w: 90, h: 90, color: '#2e1f50' },
            { x: 780, y:  36, w: 90, h: 90, color: '#2e1f50' },
            { x: 228, y: 144, w: 65, h: 65, color: '#2e1f50' },
            { x: 648, y: 171, w: 75, h: 75, color: '#2e1f50' },
            { x:  72, y: 333, w: 95, h: 75, color: '#2e1f50' },
            { x: 732, y: 342, w: 85, h: 70, color: '#2e1f50' },
            { x: 372, y: 405, w: 65, h: 70, color: '#2e1f50' },
        ],
        exits: [
            { zone: { x: 0,   y: 130, w: EDGE, h: 280 }, targetRoom: 'H4', spawnX: CANVAS_W - 50, spawnY: 270           },
            { zone: { x: 280, y: 0,   w: 400,  h: EDGE }, targetRoom: 'H2', spawnX: 480,            spawnY: CANVAS_H - 65 },
        ],
    },
    H4: {
        name: 'Puerta del Santuario',
        bgColor: '#3d2e0e',
        obstacles: [
            { x:  96, y:  72, w: 55, h: 110, color: '#6b5428' },
            { x: 792, y:  72, w: 55, h: 110, color: '#6b5428' },
            { x:  96, y: 369, w: 55, h: 110, color: '#6b5428' },
            { x: 792, y: 369, w: 55, h: 110, color: '#6b5428' },
        ],
        exits: [
            { zone: { x: 280,           y: 0,   w: 400,  h: EDGE }, targetRoom: 'H1', spawnX: 480,            spawnY: CANVAS_H - 65 },
            { zone: { x: CANVAS_W - EDGE, y: 130, w: EDGE, h: 280 }, targetRoom: 'H3', spawnX: 30,             spawnY: 270           },
        ],
    },
};

const DECO = {
    H1: [[192,108],[408,180],[600,117],[288,342],[660,288],[480,450],[780,405],[240,450]],
    H2: [[264,306],[504,180],[660,315],[180,252],[804,270],[456,378],[600,414],[168,153],[840,198]],
    H3: [[168,180],[504,108],[756,252],[240,360],[576,306],[420,450],[840,117],[108,441]],
};

export function drawRoom(ctx, roomId) {
    const room = ROOMS[roomId];

    ctx.fillStyle = room.bgColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    if (roomId === 'H1') {
        ctx.fillStyle = 'rgba(80,130,50,0.45)';
        for (const [px, py] of DECO.H1) {
            ctx.beginPath();
            ctx.ellipse(px, py, 28, 18, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (roomId === 'H2') {
        ctx.fillStyle = 'rgba(100,200,255,0.2)';
        for (const [px, py] of DECO.H2) {
            ctx.beginPath();
            ctx.ellipse(px, py, 20, 12, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = 'rgba(60,160,220,0.45)';
        ctx.fillRect(392, 206, 144, 84);
        ctx.strokeStyle = 'rgba(100,190,240,0.7)';
        ctx.lineWidth = 2;
        ctx.strokeRect(384, 198, 160, 100);
        ctx.lineWidth = 1;
    } else if (roomId === 'H3') {
        ctx.fillStyle = 'rgba(180,100,255,0.18)';
        for (const [px, py] of DECO.H3) {
            ctx.beginPath();
            ctx.ellipse(px, py, 22, 14, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (roomId === 'H4') {
        ctx.strokeStyle = 'rgba(100,80,40,0.3)';
        ctx.lineWidth = 1;
        for (let gx = 80; gx < CANVAS_W; gx += 80) {
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CANVAS_H); ctx.stroke();
        }
        for (let gy = 80; gy < CANVAS_H; gy += 80) {
            ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CANVAS_W, gy); ctx.stroke();
        }
    }

    for (const obs of room.obstacles) {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(obs.x, obs.y, obs.w, 4);
    }

    // Subtle exit hints
    ctx.fillStyle = 'rgba(255,255,180,0.18)';
    for (const exit of room.exits) {
        const z = exit.zone;
        ctx.fillRect(z.x, z.y, z.w, z.h);
    }
}
