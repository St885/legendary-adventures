import { game, resetGame, CANVAS_W, CANVAS_H } from './game.js';
import { initInput, isPressed, clearPressed } from './input.js';
import { drawStart, drawWin, drawDead } from './screens.js';
import { player } from './player.js';
import { ROOMS, drawRoom } from './world.js';
import { crystals, resetCrystals } from './crystal.js';
import { drawHUD } from './hud.js';
import { door } from './door.js';
import { ENEMIES, resetEnemies } from './enemy.js';
import { swordPickup, bowPickup, staffPickup, shieldPickup, heartPickup } from './pickup.js';
import { fireProjectile, getProjectiles, updateProjectiles, drawProjectiles, resetProjectiles,
         fireEnemyProjectile, getEnemyProjectiles, updateEnemyProjectiles, drawEnemyProjectiles, resetEnemyProjectiles,
         fireBossProjectile, getBossProjectiles, updateBossProjectiles, drawBossProjectiles, resetBossProjectiles } from './projectile.js';
import { boss } from './boss.js';
import { npc } from './npc.js';
import { overlaps } from './collision.js';
import { emitGem, emitHit, emitDeath, emitDoorOpen, emitChest, updateParticles, drawParticles, resetParticles } from './particles.js';
import { initAudio, playGem, playSword, playHurt, playHit, playEnemyDeath, playEnemyShoot, playDoorOpen, playHeal, playNpc, playChestOpen, playBowShoot, playStaffShoot, startAmbient, stopAmbient } from './audio.js';
import { chestH2, chestH3 } from './chest.js';
import { initTouch } from './touch.js';

const weaponPickups = { sword: swordPickup, bow: bowPickup, staff: staffPickup };

function facingToDir(facing) {
    switch (facing) {
        case 'right': return {  x: 1, y:  0 };
        case 'left':  return {  x:-1, y:  0 };
        case 'up':    return {  x: 0, y: -1 };
        default:      return {  x: 0, y:  1 };
    }
}

function getDropPos(player, obstacles) {
    const OFFSET = 32, MARGIN = 24;
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    const primary = {
        right: { x: -OFFSET, y:       0 },
        left:  { x:  OFFSET, y:       0 },
        up:    { x:       0, y:  OFFSET },
        down:  { x:       0, y: -OFFSET },
    }[player.facing] || { x: -OFFSET, y: 0 };
    const candidates = [
        primary,
        { x:  primary.y, y: -primary.x },
        { x: -primary.y, y:  primary.x },
        { x: 0,          y:           0 },
    ];
    for (const d of candidates) {
        const px  = Math.max(MARGIN, Math.min(CANVAS_W - MARGIN, cx + d.x));
        const py  = Math.max(MARGIN, Math.min(CANVAS_H - MARGIN, cy + d.y));
        const box = { x: px - 12, y: py - 12, w: 24, h: 24 };
        if (!obstacles.some(obs => overlaps(box, obs))) return { x: px, y: py };
    }
    return {
        x: Math.max(MARGIN, Math.min(CANVAS_W - MARGIN, cx)),
        y: Math.max(MARGIN, Math.min(CANVAS_H - MARGIN, cy)),
    };
}

function drawBossBar(ctx, boss) {
    if (!boss || !boss.alive) return;
    const maxHp = boss.maxHp || 8;
    const hp    = Math.max(0, boss.hp || 0);
    const x = Math.round(CANVAS_W / 2 - 120);
    const y = 8;
    const w = 240;
    const h = 18;
    const pct = hp / maxHp;
    const segW = w / maxHp;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(x - 60, y - 2, w + 70, h + 4);

    ctx.fillStyle = 'rgba(50,15,0,0.9)';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = 'rgba(200,60,0,0.9)';
    ctx.fillRect(x, y, Math.round(w * pct), h);

    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    for (let i = 1; i < maxHp; i++) {
        const sx = x + Math.round(i * segW);
        ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx, y + h); ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,180,0,0.7)';
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('GUARDIAN', x - 4, y + 13);
    ctx.textAlign = 'left';
    ctx.lineWidth = 1;
    ctx.restore();
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
ctx.imageSmoothingEnabled = false;

