# Backlog Técnico — Legendary Adventures

**Fecha:** 2026-06-01  
**Total:** 20 puntos de esfuerzo  
**Referencia de producto:** `01_agentes/agente-product-owner/productos/legendary-adventures/backlog-videojuego.md`

> Este backlog técnico amplía el backlog de producto con decisiones de implementación específicas.
> Cada historia tiene: archivos afectados, dependencias técnicas y notas de implementación.

---

## Fase 1 — Fundación técnica (3 pts)

---

### T1-01 — Estructura de archivos del proyecto
**Pts:** 1 | **Prioridad:** Primera historia a implementar

```
Archivos a crear:
  index.html          ← canvas + scripts
  src/main.js         ← init + game loop (esqueleto)
  src/game.js         ← state + reset (esqueleto)
  src/input.js        ← keyboard handler (esqueleto)
  src/screens.js      ← drawStart + drawWin (placeholder)
  src/collision.js    ← helpers AABB (vacío)
  assets/images/      ← carpeta vacía
  assets/audio/       ← carpeta vacía
  .gitignore          ← node_modules, .env, *.log, Thumbs.db, .DS_Store

Criterio técnico de aceptación:
  [ ] index.html carga sin errores (canvas negro visible)
  [ ] Los scripts se cargan con type="module"
  [ ] 0 errores "module not found" en consola
```

---

### T1-02 — Game loop con requestAnimationFrame
**Pts:** 1 | **Dependencia:** T1-01

```
Archivos afectados:
  src/main.js         ← gameLoop(timestamp), lastTime, dt, requestAnimationFrame

Notas técnicas:
  - dt = Math.min((timestamp - lastTime) / 1000, 0.05)  — cap a 50ms
  - Llamar update(dt) y render() cada frame
  - NO usar setInterval

Criterio técnico:
  [ ] Loop arranca con requestAnimationFrame(gameLoop)
  [ ] dt está capado — no hay comportamiento extraño si la tab pierde foco
  [ ] 0 errores en consola durante el loop
```

---

### T1-03 — Canvas 800×600 y state machine
**Pts:** 1 | **Dependencia:** T1-02

```
Archivos afectados:
  src/game.js         ← objeto game con state, currentRoom, crystalsCollected, collectedIds
  src/main.js         ← update() y render() enrutan según game.state
  src/screens.js      ← drawStart() con texto "Legendary Adventures" + instrucciones

Notas técnicas:
  - game.state: "START" | "PLAYING" | "WIN"
  - update(): si state === "START", solo escuchar Enter
  - render(): según state, delegar a screens.drawStart / drawGame / drawWin
  - Enter en START → game.state = "PLAYING"

Criterio técnico:
  [ ] Pantalla START visible con título al cargar
  [ ] Enter cambia estado a PLAYING (canvas vacío por ahora)
  [ ] 0 errores en las transiciones
```

---

## Fase 2 — Oliver el jugador (4 pts)

---

### T2-01 — Oliver visible en posición inicial
**Pts:** 1 | **Dependencia:** T1-03

```
Archivos afectados:
  src/player.js       ← objeto player: x, y, w=24, h=32, draw(ctx)
  src/main.js         ← importar y llamar player.draw(ctx) en render()

Notas técnicas:
  - MVP: 3 rectángulos (cabeza, cuerpo, capa) sin sprites PNG
  - Colores: cuerpo #3a8a4a, cabeza #2d5e35, capa #1a4a6a
  - Posición inicial: { x: 380, y: 260 } (centro de H1)
  - player.reset(x, y) para reposicionar desde game.js

Criterio técnico:
  [ ] Oliver visible en canvas en estado PLAYING
  [ ] Proporciones correctas (24×32) — ni gigante ni invisible
  [ ] Los 3 rectángulos forman una silueta reconocible
```

---

### T2-02 — Movimiento 4 direcciones
**Pts:** 1 | **Dependencia:** T2-01

```
Archivos afectados:
  src/input.js        ← initInput(), isDown(code) — handler completo
  src/player.js       ← player.update(dt, obstacles): leer input, calcular vx/vy, mover

Notas técnicas:
  - preventDefault en ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Space
  - speed = 150 px/s
  - NO normalizar diagonal en MVP (velocidad diagonal ligeramente mayor es aceptable)
  - El movimiento solo ocurre en estado PLAYING

Criterio técnico:
  [ ] WASD y flechas mueven a Oliver en las 4 direcciones
  [ ] Las teclas de flecha NO hacen scroll de la página
  [ ] Soltar tecla = detención inmediata (sin inercia)
  [ ] Oliver no se mueve en estado START ni WIN
```

