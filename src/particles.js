const _pool = [];

export function emitGem(x, y) {
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const spd   = 55 + Math.random() * 65;
        _pool.push({
            x, y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: 0.35 + Math.random() * 0.25,
            maxLife: 0.6,
            size: 3 + Math.random() * 3,
            color: Math.random() < 0.5 ? '#00BFFF' : '#80EEFF',
        });
    }
}

export function emitDeath(x, y) {
    for (let i = 0; i < 7; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd   = 45 + Math.random() * 75;
        _pool.push({
            x, y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd - 25,
            life: 0.25 + Math.random() * 0.25,
            maxLife: 0.5,
            size: 2 + Math.random() * 4,
            color: Math.random() < 0.55 ? '#ff4020' : '#ff9030',
        });
    }
}

export function emitDoorOpen(x, y) {
    for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd   = 35 + Math.random() * 80;
        _pool.push({
            x: x + (Math.random() - 0.5) * 60,
            y: y + (Math.random() - 0.5) * 80,
            vx: Math.cos(angle) * spd * 0.4,
            vy: -25 - Math.random() * 55,
            life: 0.8 + Math.random() * 0.6,
            maxLife: 1.4,
            size: 3 + Math.random() * 5,
            color: Math.random() < 0.5 ? '#FFD700' : '#FFF080',
        });
    }
}

export function updateParticles(dt) {
    for (let i = _pool.length - 1; i >= 0; i--) {
        const p = _pool[i];
        p.x    += p.vx * dt;
        p.y    += p.vy * dt;
        p.vy   += 55 * dt;
        p.life -= dt;
        if (p.life <= 0) _pool.splice(i, 1);
    }
}

export function drawParticles(ctx) {
    for (const p of _pool) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle   = p.color;
        ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
        ctx.restore();
    }
}

export function emitVictory(x, y) {
    const colors = ['#FFD700', '#FFF080', '#FFB020', '#FFEA40'];
    for (let i = 0; i < 22; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd   = 50 + Math.random() * 100;
        _pool.push({
            x: x + (Math.random() - 0.5) * 80,
            y: y + (Math.random() - 0.5) * 40,
            vx: Math.cos(angle) * spd * 0.6,
            vy: -40 - Math.random() * 80,
            life: 1.0 + Math.random() * 0.8,
            maxLife: 1.8,
            size: 4 + Math.random() * 5,
            color: colors[Math.floor(Math.random() * 4)],
        });
    }
}

export function emitChest(x, y, color) {
    for (let i = 0; i < 10; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
        const spd   = 50 + Math.random() * 70;
        _pool.push({
            x: x + (Math.random() - 0.5) * 18,
            y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life:    0.35 + Math.random() * 0.30,
            maxLife: 0.65,
            size:    3 + Math.random() * 3,
            color,
        });
    }
}

export function resetParticles() {
    _pool.length = 0;
}
