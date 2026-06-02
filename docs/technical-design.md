# Technical Design Document — Legendary Adventures

> **Nota histórica:** Este documento refleja el diseño de la versión v1.0 (MVP).
> El juego actual es v1.1 e incluye archivos y sistemas adicionales no documentados aquí
> (enemy.js, pickup.js, particles.js, audio.js, estados PAUSED/DEAD, enemigos y combate).
> Se mantiene como referencia arquitectónica; para el estado actual ver el código fuente.

**Versión:** 1.0 (histórico)
**Fecha:** 2026-06-01  
**GDD:** `GDD.md`  
**Stack:** HTML5 Canvas + JavaScript ES6+ + CSS3 — zero dependencies

---

## 1. Stack tecnológico

| Capa | Tecnología | Decisión |
|------|-----------|----------|
| Markup | HTML5 | Canvas, estructura mínima |
| Estilos | CSS3 | Centrado del canvas, pantalla negra de fondo |
| Lógica | JavaScript ES6+ | Módulos, sin transpilador, sin bundler |
| Render | Canvas 2D API | `getContext("2d")` nativo |
| Persistencia | Ninguna en MVP | No hay guardado en MVP |
| Deploy | GitHub Pages | `index.html` en raíz, paths relativos |
| Dependencias | **Zero** | Sin frameworks, sin librerías |

---

## 2. Estructura de archivos

```
03_juegos/legendary-adventures/
├── index.html              ← entrada del juego
├── README.md               ← instrucciones y link a GitHub Pages
├── CLAUDE.md               ← instrucciones para Claude Code
├── GDD.md                  ← Game Design Document
├── LICENSE                 ← MIT
├── docs/
│   ├── technical-design.md ← este documento (histórico v1.0)
│   ├── implementation-plan.md
│   └── technical-backlog.md
├── src/
│   ├── main.js             ← init, game loop, pausa, orquestación
│   ├── game.js             ← state machine, reset, crystal/enemy tracking
│   ├── input.js            ← keyboard handler (keydown/keyup)
│   ├── player.js           ← Oliver: posición, espada, escudo, colisión, draw
│   ├── world.js            ← definición de las 4 habitaciones
│   ├── crystal.js          ← entidad cristal: render animado, hitbox
│   ├── door.js             ← entidad puerta: estado, render animado, hitbox
│   ├── enemy.js            ← [v1.1] enemigos por sala con IA y estilos visuales
│   ├── pickup.js           ← [v1.1] espada y escudo como objetos recogibles
│   ├── particles.js        ← [v1.1] sistema de partículas (gemas, muerte, puerta)
│   ├── audio.js            ← [v1.1] Web Audio API: SFX y música ambiental
│   ├── hud.js              ← overlay HUD (vida, objetos, cristales, controles)
│   ├── screens.js          ← pantallas START, WIN y DEAD con estadísticas
│   └── collision.js        ← helpers AABB
└── assets/
    ├── images/             ← vacío (se usa Canvas drawing)
    └── audio/              ← vacío (audio generado por código)
```

**Decisión de diseño:** Módulos separados por responsabilidad. `main.js` es el único punto de entrada. Todo comunica a través de un objeto `game` compartido importado desde `game.js`.

---

## 3. Configuración del Canvas

```javascript
// Constantes globales (en main.js o constants.js)
const CANVAS_W = 800;
const CANVAS_H = 600;
const FPS_TARGET = 60;

// Configuración del canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
ctx.imageSmoothingEnabled = false;  // gráficos nítidos
```

---

## 4. Game loop

```javascript
// En main.js
let lastTime = 0;

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);  // cap a 50ms
    lastTime = timestamp;
    
    update(dt);
    render();
    
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

**Delta time capado a 0.05s** para evitar tunneling si la tab pierde foco.

---

## 5. State machine del juego

```javascript
// En game.js — objeto de estado central
const game = {
    state: "START",          // "START" | "PLAYING" | "WIN"
    currentRoom: "H1",       // "H1" | "H2" | "H3" | "H4"
    crystalsCollected: 0,    // 0 | 1 | 2 | 3
    collectedIds: new Set(),  // Set de IDs de cristales recogidos: "c1", "c2", "c3"
    transitioning: false,    // true durante el fade entre habitaciones
    fadeAlpha: 0,            // 0.0 → 1.0 → 0.0 durante transición
    fadeTarget: null,        // habitación destino durante la transición
};

