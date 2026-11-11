/**
 * @file MSXPalette.ts
 * Definición oficial de la paleta de 16 colores del estándar MSX (TMS9918 / V9938).
 */

/**
 * Gestor y catálogo de la paleta retro oficial de 16 colores de ordenadores MSX.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Esta clase garantiza la fidelidad visual absoluta al King's Valley original de 1985.
 * Proporciona los valores hexadecimales (tanto cadenas CSS como valores numéricos de Phaser 0xRRGGBB)
 * de los 16 colores nativos del chip de vídeo MSX, evitando el uso de colores modernos fuera de época
 * y unificando el renderizado de sprites procedimentales, fuentes y fondos.
 * 
 * ¿CÓMO SE USA?:
 * Se consulta de manera estática para pintar en Canvas o asignar tintes y colores en Phaser:
 * ```ts
 * const bgColor = MSXPalette.BLACK; // '#000000'
 * const playerHatColor = MSXPalette.LIGHT_YELLOW; // '#e6ce80'
 * const numericColor = MSXPalette.getColorHex(MSXColorIndex.White); // 0xffffff
 * ```
 */
export const MSXColorIndex = {
    Transparent: 0,
    Black: 1,
    MediumGreen: 2,
    LightGreen: 3,
    DarkBlue: 4,
    LightBlue: 5,
    DarkRed: 6,
    Cyan: 7,
    MediumRed: 8,
    LightRed: 9,
    DarkYellow: 10,
    LightYellow: 11,
    DarkGreen: 12,
    Magenta: 13,
    Gray: 14,
    White: 15
} as const;

export type MSXColorIndex = typeof MSXColorIndex[keyof typeof MSXColorIndex];

export class MSXPalette {
    // Definiciones en cadena CSS hexadecimal
    public static readonly TRANSPARENT = 'rgba(0,0,0,0)';
    public static readonly BLACK = '#000000';
    public static readonly MEDIUM_GREEN = '#21c842';
    public static readonly LIGHT_GREEN = '#5edc78';
    public static readonly DARK_BLUE = '#5455ed';
    public static readonly LIGHT_BLUE = '#7d76fc';
    public static readonly DARK_RED = '#d4524d';
    public static readonly CYAN = '#42ebf5';
    public static readonly MEDIUM_RED = '#fc5554';
    public static readonly LIGHT_RED = '#ff7978';
    public static readonly DARK_YELLOW = '#d4c154';
    public static readonly LIGHT_YELLOW = '#e6ce80';
    public static readonly DARK_GREEN = '#21b03b';
    public static readonly MAGENTA = '#c95bba';
    public static readonly GRAY = '#cccccc';
    public static readonly WHITE = '#ffffff';

    // Array ordenado por índice MSX
    public static readonly COLORS_CSS: readonly string[] = [
        MSXPalette.TRANSPARENT,
        MSXPalette.BLACK,
        MSXPalette.MEDIUM_GREEN,
        MSXPalette.LIGHT_GREEN,
        MSXPalette.DARK_BLUE,
        MSXPalette.LIGHT_BLUE,
        MSXPalette.DARK_RED,
        MSXPalette.CYAN,
        MSXPalette.MEDIUM_RED,
        MSXPalette.LIGHT_RED,
        MSXPalette.DARK_YELLOW,
        MSXPalette.LIGHT_YELLOW,
        MSXPalette.DARK_GREEN,
        MSXPalette.MAGENTA,
        MSXPalette.GRAY,
        MSXPalette.WHITE
    ];

    // Array con valores numéricos para Phaser (0xRRGGBB)
    public static readonly COLORS_NUMERIC: readonly number[] = [
        0x000000,
        0x000000,
        0x21c842,
        0x5edc78,
        0x5455ed,
        0x7d76fc,
        0xd4524d,
        0x42ebf5,
        0xfc5554,
        0xff7978,
        0xd4c154,
        0xe6ce80,
        0x21b03b,
        0xc95bba,
        0xcccccc,
        0xffffff
    ];

    /**
     * Obtiene el código hexadecimal numérico (0xRRGGBB) para un índice de color MSX.
     * @param index Índice de color (0-15)
     */
    public static getColorNumeric(index: MSXColorIndex): number {
        return MSXPalette.COLORS_NUMERIC[index] ?? 0xffffff;
    }

    /**
     * Obtiene la cadena CSS (#RRGGBB) para un índice de color MSX.
     * @param index Índice de color (0-15)
     */
    public static getColorCSS(index: MSXColorIndex): string {
        return MSXPalette.COLORS_CSS[index] ?? '#ffffff';
    }
}