---

### T2-03 — Colisión de Oliver con muros (AABB ejes separados)
**Pts:** 1 | **Dependencia:** T2-02

```
Archivos afectados:
  src/collision.js    ← overlaps(a, b), resolveX(entity, obs), resolveY(entity, obs), clampToBounds
  src/player.js       ← player.update() llama resolveX y resolveY para cada obstáculo

Notas técnicas:
  - Orden: mover X → resolver X → mover Y → resolver Y (NO al revés)
  - clampToBounds al final para bordes del canvas
  - Testar con 1 obstáculo en H1 antes de añadir el resto
  - Los "exits" (zonas de salida) NO son obstáculos — lista separada

Criterio técnico:
  [ ] Oliver no atraviesa el rectángulo de prueba bajo ningún ángulo
  [ ] Oliver no queda atascado en la esquina del obstáculo
  [ ] Oliver puede deslizarse a lo largo de un muro
  [ ] Oliver no sale del canvas por ningún borde
```

---

### T2-04 — Cámara fija por habitación
**Pts:** 1 | **Dependencia:** T2-03

```
Archivos afectados:
  src/world.js        ← definir que cada room es de 800×600 — cabe exactamente en el canvas
  src/main.js         ← NO hay ctx.translate — coordenadas directas

Notas técnicas:
  - DECISIÓN: No hay scroll en MVP. Cada habitación = 800×600 exactos.
  - No se necesita ctx.save/translate para cámara.
  - Las coordenadas de obstáculos/cristales son directas en el canvas.
  - Esto simplifica TODO el sistema de colisiones.

Criterio técnico:
  [ ] Habitación ocupa los 800×600 px del canvas correctamente
  [ ] Oliver se mueve sin offset ni transformaciones de cámara
  [ ] Verificar que la estrategia de cámara fija es correcta (no se necesita scroll)
```

---

## Fase 3 — El mundo (3 pts)

---

### T3-01 — Las 4 habitaciones con obstáculos
**Pts:** 2 | **Dependencia:** T2-04

```
Archivos afectados:
  src/world.js        ← objeto rooms{H1, H2, H3, H4} con bgColor, obstacles[], exits[], crystals[]
  src/main.js         ← render lee rooms[game.currentRoom] para dibujar fondo y obstáculos

Notas técnicas:
  - Cada room: { id, bgColor, obstacles: [{x,y,w,h}], exits: [{x,y,w,h,target,entryX,entryY}], crystals: [] }
  - H1: verde claro, 4 obstáculos (árboles), salidas este+sur
  - H2: verde medio, fuente central sólida + 2 rocas, salidas norte+sur  
  - H3: marrón-gris, 4-5 columnas, salidas norte+oeste
  - H4: morado, 2 pilares, salidas norte+este, puerta al norte
  - drawRoom(ctx, roomId): fillRect fondo + fillRect cada obstáculo

Criterio técnico:
  [ ] Las 4 habitaciones tienen fondos de color distinto
  [ ] Los obstáculos de cada habitación son colisionables
  [ ] Oliver no puede atravesar ningún obstáculo en ninguna de las 4 habitaciones
  [ ] El diseño de cada habitación es visualmente reconocible
```

---

### T3-02 — Transiciones entre habitaciones con fade
**Pts:** 1 | **Dependencia:** T3-01

```
Archivos afectados:
  src/game.js         ← transitioning, fadeAlpha, fadeTarget, startTransition(), lógica en update()
  src/player.js       ← player.update() verifica exits solo si !game.transitioning
  src/main.js         ← render() dibuja overlay negro al final si transitioning

Notas técnicas:
  - FADE_SPEED = 3.0 alpha/s → fade completo en ~0.33s
  - Al llegar fadeAlpha >= 1.0: cargar nueva room, reposicionar Oliver
  - Al llegar fadeAlpha >= 2.0: fin de transición
  - Oliver NO se mueve durante la transición
  - Verificar TODAS las conexiones: H1↔H2, H1↔H4, H2↔H3, H3↔H4

Criterio técnico:
  [ ] Fade a negro visible al cambiar de habitación
  [ ] Oliver aparece en la posición de entrada correcta en la nueva habitación
  [ ] Navegar H1→H2→H3→H4→H1 funciona en todas las conexiones
  [ ] No se puede activar una transición durante otra
```

---

## Fase 4 — Mecánica central (4 pts)

---

### T4-01 — Cristales en el mapa
**Pts:** 1 | **Dependencia:** T3-02

