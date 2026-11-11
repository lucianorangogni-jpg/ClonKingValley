/**
 * @file Mummy.ts
 * Entidad de momia enemiga con navegación en cuadrícula y persecución IA para King's Valley.
 */

import * as Phaser from 'phaser';
import { MummyType } from './MummyType.ts';
import { GameConstants } from '../core/GameConstants.ts';
import { DirectionType } from '../core/Direction.ts';
import { ChamberGrid } from '../grid/ChamberGrid.ts';
import { MSXAudio } from '../audio/MSXAudio.ts';

/**
 * Entidad de momia enemiga con inteligencia artificial para patrullar y perseguir a Vick.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Modela el principal enemigo de King's Valley (1985). Patrulla las plataformas de la pirámide,
 * detecta bordes y muros sólidos para girar, detecta escaleras para ascender o descender hacia
 * el piso en el que se encuentra Vick, y representa una amenaza letal si entra en contacto con el explorador.
 * Además gestiona su vulnerabilidad frente a los cuchillos arrojadizos.
 * 
 * ¿CÓMO SE USA?:
 * Se instancia en `GameScene.ts` en base a los puntos de spawn definidos en `ChamberLevels`:
 * ```ts
 * const mummy = new Mummy(scene, x, y, MummyType.White, grid);
 * mummy.updateMummy(delta, playerX, playerY);
 * if (mummy.checkKnifeHit(knifeX, knifeY)) {
 *     // Momia derrotada
 * }
 * ```
 */
export class Mummy extends Phaser.Physics.Arcade.Sprite {
    public readonly mummyType: MummyType;
    private grid: ChamberGrid;
    private audio: MSXAudio;
    private facing: DirectionType = DirectionType.Left;
    private isClimbing: boolean = false;
    private isEliminated: boolean = false;
    private speed: number;
    private decisionTimer: number = 0;