function resetGame() {
    game.state = "PLAYING";
    game.currentRoom = "H1";
    game.crystalsCollected = 0;
    game.collectedIds = new Set();
    game.transitioning = false;
    game.fadeAlpha = 0;
    game.fadeTarget = null;
    player.reset();  // resetea posición de Oliver
}
```

**Principio:** `game.js` es la única fuente de verdad del estado. Los demás módulos leen de él; nunca escriben directamente excepto a través de funciones expuestas por `game.js`.

---

## 6. Input handler

```javascript
// En input.js
const keys = {};

export function initInput() {
    const prevent = ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "];
    
    document.addEventListener("keydown", (e) => {
        keys[e.code] = true;
        if (prevent.includes(e.key)) e.preventDefault();
    });
    
    document.addEventListener("keyup", (e) => {
        keys[e.code] = false;
    });
}

export function isDown(code) { return !!keys[code]; }
export function isPressed(code) { /* one-frame press detection */ }
```

**Teclas registradas:** `KeyW`, `KeyA`, `KeyS`, `KeyD`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Enter`, `KeyR`

---

## 7. Entidad — Oliver (Player)

```javascript
// En player.js
const player = {
    x: 0, y: 0,           // posición top-left del hitbox
    w: 24, h: 32,          // tamaño del hitbox y sprite
    speed: 150,            // px/s
    
    update(dt, obstacles, exits) {
        // 1. Calcular velocidad deseada desde input
        let vx = 0, vy = 0;
        if (isDown("KeyA") || isDown("ArrowLeft"))  vx -= this.speed;
        if (isDown("KeyD") || isDown("ArrowRight")) vx += this.speed;
        if (isDown("KeyW") || isDown("ArrowUp"))    vy -= this.speed;
        if (isDown("KeyS") || isDown("ArrowDown"))  vy += this.speed;
        
        // 2. Mover en X, resolver colisiones en X
        this.x += vx * dt;
        for (const obs of obstacles) resolveX(this, obs);
        clampToBounds(this, 0, 0, CANVAS_W, CANVAS_H);
        
        // 3. Mover en Y, resolver colisiones en Y
        this.y += vy * dt;
        for (const obs of obstacles) resolveY(this, obs);
        clampToBounds(this, 0, 0, CANVAS_W, CANVAS_H);
        
        // 4. Verificar salidas (triggers de transición)
        checkExits(this, exits);
    },
    
    draw(ctx) {
        // MVP: dos rectángulos (cuerpo verde + cabeza oscura)
        ctx.fillStyle = "#3a8a4a";
        ctx.fillRect(this.x + 4, this.y + 8, this.w - 8, this.h - 8);  // cuerpo
        ctx.fillStyle = "#2d5e35";
        ctx.fillRect(this.x + 6, this.y, this.w - 12, 12);  // cabeza
        // Capa (rectángulo azul-verde oscuro)
        ctx.fillStyle = "#1a4a6a";
        ctx.fillRect(this.x, this.y + 10, 6, 14);   // capa izquierda
        ctx.fillRect(this.x + this.w - 6, this.y + 10, 6, 14);  // capa derecha
    },
    
    reset(x, y) {
        this.x = x ?? 380;
        this.y = y ?? 200;
    }
};
```

---

## 8. Sistema de colisiones — AABB con ejes separados

```javascript
// En collision.js

// ¿Dos rectángulos se solapan?
export function overlaps(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

// Resolver colisión solo en eje X (empujar a fuera)
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

// Resolver colisión solo en eje Y
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

// Mantener dentro del canvas
export function clampToBounds(entity, x0, y0, x1, y1) {
    entity.x = Math.max(x0, Math.min(x1 - entity.w, entity.x));
    entity.y = Math.max(y0, Math.min(y1 - entity.h, entity.y));
}
```

