# Game Design Document — Legendary Adventures

**Versión:** 1.0  
**Fecha:** 2026-06-01  
**Estado:** Aprobado  
**Referencia de producto:** `01_agentes/agente-product-owner/productos/legendary-adventures/ficha-producto.md`

---

## 1. Concepto

**Título:** Legendary Adventures  
**Género:** Aventura top-down 2D — exploración + colección + progresión por desbloqueables  
**Plataforma:** Web (HTML5 Canvas) — GitHub Pages  
**Duración de partida:** 5-10 minutos  
**Audiencia:** Universal — no requiere experiencia previa con videojuegos

**Tagline:**
> Un pequeño aventurero mágico explora un bosque encantado, recolecta cristales y abre la puerta hacia la leyenda.

---

## 2. Mecánica central

> El jugador explora 4 habitaciones de un bosque mágico, recoge las 3 gemas mágicas y desbloquea la puerta del santuario final.

**Loop de juego:**
```
Explorar habitación → Encontrar gema → Recoger (feedback HUD) → Siguiente habitación
      → Repetir hasta 3/3 gemas → Volver a H4 → Puerta abierta → Victoria
```

**Por qué funciona:**
- Cada gema es una micro-recompensa inmediata
- El HUD muestra progreso claro (0/3 → 3/3)
- La puerta bloqueada crea tensión; abrirla, catarsis
- No hay forma de perder — solo de progresar más lento

---

## 3. Personaje principal — Oliver

| Campo | Descripción |
|-------|-------------|
| Nombre | Oliver |
| Descripción | Joven explorador mágico de fantasía ligera. Capa verde o azul. Diseño 100% original. |
| Movimiento | 4 direcciones (WASD / flechas) |
| Tamaño | 24 × 32 px (MVP: rectángulo con proporciones humanas) |
| Velocidad | 150 px/segundo |
| Habilidades | Moverse, recoger cristales al contacto, cruzar la puerta abierta |
| Restricción | **No debe parecerse visual ni nominalmente a ningún personaje protegido** |

**Visual MVP:** Rectángulo verde oscuro (cuerpo) + rectángulo más oscuro (cabeza). Sin animaciones de walk cycle en MVP — se añaden en v1.1.

---

## 4. Mundo — 4 habitaciones

### Diseño del mapa

```
[H1 Claro del Bosque] ──este──→ [H2 Fuente Mágica]
        │                               │
       sur                             sur
        ↓                               ↓
[H4 Puerta Santuario] ←─oeste─ [H3 Caverna Cristales]
```

**Ruta óptima:** H1 (gema 1) → H2 (gema 2) → H3 (gema 3) → H4 (puerta = victoria)  
**Ruta de exploración libre:** H1 → H4 (descubre puerta bloqueada) → vuelve a buscar cristales

### H1 — Claro del Bosque (inicio)

