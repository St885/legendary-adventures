# Legendary Adventures

**Juego en vivo:** https://st885.github.io/legendary-adventures/

Videojuego de aventura top-down 2D en HTML5 Canvas. Oliver, joven explorador mágico,
debe recorrer el bosque encantado, recoger 3 gemas y desbloquear la Puerta del Santuario.

## Cómo ejecutar

El juego usa módulos ES6 — **requiere un servidor HTTP**, no funciona desde `file://` directamente.

**Opción A — Live Server (VS Code):**
Clic derecho en `index.html` → "Open with Live Server"

**Opción B — Python:**
```bash
python -m http.server 5500
```
Luego abrir `http://localhost:5500`

**Opción C — Node.js:**
```bash
npx serve .
```

## Controles

| Tecla | Acción |
|-------|--------|
| W / ↑ | Mover arriba |
| S / ↓ | Mover abajo |
| A / ← | Mover izquierda |
| D / → | Mover derecha |
| Espacio | Usar arma activa (espada / arco / bastón) |
| Enter | Iniciar aventura |
| P     | Pausar / reanudar |
| R     | Reiniciar partida |

## Objetivo

1. Explora las **4 habitaciones** del bosque mágico.
2. Recoge las **3 gemas azules** — el HUD (arriba derecha) muestra tu progreso: `0/3` → `3/3`.
3. Regresa a la **Puerta del Santuario (H4)** — se convierte en un arco dorado.
4. Entra en el arco dorado para **completar la aventura**.

## Mapa del mundo

```
[H1: Claro del Bosque] ───→ [H2: Fuente Mágica]
          ↓                          ↓
[H4: Puerta Santuario] ←── [H3: Caverna Cristales]
```

| Habitación | Gemas | Notas |
|------------|-------|-------|
| H1: Claro del Bosque | 1 gema (posición aleatoria) | Punto de inicio |
| H2: Fuente Mágica | 1 gema (posición aleatoria) | |
| H3: Caverna de los Cristales | 1 gema (posición aleatoria) | |
| H4: Puerta del Santuario | — | Destino final con la puerta |

## Stack técnico

- HTML5 Canvas API
- JavaScript ES6+ (módulos nativos, sin frameworks)
- CSS3

## Estructura de archivos

```
legendary-adventures/
├── index.html
├── src/
│   ├── main.js       — game loop, orquestación, pausa
│   ├── game.js       — estado global y transiciones
│   ├── player.js     — Oliver: movimiento, espada, escudo, render
│   ├── world.js      — 4 habitaciones con obstáculos y salidas
│   ├── crystal.js    — 3 gemas recolectables con posición aleatoria
│   ├── door.js       — puerta bloqueada/abierta + checkVictory
│   ├── enemy.js      — enemigos por sala con IA y estilos visuales
│   ├── pickup.js     — espada, arco, bastón, escudo y corazón como objetos recogibles
│   ├── particles.js  — sistema de partículas (gemas, muerte, puerta)
│   ├── audio.js      — Web Audio API: SFX y música ambiental
│   ├── hud.js        — HUD: vida, objetos, cristales, controles
│   ├── screens.js    — pantallas START, WIN y DEAD con estadísticas y logros
│   ├── npc.js        — Anciano del Bosque: diálogo y proximidad
│   ├── chest.js      — 2 cofres con apertura por contacto
│   ├── projectile.js — sistema de proyectiles (flechas y bolas mágicas)
│   ├── collision.js  — AABB separado por ejes
│   └── input.js      — teclado
└── assets/
    ├── images/
    └── audio/
```

## Publicar en GitHub Pages

1. Sube el repositorio a GitHub (rama `main`).
2. En el repositorio → **Settings** → **Pages**.
3. En "Source" selecciona **Deploy from a branch** → rama `main` → carpeta `/ (root)`.
4. Guarda. En ~1 minuto el juego estará disponible en `https://<usuario>.github.io/<repositorio>/`.

> El juego usa ES6 modules — GitHub Pages los sirve con los headers MIME correctos, por lo que funciona sin configuración adicional.

## Licencia

MIT © 2026 Stefano Luis
