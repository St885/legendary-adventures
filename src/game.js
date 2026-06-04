export const CANVAS_W = 960;
export const CANVAS_H = 540;

export const game = {
    state: 'START',
    currentRoom: 'H1',
    crystalsCollected: 0,
    collectedIds: new Set(),
    enemiesKilled: 0,
    bossDefeated: false,
    transitioning: false,
    fadeAlpha: 0,
    fadeTarget: null,
};

export function startTransition(targetRoom, spawnX, spawnY) {
    if (game.transitioning) return;
    game.transitioning = true;
    game.fadeAlpha = 0;
    game.fadeTarget = { room: targetRoom, spawnX, spawnY, phase: 'in' };
}

export function resetGame() {
    game.state = 'PLAYING';
    game.currentRoom = 'H1';
    game.crystalsCollected = 0;
    game.collectedIds = new Set();
    game.enemiesKilled = 0;
    game.bossDefeated = false;
    game.transitioning = false;
    game.fadeAlpha = 0;
    game.fadeTarget = null;
}
