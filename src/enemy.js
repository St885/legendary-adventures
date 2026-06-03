import { CANVAS_W, CANVAS_H } from './game.js';
import { resolveX, resolveY, clampToBounds } from './collision.js';

const ENEMY_STYLE = {
    H1: { body: '#4a8a2a', head: '#2a5a10', eye: '#c0ff80', trait: 'forest' },
    H2: { body: '#1a6a58', head: '#0d4a3a', eye: '#80eeff', trait: 'slime'  },
    H3: { body: '#5a1a7a', head: '#3a0d52', eye: '#dd88ff', trait: 'spike'  },
    H4: { body: '#6a5030', head: '#4a3418', eye: '#ffaa40', trait: 'stone'  },
};

// Validated positions per room — shuffled on every reset to randomise spawns
const SPAWN_POOLS = {
    H1: [
        { x: 400, y: 380, axis: 'x', min: 340, max: 520 },
        { x: 560, y: 330, axis: 'x', min: 480, max: 640 },
        { x: 300, y: 310, axis: 'x', min: 220, max: 380 },
        { x: 450, y: 440, axis: 'x', min: 380, max: 550 },
        { x: 620, y: 280, axis: 'x', min: 540, max: 680 },
        { x: 350, y: 470, axis: 'y', min: 430, max: 560 },
    ],
    H2: [
        { x: 160, y: 300, axis: 'x', min:  90, max: 270 },
        { x: 560, y: 300, axis: 'x', min: 490, max: 640 },
        { x: 200, y: 430, axis: 'x', min: 160, max: 300 },
        { x: 540, y: 430, axis: 'x', min: 460, max: 620 },
        { x: 200, y: 175, axis: 'x', min:  90, max: 290 },
        { x: 540, y: 175, axis: 'x', min: 450, max: 620 },
    ],
    H3: [
        { x: 325, y: 220, axis: 'x', min: 250, max: 420 },
        { x: 370, y: 355, axis: 'x', min: 280, max: 500 },
        { x: 160, y: 250, axis: 'y', min: 150, max: 360 },
        { x: 530, y: 120, axis: 'x', min: 450, max: 640 },
        { x: 380, y: 410, axis: 'x', min: 300, max: 500 },
        { x: 200, y: 490, axis: 'x', min: 160, max: 290 },
        { x: 540, y: 460, axis: 'x', min: 450, max: 600 },
        { x: 400, y: 120, axis: 'x', min: 300, max: 490 },
    ],
    H4: [
        { x: 200, y: 210, axis: 'y', min: 210, max: 390 },
        { x: 570, y: 210, axis: 'y', min: 210, max: 390 },
        { x: 340, y: 120, axis: 'x', min: 210, max: 470 },
        { x: 340, y: 450, axis: 'x', min: 210, max: 470 },
        { x: 200, y: 290, axis: 'y', min: 215, max: 390 },
        { x: 570, y: 290, axis: 'y', min: 215, max: 390 },
        { x: 280, y: 155, axis: 'x', min: 160, max: 420 },
        { x: 480, y: 450, axis: 'x', min: 300, max: 570 },
    ],
};

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeEnemy(room, type = 'melee') {
    return {
        room, type,
        x: 0, y: 0,
        w: 22, h: 26,
        hp: 2, maxHp: 2,
        speed: 60,
        alive: true,
        patrolAxis: 'x', patrolMin: 0, patrolMax: 100,
        dir: 1,
        invincible: false,
        invincTimer: 0,
        spawnX: 0, spawnY: 0,
        shootCooldown: 0,
        style: ENEMY_STYLE[room] || ENEMY_STYLE.H2,

        update(dt, obstacles) {
            if (!this.alive) return;
            if (this.invincTimer > 0) {
                this.invincTimer -= dt;
                if (this.invincTimer <= 0) this.invincible = false;
            }
            if (this.patrolAxis === 'x') {
                this.x += this.speed * this.dir * dt;
                if (this.x <= this.patrolMin)         { this.x = this.patrolMin;         this.dir =  1; }
                if (this.x + this.w >= this.patrolMax) { this.x = this.patrolMax - this.w; this.dir = -1; }
            } else {
                this.y += this.speed * this.dir * dt;
                if (this.y <= this.patrolMin)         { this.y = this.patrolMin;         this.dir =  1; }
                if (this.y + this.h >= this.patrolMax) { this.y = this.patrolMax - this.h; this.dir = -1; }
            }
            for (const obs of obstacles) resolveX(this, obs);
            for (const obs of obstacles) resolveY(this, obs);
            clampToBounds(this, 0, 0, CANVAS_W, CANVAS_H);
        },

        draw(ctx) {
            if (!this.alive) return;
            const flash = this.invincible && Math.floor(this.invincTimer * 12) % 2 === 0;
            const s = this.style;

            // Ranged indicator — orange orb floating above head
            if (this.type === 'ranged' && !flash) {
                const bob = Math.sin(performance.now() / 500) * 2;
                ctx.shadowColor = '#ff6020';
                ctx.shadowBlur  = 6;
                ctx.fillStyle   = '#ff8030';
                ctx.beginPath();
                ctx.arc(this.x + this.w / 2, this.y - 9 + bob, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

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
            this.x            = this.spawnX;
            this.y            = this.spawnY;
            this.hp           = this.maxHp;
            this.alive        = true;
            this.invincible   = false;
            this.invincTimer  = 0;
            this.dir          = 1;
            this.shootCooldown = 0;
        },
    };
}

// H1: 1 melee  |  H2: 2 melee  |  H3: 2 melee + 1 ranged  |  H4: 2 melee + 2 ranged
export const ENEMIES = [
    makeEnemy('H1', 'melee'),
    makeEnemy('H2', 'melee'),
    makeEnemy('H2', 'melee'),
    makeEnemy('H3', 'melee'),
    makeEnemy('H3', 'melee'),
    makeEnemy('H3', 'ranged'),
    makeEnemy('H4', 'melee'),
    makeEnemy('H4', 'melee'),
    makeEnemy('H4', 'ranged'),
    makeEnemy('H4', 'ranged'),
];

// Shuffle spawn pools and assign new random positions to each enemy — call on every reset
export function resetEnemies() {
    for (const room of ['H1', 'H2', 'H3', 'H4']) {
        const pool        = shuffle([...SPAWN_POOLS[room]]);
        const roomEnemies = ENEMIES.filter(e => e.room === room);
        roomEnemies.forEach((enemy, i) => {
            const p          = pool[i % pool.length];
            enemy.spawnX     = p.x;
            enemy.spawnY     = p.y;
            enemy.patrolAxis = p.axis;
            enemy.patrolMin  = p.min;
            enemy.patrolMax  = p.max;
        });
    }
    for (const enemy of ENEMIES) enemy.reset();
}
