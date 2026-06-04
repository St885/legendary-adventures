import { virtualKeyDown, virtualKeyUp } from './input.js';

const CTRL_H = 120; // touch controls bar height — portrait only (px)

let _showControls = false;

function isTouchDevice() {
    return 'ontouchstart' in window
        || navigator.maxTouchPoints > 0
        || window.matchMedia('(pointer: coarse)').matches;
}

export function initTouch(canvas) {
    _showControls = isTouchDevice();
    if (!_showControls) return;
    _buildControls();
    _buildRotateOverlay();
    window.addEventListener('resize',            _checkOrientation);
    window.addEventListener('orientationchange', _checkOrientation);
    _checkOrientation();
}

// ── Touch controls bar ────────────────────────────────────────────────────────

function _buildControls() {
    const bar = document.createElement('div');
    bar.id = 'touch-controls';
    bar.style.cssText = [
        'position:fixed', 'bottom:0', 'left:0', 'width:100%',
        `height:${CTRL_H}px`,
        'display:flex', 'align-items:center', 'justify-content:space-between',
        'padding:0 20px',
        'background:rgba(0,0,0,0.52)',
        'z-index:10', 'box-sizing:border-box', 'touch-action:none',
    ].join(';');

    // Left: D-pad joystick
    const dpad = _makeDpad();

    // Center: pause + restart
    const mid = document.createElement('div');
    mid.style.cssText = 'display:flex;gap:10px;align-items:center;';
    mid.appendChild(_makeBtn('⏸', 'KeyP', 'rgba(40,60,100,0.9)',  44));
    mid.appendChild(_makeBtn('↺', 'KeyR', 'rgba(80,40,40,0.9)',   44));

    // Right: attack
    const attack = _makeBtn('⚔', 'Space', 'rgba(50,90,40,0.9)', 70);

    bar.append(dpad, mid, attack);
    document.body.appendChild(bar);
}

// ── D-pad joystick ────────────────────────────────────────────────────────────

function _makeDpad() {
    const SIZE    = 108;
    const DEAD    = 18;   // dead zone radius (px)
    const NUB_MAX = 28;   // max nub offset (px)

    const wrap = document.createElement('div');
    wrap.style.cssText = [
        `width:${SIZE}px`, `height:${SIZE}px`,
        'position:relative', 'touch-action:none', 'flex-shrink:0',
    ].join(';');

    // Background ring
    const ring = document.createElement('div');
    ring.style.cssText = [
        `width:${SIZE}px`, `height:${SIZE}px`, 'border-radius:50%',
        'background:rgba(255,255,255,0.07)',
        'border:2px solid rgba(255,255,255,0.18)',
        'position:absolute', 'top:0', 'left:0',
    ].join(';');
    wrap.appendChild(ring);

    // Arrow labels
    for (const [txt, css] of [
        ['▲', 'top:5px;left:50%;transform:translateX(-50%)'],
        ['▼', 'bottom:5px;left:50%;transform:translateX(-50%)'],
        ['◄', 'left:6px;top:50%;transform:translateY(-50%)'],
        ['►', 'right:6px;top:50%;transform:translateY(-50%)'],
    ]) {
        const el = document.createElement('span');
        el.textContent = txt;
        el.style.cssText = 'position:absolute;color:rgba(255,255,255,0.38);font-size:12px;line-height:1;pointer-events:none;' + css;
        wrap.appendChild(el);
    }

    // Nub
    const nub = document.createElement('div');
    nub.style.cssText = [
        'width:34px', 'height:34px', 'border-radius:50%',
        'background:rgba(255,255,255,0.26)',
        'border:2px solid rgba(255,255,255,0.44)',
        'position:absolute', 'top:50%', 'left:50%',
        'transform:translate(-50%,-50%)',
        'pointer-events:none', 'transition:transform 0.04s',
    ].join(';');
    wrap.appendChild(nub);

    let _pid = null;

    function _apply(dx, dy) {
        virtualKeyUp('KeyW'); virtualKeyUp('KeyS');
        virtualKeyUp('KeyA'); virtualKeyUp('KeyD');
        if (dx >  0.3) virtualKeyDown('KeyD');
        if (dx < -0.3) virtualKeyDown('KeyA');
        if (dy < -0.3) virtualKeyDown('KeyW');
        if (dy >  0.3) virtualKeyDown('KeyS');
        nub.style.transform =
            `translate(calc(-50% + ${dx * NUB_MAX}px), calc(-50% + ${dy * NUB_MAX}px))`;
    }

    function _vec(e) {
        const r = wrap.getBoundingClientRect();
        const rawX = e.clientX - (r.left + r.width  / 2);
        const rawY = e.clientY - (r.top  + r.height / 2);
        const dist = Math.sqrt(rawX * rawX + rawY * rawY);
        if (dist < DEAD) return { dx: 0, dy: 0 };
        return { dx: rawX / dist, dy: rawY / dist };
    }

    wrap.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (_pid !== null) return;
        _pid = e.pointerId;
        wrap.setPointerCapture(e.pointerId);
        const { dx, dy } = _vec(e);
        _apply(dx, dy);
    }, { passive: false });

    wrap.addEventListener('pointermove', e => {
        if (e.pointerId !== _pid) return;
        e.preventDefault();
        const { dx, dy } = _vec(e);
        _apply(dx, dy);
    }, { passive: false });

    const _stop = e => {
        if (e.pointerId !== _pid) return;
        _pid = null;
        virtualKeyUp('KeyW'); virtualKeyUp('KeyS');
        virtualKeyUp('KeyA'); virtualKeyUp('KeyD');
        nub.style.transform = 'translate(-50%,-50%)';
    };
    wrap.addEventListener('pointerup',     _stop, { passive: false });
    wrap.addEventListener('pointercancel', _stop, { passive: false });

    return wrap;
}

