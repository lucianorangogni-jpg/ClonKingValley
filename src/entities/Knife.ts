/**
 * @file Knife.ts
 * Entidad de proyectil y objeto recogible de cuchillo arrojadizo para King's Valley.
 */

import * as Phaser from 'phaser';
import { GameConstants } from '../core/GameConstants.ts';
import { DirectionType } from '../core/Direction.ts';
import { ChamberGrid } from '../grid/ChamberGrid.ts';

export const KnifeState = {
    Flying: 'Flying',
    Dropped: 'Dropped'
} as const;

export type KnifeState = typeof KnifeState[keyof typeof KnifeState];

/**
 * Entidad de cuchillo arrojadizo (Throwing Dagger) de King's Valley.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Modela el arma principal a distancia de Vick. Al ser lanzado, viaja en línea recta horizontal
 * a gran velocidad. Si impacta una momia enemiga, la desintegra. Si choca con un muro sólido
 * o agota su alcance de vuelo, cae verticalmente al suelo por gravedad y permanece en reposo
 * como objeto coleccionable, permitiendo a Vick recuperarlo y reutilizarlo como en el clásico MSX de 1985.
 * 
 * ¿CÓMO SE USA?:
 * Se crea cuando el jugador dispara (`player.throwKnife()`) o como spawn estático en el nivel:
 * ```ts
 * const knife = new Knife(scene, x, y, DirectionType.Right, grid);
 * knife.updateKnife(delta);
 * if (knife.getState() === KnifeState.Dropped && isPlayerOverlapping) {
 *     player.addKnife();
 *     knife.destroy();
 * }
 * ```
 */
export class Knife extends Phaser.Physics.Arcade.Sprite {
    private knifeState: KnifeState;
    private direction: DirectionType;
    private distanceTraveled: number = 0;
    private grid: ChamberGrid;

    /**
     * Construye un cuchillo arrojadizo.
     * @param scene Escena de Phaser
     * @param x Coordenada X inicial
     * @param y Coordenada Y inicial
     * @param dir Dirección de lanzamiento horizontal (Left o Right)
     * @param grid Cuadrícula lógica para colisiones con muros
     * @param initialDropped Si empieza como ítem en reposo en el suelo
     */
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        dir: DirectionType,
        grid: ChamberGrid,
        initialDropped: boolean = false
    ) {
        super(scene, x, y, initialDropped ? 'item_knife_ground' : 'item_knife');

        this.grid = grid;
        this.direction = dir;
        this.knifeState = initialDropped ? KnifeState.Dropped : KnifeState.Flying;

        this.setOrigin(0.5, 0.5);
        this.setDepth(9);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        if (this.body) {
            this.body.setSize(16, 16);
            (this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        }

        if (this.knifeState === KnifeState.Flying) {
            const speed = dir === DirectionType.Right ? GameConstants.KNIFE_SPEED : -GameConstants.KNIFE_SPEED;
            this.setVelocityX(speed);
            this.setVelocityY(0);
            this.setFlipX(dir === DirectionType.Left);
        } else {
            this.setDropped();
        }
    }

    /**
     * Bucle de actualización por fotograma del vuelo o reposo del cuchillo.
     */
    public updateKnife(delta: number): void {
        if (!this.active) return;

        if (this.knifeState === KnifeState.Flying) {
            this.distanceTraveled += GameConstants.KNIFE_SPEED * (delta / 1000);

            // Comprobar colisión frontal con muro
            const checkX = this.direction === DirectionType.Right ? this.x + 8 : this.x - 8;
            const tile = this.grid.worldToTile(checkX, this.y);

            if (this.grid.isSolid(tile.col, tile.row) || this.distanceTraveled >= GameConstants.KNIFE_MAX_RANGE) {
                this.dropToFloor();
            }
        } else if (this.knifeState === KnifeState.Dropped) {
            // Aplicar gravedad hasta asentarse en una plataforma si estaba cayendo
            const feetTile = this.grid.worldToTile(this.x, this.y + 6);
            if (!this.grid.isStandable(feetTile.col, feetTile.row)) {
                this.setVelocityY(200);
            } else {
                this.setVelocity(0, 0);
            }
        }
    }

    /**
     * Pasa el cuchillo a estado de reposo en el suelo tras finalizar el vuelo.
     */
    public dropToFloor(): void {
        this.knifeState = KnifeState.Dropped;
        this.setVelocityX(0);
        this.setVelocityY(150); // Caída hacia el suelo más cercano
        this.setTexture('item_knife_ground');
        this.setFlipX(false);
    }

    /**
     * Configura el cuchillo directamente como objeto en reposo en el suelo.
     */
    private setDropped(): void {
        this.knifeState = KnifeState.Dropped;
        this.setVelocity(0, 0);
        this.setTexture('item_knife_ground');
        this.setFlipX(false);
    }

    public getState(): KnifeState {
        return this.knifeState;
    }
}
