/**
 * @file MovingFloorTrap.ts
 * Entidad de piso movedizo / cinta transportadora de piedra para King's Valley.
 */

import * as Phaser from 'phaser';
import { GameConstants } from '../core/GameConstants.ts';
import { Direction, DirectionType } from '../core/Direction.ts';
import { ChamberGrid } from '../grid/ChamberGrid.ts';
import { Player } from './Player.ts';
import { Mummy } from './Mummy.ts';
import { TileType } from '../grid/TileType.ts';
import { MSXAudio } from '../audio/MSXAudio.ts';

/**
 * Trampa de piso movedizo / plataforma deslizante de la pirámide.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Modela las cintas transportadoras y suelos mecánicos deslizantes de las cámaras de King's Valley.
 * Desplaza continuamente o por impulsos periódicos a las entidades que se posan sobre su superficie
 * (tanto al protagonista Vick como a las momias), arrastrándolos hacia la izquierda o derecha.
 * Permite diseñar puzles donde el jugador debe luchar contra la corriente para alcanzar gemas
 * o aprovechar el impulso para esquivar momias, pudiendo arrojar a los enemigos a pozos inferiores.
 * 
 * ¿CÓMO SE USA?:
 * Se instancia en `GameScene.ts` en base a la configuración de la cámara en `ChamberLevels`:
 * ```ts
 * const trap = new MovingFloorTrap(scene, col, row, length, DirectionType.Left, grid);
 * // En el bucle de actualización:
 * trap.updateTrap(delta, player, mummies);
 * ```
 */
export class MovingFloorTrap {
    private scene: Phaser.Scene;
    private grid: ChamberGrid;
    private audio: MSXAudio;

    public readonly col: number;
    public readonly row: number;
    public readonly length: number;
    public readonly direction: DirectionType;
    public readonly speed: number;

    private sprites: Phaser.GameObjects.Sprite[] = [];
    private isActive: boolean = true;
    private soundTimer: number = 0;

    /**
     * Construye un piso movedizo de longitud determinada.
     * @param scene Escena de Phaser
     * @param col Columna inicial izquierda
     * @param row Fila de la plataforma
     * @param length Número de casillas de longitud horizontal
     * @param direction Dirección de arrastre (Left o Right)
     * @param grid Cuadrícula lógica
     * @param speed Velocidad de desplazamiento en píxeles por segundo (por defecto 75)
     */
    constructor(
        scene: Phaser.Scene,
        col: number,
        row: number,
        length: number,
        direction: DirectionType | 'left' | 'right',
        grid: ChamberGrid,
        speed: number = 75
    ) {
        this.scene = scene;
        this.grid = grid;
        this.audio = MSXAudio.getInstance();

        this.col = col;
        this.row = row;
        this.length = length;
        this.direction = (direction === 'left' || direction === DirectionType.Left) ? DirectionType.Left : DirectionType.Right;
        this.speed = speed;

        this.initVisualsAndGrid();
    }

    /**
     * Inicializa los sprites animados y marca las celdas en la cuadrícula como transitables.
     */
    private initVisualsAndGrid(): void {
        const size = this.grid.tileSize;
        const animKey = this.direction === DirectionType.Left ? 'anim_moving_floor_left' : 'anim_moving_floor_right';

        for (let i = 0; i < this.length; i++) {
            const currentCol = this.col + i;
            const pos = this.grid.tileToWorld(currentCol, this.row);

            // Marcar en la cuadrícula lógica como suelo sólido transitables
            this.grid.setTile(currentCol, this.row, TileType.MovingFloor);

            const sprite = this.scene.add.sprite(pos.x, pos.y, 'tile_moving_floor_0');
            sprite.setDepth(2);
            sprite.anims.play(animKey, true);
            this.sprites.push(sprite);
        }
    }

    /**
     * Calcula el desplazamiento horizontal para un delta dado en milisegundos.
     * @param delta Tiempo en milisegundos
     */
    public computeDisplacement(delta: number): number {
        const sign = this.direction === DirectionType.Right ? 1 : -1;
        return sign * this.speed * (delta / 1000);
    }

    /**
     * Devuelve los límites del área activa del piso movedizo.
     */
    public getBounds(): { left: number; right: number; surfaceY: number } {
        const size = this.grid.tileSize;
        return {
            left: this.col * size - 4,
            right: (this.col + this.length) * size + 4,
            surfaceY: this.grid.tileTopY(this.row)
        };
    }

    /**
     * Actualiza el desplazamiento de entidades en cada fotograma.
     * @param delta Tiempo transcurrido en ms
     * @param player Referencia a Vick
     * @param mummies Lista de momias activas
     */
    public updateTrap(delta: number, player: Player, mummies: Mummy[]): void {
        if (!this.isActive) return;

        const bounds = this.getBounds();
        const surfaceY = bounds.surfaceY;
        const leftBound = bounds.left;
        const rightBound = bounds.right;

        const displacement = this.computeDisplacement(delta);

        // 1. Comprobar si el jugador está sobre el piso movedizo
        // Se considera sobre el piso si los pies están cerca de surfaceY y dentro del rango horizontal
        const isPlayerOnSurface = Math.abs(player.y - surfaceY) <= 6 &&
                                  player.x >= leftBound &&
                                  player.x <= rightBound;

        if (isPlayerOnSurface && player.getPlayerState() !== 'Climbing') {
            const newX = player.x + displacement;
            const checkCol = this.grid.worldToTile(displacement > 0 ? newX + 10 : newX - 10, surfaceY - 8).col;
            if (!this.grid.isSolid(checkCol, this.row - 1)) {
                player.setX(newX);
            }

            // Sonido mecánico periódico de arrastre
            this.soundTimer += delta;
            if (this.soundTimer >= 500) {
                this.soundTimer = 0;
                this.audio.playStep();
            }
        }

        // 2. Comprobar si alguna momia está sobre el piso movedizo
        for (const mummy of mummies) {
            if (!mummy.isAlive()) continue;

            const isMummyOnSurface = Math.abs(mummy.y - surfaceY) <= 6 &&
                                     mummy.x >= leftBound &&
                                     mummy.x <= rightBound;

            if (isMummyOnSurface) {
                const newMummyX = mummy.x + displacement;
                const checkMummyCol = this.grid.worldToTile(displacement > 0 ? newMummyX + 10 : newMummyX - 10, surfaceY - 8).col;
                if (!this.grid.isSolid(checkMummyCol, this.row - 1)) {
                    mummy.setX(newMummyX);
                }
            }
        }
    }

    /**
     * Limpia los sprites al destruir o reiniciar la escena.
     */
    public destroy(): void {
        for (const s of this.sprites) {
            s.destroy();
        }
        this.sprites = [];
    }
}
