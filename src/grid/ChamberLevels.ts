/**
 * @file ChamberLevels.ts
 * Catálogo y diseño de niveles y cámaras para King's Valley MSX en cuadrícula 32x21.
 */

import { TileType, ReferenceTile } from './TileType.ts';
import { GameConstants } from '../core/GameConstants.ts';
import type { MummyType } from '../entities/MummyType.ts';

export type GemColorVariant = 'pink' | 'green' | 'blue' | 'yellow';

export interface ChamberItemSpawn {
    col: number;
    row: number;
    color?: GemColorVariant;
}

export interface ChamberMummySpawn {
    col: number;
    row: number;
    type: MummyType;
}

export interface ChamberMovingFloorSpawn {
    col: number;
    row: number;
    length: number;
    direction: 'left' | 'right';
    speed?: number;
}

export interface ChamberData {
    stage: number;
    name: string;
    layout: number[][];
    playerSpawn: { col: number; row: number };
    exitDoor: { col: number; row: number };
    gems: ChamberItemSpawn[];
    pickaxes: ChamberItemSpawn[];
    knives: ChamberItemSpawn[];
    mummies: ChamberMummySpawn[];
    movingFloors: ChamberMovingFloorSpawn[];
}

interface ReferenceParseOptions {
    stage: number;
    name: string;
    playerSpawn: { col: number; row: number };
    exitDoor: { col: number; row: number };
    diggableCells?: Array<{ col: number; row: number }>;
    itemKinds?: Record<string, { kind: 'gem' | 'pickaxe' | 'knife'; gemColor?: GemColorVariant }>;
    extraMummies?: ChamberMummySpawn[];
    movingFloors?: ChamberMovingFloorSpawn[];
}

/**
 * Matriz exacta de referencia (32 columnas x 21 filas) extraída de `PantallaEjemplo.png` (PYRAMID-02).
 * Leyenda:
 * 0 = Aire / Fondo | 1 = Ladrillos | 2 = Escaleras | 3 = Puertas/Spawns | 4 = Coleccionables
 */
