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

    walkTimer: 0,
    walkFrame: 0,
    moving: false,

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

        const isMoving = vx !== 0 || vy !== 0;
        this.moving = isMoving;
        if (isMoving) {
            this.walkTimer += dt;
            if (this.walkTimer >= 0.16) { this.walkTimer = 0; this.walkFrame ^= 1; }
        } else {
            this.walkFrame = 0;
            this.walkTimer = 0;
        }

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

        const x  = Math.round(this.x);
        const y  = Math.round(this.y);
        const f  = this.facing;
        const la = this.walkFrame;   // 0 or 1

        const SK  = '#d4946a', SKD = '#b07040';
        const HR  = '#2a1505', HRL = '#4a2a10';
        const TN  = '#2a7a3a', TNL = '#3a9a4a', TND = '#1a5228';
        const CP  = '#1a3d7a', CPD = '#0f2650';
        const BL  = '#6b3a18';
        const LG  = '#1e5228', BT  = '#2a1a08';
        const EY  = '#1a0800';

        if (f === 'down') {
            // Cape sides (drawn first — behind body)
            ctx.fillStyle = CPD;
            ctx.fillRect(x,      y + 13, 5, 19);
            ctx.fillRect(x + 19, y + 13, 5, 19);
            ctx.fillStyle = CP;
            ctx.fillRect(x + 1,  y + 14, 4, 17);
            ctx.fillRect(x + 19, y + 14, 4, 17);
            // Neck
            ctx.fillStyle = SK;
            ctx.fillRect(x + 9, y + 13, 6, 3);
            // Tunic
            ctx.fillStyle = TN;
            ctx.fillRect(x + 3, y + 16, 18, 11);
            ctx.fillStyle = TNL;
            ctx.fillRect(x + 5, y + 17,  5,  8);
            ctx.fillStyle = TND;
            ctx.fillRect(x + 16, y + 17, 4,  8);
            // Belt + buckle
            ctx.fillStyle = BL;
            ctx.fillRect(x + 3, y + 27, 18, 3);
            ctx.fillStyle = '#c09030';
            ctx.fillRect(x + 10, y + 27, 4, 3);
            // Legs (walk alternation)
            ctx.fillStyle = LG;
            ctx.fillRect(x + 4,  y + 28 - la, 7, 3);
            ctx.fillRect(x + 13, y + 28 + la, 7, 3);
            ctx.fillStyle = BT;
            ctx.fillRect(x + 4,  y + 30, 7, 2);
            ctx.fillRect(x + 13, y + 30, 7, 2);
            // Head (drawn on top)
            ctx.fillStyle = SK;
            ctx.fillRect(x + 5, y + 3, 14, 11);
            ctx.fillRect(x + 4, y + 5,  2,  6);   // ears
            ctx.fillRect(x + 18, y + 5, 2,  6);
            ctx.fillStyle = SKD;
            ctx.fillRect(x + 5, y + 12, 14, 2);
            // Hair
            ctx.fillStyle = HR;
            ctx.fillRect(x + 5, y,      14, 5);
            ctx.fillRect(x + 3, y + 2,   3, 4);
            ctx.fillRect(x + 18, y + 2,  3, 4);
            ctx.fillStyle = HRL;
            ctx.fillRect(x + 8, y + 1,   5, 2);
            // Eyes + shine
            ctx.fillStyle = EY;
            ctx.fillRect(x + 8,  y + 7, 2, 2);
            ctx.fillRect(x + 14, y + 7, 2, 2);
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(x + 8,  y + 7, 1, 1);
            ctx.fillRect(x + 14, y + 7, 1, 1);

        } else if (f === 'up') {
            // Cape (full back — most prominent in this view)
            ctx.fillStyle = CPD;
            ctx.fillRect(x + 1, y + 13, 22, 19);
            ctx.fillStyle = CP;
            ctx.fillRect(x + 2, y + 14, 20, 17);
            ctx.fillStyle = 'rgba(80,130,220,0.18)';
            ctx.fillRect(x + 4, y + 15,  7, 14);
            // Tunic back
            ctx.fillStyle = TND;
            ctx.fillRect(x + 3, y + 16, 18, 11);
            // Belt
            ctx.fillStyle = BL;
            ctx.fillRect(x + 3, y + 27, 18, 3);
            // Legs
            ctx.fillStyle = LG;
            ctx.fillRect(x + 4,  y + 28 - la, 7, 3);
            ctx.fillRect(x + 13, y + 28 + la, 7, 3);
            ctx.fillStyle = BT;
            ctx.fillRect(x + 4,  y + 30, 7, 2);
            ctx.fillRect(x + 13, y + 30, 7, 2);
            // Back of head — hair only, no face
            ctx.fillStyle = HR;
            ctx.fillRect(x + 5, y,     14, 14);
            ctx.fillStyle = HRL;
            ctx.fillRect(x + 8, y + 2,  6,  5);

        } else if (f === 'right') {
            // Cape left side (trailing)
            ctx.fillStyle = CPD;
            ctx.fillRect(x, y + 13, 6, 19);
            ctx.fillStyle = CP;
            ctx.fillRect(x + 1, y + 14, 5, 17);
            // Tunic
            ctx.fillStyle = TN;
            ctx.fillRect(x + 4, y + 16, 15, 11);
            ctx.fillStyle = TNL;
            ctx.fillRect(x + 5, y + 17,  5,  8);
            ctx.fillStyle = TND;
            ctx.fillRect(x + 15, y + 17, 3,  8);
            // Belt
            ctx.fillStyle = BL;
            ctx.fillRect(x + 4, y + 27, 15, 3);
            // Neck
            ctx.fillStyle = SK;
            ctx.fillRect(x + 8, y + 13, 7, 4);
            // Legs — side stride (front leg shifts forward)
            const sx = la * 2;
            ctx.fillStyle = LG;
            ctx.fillRect(x + 5 + sx, y + 28, 7, 3);
            ctx.fillRect(x + 5,      y + 29, 7, 2);
            ctx.fillStyle = BT;
            ctx.fillRect(x + 5 + sx, y + 30, 8, 2);
            ctx.fillRect(x + 4,      y + 30, 7, 2);
            // Head profile (right)
            ctx.fillStyle = SK;
            ctx.fillRect(x + 7, y + 3, 12, 11);
            ctx.fillRect(x + 18, y + 7, 2,  4);   // chin/nose
            ctx.fillStyle = SKD;
            ctx.fillRect(x + 7, y + 12, 12, 2);
            // Hair
            ctx.fillStyle = HR;
            ctx.fillRect(x + 7, y,      12, 5);
            ctx.fillRect(x + 4, y + 1,   4, 7);
            // Eye
            ctx.fillStyle = EY;
            ctx.fillRect(x + 16, y + 7, 2, 2);
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(x + 16, y + 7, 1, 1);

        } else { // left
            // Cape right side (trailing)
            ctx.fillStyle = CPD;
            ctx.fillRect(x + 18, y + 13, 6, 19);
            ctx.fillStyle = CP;
            ctx.fillRect(x + 18, y + 14, 5, 17);
            // Tunic
            ctx.fillStyle = TN;
            ctx.fillRect(x + 5, y + 16, 15, 11);
            ctx.fillStyle = TNL;
            ctx.fillRect(x + 6, y + 17,  5,  8);
            ctx.fillStyle = TND;
            ctx.fillRect(x + 16, y + 17, 3,  8);
            // Belt
            ctx.fillStyle = BL;
            ctx.fillRect(x + 5, y + 27, 15, 3);
            // Neck
            ctx.fillStyle = SK;
            ctx.fillRect(x + 9, y + 13, 7, 4);
            // Legs — side stride mirrored
            const sx2 = la * 2;
            ctx.fillStyle = LG;
            ctx.fillRect(x + 12 - sx2, y + 28, 7, 3);
            ctx.fillRect(x + 12,       y + 29, 7, 2);
            ctx.fillStyle = BT;
            ctx.fillRect(x + 11 - sx2, y + 30, 8, 2);
            ctx.fillRect(x + 13,       y + 30, 7, 2);
            // Head profile (left)
            ctx.fillStyle = SK;
            ctx.fillRect(x + 5, y + 3, 12, 11);
            ctx.fillRect(x + 4, y + 7,  2,  4);   // chin/nose
            ctx.fillStyle = SKD;
            ctx.fillRect(x + 5, y + 12, 12, 2);
            // Hair
            ctx.fillStyle = HR;
            ctx.fillRect(x + 5, y,      12, 5);
            ctx.fillRect(x + 16, y + 1,  4, 7);
            // Eye
            ctx.fillStyle = EY;
            ctx.fillRect(x + 6, y + 7, 2, 2);
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(x + 6, y + 7, 1, 1);
        }
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
        this.walkTimer = 0;
        this.walkFrame = 0;
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
        this.walkTimer = 0;
        this.walkFrame = 0;
        this.moving = false;
    },
};
