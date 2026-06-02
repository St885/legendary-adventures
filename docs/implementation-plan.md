# Plan de Implementación — Legendary Adventures

**Versión:** 1.0  
**Fecha:** 2026-06-01  
**Total MVP:** 20 puntos — ~10 sesiones de 2h  
**Ritmo de Stefano:** 2-3 h/semana → **~2-3 semanas calendario**

---

## Principios del plan

1. **Una historia a la vez** — nunca empezar la siguiente sin validar la anterior en el navegador
2. **Probar en Chrome al terminar cada historia** — 0 errores en consola antes de avanzar
3. **Código sin audio ni assets externos** — todo se dibuja con Canvas primitives en MVP
4. **Si algo resulta más difícil de lo esperado** — parar y reportar antes de continuar

---

## Fase 1 — Fundación técnica (3 pts | ~1 sesión)

**Objetivo:** El juego arranca, el canvas existe y los estados funcionan.

| Orden | Historia | Archivos a crear | Pts |
|-------|----------|-----------------|-----|
| 1 | E1-03: Estructura de archivos | `index.html`, `src/main.js`, `src/game.js`, `src/input.js`, `assets/` | 1 |
| 2 | E1-01: Game loop 60fps | `src/main.js` (loop + delta time) | 1 |
| 3 | E1-02: Canvas 800×600 y estados | `src/game.js` (state machine), `src/screens.js` (placeholder) | 1 |

**Checkpoint Fase 1:** Abrir `index.html` → canvas negro visible → pantalla START con texto placeholder → 0 errores de consola.

---

## Fase 2 — Oliver el jugador (4 pts | ~2 sesiones)

**Objetivo:** Oliver aparece, se mueve y choca con los límites del canvas.

| Orden | Historia | Archivos | Pts |
|-------|----------|----------|-----|
| 4 | E2-01: Oliver visible | `src/player.js` (draw de rectángulos) | 1 |
| 5 | E2-02: Movimiento 4 dirs | `src/input.js` (handler completo), `src/player.js` (update) | 1 |
| 6 | E2-03: Colisión con muros | `src/collision.js` (AABB ejes separados) — testar con muro temporal | 1 |
| 7 | E2-04: Cámara fija por room | Verificar que la room de 800×600 no necesita transformación | 1 |

**Checkpoint Fase 2:** Oliver se mueve en 4 direcciones, no sale del canvas, choca correctamente con un rectángulo de prueba. 0 errores.

---

## Fase 3 — El mundo (3 pts | ~1-2 sesiones)

**Objetivo:** Las 4 habitaciones existen, tienen diseño propio y se puede navegar entre ellas.

| Orden | Historia | Archivos | Pts |
|-------|----------|----------|-----|
| 8 | E3-01: Las 4 habitaciones | `src/world.js` (definición de H1, H2, H3, H4 con obstáculos) | 2 |
| 9 | E3-02: Transiciones con fade | `src/game.js` (startTransition, fadeAlpha) | 1 |

**Checkpoint Fase 3:** Navegar H1→H2→H3→H4→H1 completo. Cada habitación tiene color y obstáculos distintos. Fade funciona. 0 errores.

---

## Fase 4 — Mecánica central (4 pts | ~2 sesiones)

**Objetivo:** Los 3 cristales existen, se recogen, el HUD se actualiza, la puerta funciona.

| Orden | Historia | Archivos | Pts |
|-------|----------|----------|-----|
| 10 | E4-01: Cristales en el mapa | `src/crystal.js` (instancias en H2 y H3), `src/world.js` (positions) | 1 |
| 11 | E4-02: Recolección de cristales | `src/crystal.js` (checkCollect), `src/game.js` (collectedIds) | 1 |
| 12 | E4-03: HUD contador | `src/hud.js` | 1 |
| 13 | E4-04: Puerta bloqueada/abierta | `src/door.js` (estado, render, toObstacle, checkVictory) | 1 |

**Checkpoint Fase 4:** Recoger los 3 cristales → HUD llega a 3/3 → puerta cambia de gris a dorada → cruzar la puerta cambia el estado a WIN. 0 errores.

---

## Fase 5 — Loop completo (3 pts | ~1 sesión)

**Objetivo:** Pantalla de inicio, pantalla de victoria, y reinicio funcionan.

| Orden | Historia | Archivos | Pts |
|-------|----------|----------|-----|
| 14 | E5-01: Pantalla de inicio | `src/screens.js` (drawStart con título + instrucciones) | 1 |
| 15 | E5-02: Pantalla de victoria | `src/screens.js` (drawWin con overlay y mensaje) | 1 |
| 16 | E5-03: Reinicio con R | `src/game.js` (resetGame completo) | 1 |

**Checkpoint Fase 5:** El juego es completamente jugable: Inicio → Aventura → Victoria → Reinicio. 0 errores en partida completa. 0 errores al reiniciar 5 veces.

---

## Fase 6 — Publicación mínima (3 pts | ~1 sesión)

**Objetivo:** El juego está listo para GitHub Pages.

| Orden | Historia | Archivos | Pts |
|-------|----------|----------|-----|
| 17 | E6-01: index.html funcional | `index.html` final (limpio, paths correctos) | 1 |
| 18 | E6-02: README.md | `README.md` con descripción, controles y link a GitHub Pages | 1 |
| 19 | E6-03: Paths relativos + .gitignore | Verificar todos los `src=` y paths | 1 |

**Checkpoint Fase 6:** El juego funciona abriendo `index.html` directamente. Funciona desde `file://` y desde `http://`. README legible en GitHub.

---

## Orden de creación de archivos

```
Sesión 1 (Fase 1):
  index.html
  src/main.js
  src/game.js
  src/input.js
  src/screens.js (placeholder)
  src/collision.js
  
Sesión 2-3 (Fase 2):
  src/player.js
  src/collision.js (completar)
  
Sesión 4-5 (Fase 3):
  src/world.js
  src/game.js (añadir transición)
  
Sesión 6-7 (Fase 4):
  src/crystal.js
  src/hud.js
  src/door.js
  
Sesión 8 (Fase 5):
  src/screens.js (completar)
  src/game.js (resetGame completo)
  
Sesión 9-10 (Fase 6):
  README.md
  LICENSE
  .gitignore
  Verificación final + GitHub Pages
```

---

## Gate antes de cada fase

**Antes de iniciar la siguiente fase, verificar:**
- [ ] Todos los checkpoints de la fase anterior están pasando
- [ ] 0 errores en consola del navegador
- [ ] Stefano ha aprobado el resultado (o dado el ok para avanzar)
- [ ] No se ha añadido ninguna feature fuera del backlog

---

## Estimación por sesión

| Sesión | Contenido | Fase |
|--------|-----------|------|
| 1 | Estructura + game loop + canvas + estados | Fase 1 |
| 2 | Oliver visible + movimiento | Fase 2 |
| 3 | Colisiones + cámara | Fase 2 |
| 4 | 4 habitaciones con obstáculos | Fase 3 |
| 5 | Transiciones con fade | Fase 3 |
| 6 | Cristales en mapa + recolección | Fase 4 |
| 7 | HUD + puerta + victoria | Fase 4 |
| 8 | Pantallas inicio/victoria + reinicio | Fase 5 |
| 9 | index.html final + README + paths | Fase 6 |
| 10 | QA final + publicación GitHub Pages | Fase 6 |
