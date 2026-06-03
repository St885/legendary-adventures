import { isDown } from './input.js';
import { CANVAS_W, CANVAS_H, game, startTransition } from './game.js';
import { resolveX, resolveY, clampToBounds, overlaps } from './collision.js';

export const player = {
    x: 380, y: 200,
    w: 24,  h: 32,
    speed: 150,

    facing: 'down',
    hp: 3,
    maxHp: 3,

    weapon: null,
    hasShield: false,
    shieldCooldown: 0,

    get hasSword() { return this.weapon === 'sword'; },

    invincible: false,
    invincTimer: 0,

    attacking: false,
    attackTimer: 0,
    attackCooldown: 0,

    get shieldActive() {
        return this.hasShield && this.shieldCooldown <= 0;
    },

    update(dt, obstacles, exits) {
        if (game.transitioning) return;

        // Timers
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.attackTimer   > 0) { this.attackTimer -= dt; this.attacking = this.attackTimer > 0; }
        if (this.invincTimer   > 0) { this.invincTimer -= dt; if (this.invincTimer <= 0) this.invincible = false; }
        if (this.shieldCooldown > 0) this.shieldCooldown -= dt;

        // Movement + facing
        let vx = 0, vy = 0;
        if (isDown('KeyA') || isDown('ArrowLeft'))  { vx -= this.speed; this.facing = 'left';  }
        if (isDown('KeyD') || isDown('ArrowRight')) { vx += this.speed; this.facing = 'right'; }
        if (isDown('KeyW') || isDown('ArrowUp'))    { vy -= this.speed; this.facing = 'up';    }
        if (isDown('KeyS') || isDown('ArrowDown'))  { vy += this.speed; this.facing = 'down';  }

        if (vx !== 0 && vy !== 0) { vx /= Math.SQRT2; vy /= Math.SQRT2; }

        this.x += vx * dt;
        for (const obs of obstacles) resolveX(this, obs);
        clampToBounds(this, 0, 0, CANVAS_W, CANVAS_H);

        this.y += vy * dt;
        for (const obs of obstacles) resolveY(this, obs);
        clampToBounds(this, 0, 0, CANVAS_W, CANVAS_H);

        for (const exit of exits) {
            if (overlaps(this, exit.zone)) {
                startTransition(exit.targetRoom, exit.spawnX, exit.spawnY);
                break;
            }
        }
    },

    tryAttack() {
        if (!this.hasSword || this.attackCooldown > 0) return;
        this.attackTimer   = 0.25;
        this.attackCooldown = 0.5;
        this.attacking     = true;
    },

    getSwordHitbox() {
        switch (this.facing) {
            case 'right': return { x: this.x + this.w,  y: this.y + 10,      w: 22, h: 14 };
            case 'left':  return { x: this.x - 22,       y: this.y + 10,      w: 22, h: 14 };
            case 'down':  return { x: this.x + 4,        y: this.y + this.h,  w: 16, h: 22 };
            case 'up':    return { x: this.x + 4,        y: this.y - 22,      w: 16, h: 22 };
        }
    },

    takeDamage() {
        if (this.invincible) return;

        if (this.shieldActive) {
            // Shield absorbs the hit — no HP lost, shield recharges
            this.shieldCooldown = 2.5;
            this.invincible = true;
            this.invincTimer = 0.8;
        } else {
            this.hp = Math.max(0, this.hp - 1);
            this.invincible = true;
            this.invincTimer = 1.5;
            if (this.hp <= 0) game.state = 'DEAD';
        }
    },

    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
    },

    draw(ctx) {
        if (this.invincible && Math.floor(this.invincTimer * 10) % 2 === 0) return;

        const x = this.x, y = this.y;

        // Cape behind body
        ctx.fillStyle = '#173d6a';
        ctx.fillRect(x,      y + 10, 7, 17);
        ctx.fillRect(x + 17, y + 10, 7, 17);
        ctx.fillStyle = '#0f2a4a';
        ctx.fillRect(x,      y + 10, 2, 17);
        ctx.fillRect(x + 22, y + 10, 2, 17);

        // Body — tunic
        ctx.fillStyle = '#3a8a4a';
        ctx.fillRect(x + 5, y + 10, 14, 16);
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fillRect(x + 6, y + 11, 4, 8);

        // Belt
        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(x + 5, y + 22, 14, 3);

        // Legs + boots
        ctx.fillStyle = '#2a6035';
        ctx.fillRect(x + 6,  y + 25, 5, 7);
        ctx.fillRect(x + 13, y + 25, 5, 7);
        ctx.fillStyle = '#3a2810';
        ctx.fillRect(x + 6,  y + 30, 5, 2);
        ctx.fillRect(x + 13, y + 30, 5, 2);

        // Head — flesh
        ctx.fillStyle = '#c8845a';
        ctx.fillRect(x + 6, y + 2, 12, 10);

        // Hair
        ctx.fillStyle = '#3a2010';
        ctx.fillRect(x + 6, y,     12, 4);
        ctx.fillRect(x + 4, y + 2,  3, 4);

        // Eyes — direction-aware
        ctx.fillStyle = '#1a0a00';
        if (this.facing === 'down') {
            ctx.fillRect(x + 9,  y + 6, 2, 2);
            ctx.fillRect(x + 13, y + 6, 2, 2);
        } else if (this.facing === 'right') {
            ctx.fillRect(x + 14, y + 6, 2, 2);
        } else if (this.facing === 'left') {
            ctx.fillRect(x + 8,  y + 6, 2, 2);
        }
        // facing 'up' — back of head visible, no eyes
    },

    drawSword(ctx) {
        if (!this.attacking) return;
        const hb = this.getSwordHitbox();

        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur  = 10;
        ctx.fillStyle   = 'rgba(255,225,60,0.88)';
        ctx.fillRect(hb.x, hb.y, hb.w, hb.h);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth   = 1.5;
        ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);
        ctx.lineWidth = 1;

        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        if (this.facing === 'right' || this.facing === 'left') {
            ctx.fillRect(hb.x + 1, hb.y + 1, hb.w - 2, Math.floor(hb.h / 2));
        } else {
            ctx.fillRect(hb.x + 1, hb.y + 1, Math.floor(hb.w / 2), hb.h - 2);
        }
    },

    // Called on room transition — preserves hp, hasSword, hasShield
    resetPosition(x, y) {
        this.x = x ?? 380;
        this.y = y ?? 200;
        this.attacking = false;
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.invincible = false;
        this.invincTimer = 0;
    },

    // Full reset — called when pressing R
    reset(x, y) {
        this.x = x ?? 380;
        this.y = y ?? 200;
        this.facing = 'down';
        this.hp = this.maxHp;
        this.weapon = null;
        this.hasShield = false;
        this.shieldCooldown = 0;
        this.invincible = false;
        this.invincTimer = 0;
        this.attacking = false;
        this.attackTimer = 0;
        this.attackCooldown = 0;
    },
};
