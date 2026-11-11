# King's Valley (Retro MSX 1985) - Clone

Clon fiel del clásico videojuego de plataformas y puzles **King's Valley** para el estándar de ordenadores MSX de 1985. Desarrollado con **TypeScript**, **Phaser 3** y empaquetado con **Vite**.

---

## 🎮 Características del Juego

1. **Protagonista Vick (El Arqueólogo):**
   - Movimiento horizontal responsivo sobre plataformas.
   - Escalada por escaleras para transitar entre los pisos de la pirámide.
   - Sistema de excavación de bloques de arenisca (hacia los laterales o bajo los pies) con el pico.
   - Lanzamiento de cuchillos arrojadizos en línea recta. Los cuchillos caen al suelo y pueden recuperarse.
   - Sistema de vidas y reaparición arcade.
2. **Momias Enemigas (MSX AI):**
   - **Momia Blanca:** Patrulla plataformas y rastrea a Vick usando escaleras.
   - **Momia Roja:** Mayor velocidad y agresividad, persigue activamente al jugador.
   - Daño letal por contacto. Eliminables mediante impacto de cuchillo arrojadizo.
3. **Mecánica de Puzle y Cámaras:**
   - **Gemas Sagradas (Soul Stones):** Deben recolectarse todas para abrir el portal de salida.
   - **Arenisca destructible:** Permite crear atajos, acceder a tesoros o encerrar momias (o quedar atrapado si no se planifica).
   - **Pisos Movedizos (Conveyors):** Cintas mecánicas con flechas y rodillos animados que arrastran continuamente al jugador y a las momias.
   - **Puerta de escape:** Se abre con fanfarria al recolectar la última gema.
   - 3 Cámaras completas con diseño creciente de dificultad.
4. **Gráficos y Paleta MSX:**
   - Paleta oficial de 16 colores MSX (TMS9918 / V9938).
   - Generación procedimental de texturas píxel a píxel en memoria (sin dependencias de ficheros externos ni 404).
   - HUD retro con marcador `SCORE`, `HI-SCORE`, `STAGE`, `LIVES`, `GEMS`, `PICKAXE` y `KNIVES`.
5. **Audio Chiptune PSG (AY-3-8910):**
   - Sintetizador WebAudio de ondas cuadradas y ruido blanco.
   - Reproducción de la mítica melodía de King's Valley (1985) y efectos sonoros retro (cavar, pasos, impacto de cuchillo, apertura de puerta, fanfarrias de victoria y derrota).

---

## 🕹️ Controles

| Acción | Teclado | Gamepad |
| :--- | :--- | :--- |
| **Moverse Izquierda / Derecha** | `A` / `D` o Flechas `←` / `→` | D-Pad / Stick Izquierdo |
| **Subir / Bajar Escaleras** | `W` / `S` o Flechas `↑` / `↓` | D-Pad / Stick Izquierdo |
| **Lanzar Cuchillo** | `Espacio` | Botón `A` (0) |
| **Cavar Bloque con Pico** | `Espacio + Abajo` o tecla `X` | Botón `X` (2) |
| **Reiniciar Nivel** | Tecla `R` | - |
| **Silenciar Audio** | Tecla `M` | - |

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con Hot Reload
npm run dev

# Ejecutar suite de pruebas unitarias y de integración
npm test

# Validar tipado con TypeScript
npx tsc --noEmit

# Compilar paquete para producción
npm run build

# Vista previa de la build de producción
npm run preview
```

---

## 📁 Arquitectura del Proyecto

```
ClonKingValley/
├── .agents/
│   ├── rules.md                   # Normas de arquitectura y retro-fidelidad
│   ├── skills/                    # Habilidades operativas de los agentes
│   │   ├── code-review/
│   │   ├── level-puzzle-design/
│   │   ├── qa-testing/
│   │   └── technical-design/
│   ├── specs/                     # GDD y User Stories detalladas
│   └── subagents/                 # Roles: architect, developer, reviewer, qa
├── src/
│   ├── audio/
│   │   └── MSXAudio.ts            # Emulador de sonido PSG chiptune
│   ├── core/
│   │   ├── Direction.ts           # Vectores y direcciones discretas
│   │   └── GameConstants.ts       # Métricas de pantalla, físicas y puntuaciones
│   ├── entities/
│   │   ├── Player.ts              # Protagonista Vick (física, excavar, lanzar)
│   │   ├── PlayerState.ts         # Máquina de estados finita
│   │   ├── Mummy.ts               # Enemigo momia y algoritmos de rastreo
│   │   ├── MummyType.ts           # Variantes blanca y roja
│   │   ├── Knife.ts               # Cuchillo arrojadizo y objeto recogible
│   │   ├── Pickaxe.ts             # Pico recogible y durabilidad
│   │   ├── Gem.ts                 # Gema sagrada animada
│   │   ├── MovingFloorTrap.ts     # Pisos movedizos / cintas mecánicas
│   │   └── ExitDoor.ts            # Puerta sellada y portal de salida
│   ├── graphics/
│   │   ├── HUD.ts                 # Marcador superior retro MSX
│   │   ├── MSXPalette.ts          # Paleta oficial de 16 colores MSX
│   │   └── SpriteFactory.ts       # Generador procedural de texturas pixel-art
│   ├── grid/
│   │   ├── ChamberGrid.ts         # Simulación de cuadrícula y colisiones
│   │   ├── ChamberLevels.ts       # Mapas y colocación de elementos en fases 1-3
│   │   └── TileType.ts            # Definición de casillas de la pirámide
│   ├── input/
│   │   └── InputManager.ts        # Soporte para teclado y gamepad
│   ├── scenes/
│   │   ├── BootScene.ts           # Inicialización de recursos
│   │   ├── TitleScene.ts          # Portada retro MSX 1985
│   │   ├── GameScene.ts           # Bucle principal de gameplay
│   │   └── GameOverScene.ts       # Pantalla de derrota y reintento
│   └── main.ts                    # Punto de entrada de Phaser
├── tests/                         # Suite de tests automáticos en Node 22+
└── index.html                     # Contenedor retro del juego
```
