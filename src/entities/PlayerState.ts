/**
 * @file PlayerState.ts
 * Estados de la máquina de estados del protagonista Vick para King's Valley.
 */

/**
 * Constantes y tipos de estados de comportamiento para el jugador Vick.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Controla la máquina de estados finita del protagonista, garantizando que transiciones
 * como saltar, escalar escaleras, cavar arenisca con el pico, caer por gravedad, lanzar cuchillos
 * o morir por contacto con momias sean mutuamente excluyentes y respeten las animaciones y físicas arcade.
 * Compatible con Node.js strip-only mode.
 * 
 * ¿CÓMO SE USA?:
 * Es evaluado y asignado dentro de `Player.ts`:
 * ```ts
 * if (this.playerState === PlayerState.Climbing) {
 *     this.handleClimbingInput();
 * }
 * ```
 */
export const PlayerState = {
    /** En reposo sobre una superficie sólida */
    Idle: 'Idle',

    /** Desplazándose horizontalmente hacia la izquierda o derecha */
    Walking: 'Walking',

    /** Ascendiendo o descendiendo por una escalera */
    Climbing: 'Climbing',

    /** Saltando parabólicamente sobre obstáculos o momias */
    Jumping: 'Jumping',

    /** Ejecutando la animación y lógica de excavación con pico */
    Digging: 'Digging',

    /** Cayendo libremente por gravedad hacia el suelo */
    Falling: 'Falling',

    /** Animación de derrota al ser alcanzado por una momia o caer en trampa */
    Dead: 'Dead',

    /** Atravesando la puerta de salida para completar la cámara */
    StageClear: 'StageClear'
} as const;

export type PlayerState = typeof PlayerState[keyof typeof PlayerState];
