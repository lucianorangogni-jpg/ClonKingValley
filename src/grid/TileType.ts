/**
 * @file TileType.ts
 * Definición de tipos de celda de la pirámide de King's Valley.
 */

/**
 * Constantes y tipos de celda discretos en la cuadrícula de la cámara de la pirámide.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Modela las propiedades físicas y de interacción de cada casilla de la pirámide:
 * si es transitable (vacía), si es un muro macizo indestructible, si es un bloque
 * de arenisca excavable con el pico, si es una escalera para ascender/descender,
 * o si es la puerta sellada/abierta de escape.
 * Compatible con Node.js type stripping y bundlers modernos.
 * 
 * ¿CÓMO SE USA?:
 * Se utiliza para poblar la matriz bidimensional de `ChamberGrid`, consultar colisiones
 * y determinar la lógica de excavación y navegación de entidades:
 * ```ts
 * if (tile === TileType.DiggableSandstone) {
 *     player.startDigging(col, row);
 * }
 * ```
 */
export const TileType = {
    /** Espacio vacío por el que pueden desplazarse las entidades y caer por gravedad */
    Empty: 0,

    /** Muro de piedra macizo impenetrable e indestructible */
    SolidWall: 1,

    /** Bloque de arenisca destructible que puede ser excavado con el pico */
    DiggableSandstone: 2,

    /** Bloque de arenisca fracturado a medio excavar */
    DiggableSandstoneCracked: 3,

    /** Escalera / Peldaños verticales que permiten subir y bajar entre plataformas */
    Ladder: 4,

    /** Puerta de salida sellada (requiere recolectar todas las gemas sagradas) */
    ExitDoorClosed: 5,

    /** Puerta de salida abierta (permite completar la cámara al cruzarla) */
    ExitDoorOpen: 6,

    /** Piso movedizo / Cinta transportadora mecánica que desplaza entidades */
    MovingFloor: 7
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

/**
 * Leyenda simplificada utilizada en matrices de nivel importadas desde capturas de referencia:
 * - `0`: Espacio vacío (aire / fondo)
 * - `1`: Ladrillos de la pirámide
 * - `2`: Escaleras
 * - `3`: Puertas (puntos de generación de momias)
 * - `4`: Gemas o espadas/herramientas (coleccionables)
 */
export const ReferenceTile = {
    Empty: 0,
    Brick: 1,
    Stair: 2,
    Door: 3,
    Collectible: 4
} as const;

export type ReferenceTile = typeof ReferenceTile[keyof typeof ReferenceTile];