**Por qué ejes separados:** Evita que Oliver quede atascado en esquinas. Mover X, corregir X, luego mover Y, corregir Y — el personaje puede deslizarse a lo largo de las paredes.

---

## 9. Definición de habitaciones

```javascript
// En world.js — cada habitación es un objeto de datos
const rooms = {
    H1: {
        id: "H1",
        name: "Claro del Bosque",
        bgColor: "#5a8a3a",
        obstacles: [
            { x: 50,  y: 80,  w: 60, h: 80 },   // árbol noroeste
            { x: 680, y: 100, w: 60, h: 80 },   // árbol noreste
            { x: 300, y: 400, w: 80, h: 60 },   // roca central
            // ... más obstáculos
        ],
        exits: [
            { x: 780, y: 240, w: 20, h: 120, target: "H2", entryX: 20, entryY: 260 },  // este → H2
            { x: 340, y: 580, w: 120, h: 20, target: "H4", entryX: 380, entryY: 40 }, // sur → H4
        ],
        crystals: [],
        entryPositions: {
            fromH2: { x: 740, y: 260 },  // llega desde H2 por el oeste
            fromH4: { x: 380, y: 530 },  // llega desde H4 por el norte
        }
    },
    H2: { /* ... */ },
    H3: { /* ... */ },
    H4: { /* ... */ }
};
```

**Principio clave:** Las habitaciones son **datos puros**, no código. El engine las renderiza e interpreta. Cambiar un nivel = cambiar números, no lógica.

---

## 10. Sistema de transición entre habitaciones

```javascript
// En game.js
const FADE_SPEED = 3.0;  // unidades alpha por segundo (1.0 = opaco)

function startTransition(targetRoom, entryX, entryY) {
    game.transitioning = true;
    game.fadeAlpha = 0;
    game.fadeTarget = { room: targetRoom, x: entryX, y: entryY };
}

// En update(dt):
if (game.transitioning) {
    game.fadeAlpha += FADE_SPEED * dt;
    if (game.fadeAlpha >= 1.0) {
        // Mitad del fade: cambiar de habitación
        if (game.fadeTarget) {
            game.currentRoom = game.fadeTarget.room;
            player.reset(game.fadeTarget.x, game.fadeTarget.y);
            game.fadeTarget = null;
        }
    }
    if (game.fadeAlpha >= 2.0) {
        // Fade completo (ida + vuelta)
        game.fadeAlpha = 0;
        game.transitioning = false;
    }
}

// En render() — siempre al final del frame:
if (game.transitioning) {
    const alpha = game.fadeAlpha <= 1.0 ? game.fadeAlpha : 2.0 - game.fadeAlpha;
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}
```

---

## 11. Cristales — estado y recolección

```javascript
// En crystal.js — cada cristal es un objeto simple
// Se instancian a partir de la definición de habitación

class Crystal {
    constructor(id, x, y) {
        this.id = id;    // "c1", "c2", "c3"
        this.x = x;
        this.y = y;
        this.w = 16;
        this.h = 16;
    }
    
    draw(ctx) {
        if (game.collectedIds.has(this.id)) return;  // ya recogido — no dibujar
        ctx.fillStyle = "#00BFFF";
        // Diamante (rombo): dibujar como polígono rotado 45°
        ctx.save();
        ctx.translate(this.x + 8, this.y + 8);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-6, -6, 12, 12);
        ctx.restore();
        // Brillo sutil
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.save();
        ctx.translate(this.x + 8, this.y + 8);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-3, -3, 5, 5);
        ctx.restore();
    }
    
    checkCollect(player) {
        if (game.collectedIds.has(this.id)) return;
        if (overlaps(player, this)) {
            game.collectedIds.add(this.id);
            game.crystalsCollected++;
        }
    }
}
```

