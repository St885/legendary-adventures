let _ctx = null;
let _ambientGain = null;
let _ambientOscs = [];

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

export function playEnemyDeath() {
    tone({ freq1: 380, freq2: 110, type: 'square', dur: 0.22, gain: 0.10 });
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

export function startAmbient() {
    if (_ambientOscs.length) return;
    try {
        const ac = getCtx();
        _ambientGain = ac.createGain();
        _ambientGain.gain.setValueAtTime(0, ac.currentTime);
        _ambientGain.gain.linearRampToValueAtTime(0.03, ac.currentTime + 2.0);
        _ambientGain.connect(ac.destination);
        for (const freq of [130.81, 196.00]) {
            const osc = ac.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(_ambientGain);
            osc.start();
            _ambientOscs.push(osc);
        }
    } catch (_) {}
}

export function stopAmbient() {
    for (const osc of _ambientOscs) {
        try { osc.stop(); } catch (_) {}
    }
    _ambientOscs = [];
    if (_ambientGain) {
        try { _ambientGain.disconnect(); } catch (_) {}
        _ambientGain = null;
    }
}