initTouch(canvas);
initInput();
player.reset();

const FADE_SPEED = 2.5;
let lastTime = 0;
let roomNameTimer = 0;
let doorWasOpen = false;
let paused = false;
let winTimer = 0;

function handleReset() {
    resetGame();
    player.reset();
    resetEnemies();
    swordPickup.reset();
    bowPickup.reset();
    staffPickup.reset();
    shieldPickup.reset();
    heartPickup.reset();
    npc.reset();
    resetCrystals();
    resetParticles();
    resetProjectiles();
    resetEnemyProjectiles();
    chestH2.reset();
    chestH3.reset();
    boss.reset();
    resetBossProjectiles();
    doorWasOpen = false;
    paused = false;
    winTimer = 0;
    stopAmbient();
    initAudio();
    startAmbient();
    roomNameTimer = 3;
}

function update(dt) {
    if (game.state === 'START') {
        if (isPressed('Enter') || isPressed('KeyR')) handleReset();
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

    if (game.state === 'PLAYING' && isPressed('KeyP')) paused = !paused;
    if (paused && game.state === 'PLAYING') { clearPressed(); return; }

    if (roomNameTimer > 0) roomNameTimer -= dt;

    updateParticles(dt);

    if (game.state === 'PLAYING') {
        if (isPressed('Space')) {
            if (player.weapon === 'sword') {
                if (player.attackCooldown <= 0) playSword();
                player.tryAttack();
            } else if (player.weapon === 'bow' && player.attackCooldown <= 0) {
                const d = facingToDir(player.facing);
                fireProjectile('arrow', player.x + player.w / 2, player.y + player.h / 2, d.x, d.y);
                playBowShoot();
                player.attackCooldown = 0.4;
            } else if (player.weapon === 'staff' && player.attackCooldown <= 0) {
                const d = facingToDir(player.facing);
                fireProjectile('bolt', player.x + player.w / 2, player.y + player.h / 2, d.x, d.y);
                playStaffShoot();
                player.attackCooldown = 0.7;
            }
        }

        const room = ROOMS[game.currentRoom];
        const obstacles = [...room.obstacles];
        if (game.currentRoom === 'H4') {
            if (game.crystalsCollected >= 3 && !boss.alive && !game.bossDefeated) boss.spawn();
            const doorObs = door.toObstacle();
            if (doorObs) obstacles.push(doorObs);
            // Boss moves against current obstacles (not itself)
            if (boss.alive) boss.update(dt, obstacles, player);
            // Add boss as obstacle for player after boss has moved
            const bossObs = boss.toObstacle();
            if (bossObs) obstacles.push(bossObs);
        }
        player.update(dt, obstacles, room.exits);

        const roomEnemies = ENEMIES.filter(e => e.room === game.currentRoom);

        for (const enemy of roomEnemies) enemy.update(dt, room.obstacles);

        // Ranged enemies shoot at Oliver when within range
        for (const enemy of roomEnemies) {
            if (enemy.type !== 'ranged' || !enemy.alive) continue;
            if (enemy.shootCooldown > 0) { enemy.shootCooldown -= dt; continue; }
            const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2;
            const px = player.x + player.w / 2, py = player.y + player.h / 2;
            const dx = px - ex, dy = py - ey;
            const distSq = dx * dx + dy * dy;
            if (distSq > 220 * 220) continue;
            const dist = Math.sqrt(distSq);
            fireEnemyProjectile(ex, ey, dx / dist, dy / dist);
            playEnemyShoot();
            enemy.shootCooldown = 3.0;
        }

        // Boss attacks: ranged shot (20s cooldown) and melee (1.5s cooldown)
        if (boss.alive && game.currentRoom === 'H4') {
            const shootDir = boss.tryShoot(player);
            if (shootDir) {
                fireBossProjectile(boss.cx, boss.cy, shootDir.dx, shootDir.dy);
                playEnemyShoot();
            }
            if (boss.tryMelee(player)) {
                if (!player.invincible) playHurt();
                player.takeDamage();
            }
        }

        updateProjectiles(dt, obstacles);
        updateEnemyProjectiles(dt, obstacles);
        updateBossProjectiles(dt, obstacles);

        // Projectiles hit enemies
        for (const proj of getProjectiles()) {
            for (const enemy of roomEnemies) {
                if (enemy.alive && overlaps(proj, enemy)) {
                    proj.alive = false;
                    enemy.takeDamage(proj.damage);
                    if (!enemy.alive) {
                        emitDeath(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
                        playEnemyDeath();
                        game.enemiesKilled++;
                    } else {
                        emitHit(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
                        playHit();
                    }
                    break;
                }
            }
        }

        // Player projectiles hit boss
        if (boss.alive && game.currentRoom === 'H4') {
            for (const proj of getProjectiles()) {
                if (!proj.alive) continue;
                if (overlaps(proj, boss)) {
                    proj.alive = false;
                    if (boss.takeDamage(proj.damage)) {
                        game.bossDefeated = true;
                        game.enemiesKilled++;
                        emitDeath(boss.cx, boss.cy);
                        playEnemyDeath();
                    } else {
                        emitHit(boss.cx, boss.cy);
                        playHit();
                    }
                }
            }
        }

        // Enemy projectiles hit Oliver
        for (const proj of getEnemyProjectiles()) {
            if (proj.alive && overlaps(proj, player)) {
                proj.alive = false;
                if (!player.invincible) playHurt();
                player.takeDamage();
                break;
            }
        }

        // Boss projectiles hit Oliver
        for (const proj of getBossProjectiles()) {
            if (proj.alive && overlaps(proj, player)) {
                proj.alive = false;
                if (!player.invincible) playHurt();
                player.takeDamage();
                break;
            }
        }

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
                    } else {
                        emitHit(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
                        playHit();
                    }
                }
            }
            // Sword hits boss
            if (boss.alive && game.currentRoom === 'H4' && overlaps(hitbox, boss)) {
                if (boss.takeDamage(1)) {
                    game.bossDefeated = true;
                    game.enemiesKilled++;
                    emitDeath(boss.cx, boss.cy);
                    playEnemyDeath();
                } else {
                    emitHit(boss.cx, boss.cy);
                    playHit();
                }
            }
        }

        // Enemies hit player
        for (const enemy of roomEnemies) {
            if (enemy.alive && overlaps(enemy, player)) {
                if (!player.invincible) playHurt();
                player.takeDamage();
                break;
            }
        }

        if (game.state !== 'PLAYING') {
            stopAmbient();
            clearPressed();
            return;
        }

        if (swordPickup.dropCooldown > 0) swordPickup.dropCooldown -= dt;
        if (bowPickup.dropCooldown   > 0) bowPickup.dropCooldown   -= dt;
        if (staffPickup.dropCooldown > 0) staffPickup.dropCooldown -= dt;

        if (swordPickup.room === game.currentRoom && !swordPickup.collected && swordPickup.dropCooldown <= 0 && player.weapon !== 'sword' && overlaps(player, swordPickup.aabb)) {
            if (player.weapon !== null) {
                const pos = getDropPos(player, obstacles);
                weaponPickups[player.weapon].dropAt(pos.x, pos.y, game.currentRoom);
            }
            swordPickup.collected = true;
            player.weapon = 'sword';
        }
        if (bowPickup.room === game.currentRoom && !bowPickup.collected && bowPickup.dropCooldown <= 0 && player.weapon !== 'bow' && overlaps(player, bowPickup.aabb)) {
            if (player.weapon !== null) {
                const pos = getDropPos(player, obstacles);
                weaponPickups[player.weapon].dropAt(pos.x, pos.y, game.currentRoom);
            }
            bowPickup.collected = true;
            player.weapon = 'bow';
        }
        if (staffPickup.room === game.currentRoom && !staffPickup.collected && staffPickup.dropCooldown <= 0 && player.weapon !== 'staff' && overlaps(player, staffPickup.aabb)) {
            if (player.weapon !== null) {
                const pos = getDropPos(player, obstacles);
                weaponPickups[player.weapon].dropAt(pos.x, pos.y, game.currentRoom);
            }
            staffPickup.collected = true;
            player.weapon = 'staff';
        }

        if (shieldPickup.room === game.currentRoom && shieldPickup.checkPickup(player)) {
            player.hasShield = true;
        }
        if (heartPickup.room === game.currentRoom && player.hp < player.maxHp && heartPickup.checkPickup(player)) {
            player.heal(1);
            playHeal();
        }

        if (chestH2.room === game.currentRoom && chestH2.checkOpen(player)) {
            emitChest(chestH2.cx, chestH2.cy - 12, '#ffb0b0');
            playChestOpen();
            if (player.hp < player.maxHp) player.heal(1);
        }
        if (chestH3.room === game.currentRoom && chestH3.checkOpen(player)) {
            emitChest(chestH3.cx, chestH3.cy - 12, '#FFD700');
            playChestOpen();
        }

        if (npc.room === game.currentRoom && !npc._chimed && npc.isNear(player)) {
            npc._chimed = true;
            playNpc();
        }

        for (const c of crystals) {
            if (c.room === game.currentRoom && c.checkCollect(player)) { emitGem(c.cx, c.cy); playGem(); }
        }

        if (game.currentRoom === 'H4') {
            if (door.isOpen && !doorWasOpen) {
                doorWasOpen = true;
                emitDoorOpen(door.x + door.w / 2, door.y + door.h / 2);
                playDoorOpen();
            }
            door.checkVictory(player);
            if (game.state === 'WIN') {
                stopAmbient();
                winTimer = 0;
            }
        }
    }

    if (game.state === 'WIN') winTimer += dt;

    clearPressed();
}

