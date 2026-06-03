# CLAUDE.md — Legendary Adventures

## Identidad del proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | Legendary Adventures |
| **Género** | Aventura top-down 2D |
| **Stack** | HTML5 Canvas + JavaScript ES6+ + CSS3 |
| **Estado** | ✅ Publicado en GitHub Pages — v1.1 · Local en v1.3 (pendiente de push) |
| **Carpeta** | `03_juegos/legendary-adventures/` |
| **GitHub Pages** | https://st885.github.io/legendary-adventures/ |

---

## Documentos de referencia obligatorios

Antes de cualquier acción en este proyecto, leer en orden:

1. `CLAUDE.md` del workspace raíz — reglas globales
2. `01_agentes/agente-product-owner/productos/legendary-adventures/ficha-producto.md`
3. `01_agentes/agente-product-owner/productos/legendary-adventures/mvp-one-pager.md`
4. `01_agentes/agente-product-owner/productos/legendary-adventures/backlog-videojuego.md`
5. `GDD.md` de este proyecto
6. `docs/technical-design.md` de este proyecto

---

## Mecánica central

> El jugador **explora 4 habitaciones de un bosque mágico** recogiendo **3 gemas** para **desbloquear la puerta final y completar su aventura**.

---

## Personaje principal

- **Nombre:** Oliver
- **Descripción:** Joven explorador mágico original. Capa verde o azul. Diseño 100% original.
- **RESTRICCIÓN ABSOLUTA:** Oliver NO debe parecerse a Link ni a ningún personaje protegido por copyright.

---

## Reglas de desarrollo para este proyecto

1. **No modificar tetris-game** ni ningún otro proyecto bajo ninguna circunstancia
2. **No crear código antes de tener el diseño técnico aprobado**
3. **No copiar assets ni mecánicas únicas de juegos comerciales**
4. **Implementar una historia de usuario a la vez** — validar en navegador antes de avanzar
5. **No avanzar si hay errores en consola** — resolver siempre antes de continuar
6. **No añadir features fuera del backlog aprobado** — scope creep a v1.1

---

## Mapa del mundo (MVP)

```
[H1 Claro del Bosque] ──este──→ [H2 Fuente Mágica]
        │                               │
       sur                             sur
        ↓                               ↓
[H4 Puerta Santuario] ←─oeste─ [H3 Caverna Cristales]
```

| Habitación | ID | Cristales | Notas |
|------------|-----|-----------|-------|
| Claro del Bosque | H1 | Gema 1 (aleatoria) | Inicio. Salidas: este → H2, sur → H4 |
| Fuente Mágica | H2 | Gema 2 (aleatoria) | Salida sur → H3 |
| Caverna Cristales | H3 | Gema 3 (aleatoria) | Salida oeste → H4 |
| Puerta Santuario | H4 | — | Puerta final bloqueada/abierta. Salidas norte → H1, este → H3 |

---

## Comandos del proyecto

```
# IMPORTANTE: el juego usa módulos ES6 — requiere servidor HTTP
# No funciona desde file:// directamente

# Opción A — Live Server (VS Code)
Clic derecho en index.html → "Open with Live Server"

# Opción B — Python
python -m http.server 5500
# luego abrir http://localhost:5500

# Opción C — Node.js
npx serve .
```

---

## Estado de implementación

| Épica | Estado |
|-------|--------|
| E1 Fundación técnica | ✅ Completa |
| E2 Oliver el jugador | ✅ Completa |
| E3 El mundo — 4 habitaciones | ✅ Completa |
| E4 Mecánica central — cristales + puerta | ✅ Completa |
| E5 Loop completo — pantallas + polish | ✅ Completa |
| E6 Publicación mínima — README + .gitignore | ✅ Completa |
| Fase 5 — Polish visual (enemy.js, pickup.js, particles.js, crystal/door animados) | ✅ Completa |
| Fase 6 — Sonido, pausa y experiencia final (audio.js, P-key, WIN/DEAD con estadísticas) | ✅ Completa |
| Fase 7 — Pantalla WIN mejorada (mensajes de rendimiento, bonus NPC, v1.2) | ✅ Completa |
| Fase 8 — Sistema de armas: arco, bastón, proyectiles, drop de arma (v1.3) | ✅ Completa (local) |

### Notas técnicas v1.3
- `src/projectile.js` → nuevo: pool de proyectiles, flechas (daño 1) y bolas mágicas (daño 2)
- `src/pickup.js` → arco (H2, cx:220, cy:300), bastón (H3, cx:480, cy:270); `dropAt()` posiciona el arma anterior cerca de Oliver al hacer swap
- `src/player.js` → `weapon: null | 'sword' | 'bow' | 'staff'`; getter `hasSword` para compatibilidad
- `src/audio.js` → `playBowShoot`, `playStaffShoot`, `playChestOpen`; `playVictory` definida pero no importada (pendiente)
- `particles.js` → `emitVictory` definida pero no importada (pendiente — evitar caché de módulos ES6)

---

## Archivos sensibles
Ninguno — este proyecto no requiere credenciales ni APIs externas.

---

## Licencia
MIT © 2026 Stefano Luis
