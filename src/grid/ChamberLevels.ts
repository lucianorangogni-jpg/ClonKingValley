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
            ChamberLevels.createChamber3(),
            ChamberLevels.createChamber4(),
            ChamberLevels.createChamber5()
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
     * PYRAMID-01: Vestíbulo de terrazas escalonadas y altar hundido central (cuadrícula 32x21).
     */
    private static createChamber1(): ChamberData {
        const m = ChamberLevels.createEmptyReferenceMatrix();
        const diggable: Array<{ col: number; row: number }> = [];

        // Terrazas inferiores escalonadas (izq en fila 16, der en fila 15)
        for (let c = 1; c <= 12; c++) m[16][c] = 1;
        for (let c = 19; c <= 30; c++) m[15][c] = 1;

        // Altar central hundido en la base (techo en fila 18, paredes laterales excavables en fila 19)
        for (let c = 13; c <= 18; c++) m[18][c] = 1;
        for (const c of [13, 18]) {
            m[19][c] = 1;
            diggable.push({ col: c, row: 19 });
        }

        // Puente central (fila 12) y balcones laterales (fila 10)
        for (let c = 9; c <= 22; c++) m[12][c] = 1;
        for (let c = 1; c <= 7; c++) m[10][c] = 1;
        for (let c = 24; c <= 30; c++) m[10][c] = 1;

        // Terrazas superiores asimétricas (izq en fila 6, salida der en fila 5)
        for (let c = 1; c <= 13; c++) m[6][c] = 1;
        for (let c = 18; c <= 30; c++) m[5][c] = 1;

        // Bloques rosados excavables en balcones y puente
        for (const cell of [
            { col: 15, row: 12 }, { col: 16, row: 12 },
            { col: 5, row: 6 }, { col: 6, row: 6 }
        ]) {
            m[cell.row][cell.col] = 1;
            diggable.push(cell);
        }

        // Escaleras diagonales de 2 columnas conectando todas las terrazas
        ChamberLevels.addDiagonalStair(m, 9, 16, 19, -1);  // Base <-> terraza inf-izq
        ChamberLevels.addDiagonalStair(m, 21, 15, 19, 1);  // Base <-> terraza inf-der
        ChamberLevels.addDiagonalStair(m, 2, 10, 15, 1);   // Inf-izq <-> balcón izq
        ChamberLevels.addDiagonalStair(m, 27, 10, 14, -1); // Inf-der <-> balcón der
        ChamberLevels.addDiagonalStair(m, 11, 12, 15, -1); // Inf-izq <-> puente central
        ChamberLevels.addDiagonalStair(m, 18, 12, 14, 1);  // Inf-der <-> puente central
        ChamberLevels.addDiagonalStair(m, 7, 6, 11, 1);    // Puente central <-> sup-izq
        ChamberLevels.addDiagonalStair(m, 21, 5, 11, -1);  // Puente central <-> sup-der

        // Coleccionables
        m[19][15] = 4; // Gema rosa dentro del altar central
        m[9][2] = 4;   // Gema verde en balcón izq
        m[9][28] = 4;  // Gema azul en balcón der
        m[5][3] = 4;   // Gema amarilla en terraza sup-izq
        m[15][8] = 4;  // Pico en terraza inf-izq
        m[14][20] = 4; // Pico en terraza inf-der
        m[11][15] = 4; // Pico en puente central
        m[19][28] = 4; // Cuchillo en suelo inf-der
        m[5][8] = 4;   // Cuchillo en terraza sup-izq

        return ChamberLevels.parseReferenceMatrix(m, {
            stage: 1,
            name: 'PYRAMID-01 - THE VESTIBULE',
            playerSpawn: { col: 3, row: 15 },
            exitDoor: { col: 28, row: 4 },
            diggableCells: diggable,
            itemKinds: {
                '15,19': { kind: 'gem', gemColor: 'pink' },
                '2,9': { kind: 'gem', gemColor: 'green' },
                '28,9': { kind: 'gem', gemColor: 'blue' },
                '3,5': { kind: 'gem', gemColor: 'yellow' },
                '8,15': { kind: 'pickaxe' },
                '20,14': { kind: 'pickaxe' },
                '15,11': { kind: 'pickaxe' },
                '28,19': { kind: 'knife' },
                '8,5': { kind: 'knife' }
            },
            extraMummies: [
                { col: 26, row: 14, type: 'white' },
                { col: 17, row: 11, type: 'yellow' }
            ],
            movingFloors: [
                { col: 14, row: 12, length: 4, direction: 'left', speed: 70 }
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
     * PYRAMID-03: Tres torres verticales con cámara sellada central y muros divisorios excavables.
     */
    private static createChamber3(): ChamberData {
        const m = ChamberLevels.createEmptyReferenceMatrix();
        const diggable: Array<{ col: number; row: number }> = [];

        // Torre izquierda
        for (let c = 1; c <= 9; c++) m[16][c] = 1;
        for (let c = 1; c <= 10; c++) m[11][c] = 1;
        for (let c = 1; c <= 8; c++) m[6][c] = 1;

        // Muro divisorio inferior-izquierdo (col 10, filas 12..19) con paso excavable abajo
        for (let r = 12; r <= 19; r++) {
            m[r][10] = 1;
            if (r >= 18) diggable.push({ col: 10, row: r });
        }

        // Ciudadela central con bóveda sellada arriba (fila 4..8)
        for (let c = 12; c <= 20; c++) m[14][c] = 1;
        for (let c = 11; c <= 21; c++) m[8][c] = 1;
        for (let c = 12; c <= 20; c++) m[4][c] = 1;
        for (let r = 5; r <= 7; r++) {
            m[r][11] = 1;
            m[r][21] = 1;
            if (r === 7) {
                diggable.push({ col: 11, row: r }, { col: 21, row: r });
            }
        }

        // Torre derecha
        for (let c = 21; c <= 30; c++) m[17][c] = 1;
        for (let c = 22; c <= 30; c++) m[12][c] = 1;
        for (let c = 23; c <= 30; c++) m[6][c] = 1;

        // Escaleras diagonales de 2 columnas
        ChamberLevels.addDiagonalStair(m, 3, 16, 19, 1);   // Base izq <-> fila 16
        ChamberLevels.addDiagonalStair(m, 7, 11, 15, -1);  // Fila 16 <-> fila 11
        ChamberLevels.addDiagonalStair(m, 5, 6, 10, 1);    // Fila 11 <-> fila 6
        ChamberLevels.addDiagonalStair(m, 14, 14, 19, 1);  // Base centro <-> ciudadela fila 14
        ChamberLevels.addDiagonalStair(m, 12, 8, 13, 1);   // Fila 14 <-> bóveda fila 8
        ChamberLevels.addDiagonalStair(m, 26, 17, 19, -1); // Base der <-> fila 17
        ChamberLevels.addDiagonalStair(m, 23, 12, 16, 1);  // Fila 17 <-> fila 12
        ChamberLevels.addDiagonalStair(m, 27, 6, 11, -1);  // Fila 12 <-> fila 6

        // Coleccionables
        m[5][4] = 4;   // Gema rosa en torre sup-izq
        m[7][16] = 4;  // Gema verde dentro de la bóveda sellada central
        m[11][27] = 4; // Gema azul en torre der
        m[19][2] = 4;  // Gema amarilla tras muro divisorio izq
        m[19][8] = 4;  // Pico en base izq
        m[13][13] = 4; // Pico en ciudadela
        m[16][23] = 4; // Pico en torre der
        m[10][2] = 4;  // Pico en torre izq
        m[19][20] = 4; // Cuchillo en base centro
        m[13][19] = 4; // Cuchillo en ciudadela

        return ChamberLevels.parseReferenceMatrix(m, {
            stage: 3,
            name: 'PYRAMID-03 - LABYRINTH OF ANUBIS',
            playerSpawn: { col: 15, row: 13 },
            exitDoor: { col: 24, row: 5 },
            diggableCells: diggable,
            itemKinds: {
                '4,5': { kind: 'gem', gemColor: 'pink' },
                '16,7': { kind: 'gem', gemColor: 'green' },
                '27,11': { kind: 'gem', gemColor: 'blue' },
                '2,19': { kind: 'gem', gemColor: 'yellow' },
                '8,19': { kind: 'pickaxe' },
                '13,13': { kind: 'pickaxe' },
                '23,16': { kind: 'pickaxe' },
                '2,10': { kind: 'pickaxe' },
                '20,19': { kind: 'knife' },
                '19,13': { kind: 'knife' }
            },
            extraMummies: [
                { col: 25, row: 16, type: 'white' },
                { col: 16, row: 13, type: 'yellow' },
                { col: 25, row: 11, type: 'red' },
                { col: 4, row: 10, type: 'red' }
            ],
            movingFloors: [
                { col: 16, row: 14, length: 4, direction: 'right', speed: 80 },
                { col: 25, row: 12, length: 4, direction: 'left', speed: 80 }
            ]
        });
    }

    /**
     * PYRAMID-04: Embudo invertido de Horus en forma de V con cámara subterránea central.
     */
    private static createChamber4(): ChamberData {
        const m = ChamberLevels.createEmptyReferenceMatrix();
        const diggable: Array<{ col: number; row: number }> = [];

        // Alas superiores (fila 5)
        for (let c = 1; c <= 11; c++) m[5][c] = 1;
        for (let c = 20; c <= 30; c++) m[5][c] = 1;

        // Terrazas medias convergentes (fila 9)
        for (let c = 5; c <= 13; c++) m[9][c] = 1;
        for (let c = 18; c <= 26; c++) m[9][c] = 1;

        // Corazón central (fila 13)
        for (let c = 10; c <= 21; c++) m[13][c] = 1;

        // Alas inferiores divergentes (fila 17)
        for (let c = 3; c <= 11; c++) m[17][c] = 1;
        for (let c = 20; c <= 28; c++) m[17][c] = 1;

        // Cámara central inferior excavable (fila 18 techo, fila 19 muros)
        for (let c = 14; c <= 17; c++) m[18][c] = 1;
        for (const c of [14, 17]) {
            m[19][c] = 1;
            diggable.push({ col: c, row: 19 });
        }

        // Escaleras simétricas en V
        ChamberLevels.addDiagonalStair(m, 8, 5, 8, 1);    // Fila 5 izq <-> fila 9 izq
        ChamberLevels.addDiagonalStair(m, 22, 5, 8, -1);  // Fila 5 der <-> fila 9 der
        ChamberLevels.addDiagonalStair(m, 10, 9, 12, 1);  // Fila 9 izq <-> corazón fila 13
        ChamberLevels.addDiagonalStair(m, 20, 9, 12, -1); // Fila 9 der <-> corazón fila 13
        ChamberLevels.addDiagonalStair(m, 12, 13, 16, -1);// Corazón <-> fila 17 izq
        ChamberLevels.addDiagonalStair(m, 18, 13, 16, 1); // Corazón <-> fila 17 der
        ChamberLevels.addDiagonalStair(m, 5, 17, 19, 1);  // Fila 17 izq <-> base
        ChamberLevels.addDiagonalStair(m, 25, 17, 19, -1);// Fila 17 der <-> base

        // Coleccionables
        m[19][15] = 4; // Gema rosa en cámara central inferior
        m[8][6] = 4;   // Gema verde en terraza media izq
        m[8][25] = 4;  // Gema azul en terraza media der
        m[16][4] = 4;  // Gema amarilla en ala inf-izq
        m[4][6] = 4;   // Pico en ala sup-izq
        m[12][15] = 4; // Pico en corazón central
        m[16][27] = 4; // Pico en ala inf-der
        m[19][3] = 4;  // Cuchillo abajo izq
        m[4][23] = 4;  // Cuchillo arriba der

        return ChamberLevels.parseReferenceMatrix(m, {
            stage: 4,
            name: 'PYRAMID-04 - TOMB OF HORUS',
            playerSpawn: { col: 3, row: 4 },
            exitDoor: { col: 28, row: 4 },
            diggableCells: diggable,
            itemKinds: {
                '15,19': { kind: 'gem', gemColor: 'pink' },
                '6,8': { kind: 'gem', gemColor: 'green' },
                '25,8': { kind: 'gem', gemColor: 'blue' },
                '4,16': { kind: 'gem', gemColor: 'yellow' },
                '6,4': { kind: 'pickaxe' },
                '15,12': { kind: 'pickaxe' },
                '27,16': { kind: 'pickaxe' },
                '3,19': { kind: 'knife' },
                '23,4': { kind: 'knife' }
            },
            extraMummies: [
                { col: 22, row: 8, type: 'white' },
                { col: 14, row: 12, type: 'yellow' },
                { col: 22, row: 19, type: 'red' }
            ]
        });
    }

    /**
     * PYRAMID-05: Santuario de Ra con islas flotantes alternadas y jaulas elevadas.
     */
    private static createChamber5(): ChamberData {
        const m = ChamberLevels.createEmptyReferenceMatrix();
        const diggable: Array<{ col: number; row: number }> = [];

        // Nivel 1: Tres islas bajas (fila 17)
        for (let c = 2; c <= 8; c++) m[17][c] = 1;
        for (let c = 13; c <= 18; c++) m[17][c] = 1;
        for (let c = 23; c <= 29; c++) m[17][c] = 1;

        // Nivel 2: Dos puentes intermedios (fila 13)
        for (let c = 6; c <= 13; c++) m[13][c] = 1;
        for (let c = 18; c <= 25; c++) m[13][c] = 1;

        // Nivel 3: Tres plataformas altas (fila 9)
        for (let c = 1; c <= 7; c++) m[9][c] = 1;
        for (let c = 12; c <= 19; c++) m[9][c] = 1;
        for (let c = 24; c <= 30; c++) m[9][c] = 1;

        // Nivel 4: Corona de Ra superior (fila 5)
        for (let c = 8; c <= 23; c++) m[5][c] = 1;

        // Jaula excavable bajo la corona (fila 6..8, cols 14 y 17)
        for (const c of [14, 17]) {
            m[6][c] = 1;
            m[7][c] = 1;
            m[8][c] = 1;
            diggable.push({ col: c, row: 7 }, { col: c, row: 8 });
        }

        // Escaleras en zigzag entre islas
        ChamberLevels.addDiagonalStair(m, 4, 17, 19, 1);  // Base <-> isla inf-izq
        ChamberLevels.addDiagonalStair(m, 15, 17, 19, -1);// Base <-> isla inf-centro
        ChamberLevels.addDiagonalStair(m, 26, 17, 19, -1);// Base <-> isla inf-der
        ChamberLevels.addDiagonalStair(m, 9, 13, 16, -1); // Fila 17 izq <-> fila 13 izq
        ChamberLevels.addDiagonalStair(m, 21, 13, 16, 1); // Fila 17 der <-> fila 13 der
        ChamberLevels.addDiagonalStair(m, 4, 9, 12, 1);   // Fila 13 izq <-> fila 9 izq
        ChamberLevels.addDiagonalStair(m, 14, 9, 12, -1); // Fila 13 izq <-> fila 9 centro
        ChamberLevels.addDiagonalStair(m, 26, 9, 12, -1); // Fila 13 der <-> fila 9 der
        ChamberLevels.addDiagonalStair(m, 10, 5, 8, 1);   // Fila 9 centro <-> corona fila 5
        ChamberLevels.addDiagonalStair(m, 20, 5, 8, 1);   // Fila 9 der <-> corona fila 5

        // Coleccionables
        m[8][15] = 4;  // Gema rosa dentro de la jaula central
        m[8][2] = 4;   // Gema verde en isla sup-izq
        m[8][28] = 4;  // Gema azul en isla sup-der
        m[16][15] = 4; // Gema amarilla en isla inf-centro
        m[16][3] = 4;  // Pico en isla inf-izq
        m[12][20] = 4; // Pico en puente der
        m[4][10] = 4;  // Pico en corona
        m[19][20] = 4; // Cuchillo abajo
        m[12][8] = 4;  // Cuchillo en puente izq

        return ChamberLevels.parseReferenceMatrix(m, {
            stage: 5,
            name: 'PYRAMID-05 - SANCTUM OF RA',
            playerSpawn: { col: 16, row: 19 },
            exitDoor: { col: 15, row: 4 },
            diggableCells: diggable,
            itemKinds: {
                '15,8': { kind: 'gem', gemColor: 'pink' },
                '2,8': { kind: 'gem', gemColor: 'green' },
                '28,8': { kind: 'gem', gemColor: 'blue' },
                '15,16': { kind: 'gem', gemColor: 'yellow' },
                '3,16': { kind: 'pickaxe' },
                '20,12': { kind: 'pickaxe' },
                '10,4': { kind: 'pickaxe' },
                '20,19': { kind: 'knife' },
                '8,12': { kind: 'knife' }
            },
            extraMummies: [
                { col: 25, row: 16, type: 'white' },
                { col: 10, row: 12, type: 'yellow' },
                { col: 27, row: 8, type: 'red' },
                { col: 18, row: 4, type: 'red' }
            ]
        });
    }
}
