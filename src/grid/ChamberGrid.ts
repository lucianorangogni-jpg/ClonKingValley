/**
 * @file ChamberGrid.ts
 * Gestor lógico bidimensional de la cuadrícula de la cámara de la pirámide.
 */

import { TileType } from './TileType.ts';
import { GameConstants } from '../core/GameConstants.ts';

/**
 * Gestor de simulación de cuadrícula y colisiones discretas para King's Valley.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Esta clase encapsula toda la topología de la cámara de la pirámide desacoplada del renderizado.
 * Gestiona el mapa de casillas (`TileType`), verifica si una posición es sólida, transitable, escalera
 * o excavable, maneja el estado de degradación de los bloques de arenisca y convierte entre coordenadas
 * continuas del mundo (`x`, `y`) y celdas discretas de la cuadrícula (`col`, `row`).
 * Al estar desacoplada de Phaser, permite ser probada de forma unitaria en tests automáticos.
 * 
 * ¿CÓMO SE USA?:
 * Se instancia al inicializar el nivel y se consulta en cada frame:
 * ```ts
 * const grid = new ChamberGrid(25, 18, 32);
 * grid.loadLayout(levelData);
 * if (grid.isSolid(col, row)) {
 *     // Bloquear avance
 * }
 * if (grid.isDiggable(col, row)) {
 *     const broke = grid.digBlock(col, row);
 * }
 * ```
 */
export interface LadderStepInfo {
    col: number;
    row: number;
    centerX: number;
    slopeX: number;
    topY: number;
    bottomY: number;
    hasLadderAbove: boolean;
    hasLadderBelow: boolean;
}

export class ChamberGrid {
    public readonly cols: number;
    public readonly rows: number;
    public readonly tileSize: number;
    public readonly offsetY: number;
    private cells: TileType[][];
    private onTileChangedCallback?: (col: number, row: number, newType: TileType) => void;

    /**
     * Construye una nueva cuadrícula de cámara.
     * @param cols Número de columnas horizontales (por defecto 32)
     * @param rows Número de filas verticales (por defecto 21)
     * @param tileSize Tamaño de celda en píxeles (por defecto 25)
     * @param offsetY Desplazamiento vertical en píxeles bajo el HUD (por defecto 0)
     */
    constructor(
        cols: number = GameConstants.GRID_COLS,
        rows: number = GameConstants.GRID_ROWS,
        tileSize: number = GameConstants.TILE_SIZE,
        offsetY: number = 0
    ) {
        this.cols = cols;
        this.rows = rows;
        this.tileSize = tileSize;
        this.offsetY = offsetY;
        this.cells = [];
        this.clear();
    }

    /**
     * Registra un observador que se ejecutará cada vez que cambie un tile (por ejemplo al cavar o abrir la puerta).
     */
    public setTileChangedListener(callback: (col: number, row: number, newType: TileType) => void): void {
        this.onTileChangedCallback = callback;
    }

    /**
     * Limpia la cuadrícula dejando todas las celdas vacías.
     */
    public clear(): void {
        this.cells = [];
        for (let r = 0; r < this.rows; r++) {
            const row: TileType[] = [];
            for (let c = 0; c < this.cols; c++) {
                row.push(TileType.Empty);
            }
            this.cells.push(row);
        }
    }

    /**
     * Carga una matriz numérica en la cuadrícula.
     * @param layout Matriz de enteros que representan TileType
     */
    public loadLayout(layout: number[][]): void {
        this.clear();
        for (let r = 0; r < Math.min(layout.length, this.rows); r++) {
            for (let c = 0; c < Math.min(layout[r].length, this.cols); c++) {
                this.cells[r][c] = layout[r][c] as TileType;
            }
        }
    }