```
Archivos afectados:
  src/crystal.js      ← clase Crystal: id, x, y, w=16, h=16, draw(ctx), checkCollect(player)
  src/world.js        ← rooms.H2.crystals = [new Crystal("c1", 380, 200)]
                         rooms.H3.crystals = [new Crystal("c2", 200, 280), new Crystal("c3", 580, 120)]

Notas técnicas:
  - Cristal visual: rombo (cuadrado rotado 45°) en azul #00BFFF de 16×16
  - Cristal 3 en H3: detrás de una columna (oculto pero alcanzable rodeando)
  - draw() primero verifica game.collectedIds.has(this.id) — si sí, no renderiza

Criterio técnico:
  [ ] Cristal 1 visible en H2 al entrar, claramente distinguible del fondo
  [ ] Cristal 2 visible en H3 al entrar
  [ ] Cristal 3 en H3 requiere explorar un poco para encontrarlo
  [ ] Los cristales son visualmente reconocibles como "objetos recolectables"
```

---

### T4-02 — Recolección de cristales
**Pts:** 1 | **Dependencia:** T4-01

```
Archivos afectados:
  src/crystal.js      ← checkCollect(player): overlaps + game.collectedIds.add() + game.crystalsCollected++
  src/main.js         ← update() llama checkCollect en cristales de la room actual

Notas técnicas:
  - game.collectedIds es un Set global — persiste al cambiar de habitación
  - NO decrementar al salir/entrar en la habitación
  - El cristal desaparece inmediatamente (draw() lo verifica)

Criterio técnico:
  [ ] Tocar un cristal lo hace desaparecer en el mismo frame
  [ ] game.crystalsCollected sube correctamente (0→1→2→3)
  [ ] Al volver a una habitación, los cristales ya recogidos NO reaparecen
  [ ] El cristal no se puede "recoger" dos veces
```

---

### T4-03 — HUD contador de cristales
**Pts:** 1 | **Dependencia:** T4-02

```
Archivos afectados:
  src/hud.js          ← drawHUD(ctx): fondo semitransparente, icono cristal, texto "Cristales: X/3"

Notas técnicas:
  - Posición: top-left (x=10, y=10, w=170, h=36)
  - Fondo: rgba(0,0,0,0.6)
  - Texto: "bold 16px monospace" blanco
  - Ícono: miniatura de rombo azul #00BFFF

Criterio técnico:
  [ ] HUD visible en todas las habitaciones
  [ ] Muestra "Cristales: 0/3" al inicio
  [ ] Se actualiza inmediatamente al recoger cada cristal
  [ ] Legible sobre todos los fondos de habitación (incluido verde claro)
```

---

### T4-04 — Puerta bloqueada / abierta + condición de victoria
**Pts:** 1 | **Dependencia:** T4-03

```
Archivos afectados:
  src/door.js         ← objeto door: x, y, w, h, get isOpen(), draw(ctx), toObstacle(), checkVictory(player)
  src/world.js        ← rooms.H4 incluye door en su render y como obstáculo condicional
  src/game.js         ← checkVictory() → game.state = "WIN"

Notas técnicas:
  - door.toObstacle() devuelve null si isOpen → no entra en el loop de colisiones
  - door.isOpen = game.crystalsCollected >= 3 (getter)
  - Cambio visual INMEDIATO en el frame en que se recoge el 3er cristal
  - checkVictory solo se llama si isOpen && overlaps(player, door)

Criterio técnico:
  [ ] Puerta gris oscura con < 3 cristales — Oliver choca como si fuera un muro
  [ ] Puerta dorada con 3 cristales — Oliver puede cruzarla
  [ ] El cambio visual es inmediato y claro
  [ ] Cruzar la puerta abierta → game.state = "WIN" correctamente
```

---

## Fase 5 — Loop completo (3 pts)

---

### T5-01 — Pantalla de inicio
**Pts:** 1 | **Dependencia:** T1-03 (state machine)

```
Archivos afectados:
  src/screens.js      ← drawStart(ctx): fondo oscuro, título, instrucciones, CTA

Notas técnicas:
  - Fondo: fillRect negro o gradiente oscuro
  - Título: "Legendary Adventures" — 36px bold, color dorado #FFD700, centrado
  - Instrucciones: "Muévete: WASD o Flechas" / "Objetivo: encuentra los 3 cristales mágicos"
  - CTA: "Presiona Enter para comenzar tu aventura"
  - Enter → game.state = "PLAYING" + resetGame() + player.reset()

Criterio técnico:
  [ ] Pantalla visible al cargar la página
  [ ] Título prominente y legible
  [ ] Enter inicia la partida correctamente
  [ ] 0 errores en transición START→PLAYING
```

