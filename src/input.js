const keys = {};
const keysPressed = {};

export function initInput() {
    const preventScroll = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];

    document.addEventListener('keydown', (e) => {
        if (!keys[e.code]) {
            keysPressed[e.code] = true;
        }
        keys[e.code] = true;
        if (preventScroll.includes(e.key)) e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
}

export function isDown(code) {
    return !!keys[code];
}

export function isPressed(code) {
    return !!keysPressed[code];
}

export function clearPressed() {
    for (const key in keysPressed) {
        delete keysPressed[key];
    }
}

// Used by touch controls to simulate keyboard input
export function virtualKeyDown(code) {
    if (!keys[code]) keysPressed[code] = true;
    keys[code] = true;
}

export function virtualKeyUp(code) {
    keys[code] = false;
}
