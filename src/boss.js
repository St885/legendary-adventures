import { game, CANVAS_W, CANVAS_H } from './game.js';
import { resolveX, resolveY, clampToBounds } from './collision.js';

const SPEED       = 80;   // px/s — slower than Oliver (150px/s)
const MELEE_RANGE = 75;   // px — distance to trigger melee attack
const SHOOT_DIST  = 120;  // px — minimum distance to fire ranged shot

const W = 80, H = 80;

export const boss = {
    x: 440,
    y: 250,
    w: W,
    h: H,
    hp: 8,
    maxHp: 8,
    alive: false,
    vx: 0,
    vy: 0,
    meleeCooldown: 0,
    shootCooldown: 0,

    get cx() { return this.x + this.w / 2; },
    get cy() { return this.y + this.h / 2; },

    spawn() {
        this.hp            = this.maxHp;
        this.alive         = true;
        this.vx            = 0;
        this.vy            = 0;
        this.meleeCooldown = 0;
        this.shootCooldown = 5.0;
    },

    takeDamage(amount = 1) {
        if (!this.alive) return false;
        this.hp = Math.max(0, this.hp - amount);
        if (this.hp <= 0) { this.alive = false; return true; }
        return false;
    },

    tryMelee(player) {
        if (!this.alive || this.meleeCooldown > 0) return false;
        const pdx = player.x + player.w / 2 - this.cx;
        const pdy = player.y + player.h / 2 - this.cy;
        if (pdx * pdx + pdy * pdy <= MELEE_RANGE * MELEE_RANGE) {
            this.meleeCooldown = 1.5;
            return true;
        }
        return false;
    },

    tryShoot(player) {
        if (!this.alive || this.shootCooldown > 0) return null;
        const pdx = player.x + player.w / 2 - this.cx;
        const pdy = player.y + player.h / 2 - this.cy;
        const dist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (dist >= SHOOT_DIST) {
            this.shootCooldown = 20.0;
            return { dx: pdx / dist, dy: pdy / dist };
        }
        return null;
    },

    update(dt, obstacles, player) {
        if (!this.alive) return;

        this.meleeCooldown -= dt;
        this.shootCooldown -= dt;

        const pdx  = player.x + player.w / 2 - this.cx;
        const pdy  = player.y + player.h / 2 - this.cy;
        const dist = Math.sqrt(pdx * pdx + pdy * pdy);

        if (dist > MELEE_RANGE && dist > 0) {
            this.vx = (pdx / dist) * SPEED;
            this.vy = (pdy / dist) * SPEED;
        } else {
            this.vx = 0;
            this.vy = 0;
        }

        this.x += this.vx * dt;
        for (const obs of obstacles) resolveX(this, obs);
        clampToBounds(this, 0, 0, CANVAS_W, CANVAS_H);

        this.y += this.vy * dt;
        for (const obs of obstacles) resolveY(this, obs);
        clampToBounds(this, 0, 0, CANVAS_W, CANVAS_H);
    },

    reset() {
        this.hp            = this.maxHp;
        this.alive         = false;
        this.vx            = 0;
        this.vy            = 0;
        this.meleeCooldown = 0;
        this.shootCooldown = 0;
    },

    toObstacle() {
        return this.alive ? { x: this.x, y: this.y, w: this.w, h: this.h } : null;
    },

    draw(ctx) {
        if (!this.alive) return;

        const t        = performance.now() / 1000;
        const pulse    = 0.5 + Math.sin(t * 2.2) * 0.4;
        const isMoving = Math.abs(this.vx) > 1 || Math.abs(this.vy) > 1;
        const bob      = isMoving ? Math.sin(t * 8) * 3 : 0;

        const cx = this.cx;
        const cy = this.cy + bob;
        const bx = this.x;
        const by = this.y + bob;

        // Outer aura ring
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur  = 12 + pulse * 14;
        ctx.strokeStyle = `rgba(255,180,0,${0.3 + pulse * 0.4})`;
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 52 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;

        // Body
        ctx.shadowBlur  = 0;
        ctx.fillStyle   = '#1a0d00';
        ctx.fillRect(bx, by, this.w, this.h);
        ctx.fillStyle = '#3a1a08';
        ctx.fillRect(bx + 6, by + 6, this.w - 12, this.h - 12);

        // Gold frame
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur  = 8;
        ctx.strokeStyle = `rgba(255,200,0,${0.7 + pulse * 0.25})`;
        ctx.lineWidth   = 2;
        ctx.strokeRect(bx + 3, by + 3, this.w - 6, this.h - 6);
        ctx.lineWidth = 1;

        // Crown
        ctx.fillStyle  = '#FFD700';
        ctx.shadowBlur = 6;
        ctx.fillRect(cx - 18, by - 14,  6, 14);
        ctx.fillRect(cx -  4, by - 18,  8, 18);
        ctx.fillRect(cx + 12, by - 14,  6, 14);
        ctx.fillRect(cx - 18, by -  2, 36,  4);

        // Eyes
        ctx.shadowColor = '#ff2000';
        ctx.shadowBlur  = 10 + pulse * 8;
        ctx.fillStyle   = `rgba(255,${Math.round(30 + pulse * 40)},0,${0.8 + pulse * 0.2})`;
        ctx.fillRect(cx - 22, cy - 14, 14, 10);
        ctx.fillRect(cx +  8, cy - 14, 14, 10);
        ctx.fillStyle = '#ffee00';
        ctx.fillRect(cx - 18, cy - 12,  6, 6);
        ctx.fillRect(cx + 12, cy - 12,  6, 6);

        // Rune cross
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur  = 8;
        ctx.fillStyle   = `rgba(255,200,50,${0.4 + pulse * 0.45})`;
        ctx.fillRect(cx -  2, cy - 10,  4, 22);
        ctx.fillRect(cx - 11, cy -  2, 22,  4);
        ctx.fillRect(cx - 14, cy -  6,  4,  4);
        ctx.fillRect(cx + 10, cy -  6,  4,  4);
        ctx.fillRect(cx -  6, cy - 14,  4,  4);
        ctx.fillRect(cx +  2, cy + 10,  4,  4);

        ctx.shadowBlur = 0;
    },
};
