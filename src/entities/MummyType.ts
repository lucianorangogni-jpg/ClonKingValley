/**
 * @file MummyType.ts
 * Variantes de enemigos tipo momia en King's Valley.
 */

/**
 * Constantes y tipos que distinguen los tipos de momia según velocidad y agresividad.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Diferencia las mecánicas y el comportamiento de las momias enemigas:
 * - `White`: Momia estándar de patrulla y velocidad moderada.
 * - `Red`: Momia veloz con mayor capacidad de persecución y subida rápida de escaleras.
 * Compatible con Node.js strip-only mode.
 * 
 * ¿CÓMO SE USA?:
 * Se asigna al instanciar la entidad `Mummy`:
 * ```ts
 * const mummy = new Mummy(scene, x, y, MummyType.Red, grid);
 * ```
 */
export const MummyType = {
    White: 'white',
    Yellow: 'yellow',
    Red: 'red'
} as const;

export type MummyType = typeof MummyType[keyof typeof MummyType];
