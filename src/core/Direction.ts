/**
 * @file Direction.ts
 * Representación de las direcciones cardinales en el plano 2D para King's Valley.
 */

export const DirectionType = {
    None: 0,
    Left: 1,
    Right: 2,
    Up: 3,
    Down: 4
} as const;

export type DirectionType = typeof DirectionType[keyof typeof DirectionType];

/**
 * Clase utilitaria para operaciones y cálculos vectoriales con direcciones cardinales.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Esta clase proporciona la lógica matemática y de conversión para las 4 direcciones de movimiento
 * de las entidades del juego (jugador Vick, momias, cuchillos arrojadizos y comprobaciones de excavación).
 * Facilita la conversión de direcciones a vectores unitarios (dx, dy) y el cálculo de direcciones opuestas.
 * 
 * ¿CÓMO SE USA?:
 * Se utiliza de forma estática o instanciada según se requiera:
 * ```ts
 * const dir = Direction.Left;
 * const offset = Direction.toVector(dir); // { x: -1, y: 0 }
 * const opposite = Direction.getOpposite(dir); // Direction.Right
 * const isHoriz = Direction.isHorizontal(dir); // true
 * ```
 */
export class Direction {
    public static readonly None = DirectionType.None;
    public static readonly Left = DirectionType.Left;
    public static readonly Right = DirectionType.Right;
    public static readonly Up = DirectionType.Up;
    public static readonly Down = DirectionType.Down;

    /**
     * Obtiene el vector unitario discreto {x, y} correspondiente a una dirección dada.
     * @param dir Dirección cardinal
     * @returns Vector con componentes enteros {-1, 0, 1}
     */
    public static toVector(dir: DirectionType): { x: number; y: number } {
        switch (dir) {
            case DirectionType.Left:
                return { x: -1, y: 0 };
            case DirectionType.Right:
                return { x: 1, y: 0 };
            case DirectionType.Up:
                return { x: 0, y: -1 };
            case DirectionType.Down:
                return { x: 0, y: 1 };
            default:
                return { x: 0, y: 0 };
        }
    }

    /**
     * Devuelve la dirección contraria a la indicada.
     * @param dir Dirección actual
     * @returns Dirección cardinal opuesta
     */
    public static getOpposite(dir: DirectionType): DirectionType {
        switch (dir) {
            case DirectionType.Left:
                return DirectionType.Right;
            case DirectionType.Right:
                return DirectionType.Left;
            case DirectionType.Up:
                return DirectionType.Down;
            case DirectionType.Down:
                return DirectionType.Up;
            default:
                return DirectionType.None;
        }
    }

    /**
     * Comprueba si la dirección corresponde al eje horizontal.
     */
    public static isHorizontal(dir: DirectionType): boolean {
        return dir === DirectionType.Left || dir === DirectionType.Right;
    }

    /**
     * Comprueba si la dirección corresponde al eje vertical (escaleras).
     */
    public static isVertical(dir: DirectionType): boolean {
        return dir === DirectionType.Up || dir === DirectionType.Down;
    }
}