function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (game.state === 'START') {
        drawStart(ctx);
        return;
    }

    drawRoom(ctx, game.currentRoom);

    if (swordPickup.room  === game.currentRoom) swordPickup.draw(ctx);
    if (bowPickup.room    === game.currentRoom) bowPickup.draw(ctx);
    if (staffPickup.room  === game.currentRoom) staffPickup.draw(ctx);
    if (shieldPickup.room === game.currentRoom) shieldPickup.draw(ctx);
    if (heartPickup.room  === game.currentRoom) heartPickup.draw(ctx, player.hp < player.maxHp);

    if (chestH2.room === game.currentRoom) chestH2.draw(ctx);
    if (chestH3.room === game.currentRoom) chestH3.draw(ctx);

    if (npc.room === game.currentRoom) npc.draw(ctx);

    for (const c of crystals) {
        if (c.room === game.currentRoom) c.draw(ctx);
    }

    if (game.currentRoom === 'H4') {
        door.draw(ctx);
        boss.draw(ctx);
    }

    for (const enemy of ENEMIES) {
        if (enemy.room === game.currentRoom) enemy.draw(ctx);
    }

    drawProjectiles(ctx);
    drawEnemyProjectiles(ctx);
    drawBossProjectiles(ctx);

    player.drawSword(ctx);
    player.draw(ctx);

    drawParticles(ctx);
    if (npc.room === game.currentRoom && npc.isNear(player)) npc.drawDialog(ctx);
    const chestsOpened = (chestH2.open ? 1 : 0) + (chestH3.open ? 1 : 0);
    drawHUD(ctx, { chestsOpened });

    if (game.currentRoom === 'H4') {
        drawBossBar(ctx, boss);
        if (boss.alive && game.crystalsCollected >= 3 && roomNameTimer <= 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.52)';
            ctx.fillRect(CANVAS_W / 2 - 218, 34, 436, 22);
            ctx.fillStyle = '#FFD700';
            ctx.font      = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Derrota al Guardian para abrir el Santuario', CANVAS_W / 2, 49);
            ctx.textAlign = 'left';
            ctx.restore();
        }
    }

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

    if (game.state === 'WIN')  drawWin(ctx,  { hp: player.hp, maxHp: player.maxHp, kills: game.enemiesKilled, crystals: game.crystalsCollected, talked: npc._chimed, chestsOpened }, winTimer);
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