// ── Action button ─────────────────────────────────────────────────────────────

function _makeBtn(label, code, bg, size) {
    const btn = document.createElement('div');
    btn.textContent = label;
    btn.style.cssText = [
        `width:${size}px`, `height:${size}px`, 'border-radius:50%',
        `background:${bg}`,
        'border:2px solid rgba(255,255,255,0.22)',
        'color:rgba(255,255,255,0.88)',
        `font-size:${size > 58 ? 22 : 16}px`,
        'display:flex', 'align-items:center', 'justify-content:center',
        'cursor:pointer', 'touch-action:none',
        '-webkit-tap-highlight-color:transparent',
        'user-select:none', 'flex-shrink:0',
        'transition:opacity 0.08s',
    ].join(';');

    btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        btn.setPointerCapture(e.pointerId);
        btn.style.opacity = '0.5';
        virtualKeyDown(code);
    }, { passive: false });

    btn.addEventListener('pointerup', e => {
        e.preventDefault();
        btn.style.opacity = '1';
        virtualKeyUp(code);
    }, { passive: false });

    btn.addEventListener('pointercancel', () => {
        btn.style.opacity = '1';
        virtualKeyUp(code);
    });

    btn.addEventListener('contextmenu', e => e.preventDefault());

    return btn;
}

// ── Orientation overlay ───────────────────────────────────────────────────────

function _buildRotateOverlay() {
    const ov = document.createElement('div');
    ov.id = 'rotate-overlay';
    ov.style.cssText = [
        'position:fixed', 'inset:0',
        'background:rgba(0,0,0,0.92)',
        'display:none', 'flex-direction:column',
        'align-items:center', 'justify-content:center',
        'z-index:200', 'touch-action:none', 'pointer-events:none',
    ].join(';');
    ov.innerHTML =
        '<div style="font-size:52px;margin-bottom:16px">📱</div>' +
        '<div style="color:#FFD700;font:bold 20px monospace;text-align:center;line-height:1.6">' +
        'Gira tu teléfono<br>para jugar mejor</div>' +
        '<div style="color:rgba(200,200,200,0.55);font:12px monospace;margin-top:12px">' +
        'Modo horizontal recomendado</div>';
    document.body.appendChild(ov);
}

function _checkOrientation() {
    const ov = document.getElementById('rotate-overlay');
    if (!ov) return;
    const isPortrait = window.innerHeight > window.innerWidth;
    ov.style.display = isPortrait ? 'flex' : 'none';
    const bar = document.getElementById('touch-controls');
    if (bar) {
        // Landscape: bar becomes transparent so canvas fills the full viewport;
        // controls float visually over the canvas corners.
        bar.style.background = isPortrait ? 'rgba(0,0,0,0.52)' : 'transparent';
    }
}