---

## 12. Puerta del Santuario

```javascript
// En door.js
const door = {
    x: 340, y: 20, w: 120, h: 30,  // posición en H4

    get isOpen() { return game.crystalsCollected >= 3; },
    
    draw(ctx) {
        if (this.isOpen) {
            ctx.fillStyle = "#FFD700";  // dorado
            // Efecto de brillo (gradiente simple)
            const grd = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
            grd.addColorStop(0, "#FFE566");
            grd.addColorStop(1, "#B8860B");
            ctx.fillStyle = grd;
        } else {
            ctx.fillStyle = "#444455";  // gris bloqueado
        }
        ctx.fillRect(this.x, this.y, this.w, this.h);
        // Marco de piedra (siempre visible)
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
    },
    
    checkVictory(player) {
        if (this.isOpen && overlaps(player, this)) {
            game.state = "WIN";
        }
    },
    
    // Como obstáculo: solo es sólido si está cerrada
    toObstacle() {
        return this.isOpen ? null : { x: this.x, y: this.y, w: this.w, h: this.h };
    }
};
```

---

## 13. HUD

```javascript
// En hud.js
export function drawHUD(ctx) {
    if (game.state !== "PLAYING") return;
    
    // Fondo semitransparente
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(10, 10, 170, 36);
    
    // Icono cristal
    ctx.fillStyle = "#00BFFF";
    ctx.save();
    ctx.translate(28, 28);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
    
    // Texto
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText(`Cristales: ${game.crystalsCollected}/3`, 44, 33);
}
```

---

## 14. Orden de render (painter's algorithm)

```javascript
function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    
    if (game.state === "START") {
        screens.drawStart(ctx);
        return;
    }
    
    // 1. Fondo de la habitación
    drawRoomBackground(ctx, game.currentRoom);
    
    // 2. Obstáculos y decoraciones
    drawRoomObstacles(ctx, game.currentRoom);
    
    // 3. Cristales (si existen en esta habitación)
    drawRoomCrystals(ctx, game.currentRoom);
    
    // 4. Puerta (si es H4)
    if (game.currentRoom === "H4") door.draw(ctx);
    
    // 5. Oliver
    player.draw(ctx);
    
    // 6. Fade de transición (si está activa)
    drawTransitionFade(ctx);
    
    // 7. HUD — siempre encima de todo
    hud.drawHUD(ctx);
    
    // 8. Pantalla de victoria (si aplica)
    if (game.state === "WIN") screens.drawWin(ctx);
}
```

---

## 15. Decisiones técnicas clave

| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| Cámara fija por habitación | Scroll continuo | Elimina transformación mundo↔pantalla y simplifica colisiones para MVP |
| AABB con ejes separados | AABB simple con respawn | Evita atascamiento en esquinas sin complejidad extra |
| Estado centralizado en `game.js` | Estado distribuido en módulos | Una sola fuente de verdad evita bugs de sincronización |
| Habitaciones como datos puros (objetos JS) | Clases con lógica | Cambiar niveles = cambiar datos, no lógica; fácil de iterar |
| Audio Web Audio API (v1.1) | Assets MP3 externos | Zero assets; procedural; resuelve autoplay policy con lazy init en primer gesto |
| Dibujo con Canvas primitives | Sprites PNG | Zero assets externos; funciona desde el día 1 sin esperar assets |

---

## 16. Riesgos técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Oliver se atasca en esquinas | Media | Alto | Resolución de colisión por ejes separados (ya diseñado) |
| Cristal 3 "oculto" no se encuentra | Media | Medio | Brillo/pulso del cristal lo hace visible aunque esté detrás |
| Transición brusca entre habitaciones | Baja | Bajo | Fade simple a negro (ya diseñado) |
| Estado de cristales no persiste al cambiar de room | Media | Alto | Estado en `game.collectedIds` (Set global), no en la room |
| Door collision race condition | Baja | Medio | `door.toObstacle()` retorna `null` si abierta — no entra en el loop de colisiones |
