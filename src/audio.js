let _ctx = null;
let _ambientGain  = null;
let _melodyGain   = null;
let _ambientOscs  = [];
let _melodyIdx     = 0;
let _melodyTimeout = null;
const _MELODY = [329.63, 392.00, 440.00, 523.25, 659.25, 523.25, 440.00, 392.00];

function getCtx() {
    if (!_ctx) {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
}

function tone({ freq1, freq2, type = 'sine', dur, gain = 0.18 }) {
    try {
        const ac = getCtx();
        const osc = ac.createOscillator();
        const g   = ac.createGain();
        osc.connect(g);
        g.connect(ac.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq1, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq2 ?? freq1, ac.currentTime + dur);
        g.gain.setValueAtTime(gain, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
        osc.start();
        osc.stop(ac.currentTime + dur + 0.01);
    } catch (_) {}
}

export function initAudio() {
    try { getCtx(); } catch (_) {}
}

export function playGem() {
    tone({ freq1: 600, freq2: 1200, type: 'sine', dur: 0.15, gain: 0.15 });
}

export function playSword() {
    tone({ freq1: 260, freq2: 80, type: 'sawtooth', dur: 0.09, gain: 0.12 });
}

export function playHurt() {
    tone({ freq1: 180, freq2: 60, type: 'sine', dur: 0.28, gain: 0.20 });
}

export function playHit() {
    tone({ freq1: 440, freq2: 220, type: 'square', dur: 0.07, gain: 0.09 });
}

export function playEnemyDeath() {
    tone({ freq1: 380, freq2: 110, type: 'square', dur: 0.22, gain: 0.10 });
}

export function playEnemyShoot() {
    tone({ freq1: 320, freq2: 180, type: 'sine', dur: 0.12, gain: 0.08 });
}

export function playHeal() {
    tone({ freq1: 500, freq2: 1000, type: 'sine', dur: 0.18, gain: 0.16 });
}

export function playNpc() {
    tone({ freq1: 660, freq2: 660, type: 'sine', dur: 0.10, gain: 0.08 });
}

export function playVictory() {
    try {
        const ac = getCtx();
        [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
            const osc = ac.createOscillator();
            const g   = ac.createGain();
            osc.connect(g);
            g.connect(ac.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            const t = ac.currentTime + i * 0.12;
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(0.20, t + 0.04);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.50);
            osc.start(t);
            osc.stop(t + 0.52);
        });
    } catch (_) {}
}

export function playBowShoot() {
    tone({ freq1: 800, freq2: 200, type: 'sawtooth', dur: 0.07, gain: 0.12 });
}

export function playStaffShoot() {
    try {
        const ac = getCtx();
        const osc = ac.createOscillator();
        const g   = ac.createGain();
        osc.connect(g);
        g.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 0.20);
        g.gain.setValueAtTime(0.001, ac.currentTime);
        g.gain.linearRampToValueAtTime(0.14, ac.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.22);
        osc.start();
        osc.stop(ac.currentTime + 0.24);
    } catch (_) {}
}

export function playDoorOpen() {
    try {
        const ac = getCtx();
        [261.63, 329.63, 392.00].forEach((freq, i) => {
            const osc = ac.createOscillator();
            const g   = ac.createGain();
            osc.connect(g);
            g.connect(ac.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            const t = ac.currentTime + i * 0.14;
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(0.18, t + 0.03);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.40);
            osc.start(t);
            osc.stop(t + 0.42);
        });
    } catch (_) {}
}

export function playChestOpen() {
    try {
        const ac = getCtx();
        [[440, 0], [660, 0.12]].forEach(([freq, delay]) => {
            const osc = ac.createOscillator();
            const g   = ac.createGain();
            osc.connect(g);
            g.connect(ac.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            const t = ac.currentTime + delay;
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(0.14, t + 0.03);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
            osc.start(t);
            osc.stop(t + 0.30);
        });
    } catch (_) {}
}

function _scheduleNote() {
    if (!_melodyGain) return;
    try {
        const ac   = getCtx();
        const freq = _MELODY[_melodyIdx % _MELODY.length];
        const t    = ac.currentTime;
        const osc  = ac.createOscillator();
        const g    = ac.createGain();
        osc.connect(g);
        g.connect(_melodyGain);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0,      t);
        g.gain.linearRampToValueAtTime(0.055, t + 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.40);
        osc.start(t);
        osc.stop(t + 0.42);
        _melodyIdx++;
        _melodyTimeout = setTimeout(_scheduleNote, 500);
    } catch (_) {}
}

export function startAmbient() {
    if (_ambientOscs.length) return;
    try {
        const ac = getCtx();

        // Quiet bass pad for depth
        _ambientGain = ac.createGain();
        _ambientGain.gain.setValueAtTime(0, ac.currentTime);
        _ambientGain.gain.linearRampToValueAtTime(0.022, ac.currentTime + 2.5);
        _ambientGain.connect(ac.destination);
        for (const freq of [130.81, 196.00]) {
            const osc = ac.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(_ambientGain);
            osc.start();
            _ambientOscs.push(osc);
        }

        // Melody pass-through gain
        _melodyGain = ac.createGain();
        _melodyGain.gain.setValueAtTime(1.0, ac.currentTime);
        _melodyGain.connect(ac.destination);

        _melodyIdx = 0;
        _scheduleNote();
    } catch (_) {}
}

export function stopAmbient() {
    if (_melodyTimeout !== null) { clearTimeout(_melodyTimeout); _melodyTimeout = null; }
    for (const osc of _ambientOscs) { try { osc.stop(); } catch (_) {} }
    _ambientOscs = [];
    if (_ambientGain) { try { _ambientGain.disconnect(); } catch (_) {} _ambientGain = null; }
    if (_melodyGain)  { try { _melodyGain.disconnect();  } catch (_) {} _melodyGain  = null; }
}