export const levelData: number[][] = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 4, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 1],
    [1, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1, 1, 1, 1, 0, 0, 0, 4, 0, 0, 2, 2, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 2, 2, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 2, 2, 1, 1, 1, 1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

/**
 * Catálogo de niveles y diseño de mapas de las cámaras de la pirámide (cuadrícula 32x21).
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Almacena la configuración de cada pirámide usando matrices bidimensionales de 32x21 fieles al
 * clásico MSX y a la imagen de referencia `PantallaEjemplo.png`. Convierte la leyenda simplificada
 * (0=aire, 1=ladrillo, 2=escalera, 3=puerta momia, 4=coleccionable) al sistema de `TileType` y spawns.
 * 
 * ¿CÓMO SE USA?:
 * ```ts
 * const chamber = ChamberLevels.getLevel(2); // PYRAMID-02 exacta
 * grid.loadLayout(chamber.layout);
 * ```
 */
export class ChamberLevels {
    /**
     * Devuelve los datos de la cámara correspondiente al número de fase (1..15).
     */
    public static getLevel(stage: number): ChamberData {
        const levels = [
            ChamberLevels.createChamber1(),
            ChamberLevels.createChamber2(),
            ChamberLevels.createChamber3()
        ];
        const index = (stage - 1) % levels.length;
        const base = levels[index];
        return {
            ...base,
            stage
        };
    }

    /**
     * Convierte una matriz numérica con la leyenda de referencia (`ReferenceTile`) en un `ChamberData` jugable.
     */
    public static parseReferenceMatrix(matrix: number[][], options: ReferenceParseOptions): ChamberData {
        const rows = GameConstants.GRID_ROWS;
        const cols = GameConstants.GRID_COLS;
        const layout: number[][] = [];
        const gems: ChamberItemSpawn[] = [];
        const pickaxes: ChamberItemSpawn[] = [];
        const knives: ChamberItemSpawn[] = [];
        const mummies: ChamberMummySpawn[] = [...(options.extraMummies ?? [])];

        const diggableSet = new Set(
            (options.diggableCells ?? []).map((cell) => `${cell.col},${cell.row}`)
        );

        for (let r = 0; r < rows; r++) {
            const row: number[] = [];
            const srcRow = matrix[r] ?? [];
            for (let c = 0; c < cols; c++) {
                const raw = srcRow[c] ?? ReferenceTile.Empty;
                const key = `${c},${r}`;

                if (raw === ReferenceTile.Brick) {
                    row.push(diggableSet.has(key) ? TileType.DiggableSandstone : TileType.SolidWall);
                } else if (raw === ReferenceTile.Stair) {
                    row.push(TileType.Ladder);
                } else if (raw === ReferenceTile.Door) {
                    row.push(TileType.Empty);
                    mummies.push({ col: c, row: r, type: 'white' });
                } else if (raw === ReferenceTile.Collectible) {
                    row.push(TileType.Empty);
                    const spec = options.itemKinds?.[key];
                    if (spec?.kind === 'pickaxe') {
                        pickaxes.push({ col: c, row: r });
                    } else if (spec?.kind === 'knife') {
                        knives.push({ col: c, row: r });
                    } else {
                        gems.push({ col: c, row: r, color: spec?.gemColor ?? 'pink' });
                    }
                } else {
                    row.push(TileType.Empty);
                }
            }
            layout.push(row);
        }

        layout[options.exitDoor.row][options.exitDoor.col] = TileType.ExitDoorClosed;

        return {
            stage: options.stage,
            name: options.name,
            layout,
            playerSpawn: options.playerSpawn,
            exitDoor: options.exitDoor,
            gems,
            pickaxes,
            knives,
            mummies,
            movingFloors: options.movingFloors ?? []
        };
    }

    /**
     * Crea una matriz 32x21 vacía con borde izquierdo, derecho y suelo inferior de ladrillo.
     */
    private static createEmptyReferenceMatrix(): number[][] {
        const map: number[][] = [];
        for (let r = 0; r < GameConstants.GRID_ROWS; r++) {
            const row: number[] = [];
            for (let c = 0; c < GameConstants.GRID_COLS; c++) {
                if (c === 0 || c === GameConstants.GRID_COLS - 1 || r === GameConstants.GRID_ROWS - 1) {
                    row.push(ReferenceTile.Brick);
                } else {
                    row.push(ReferenceTile.Empty);
                }
            }
            map.push(row);
        }
        return map;
    }

    /**
     * Traza una escalera diagonal de 2 columnas de ancho por fila (estilo clásico MSX King's Valley).
     * @param matrix Matriz 32x21 de referencia
     * @param capLeftCol Columna izquierda del remate superior en la plataforma
     * @param topRow Fila de la plataforma superior donde perfora la escalera
     * @param bottomRow Fila de la última celda aérea sobre el piso inferior
     * @param dir `-1` desciende hacia la izquierda (`/`), `+1` desciende hacia la derecha (`\`)
     */
    private static addDiagonalStair(
        matrix: number[][],
        capLeftCol: number,
        topRow: number,
        bottomRow: number,
        dir: -1 | 1
    ): void {
        for (let r = topRow; r <= bottomRow; r++) {
            const offset = (r - topRow) * dir;
            const c = capLeftCol + offset;
            if (r >= 0 && r < GameConstants.GRID_ROWS && c >= 1 && c + 1 < GameConstants.GRID_COLS) {
                matrix[r][c] = ReferenceTile.Stair;
                matrix[r][c + 1] = ReferenceTile.Stair;
            }
        }
    }

    /**
     * Añade una escalera continua vertical sobre la matriz interna de `ChamberLevels`.
     */
    public static addLadder(layout: number[][], col: number, topRow: number, bottomRow: number): void {
        const effectiveBottom = Math.min(bottomRow, GameConstants.GRID_ROWS - 2);
        for (let r = topRow; r <= effectiveBottom; r++) {
            layout[r][col] = TileType.Ladder;
        }
    }

    /**
     * PYRAMID-01: Vestíbulo de entrada en cuadrícula 32x21 adaptado a la estética MSX de referencia.
     */
    private static createChamber1(): ChamberData {
        const m = ChamberLevels.createEmptyReferenceMatrix();
        const diggable: Array<{ col: number; row: number }> = [];

        // Plataforma inferior-media (row 16)
        for (let c = 1; c <= 30; c++) m[16][c] = 1;
        // Plataforma central (row 11)
        for (let c = 3; c <= 28; c++) m[11][c] = 1;
        // Plataforma superior (row 6)
        for (let c = 5; c <= 26; c++) m[6][c] = 1;

        // Muros de ladrillo rosado excavable
        for (const r of [14, 15]) {
            for (const c of [10, 11]) {
                m[r][c] = 1;
                diggable.push({ col: c, row: r });
            }
        }
        for (const c of [15, 16]) {
            m[11][c] = 1;
            diggable.push({ col: c, row: 11 });
        }
        for (const c of [20, 21]) {
            m[6][c] = 1;
            diggable.push({ col: c, row: 6 });
        }

        // Escaleras diagonales de 2 columnas (conectando piso base hasta plataforma superior)
        ChamberLevels.addDiagonalStair(m, 5, 16, 19, 1);   // Base (row 20) <-> row 16
        ChamberLevels.addDiagonalStair(m, 22, 11, 15, -1); // row 16 <-> row 11
        ChamberLevels.addDiagonalStair(m, 7, 6, 10, 1);    // row 11 <-> row 6
        ChamberLevels.addDiagonalStair(m, 23, 16, 19, -1); // Acceso lateral inferior

        // Coleccionables (4)
        m[19][14] = 4; // Gema rosa en piso inferior
        m[15][6] = 4;  // Gema verde
        m[10][14] = 4; // Gema azul
        m[5][10] = 4;  // Gema amarilla
        m[15][18] = 4; // Pico
        m[10][24] = 4; // Pico
        m[15][4] = 4;  // Cuchillo
        m[5][22] = 4;  // Cuchillo

        return ChamberLevels.parseReferenceMatrix(m, {
            stage: 1,
            name: 'PYRAMID-01 - THE VESTIBULE',
            playerSpawn: { col: 3, row: 15 },
            exitDoor: { col: 25, row: 5 },
            diggableCells: diggable,
            itemKinds: {
                '14,19': { kind: 'gem', gemColor: 'pink' },
                '6,15': { kind: 'gem', gemColor: 'green' },
                '14,10': { kind: 'gem', gemColor: 'blue' },
                '10,5': { kind: 'gem', gemColor: 'yellow' },
                '18,15': { kind: 'pickaxe' },
                '24,10': { kind: 'pickaxe' },
                '4,15': { kind: 'knife' },
                '22,5': { kind: 'knife' }
            },
            extraMummies: [
                { col: 26, row: 15, type: 'white' },
                { col: 18, row: 10, type: 'yellow' }
            ],
            movingFloors: [
                { col: 10, row: 11, length: 4, direction: 'left', speed: 70 }
            ]
        });
    }

    /**
     * PYRAMID-02: Nivel mapeado píxel a píxel desde `PantallaEjemplo.png` usando `levelData` (32x21).
     */
    private static createChamber2(): ChamberData {
        // Ladrillos rosados excavables en la esquina inferior izquierda de la captura de referencia
        const diggablePinkBricks: Array<{ col: number; row: number }> = [
            { col: 1, row: 18 }, { col: 2, row: 18 }, { col: 3, row: 18 },
            { col: 1, row: 19 }, { col: 2, row: 19 }, { col: 3, row: 19 }, { col: 4, row: 19 }, { col: 5, row: 19 }
        ];

        return ChamberLevels.parseReferenceMatrix(levelData, {
            stage: 2,
            name: "PYRAMID-02 - THE PHARAOH'S VAULT",
            playerSpawn: { col: 7, row: 14 },
            exitDoor: { col: 30, row: 3 },
            diggableCells: diggablePinkBricks,
            itemKinds: {
                '7,1': { kind: 'knife' },
                '23,1': { kind: 'pickaxe' },
                '3,7': { kind: 'pickaxe' },
                '25,7': { kind: 'pickaxe' },
                '18,9': { kind: 'gem', gemColor: 'pink' },
                '23,11': { kind: 'gem', gemColor: 'green' },
                '14,15': { kind: 'pickaxe' },
                '1,17': { kind: 'pickaxe' },
                '24,19': { kind: 'knife' }
            },
            extraMummies: [
                { col: 18, row: 6, type: 'yellow' },
                { col: 27, row: 3, type: 'white' }
            ]
        });
    }

    /**
     * PYRAMID-03: Laberinto de Anubis en cuadrícula 32x21 con cintas transportadoras y momias rojas.
     */
    private static createChamber3(): ChamberData {
        const m = ChamberLevels.createEmptyReferenceMatrix();
        const diggable: Array<{ col: number; row: number }> = [];

        for (let c = 1; c <= 30; c++) m[16][c] = 1;
        for (let c = 2; c <= 29; c++) m[12][c] = 1;
        for (let c = 4; c <= 27; c++) m[8][c] = 1;
        for (let c = 2; c <= 29; c++) m[4][c] = 1;

        // Cajas centrales excavables
        for (const c of [15, 16]) {
            m[16][c] = 1;
            m[12][c] = 1;
            diggable.push({ col: c, row: 16 }, { col: c, row: 12 });
        }
        for (const c of [10, 11, 20, 21]) {
            m[8][c] = 1;
            diggable.push({ col: c, row: 8 });
        }

        ChamberLevels.addDiagonalStair(m, 4, 16, 19, 1);
        ChamberLevels.addDiagonalStair(m, 25, 16, 19, -1);
        ChamberLevels.addDiagonalStair(m, 8, 12, 15, -1);
        ChamberLevels.addDiagonalStair(m, 21, 8, 11, 1);
        ChamberLevels.addDiagonalStair(m, 14, 4, 7, -1);

        m[19][15] = 4;
        m[15][27] = 4;
        m[11][4] = 4;
        m[7][18] = 4;
        m[3][10] = 4;
        m[15][6] = 4;
        m[11][25] = 4;
        m[15][20] = 4;
        m[7][6] = 4;

        return ChamberLevels.parseReferenceMatrix(m, {
            stage: 3,
            name: 'PYRAMID-03 - LABYRINTH OF ANUBIS',
            playerSpawn: { col: 3, row: 15 },
            exitDoor: { col: 28, row: 3 },
            diggableCells: diggable,
            itemKinds: {
                '15,19': { kind: 'gem', gemColor: 'pink' },
                '27,15': { kind: 'gem', gemColor: 'green' },
                '4,11': { kind: 'gem', gemColor: 'blue' },
                '18,7': { kind: 'gem', gemColor: 'yellow' },
                '10,3': { kind: 'gem', gemColor: 'pink' },
                '6,15': { kind: 'pickaxe' },
                '25,11': { kind: 'pickaxe' },
                '20,15': { kind: 'knife' },
                '6,7': { kind: 'knife' }
            },
            extraMummies: [
                { col: 22, row: 15, type: 'white' },
                { col: 19, row: 11, type: 'yellow' },
                { col: 14, row: 7, type: 'red' },
                { col: 22, row: 3, type: 'red' }
            ],
            movingFloors: [
                { col: 10, row: 12, length: 4, direction: 'right', speed: 80 },
                { col: 14, row: 8, length: 4, direction: 'left', speed: 80 }
            ]
        });
    }
}