| Campo | Valor |
|-------|-------|
| Función | Zona de inicio. Tutorial implícito de movimiento y colisión |
| Fondo | Verde claro (#5a8a3a) |
| Obstáculos | 3-4 árboles simples (rectángulos marrones con verde encima) |
| Salidas | Este → H2 | Sur → H4 |
| Cristales | Ninguno |
| Diseño | Espacioso. Oliver aparece al norte-centro. Salidas visibles. |

### H2 — Fuente Mágica

| Campo | Valor |
|-------|-------|
| Función | Primera recompensa. Cristal visible al entrar. |
| Fondo | Verde medio (#3d7a4f) |
| Obstáculos | Fuente central (decorativo, sólido), rocas a los lados |
| Salidas | Norte → H1 | Sur → H3 |
| Cristales | **Cristal 1** — posicionado cerca de la fuente, visible desde la entrada |
| Diseño | Cristal 1 visible en cuanto el jugador entra. No hay obstáculos entre la entrada y el cristal. |

### H3 — Caverna de Cristales

| Campo | Valor |
|-------|-------|
| Función | Recompensa media + descubrimiento. Más densa y oscura. |
| Fondo | Marrón-gris (#4a3d2e) |
| Obstáculos | Columnas de roca (4-5 rectángulos grandes), stalactitas decorativas |
| Salidas | Norte → H2 | Oeste → H4 |
| Cristales | **Cristal 2** — visible cerca del centro | **Cristal 3** — oculto detrás de una columna del norte |
| Diseño | Cristal 2 visible al entrar. Cristal 3 requiere rodear una columna — el jugador lo descubre explorando. |

### H4 — Puerta del Santuario (final)

| Campo | Valor |
|-------|-------|
| Función | Zona final. Puerta bloqueada/abierta según cristales. |
| Fondo | Morado oscuro (#2d1b4e) con efecto luminoso cerca de la puerta |
| Obstáculos | Pilares de piedra a los lados, decoraciones mágicas |
| Salidas | Norte → H1 | Este → H3 |
| Cristales | Ninguno |
| Puerta | Al norte de la habitación. Bloqueada (gris) con < 3 gemas. Abierta (dorada) con 3 gemas. |

---

## 5. Objetos del mundo

### Cristal mágico

| Campo | Descripción |
|-------|-------------|
| Visual | Diamante (rombo) azul brillante (#00BFFF) de 16×16 px, con brillo/pulso simple |
| Comportamiento | Estático. Al contacto con Oliver: desaparece, contador +1, HUD actualiza |
| Persistencia | Una vez recogido, no reaparece (estado guardado en memoria del juego) |
| Feedback | Visual: desaparece. HUD: número sube. No hay sonido en MVP. |

### Puerta del Santuario

| Campo | Descripción |
|-------|-------------|
| Visual cerrada | Rectángulo gris oscuro (#555) con marco de piedra — actúa como muro sólido |
| Visual abierta | Rectángulo dorado brillante (#FFD700) con brillo — ya no es sólido |
| Comportamiento | Estado determinado por `game.crystalsCollected === 3` |
| Trigger victoria | Al cruzar hitbox de puerta abierta → estado WIN |

---

## 6. HUD

Posición: esquina superior izquierda, siempre visible.

```
┌──────────────────────────────────┐
│ ◆ Gemas: 2/3                     │
└──────────────────────────────────┘
```

- Fondo semitransparente (rgba negro 0.6)
- Texto blanco 18px monospace
- Ícono de diamante ◆ en color gema (#00BFFF)
- Actualización inmediata al recoger

---

## 7. Controles

| Tecla | Acción |
|-------|--------|
| W / Flecha arriba | Mover arriba |
| S / Flecha abajo | Mover abajo |
| A / Flecha izquierda | Mover izquierda |
| D / Flecha derecha | Mover derecha |
| Espacio | Atacar con la espada |
| Enter | Iniciar aventura (en pantalla START) |
| P | Pausar / reanudar la partida |
| R | Reiniciar aventura (en cualquier estado) |

---

## 8. Estados del juego

```
START ──(Enter)──→ PLAYING ──(P)──→ PAUSED ──(P)──→ PLAYING
                      │
                      ├──(3 cristales + cruzar puerta)──→ WIN ──(R)──┐
                      │                                                │
                      ├──(vida = 0)──→ DEAD ──(R)──────────────────┐  │
                      │                                              │  │
                      └──────────────────────────────────────────(R)┘  │
                      ↑                                                 │
                      └─────────────────────────────────────────────────┘
```

| Estado | Qué se renderiza | Qué se actualiza |
|--------|-----------------|------------------|
| START | Pantalla de inicio con título e instrucciones | Nada |
| PLAYING | Habitación activa + Oliver + enemigos + HUD | Oliver, enemigos, gemas, puerta, partículas |
| PAUSED | Overlay "PAUSA" sobre el juego congelado | Solo partículas (efecto visual) |
| WIN | Overlay de victoria con estadísticas (vida, gemas, enemigos) | Nada |
| DEAD | Overlay de derrota con estadísticas (gemas, enemigos) | Nada |

---

## 9. Cámara

**Cámara fija por habitación.** Cada habitación está diseñada para caber en 800×600 px. No hay scroll.

Ventajas de esta decisión:
- No se necesita transformación mundo↔pantalla
- Las colisiones se resuelven directamente en coordenadas de canvas
- Simplifica el rendering considerablemente para el MVP

---

## 10. Pantallas

### Pantalla de inicio (START)
- Fondo: imagen o gradiente de bosque mágico (oscuro con destellos)
- Título: "Legendary Adventures" — fuente grande, dorada/blanca
- Instrucciones: "Muévete: WASD o Flechas del teclado" / "Objetivo: encuentra las 3 gemas mágicas"
- CTA: "Presiona Enter para comenzar tu aventura"

### Pantalla de victoria (WIN)
- Overlay semitransparente sobre la habitación final
- Texto central: "¡Oliver ha completado su leyenda!" — grande, dorado
- Subtexto: "Has encontrado todas las gemas del bosque mágico"
- CTA: "Presiona R para jugar de nuevo"

---

## 11. Roadmap

| Versión | Features | Estado |
|---------|----------|--------|
| v1.0 | MVP: 4 habitaciones, 3 gemas, puerta final, Oliver, colisiones, HUD, START/WIN | ✅ Entregado |
| v1.1 | Enemigos, espada, escudo, partículas, SFX Web Audio API, música ambiental, pausa, WIN/DEAD con estadísticas | ✅ Entregado |
| v2.0 | Walk cycle de Oliver, NPC con 1 línea de texto, habitación secreta | Pendiente |
| v3.0 | Segunda área, inventario básico, guardado local, jefe final | Pendiente |
