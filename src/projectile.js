import { overlaps } from './collision.js';
import { CANVAS_W, CANVAS_H } from './game.js';

const _pool = [];

export function fireProjectile(type, cx, cy, dx, dy) {
    const isArrow = type === 'arrow';
    const speed   = isArrow ? 350 : 200;
    const size    = isArrow ? 6   : 10;
    _pool.push({
        type,
        x: cx - size / 2,
        y: cy - size / 2,
        vx: dx * speed,
        vy: dy * speed,
        w: size, h: size,
        damage: isArrow ? 1 : 2,
        alive: true,
        dx, dy,
    });
}

export function getProjectiles() { return _pool; }

export function updateProjectiles(dt, obstacles) {
    for (let i = _pool.length - 1; i >= 0; i--) {
        const p = _pool[i];
        if (!p.alive) { _pool.splice(i, 1); continue; }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x + p.w < 0 || p.x > CANVAS_W || p.y + p.h < 0 || p.y > CANVAS_H) {
            _pool.splice(i, 1);
            continue;
        }

        let hitObs = false;
        for (const obs of obstacles) {
            if (overlaps(p, obs)) { hitObs = true; break; }
        }
        if (hitObs) _pool.splice(i, 1);
    }
}

export function drawProjectiles(ctx) {
    for (const p of _pool) {
        if (!p.alive) continue;
        const cx = p.x + p.w / 2;
        const cy = p.y + p.h / 2;

        if (p.type === 'arrow') {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Math.atan2(p.vy, p.vx));
            ctx.fillStyle = '#886640';
            ctx.fillRect(-9, -2,  4,  5);   // fletching
            ctx.fillStyle = '#c8a040';
            ctx.fillRect(-5, -1, 14,  3);   // shaft
            ctx.fillStyle = '#e8e8c0';
            ctx.fillRect( 9, -2,  4,  5);   // tip
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillRect(-4, -1, 10,  1);   // highlight
            ctx.restore();
        } else {
            // Magic bolt
            ctx.shadowColor = '#a060ff';
            ctx.shadowBlur  = 12;
            ctx.fillStyle   = '#c080ff';
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 5;
            ctx.fillStyle  = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(cx - 1, cy - 1, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

export function resetProjectiles() {
    _pool.length = 0;
}

// ── Enemy projectiles ──────────────────────────────────────────────────────────

const _enemyPool = [];

export function fireEnemyProjectile(cx, cy, dx, dy) {
    const size = 10;
    _enemyPool.push({
        x: cx - size / 2, y: cy - size / 2,
        vx: dx * 150, vy: dy * 150,
        w: size, h: size,
        alive: true,
    });
}

export function getEnemyProjectiles() { return _enemyPool; }

export function updateEnemyProjectiles(dt, obstacles) {
    for (let i = _enemyPool.length - 1; i >= 0; i--) {
        const p = _enemyPool[i];
        if (!p.alive) { _enemyPool.splice(i, 1); continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x + p.w < 0 || p.x > CANVAS_W || p.y + p.h < 0 || p.y > CANVAS_H) {
            _enemyPool.splice(i, 1);
            continue;
        }
        let hitObs = false;
        for (const obs of obstacles) {
            if (overlaps(p, obs)) { hitObs = true; break; }
        }
        if (hitObs) _enemyPool.splice(i, 1);
    }
}

export function drawEnemyProjectiles(ctx) {
    for (const p of _enemyPool) {
        if (!p.alive) continue;
        const cx = p.x + p.w / 2;
        const cy = p.y + p.h / 2;
        ctx.shadowColor = '#ff4010';
        ctx.shadowBlur  = 8;
        ctx.fillStyle   = '#ff6030';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 4;
        ctx.fillStyle  = 'rgba(255,200,100,0.7)';
        ctx.beginPath();
        ctx.arc(cx - 1, cy - 1, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

export function resetEnemyProjectiles() {
    _enemyPool.length = 0;
}