    /**
     * Obtiene el tipo de celda en las coordenadas dadas.
     * Si las coordenadas quedan fuera de los límites, se considera `SolidWall`.
     */
    public getTile(col: number, row: number): TileType {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return TileType.SolidWall;
        }
        return this.cells[row][col];
    }

    /**
     * Modifica el tipo de celda y notifica al oyente si está configurado.
     */
    public setTile(col: number, row: number, type: TileType): void {
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            this.cells[row][col] = type;
            if (this.onTileChangedCallback) {
                this.onTileChangedCallback(col, row, type);
            }
        }
    }

    /**
     * Comprueba si una celda es un obstáculo sólido impenetrable para el avance horizontal.
     * Incluye muros de piedra maciza, arenisca y puerta cerrada.
     */
    public isSolid(col: number, row: number): boolean {
        const tile = this.getTile(col, row);
        return (
            tile === TileType.SolidWall ||
            tile === TileType.DiggableSandstone ||
            tile === TileType.DiggableSandstoneCracked ||
            tile === TileType.ExitDoorClosed ||
            tile === TileType.MovingFloor
        );
    }

    /**
     * Comprueba si una celda es un suelo sólido de plataforma.
     */
    public isSolidFloor(col: number, row: number): boolean {
        const tile = this.getTile(col, row);
        return (
            tile === TileType.SolidWall ||
            tile === TileType.DiggableSandstone ||
            tile === TileType.DiggableSandstoneCracked ||
            tile === TileType.ExitDoorClosed ||
            tile === TileType.ExitDoorOpen ||
            tile === TileType.MovingFloor
        );
    }

    /**
     * Comprueba si una celda es una superficie sobre la que se puede estar de pie.
     * Incluye suelos sólidos y el peldaño de una escalera que coincide con el nivel de una plataforma.
     */
    public isStandable(col: number, row: number): boolean {
        if (this.isSolidFloor(col, row)) {
            return true;
        }
        // Casilla de escalera: permite caminar horizontalmente por encima si es la cima (sin escalera arriba ni en diagonal)
        // o si coincide con el nivel de una plataforma continua adyacente
        if (this.isLadder(col, row)) {
            const hasLadderAbove =
                this.isLadder(col, row - 1) ||
                this.isLadder(col - 1, row - 1) ||
                this.isLadder(col + 1, row - 1);
            if (!hasLadderAbove) {
                return true;
            }
            if (this.isSolidFloor(col - 1, row) || this.isSolidFloor(col + 1, row)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Devuelve el rango horizontal contiguo [leftCol, rightCol] de escalera en la fila dada y su centro en X.
     */
    public getLadderSpan(col: number, row: number): { leftCol: number; rightCol: number; centerX: number } | null {
        if (!this.isLadder(col, row)) return null;
        let leftCol = col;
        let rightCol = col;
        while (leftCol > 0 && this.isLadder(leftCol - 1, row)) {
            leftCol--;
        }
        while (rightCol < this.cols - 1 && this.isLadder(rightCol + 1, row)) {
            rightCol++;
        }
        return {
            leftCol,
            rightCol,
            centerX: ((leftCol + rightCol + 1) / 2) * this.tileSize
        };
    }

    /**
     * Localiza la escalera (vertical o diagonal) accesible desde las coordenadas dadas y devuelve
     * su dirección de pendiente, centro continuo y límites verticales superior e inferior.
     */
    public findAccessibleLadder(x: number, feetY: number): LadderStepInfo | null {
        const feetTile = this.worldToTile(x, feetY - 2);
        const torsoTile = this.worldToTile(x, feetY - this.tileSize * 0.5);
        const belowTile = this.worldToTile(x, feetY + 4);

        const candidateRows = [torsoTile.row, feetTile.row, belowTile.row];
        const candidateCols = [
            torsoTile.col,
            torsoTile.col - 1,
            torsoTile.col + 1
        ];

        for (const r of candidateRows) {
            for (const c of candidateCols) {
                const span = this.getLadderSpan(c, r);
                if (!span) continue;

                const tolerance = this.tileSize * 0.9;
                if (Math.abs(x - span.centerX) > tolerance) continue;

                // Determinar continuación hacia arriba (directa o diagonal -1/+1)
                const aboveSpan = this.findAdjacentRowLadderSpan(span.centerX, r - 1);
                const belowSpan = this.findAdjacentRowLadderSpan(span.centerX, r + 1);

                let slopeX = 0;
                if (aboveSpan) {
                    const diff = aboveSpan.centerX - span.centerX;
                    slopeX = Math.abs(diff) > 2 ? Math.sign(diff) : 0;
                } else if (belowSpan) {
                    const diff = span.centerX - belowSpan.centerX;
                    slopeX = Math.abs(diff) > 2 ? Math.sign(diff) : 0;
                }

                // Trazar cima y base siguiendo la escalera (vertical o diagonal)
                let highestRow = r;
                let curX = span.centerX;
                while (highestRow > 0) {
                    const nextUp = this.findAdjacentRowLadderSpan(curX, highestRow - 1);
                    if (!nextUp) break;
                    highestRow--;
                    curX = nextUp.centerX;
                }

                let lowestRow = r;
                curX = span.centerX;
                while (lowestRow < this.rows - 1) {
                    const nextDown = this.findAdjacentRowLadderSpan(curX, lowestRow + 1);
                    if (!nextDown) break;
                    lowestRow++;
                    curX = nextDown.centerX;
                }

                const topY = this.tileTopY(highestRow);
                let bottomY = this.tileTopY(lowestRow);
                const bottomCol = Math.floor(curX / this.tileSize);
                const bottomFloorNearby =
                    this.isSolidFloor(bottomCol, lowestRow + 1) ||
                    this.isSolidFloor(bottomCol - 1, lowestRow + 1) ||
                    this.isSolidFloor(bottomCol + 1, lowestRow + 1) ||
                    lowestRow + 1 >= this.rows;
                if (bottomFloorNearby) {
                    bottomY = this.tileTopY(lowestRow + 1);
                }

                return {
                    col: Math.floor(span.centerX / this.tileSize),
                    row: r,
                    centerX: span.centerX,
                    slopeX,
                    topY,
                    bottomY,
                    hasLadderAbove: Boolean(aboveSpan) || r === feetTile.row || r === torsoTile.row,
                    hasLadderBelow: Boolean(belowSpan) || r === belowTile.row
                };
            }
        }
        return null;
    }

    /**
     * Calcula la coordenada X exacta sobre el eje de una escalera (vertical o diagonal) para una Y dada.
     */
    public getLadderCenterXAtY(feetY: number, fallbackX: number): number {
        const yProbe = Math.max(this.offsetY, Math.min(this.tileBottomY(this.rows - 1) - 1, feetY - 2));
        const r = this.worldToTile(fallbackX, yProbe).row;
        const c = this.worldToTile(fallbackX, yProbe).col;

        let span = this.getLadderSpan(c, r);
        if (!span) span = this.findAdjacentRowLadderSpan(fallbackX, r);
        if (!span) return fallbackX;

        const aboveSpan = this.findAdjacentRowLadderSpan(span.centerX, r - 1);
        const belowSpan = this.findAdjacentRowLadderSpan(span.centerX, r + 1);
        let slopeX = 0;
        if (aboveSpan && Math.abs(aboveSpan.centerX - span.centerX) > 2) {
            slopeX = Math.sign(aboveSpan.centerX - span.centerX);
        } else if (belowSpan && Math.abs(span.centerX - belowSpan.centerX) > 2) {
            slopeX = Math.sign(span.centerX - belowSpan.centerX);
        }

        if (slopeX === 0) return span.centerX;

        const rowBottom = this.tileBottomY(r);
        const t = Math.max(0, Math.min(1, (rowBottom - feetY) / this.tileSize));
        return span.centerX + (t - 0.5) * slopeX * this.tileSize;
    }

    private findAdjacentRowLadderSpan(refX: number, targetRow: number): { leftCol: number; rightCol: number; centerX: number } | null {
        if (targetRow < 0 || targetRow >= this.rows) return null;
        const refCol = Math.floor(refX / this.tileSize);
        let best: { leftCol: number; rightCol: number; centerX: number } | null = null;
        let bestDist = Infinity;

        for (let dc = -2; dc <= 2; dc++) {
            const c = refCol + dc;
            if (c < 0 || c >= this.cols) continue;
            const span = this.getLadderSpan(c, targetRow);
            if (span) {
                const dist = Math.abs(span.centerX - refX);
                if (dist <= this.tileSize * 1.6 && dist < bestDist) {
                    best = span;
                    bestDist = dist;
                }
            }
        }
        return best;
    }

    /**
     * Comprueba si una casilla es una escalera transitable en vertical.
     */
    public isLadder(col: number, row: number): boolean {
        return this.getTile(col, row) === TileType.Ladder;
    }

    /**
     * Comprueba si un bloque es arenisca excavable blanda.
     */
    public isDiggable(col: number, row: number): boolean {
        const tile = this.getTile(col, row);
        return tile === TileType.DiggableSandstone || tile === TileType.DiggableSandstoneCracked;
    }

    /**
     * Comprueba si una celda interior puede excavarse con el pico.
     * Incluye arenisca y bloques de ladrillo interiores (excluyendo muros perimetrales y celdas bajo la puerta).
     */
    public isInteriorDiggable(col: number, row: number): boolean {
        if (this.isDiggable(col, row)) {
            return true;
        }
        const isInterior = col >= 1 && col < this.cols - 1 && row >= 1 && row < this.rows - 1;
        if (!isInterior) {
            return false;
        }
        const tile = this.getTile(col, row);
        if (tile !== TileType.SolidWall) {
            return false;
        }
        const aboveTile = this.getTile(col, row - 1);
        return aboveTile !== TileType.ExitDoorClosed && aboveTile !== TileType.ExitDoorOpen;
    }

    /**
     * Excava un paso sobre el bloque objetivo.
     * Avanza de `SolidWall`/`DiggableSandstone` -> `DiggableSandstoneCracked` -> `Empty`.
     * @returns `true` si el bloque se desintegró por completo abriendo el paso, `false` si quedó agrietado.
     */
    public digBlock(col: number, row: number): boolean {
        const current = this.getTile(col, row);
        if (current === TileType.DiggableSandstone || (current === TileType.SolidWall && this.isInteriorDiggable(col, row))) {
            this.setTile(col, row, TileType.DiggableSandstoneCracked);
            return false;
        } else if (current === TileType.DiggableSandstoneCracked) {
            this.setTile(col, row, TileType.Empty);
            return true;
        }
        return false;
    }

    /**
     * Convierte coordenadas de píxeles del mundo continuo a coordenadas de columna y fila de la cuadrícula.
     */
    public worldToTile(worldX: number, worldY: number): { col: number; row: number } {
        return {
            col: Math.floor(worldX / this.tileSize),
            row: Math.floor((worldY - this.offsetY) / this.tileSize)
        };
    }

    /**
     * Convierte coordenadas de celda (col, row) al centro en píxeles de dicha celda.
     */
    public tileToWorld(col: number, row: number): { x: number; y: number } {
        return {
            x: col * this.tileSize + this.tileSize / 2,
            y: this.offsetY + row * this.tileSize + this.tileSize / 2
        };
    }

    /**
     * Obtiene la posición superior en píxeles de una fila dada (superficie sobre la que caminan las entidades).
     */
    public tileTopY(row: number): number {
        return this.offsetY + row * this.tileSize;
    }

    /**
     * Obtiene la posición inferior (pies de una entidad) de una celda dada.
     */
    public tileBottomY(row: number): number {
        return this.offsetY + (row + 1) * this.tileSize;
    }
}