    /**
     * Construye una momia enemiga.
     * @param scene Escena de Phaser
     * @param x Coordenada X inicial
     * @param y Coordenada Y de los pies inicial
     * @param type Tipo de momia (Blanca o Roja)
     * @param grid Cuadrícula lógica de la cámara
     */
    constructor(scene: Phaser.Scene, x: number, y: number, type: MummyType, grid: ChamberGrid) {
        const textureKey =
            type === MummyType.Red ? 'mummy_red_0' :
            type === MummyType.Yellow ? 'mummy_yellow_0' : 'mummy_white_0';
        super(scene, x, y, textureKey);

        this.mummyType = type;
        this.grid = grid;
        this.audio = MSXAudio.getInstance();
        this.speed =
            type === MummyType.Red ? GameConstants.RED_MUMMY_SPEED :
            type === MummyType.Yellow ? GameConstants.YELLOW_MUMMY_SPEED : GameConstants.WHITE_MUMMY_SPEED;

        this.setOrigin(0.5, 1.0);
        this.setDepth(8);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        if (this.body) {
            this.body.setSize(16, 28);
            this.body.setOffset(3, 4);
            (this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        }

        const animKey =
            type === MummyType.Red ? 'mummy_red_walk' :
            type === MummyType.Yellow ? 'mummy_yellow_walk' : 'mummy_white_walk';
        this.anims.play(animKey, true);
    }

    /**
     * Bucle de actualización por fotograma de la IA de la momia.
     * @param delta Tiempo transcurrido en ms
     * @param playerX Posición X del jugador
     * @param playerY Posición Y de los pies del jugador
     */
    public updateMummy(delta: number, playerX: number, playerY: number): void {
        if (this.isEliminated || !this.active) return;

        this.decisionTimer += delta;

        // 1. Detección de escalera (vertical o diagonal) actual
        const ladder = this.grid.findAccessibleLadder(this.x, this.y);
        const isOnLadder = ladder !== null;

        // 2. Si está escalando, seguir la trayectoria diagonal/vertical hasta alcanzar el extremo
        if (this.isClimbing) {
            if (!ladder) {
                this.isClimbing = false;
                this.setVelocityY(0);
                this.snapToNearestPlatform();
            } else {
                this.setX(this.grid.getLadderCenterXAtY(this.y, ladder.centerX));
                const vy = this.body?.velocity.y ?? 0;
                if (vy < 0 && this.y <= ladder.topY) {
                    this.setY(ladder.topY);
                    this.setVelocityY(0);
                    this.isClimbing = false;
                    this.facing = playerX > this.x ? DirectionType.Right : DirectionType.Left;
                } else if (vy > 0 && this.y >= ladder.bottomY) {
                    this.setY(ladder.bottomY);
                    this.setVelocityY(0);
                    this.isClimbing = false;
                    this.facing = playerX > this.x ? DirectionType.Right : DirectionType.Left;
                }
                return;
            }
        }

        // Evaluar si decide entrar a la escalera hacia Vick
        if (isOnLadder && this.decisionTimer >= 350) {
            this.decisionTimer = 0;
            const diffY = playerY - this.y;
            const wantUp = diffY < -20 && ladder.hasLadderAbove;
            const wantDown = diffY > 20 && ladder.hasLadderBelow;
            const chance = this.mummyType === MummyType.Red ? 0.75 : 0.45;

            if ((wantUp || wantDown) && Math.random() < chance) {
                this.isClimbing = true;
                this.setX(this.grid.getLadderCenterXAtY(this.y, ladder.centerX));
                const climbSpeed = GameConstants.MUMMY_CLIMB_SPEED;
                this.setVelocityY(wantDown ? climbSpeed : -climbSpeed);
                this.setVelocityX(0);
                return;
            }
        }

        // Control de gravedad: si no tiene suelo sólido, DEBE caer verticalmente (nunca caminar por el aire)
        const feetTile = this.grid.worldToTile(this.x, this.y + 2);
        const hasGround = this.grid.isStandable(feetTile.col, feetTile.row) || this.body?.blocked.down;

        if (!hasGround) {
            this.setVelocityX(0);
            this.setVelocityY(Math.min((this.body?.velocity.y ?? 0) + GameConstants.GRAVITY * (delta / 1000), GameConstants.MAX_FALL_SPEED));
            return;
        } else {
            if ((this.body?.velocity.y ?? 0) > 0) {
                this.setVelocityY(0);
                this.setY(this.grid.tileTopY(feetTile.row));
            }
        }

        // Límite de seguridad de la base de la pirámide
        const maxBottomY = this.grid.tileBottomY(this.grid.rows - 1);
        if (this.y >= maxBottomY) {
            this.setY(maxBottomY);
            if ((this.body?.velocity.y ?? 0) > 0) {
                this.setVelocityY(0);
            }
        }

        // 3. Patrulla horizontal y evasión de obstáculos
        const vx = this.facing === DirectionType.Right ? this.speed : -this.speed;
        this.setVelocityX(vx);
        this.setFlipX(this.facing === DirectionType.Left);

        // Comprobar colisión frontal con muro
        const checkX = this.facing === DirectionType.Right ? this.x + 11 : this.x - 11;
        const frontTile = this.grid.worldToTile(checkX, this.y - 12);
        if (this.grid.isSolid(frontTile.col, frontTile.row)) {
            this.turnAround();
            return;
        }

        // Comprobar si hay suelo por delante para no caer al vacío inadvertidamente
        const floorTile = this.grid.worldToTile(checkX, this.y + 4);
        if (!this.grid.isStandable(floorTile.col, floorTile.row) && !this.grid.isLadder(floorTile.col, floorTile.row)) {
            if (this.mummyType !== MummyType.Red || playerY <= this.y) {
                this.turnAround();
                return;
            }
        }
    }

    /**
     * Da la vuelta a la orientación de patrulla de la momia.
     */
    public turnAround(): void {
        this.facing = this.facing === DirectionType.Right ? DirectionType.Left : DirectionType.Right;
    }

    /**
     * Aplica la derrota de la momia por impacto de cuchillo arrojadizo.
     */
    public defeat(): void {
        if (this.isEliminated) return;
        this.isEliminated = true;
        this.setVelocity(0, 0);
        this.audio.playMummyDefeated();

        // Efecto visual de desintegración
        this.scene.tweens.add({
            targets: this,
            scaleY: 0.1,
            alpha: 0,
            duration: 250,
            onComplete: () => {
                this.destroy();
            }
        });
    }

    /**
     * Asienta los pies de la momia en la plataforma.
     */
    private snapToNearestPlatform(): void {
        const tile = this.grid.worldToTile(this.x, this.y);
        this.setY(this.grid.tileTopY(tile.row));
    }

    public isAlive(): boolean {
        return !this.isEliminated && this.active;
    }
}
