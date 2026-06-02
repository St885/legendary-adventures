import { game, resetGame, CANVAS_W, CANVAS_H } from './game.js';
import { initInput, isPressed, clearPressed } from './input.js';
import { drawStart, drawWin, drawDead } from './screens.js';
import { player } from './player.js';
import { ROOMS, drawRoom } from './world.js';
import { crystals, resetCrystals } from './crystal.js';
import { drawHUD } from './hud.js';
import { door } from './door.js';
import { ENEMIES } from './enemy.js';
import { swordPickup, shieldPickup } from './pickup.js';
import { overlaps } from './collision.js';
import { emitGem, emitDeath, emitDoorOpen, updateParticles, drawParticles, resetParticles } from './particles.js';
import { initAudio, playGem, playSword, playHurt, playEnemyDeath, playDoorOpen, startAmbient, stopAmbient } from './audio.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
ctx.imageSmoothingEnabled = false;

initInput();
player.reset();

const FADE_SPEED = 2.5;
let lastTime = 0;
let roomNameTimer = 0;
let doorWasOpen = false;
let paused = false;

function handleReset() {
    resetGame();
    player.reset();
    for (const enemy of ENEMIES) enemy.reset();
    swordPickup.reset();
    shieldPickup.reset();
    resetCrystals();
    resetParticles();
    doorWasOpen = false;
    paused = false;
    stopAmbient();
    initAudio();
    startAmbient();
    roomNameTimer = 3;
}

function update(dt) {
    if (game.state === 'START') {
        if (isPressed('Enter')) handleReset();
        clearPressed();
        return;
    }

    if (isPressed('KeyR')) handleReset();

    if (game.state === 'DEAD') {
        clearPressed();
        return;
    }

    if (game.transitioning) {
        if (game.fadeTarget.phase === 'in') {
            game.fadeAlpha += FADE_SPEED * dt;
            if (game.fadeAlpha >= 1) {
                game.fadeAlpha = 1;
                game.currentRoom = game.fadeTarget.room;
                player.resetPosition(game.fadeTarget.spawnX, game.fadeTarget.spawnY);
                game.fadeTarget.phase = 'out';
                roomNameTimer = 2.5;
            }
        } else {
            game.fadeAlpha -= FADE_SPEED * dt;
            if (game.fadeAlpha <= 0) {
                game.fadeAlpha = 0;
                game.transitioning = false;
                game.fadeTarget = null;
            }
        }
        clearPressed();
        return;
    }

    // Pause toggle — only when PLAYING and not transitioning
    if (game.state === 'PLAYING' && isPressed('KeyP')) paused = !paused;
    if (paused && game.state === 'PLAYING') { clearPressed(); return; }

    if (roomNameTimer > 0) roomNameTimer -= dt;

    updateParticles(dt);

    if (game.state === 'PLAYING') {
        if (isPressed('Space')) {
            if (player.hasSword && player.attackCooldown <= 0) playSword();
            player.tryAttack();
        }

        const room = ROOMS[game.currentRoom];
        const obstacles = [...room.obstacles];
        if (game.currentRoom === 'H4') {
            const doorObs = door.toObstacle();
            if (doorObs) obstacles.push(doorObs);
        }
        player.update(dt, obstacles, room.exits);

        const roomEnemies = ENEMIES.filter(e => e.room === game.currentRoom);

        for (const enemy of roomEnemies) enemy.update(dt, room.obstacles);

        // Sword hits enemies
        if (player.attacking && player.hasSword) {
            const hitbox = player.getSwordHitbox();
            for (const enemy of roomEnemies) {
                if (enemy.alive && overlaps(hitbox, enemy)) {
                    enemy.takeDamage(1);
                    if (!enemy.alive) {
                        emitDeath(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
                        playEnemyDeath();
                        game.enemiesKilled++;
                    }
                }
            }
        }

        // Enemies hit player — only one contact per frame to avoid multi-stack damage
        for (const enemy of roomEnemies) {
            if (enemy.alive && overlaps(enemy, player)) {
                if (!player.invincible) playHurt();
                player.takeDamage();
                break;
            }
        }

        // Skip pickups/crystals/door if player just died
        if (game.state !== 'PLAYING') {
            stopAmbient();
            clearPressed();
            return;
        }

        // Pickups
        if (swordPickup.room === game.currentRoom && swordPickup.checkPickup(player)) {
            player.hasSword = true;
        }
        if (shieldPickup.room === game.currentRoom && shieldPickup.checkPickup(player)) {
            player.hasShield = true;
        }

        // Crystals
        for (const c of crystals) {
            if (c.room === game.currentRoom && c.checkCollect(player)) { emitGem(c.cx, c.cy); playGem(); }
        }

        // Door victory
        if (game.currentRoom === 'H4') {
            if (door.isOpen && !doorWasOpen) {
                doorWasOpen = true;
                emitDoorOpen(door.x + door.w / 2, door.y + door.h / 2);
                playDoorOpen();
            }
            door.checkVictory(player);
            if (game.state === 'WIN') stopAmbient();
        }
    }

    clearPressed();
}

function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (game.state === 'START') {
        drawStart(ctx);
        return;
    }

    drawRoom(ctx, game.currentRoom);

    // Pickups
    if (swordPickup.room  === game.currentRoom) swordPickup.draw(ctx);
    if (shieldPickup.room === game.currentRoom) shieldPickup.draw(ctx);

    // Crystals
    for (const c of crystals) {
        if (c.room === game.currentRoom) c.draw(ctx);
    }

    // Door
    if (game.currentRoom === 'H4') door.draw(ctx);

    // Enemies
    for (const enemy of ENEMIES) {
        if (enemy.room === game.currentRoom) enemy.draw(ctx);
    }

    // Player (sword drawn first so it appears behind Oliver's body)
    player.drawSword(ctx);
    player.draw(ctx);

    drawParticles(ctx);
    drawHUD(ctx);

    if (roomNameTimer > 0) {
        const alpha = Math.min(1, roomNameTimer / 0.6);
        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(CANVAS_W / 2 - 180, 18, 360, 34);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFD770';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ROOMS[game.currentRoom].name, CANVAS_W / 2, 42);
        ctx.textAlign = 'left';
        ctx.restore();
    }

    if (paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(255,255,255,0.3)';
        ctx.shadowBlur  = 12;
        ctx.fillStyle = '#ffffff';
        ctx.font      = 'bold 48px serif';
        ctx.fillText('PAUSA', CANVAS_W / 2, CANVAS_H / 2 - 20);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(180,200,220,0.85)';
        ctx.font      = '18px monospace';
        ctx.fillText('Presiona P para continuar', CANVAS_W / 2, CANVAS_H / 2 + 28);
        ctx.textAlign = 'left';
    }

    if (game.state === 'WIN')  drawWin(ctx,  { hp: player.hp, maxHp: player.maxHp, kills: game.enemiesKilled, crystals: game.crystalsCollected });
    if (game.state === 'DEAD') drawDead(ctx, { kills: game.enemiesKilled, crystals: game.crystalsCollected });

    if (game.fadeAlpha > 0) {
        ctx.fillStyle = `rgba(0,0,0,${game.fadeAlpha})`;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
}

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    update(dt);
    render();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
