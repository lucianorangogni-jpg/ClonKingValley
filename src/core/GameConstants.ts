/**
 * @file GameConstants.ts
 * Constantes maestras y configuración física del motor para King's Valley MSX.
 */

/**
 * Clase contenedora de constantes globales, dimensiones de pantalla, físicas y puntuaciones.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Centraliza de forma inmutable todas las métricas fundamentales del juego para evitar "números mágicos",
 * garantizando que la física, las dimensiones de cuadrícula, las velocidades de entidades, los tiempos de animación
 * y las reglas de puntuación sean coherentes y fácilmente ajustables entre la simulación y el renderizado.
 * 
 * ¿CÓMO SE USA?:
 * Se accede directamente a sus campos estáticos de sólo lectura desde cualquier parte del proyecto:
 * ```ts
 * const tileW = GameConstants.TILE_SIZE;
 * const walkSpeed = GameConstants.PLAYER_WALK_SPEED;
 * const gravity = GameConstants.GRAVITY;
 * ```
 */
export class GameConstants {
    // Dimensiones de pantalla y cuadrícula adaptadas a la matriz 32x21 de referencia
    public static readonly GAME_WIDTH = 800;
    public static readonly GAME_HEIGHT = 600;
    public static readonly TILE_SIZE = 25;
    public static readonly GRID_COLS = 32; // 800 / 25 = 32 columnas
    public static readonly GRID_ROWS = 21; // 21 * 25 = 525 px de zona de cámara útil
    public static readonly HUD_HEIGHT = 75; // 75 + 525 = 600 px exactos
    public static readonly TOTAL_PYRAMIDS = 15;

    // Parámetros de física de Vick (Jugador)
    public static readonly PLAYER_WALK_SPEED = 125; // Píxeles por segundo
    public static readonly PLAYER_CLIMB_SPEED = 90; // Píxeles por segundo en escalera
    public static readonly PLAYER_JUMP_VELOCITY = -225; // Impulso vertical de salto clásico MSX
    public static readonly GRAVITY = 600; // Aceleración de caída
    public static readonly MAX_FALL_SPEED = 380; // Velocidad terminal de caída
    public static readonly INITIAL_LIVES = 3;
    public static readonly DIG_DURATION_MS = 600; // Tiempo en milisegundos para excavar un bloque
    public static readonly KNIFE_SPEED = 300; // Velocidad de vuelo del cuchillo arrojadizo
    public static readonly KNIFE_MAX_RANGE = 420; // Distancia máxima antes de caer al suelo

    // Parámetros de las momias enemigas
    public static readonly WHITE_MUMMY_SPEED = 60; // Velocidad de patrulla momia blanca
    public static readonly YELLOW_MUMMY_SPEED = 75; // Velocidad de patrulla momia dorada
    public static readonly RED_MUMMY_SPEED = 95; // Velocidad de rastreo momia roja
    public static readonly MUMMY_CLIMB_SPEED = 55; // Velocidad de escalado de momias

    // Puntuaciones
    public static readonly SCORE_GEM = 100;
    public static readonly SCORE_MUMMY = 200;
    public static readonly SCORE_CHAMBER_CLEAR = 1000;

    // Durabilidad inicial del pico recogido (número de bloques que puede romper)
    public static readonly PICKAXE_DEFAULT_USES = 3;
}