---

### T5-02 — Pantalla de victoria
**Pts:** 1 | **Dependencia:** T4-04

```
Archivos afectados:
  src/screens.js      ← drawWin(ctx): overlay semitransparente + mensaje + CTA

Notas técnicas:
  - Overlay: rgba(0,0,0,0.75) sobre el frame actual
  - Título: "¡Oliver ha completado su leyenda!" — 30px bold, dorado #FFD700, centrado
  - Subtexto: "Has encontrado todos los cristales del bosque mágico" — 18px blanco
  - CTA: "Presiona R para jugar de nuevo"
  - Llamada en render() solo si game.state === "WIN"

Criterio técnico:
  [ ] Overlay visible tras cruzar la puerta
  [ ] Mensaje legible sobre el fondo de H4
  [ ] El juego NO sigue actualizando entidades tras WIN
  [ ] 0 errores en consola en estado WIN
```

---

### T5-03 — Reinicio completo con R
**Pts:** 1 | **Dependencia:** T5-01, T5-02

```
Archivos afectados:
  src/game.js         ← resetGame(): resetea TODO el estado
  src/input.js        ← detectar KeyR como "just pressed" para evitar reinicio continuo

Notas técnicas:
  - resetGame() debe resetear: state, currentRoom, crystalsCollected, collectedIds, transitioning, fadeAlpha
  - player.reset(380, 260) para posición inicial de H1
  - R funciona en estado PLAYING (reinicio rápido) y WIN
  - NO funciona en estado START (innecesario)
  - Testar: reiniciar 10 veces seguidas — verificar que no hay memory leaks

Criterio técnico:
  [ ] R en WIN → partida completamente nueva en H1 con 0/3 cristales
  [ ] R en PLAYING → partida reiniciada (mismo resultado)
  [ ] Los 3 cristales reaparecen en sus posiciones originales
  [ ] Puerta vuelve a estar bloqueada
  [ ] 10 reinicios seguidos — sin errores ni degradación
```

---

## Fase 6 — Publicación mínima (3 pts)

---

### T6-01 — index.html final limpio
**Pts:** 1 | **Dependencia:** Todo lo anterior completado

```
Archivos afectados:
  index.html          ← versión final: canvas, scripts con paths relativos, meta, título

Contenido mínimo:
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Legendary Adventures</title>
    <style>
      body { margin: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <canvas id="gameCanvas"></canvas>
    <script type="module" src="src/main.js"></script>
  </body>
  </html>

Criterio técnico:
  [ ] Abre en Chrome y Firefox sin errores
  [ ] Canvas centrado en pantalla negra
  [ ] 0 errores de consola al cargar
```

---

### T6-02 — README.md del proyecto
**Pts:** 1 | **Dependencia:** T6-01

```
Archivos afectados:
  README.md

Contenido:
  - Título y descripción 2-3 líneas
  - "Juega aquí: [URL GitHub Pages]" — añadir tras activar Pages
  - Controles: tabla WASD/flechas + Enter + R
  - Objetivo del juego en 2 líneas
  - Tecnologías: HTML5 Canvas, JavaScript ES6+, CSS3
  - Licencia: MIT © 2026 Stefano Luis
```

---

### T6-03 — .gitignore + verificación de paths
**Pts:** 1 | **Dependencia:** T6-01

```
Archivos afectados:
  .gitignore
  Todos los src/*.js — verificar que no hay rutas absolutas

.gitignore contenido mínimo:
  node_modules/
  .env
  *.log
  Thumbs.db
  .DS_Store

Verificación:
  [ ] Buscar en todo el código: "C:\", "file://", "/home/" → 0 ocurrencias
  [ ] Todos los src= y import usan paths relativos
  [ ] El juego funciona desde file:// localmente
  [ ] El juego funciona desde http://localhost (Live Server)
```

---

## Resumen total

| Fase | Historias | Pts | Sesiones est. |
|------|-----------|-----|---------------|
| 1 — Fundación | T1-01, T1-02, T1-03 | 3 | 1 |
| 2 — Oliver | T2-01, T2-02, T2-03, T2-04 | 4 | 2 |
| 3 — Mundo | T3-01, T3-02 | 3 | 1-2 |
| 4 — Mecánica central | T4-01, T4-02, T4-03, T4-04 | 4 | 2 |
| 5 — Loop completo | T5-01, T5-02, T5-03 | 3 | 1 |
| 6 — Publicación | T6-01, T6-02, T6-03 | 3 | 1 |
| **TOTAL** | **19 historias técnicas** | **20** | **~10** |
