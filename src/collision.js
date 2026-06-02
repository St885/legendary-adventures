export function overlaps(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

// Push entity out along X axis only (separate-axis resolution)
export function resolveX(entity, obstacle) {
    if (!overlaps(entity, obstacle)) return;
    const overlapLeft  = (entity.x + entity.w) - obstacle.x;
    const overlapRight = (obstacle.x + obstacle.w) - entity.x;
    if (overlapLeft < overlapRight) {
        entity.x = obstacle.x - entity.w;
    } else {
        entity.x = obstacle.x + obstacle.w;
    }
}

// Push entity out along Y axis only
export function resolveY(entity, obstacle) {
    if (!overlaps(entity, obstacle)) return;
    const overlapTop    = (entity.y + entity.h) - obstacle.y;
    const overlapBottom = (obstacle.y + obstacle.h) - entity.y;
    if (overlapTop < overlapBottom) {
        entity.y = obstacle.y - entity.h;
    } else {
        entity.y = obstacle.y + obstacle.h;
    }
}

export function clampToBounds(entity, x0, y0, x1, y1) {
    entity.x = Math.max(x0, Math.min(x1 - entity.w, entity.x));
    entity.y = Math.max(y0, Math.min(y1 - entity.h, entity.y));
}
