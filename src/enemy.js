import { CANVAS_W, CANVAS_H } from './game.js';
import { resolveX, resolveY, clampToBounds } from './collision.js';

const ENEMY_STYLE = {
    H2: { body: '#1a6a58', head: '#0d4a3a', eye: '#80eeff', trait: 'slime' },
    H3: { body: '#5a1a7a', head: '#3a0d52', eye: '#dd88ff', trait: 'spike' },
    H4: { body: '#6a5030', head: '#4a3418', eye: '#ffaa40', trait: 'stone' },
};

function makeEnemy(room, spawnX, spawnY, patrolAxis, patrolMin, patrolMax) {
    return {
        room,
        x: spawnX, y: spawnY,
        w: 22, h: 26,
        hp: 2, maxHp: 2,
        speed: 60,
        alive: true,
        patrolAxis, patrolMin, patrolMax,
        dir: 1,
        invincible: false,
        invincTimer: 0,
        spawnX, spawnY,
        style: ENEMY_STYLE[room] || ENEMY_STYLE.H2,

        update(dt, obstacles) {
            if (!this.alive) return;

            if (this.invincTimer > 0) {
                this.invincTimer -= dt;
                if (this.invincTimer <= 0) this.invincible = false;
            }

            if (this.patrolAxis === 'x') {
                this.x += this.speed * this.dir * dt;
                if (this.x <= this.patrolMin)              { this.x = this.patrolMin;              this.dir =  1; }
                if (this.x + this.w >= this.patrolMax)     { this.x = this.patrolMax - this.w;     this.dir = -1; }
            } else {
                this.y += this.speed * this.dir * dt;
                if (this.y <= this.patrolMin)              { this.y = this.patrolMin;              this.dir =  1; }
                if (this.y + this.h >= this.patrolMax)     { this.y = this.patrolMax - this.h;     this.dir = -1; }
            }

            for (const obs of obstacles) resolveX(this, obs);
            for (const obs of obstacles) resolveY(this, obs);
            clampToBounds(this, 0, 0, CANVAS_W, CANVAS_H);
        },

        draw(ctx) {
            if (!this.alive) return;
            const flash = this.invincible && Math.floor(this.invincTimer * 12) % 2 === 0;
            const s = this.style;

            // Spike crown (H3)
            if (!flash && s.trait === 'spike') {
                ctx.fillStyle = s.head;
                ctx.fillRect(this.x + 4,  this.y - 5, 3, 6);
                ctx.fillRect(this.x + 10, this.y - 5, 3, 6);
                ctx.fillRect(this.x + 16, this.y - 5, 3, 6);
            }

            // Body
            ctx.fillStyle = flash ? '#ffffff' : s.body;
            ctx.fillRect(this.x + 1, this.y + 6, this.w - 2, this.h - 6);
            if (!flash) {
                ctx.fillStyle = 'rgba(255,255,255,0.13)';
                ctx.fillRect(this.x + 2, this.y + 7, 4, 8);
            }

            // Stone cracks (H4)
            if (!flash && s.trait === 'stone') {
                ctx.fillStyle = 'rgba(0,0,0,0.28)';
                ctx.fillRect(this.x + 8,  this.y + 9,  1, 9);
                ctx.fillRect(this.x + 14, this.y + 11, 1, 7);
            }

            // Head
            ctx.fillStyle = flash ? '#eeeeee' : s.head;
            ctx.fillRect(this.x + 2, this.y, this.w - 4, 12);

            // Slime drips (H2)
            if (!flash && s.trait === 'slime') {
                ctx.fillStyle = s.body;
                ctx.fillRect(this.x + 5,  this.y + this.h,     3, 4);
                ctx.fillRect(this.x + 14, this.y + this.h + 1, 3, 3);
            }

            // Eyes
            if (!flash) {
                ctx.fillStyle = s.eye;
                if (s.trait === 'slime') {
                    // Single wide central eye
                    ctx.fillRect(this.x + 6, this.y + 3, 10, 5);
                } else {
                    ctx.fillRect(this.x + 4,          this.y + 3, 5, 5);
                    ctx.fillRect(this.x + this.w - 9, this.y + 3, 5, 5);
                }
                ctx.fillStyle = 'rgba(255,255,255,0.55)';
                if (s.trait === 'slime') {
                    ctx.fillRect(this.x + 7, this.y + 3, 2, 2);
                } else {
                    ctx.fillRect(this.x + 5,          this.y + 3, 2, 2);
                    ctx.fillRect(this.x + this.w - 8, this.y + 3, 2, 2);
                }
            }

            // HP bar (visible only when damaged)
            if (this.hp < this.maxHp) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(this.x, this.y - 6, this.w, 4);
                ctx.fillStyle = '#ff3030';
                ctx.fillRect(this.x, this.y - 6, this.w * (this.hp / this.maxHp), 4);
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(this.x, this.y - 6, this.w * (this.hp / this.maxHp), 2);
            }
        },

        takeDamage(amount) {
            if (this.invincible) return;
            this.hp -= amount;
            this.invincible = true;
            this.invincTimer = 0.4;
            if (this.hp <= 0) this.alive = false;
        },

        reset() {
            this.x = this.spawnX;
            this.y = this.spawnY;
            this.hp = this.maxHp;
            this.alive = true;
            this.invincible = false;
            this.invincTimer = 0;
            this.dir = 1;
        },
    };
}

// H1 — zona segura, sin enemigos
// H2 — 2 enemigos (izquierda y derecha de la fuente)
// H3 — 3 enemigos (corredor superior, zona derecha, corredor izquierdo cerca de C3)
// H4 — 2 enemigos (entre pilares, guardando el arco)
export const ENEMIES = [
    makeEnemy('H2', 160, 300, 'x', 160, 310),
    makeEnemy('H2', 490, 300, 'x', 490, 620),

    makeEnemy('H3', 325, 220, 'x', 250, 400),
    makeEnemy('H3', 380, 320, 'x', 380, 620),
    makeEnemy('H3', 160, 250, 'x', 160, 280),

    makeEnemy('H4', 200, 210, 'y', 210, 390),
    makeEnemy('H4', 570, 210, 'y', 210, 390),
];
