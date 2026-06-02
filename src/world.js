import { CANVAS_W, CANVAS_H } from './game.js';

const EDGE = 12;

export const ROOMS = {
    H1: {
        name: 'Claro del Bosque',
        bgColor: '#3d6e28',
        obstacles: [
            { x:  50, y:  50, w: 55, h: 65, color: '#5c3a1e' },
            { x: 680, y:  60, w: 55, h: 65, color: '#5c3a1e' },
            { x: 100, y: 400, w: 65, h: 60, color: '#5c3a1e' },
            { x: 610, y: 390, w: 60, h: 70, color: '#5c3a1e' },
            { x: 310, y:  40, w: 50, h: 55, color: '#5c3a1e' },
            { x: 480, y: 460, w: 55, h: 55, color: '#5c3a1e' },
        ],
        exits: [
            { zone: { x: CANVAS_W - EDGE, y: 160, w: EDGE, h: 280 }, targetRoom: 'H2', spawnX: 30,             spawnY: 284 },
            { zone: { x: 200, y: CANVAS_H - EDGE, w: 400, h: EDGE }, targetRoom: 'H4', spawnX: 376,            spawnY: 30  },
        ],
    },
    H2: {
        name: 'Fuente Mágica',
        bgColor: '#1e4d6b',
        obstacles: [
            { x: 320, y: 220, w: 160, h: 100, color: '#163a52' },
            { x:  70, y:  90, w: 75,  h: 55,  color: '#3a5060' },
            { x: 630, y: 100, w: 80,  h: 60,  color: '#3a5060' },
            { x:  80, y: 410, w: 65,  h: 65,  color: '#3a5060' },
            { x: 640, y: 400, w: 70,  h: 65,  color: '#3a5060' },
            { x: 270, y: 470, w: 90,  h: 55,  color: '#3a5060' },
        ],
        exits: [
            { zone: { x: 0,             y: 160,            w: EDGE, h: 280 }, targetRoom: 'H1', spawnX: CANVAS_W - 50, spawnY: 284            },
            { zone: { x: 200,           y: CANVAS_H - EDGE, w: 400, h: EDGE }, targetRoom: 'H3', spawnX: 376,            spawnY: 30             },
        ],
    },
    H3: {
        name: 'Caverna de los Cristales',
        bgColor: '#1a1030',
        obstacles: [
            { x:  40, y:  40, w: 90, h: 90, color: '#2e1f50' },
            { x: 650, y:  40, w: 90, h: 90, color: '#2e1f50' },
            { x: 190, y: 160, w: 65, h: 65, color: '#2e1f50' },
            { x: 540, y: 190, w: 75, h: 75, color: '#2e1f50' },
            { x:  60, y: 370, w: 95, h: 75, color: '#2e1f50' },
            { x: 610, y: 380, w: 85, h: 70, color: '#2e1f50' },
            { x: 310, y: 450, w: 65, h: 70, color: '#2e1f50' },
        ],
        exits: [
            { zone: { x: 0,   y: 160, w: EDGE, h: 280 }, targetRoom: 'H4', spawnX: CANVAS_W - 50, spawnY: 284            },
            { zone: { x: 200, y: 0,   w: 400,  h: EDGE }, targetRoom: 'H2', spawnX: 376,            spawnY: CANVAS_H - 65  },
        ],
    },
    H4: {
        name: 'Puerta del Santuario',
        bgColor: '#3d2e0e',
        obstacles: [
            { x:  80, y:  80, w: 55, h: 110, color: '#6b5428' },
            { x: 660, y:  80, w: 55, h: 110, color: '#6b5428' },
            { x:  80, y: 410, w: 55, h: 110, color: '#6b5428' },
            { x: 660, y: 410, w: 55, h: 110, color: '#6b5428' },
        ],
        exits: [
            { zone: { x: 200,           y: 0,   w: 400,  h: EDGE }, targetRoom: 'H1', spawnX: 376,            spawnY: CANVAS_H - 65 },
            { zone: { x: CANVAS_W - EDGE, y: 160, w: EDGE, h: 280 }, targetRoom: 'H3', spawnX: 30,             spawnY: 284           },
        ],
    },
};

const DECO = {
    H1: [[160,120],[340,200],[500,130],[240,380],[550,320],[400,500],[650,450],[200,500]],
    H2: [[220,340],[420,200],[550,350],[150,280],[670,300],[380,420],[500,460],[140,170],[700,220]],
    H3: [[140,200],[420,120],[630,280],[200,400],[480,340],[350,500],[700,130],[90,490]],
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
        ctx.fillRect(328, 228, 144, 84);
        ctx.strokeStyle = 'rgba(100,190,240,0.7)';
        ctx.lineWidth = 2;
        ctx.strokeRect(320, 220, 160, 100);
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
