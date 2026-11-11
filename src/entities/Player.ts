/**
 * @file Player.ts
 * Entidad protagonista Vick (el arqueólogo explorador) para King's Valley MSX.
 */

import * as Phaser from 'phaser';
import { GameConstants } from '../core/GameConstants.ts';
import { DirectionType } from '../core/Direction.ts';
import { PlayerState } from './PlayerState.ts';
import { ChamberGrid } from '../grid/ChamberGrid.ts';
import { MSXAudio } from '../audio/MSXAudio.ts';

export interface PlayerInputSnapshot {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    actionThrow: boolean;
    actionDig: boolean;
}

/**
 * Entidad controlable del arqueólogo Vick en King's Valley.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Esta clase implementa toda la física, lógica de movimiento sobre plataformas y escaleras,
 * sistema de excavación de arenisca con el pico, lanzamiento de cuchillos, gestión de vidas
 * e inventario de herramientas, garantizando una respuesta ágil fiel al clásico MSX (1985).
 * 
 * Coordenadas y Anclaje:
 * - `origin` configurado en `(0.5, 1.0)`: `this.x` es el centro horizontal y `this.y` la posición exacta de los pies.
 * Esto asegura que al estar de pie sobre una plataforma en la fila R, `this.y = R * 32`, sin holguras visuales.
 * 
 * ¿CÓMO SE USA?:
 * Se instancia en `GameScene.ts` y se actualiza en cada frame pasándole el estado de las teclas:
 * ```ts
 * const player = new Player(scene, startX, startY, grid);
 * player.updatePlayer(delta, inputState);
 * player.addPickaxe(3);
 * player.addKnife();
 * ```
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
    private playerState: PlayerState = PlayerState.Idle;
    private facing: DirectionType = DirectionType.Right;
    private lives: number = GameConstants.INITIAL_LIVES;
    private pickaxeUses: number = 0;
    private knivesCount: number = 0;
    private grid: ChamberGrid;
    private audio: MSXAudio;

    // Temporizador de excavación
    private digTimeRemaining: number = 0;
    private digTargetCol: number = -1;
    private digTargetRow: number = -1;

    // Temporizadores de animación y pasos
    private stepSoundTimer: number = 0;
    private isDead: boolean = false;

    // Estado de la tecla arriba en el fotograma anterior (detección de pulsación para el salto)
    private wasUpPressed: boolean = false;

    // Callback cuando el jugador lanza un cuchillo hacia el mundo exterior
    private onThrowKnifeCallback?: (x: number, y: number, dir: DirectionType) => void;

    /**
     * Construye al protagonista Vick.
     * @param scene Escena de Phaser
     * @param x Coordenada X inicial (en píxeles)
     * @param y Coordenada Y de los pies inicial (en píxeles)
     * @param grid Cuadrícula de colisiones lógicas
     */
    constructor(scene: Phaser.Scene, x: number, y: number, grid: ChamberGrid) {
        super(scene, x, y, 'player_idle');

        this.grid = grid;
        this.audio = MSXAudio.getInstance();

        // Configuración visual y anclaje
        this.setOrigin(0.5, 1.0);
        this.setDepth(10);

        // Registro en física arcade
        scene.add.existing(this);
        scene.physics.add.existing(this);

        if (this.body) {
            this.body.setSize(16, 28);
            this.body.setOffset(3, 4);
            (this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        }
    }

    /**
     * Registra un callback disparado cuando el jugador arroja un cuchillo.
     */
    public setOnThrowKnife(callback: (x: number, y: number, dir: DirectionType) => void): void {
        this.onThrowKnifeCallback = callback;
    }

    /**
     * Bucle de actualización principal de Vick por fotograma.
     */
    public updatePlayer(delta: number, input: PlayerInputSnapshot): void {
        // Pulsación nueva de "arriba" (flanco de subida): evita saltos automáticos al mantener la tecla
        const upJustPressed = input.up && !this.wasUpPressed;
        this.wasUpPressed = input.up;

        if (this.isDead || this.playerState === PlayerState.Dead || this.playerState === PlayerState.StageClear) {
            return;
        }

        // 1. Manejo del estado de excavación
        if (this.playerState === PlayerState.Digging) {
            this.updateDigging(delta);
            return;
        }

        // 2. Comprobar si hay una escalera (vertical o diagonal) accesible en la posición del jugador
        const ladder = this.grid.findAccessibleLadder(this.x, this.y);
        const hasLadderAbove = ladder !== null && ladder.hasLadderAbove;
        const hasLadderBelow = ladder !== null && ladder.hasLadderBelow;

        // 3. Procesar entrada o permanencia en escalera
        if (ladder !== null && (this.playerState === PlayerState.Climbing || (input.up && hasLadderAbove) || (input.down && hasLadderBelow))) {
            if (input.up && (hasLadderAbove || this.playerState === PlayerState.Climbing)) {
                this.playerState = PlayerState.Climbing;
                this.setVelocityX(0);
                this.setVelocityY(-GameConstants.PLAYER_CLIMB_SPEED);
                this.setX(this.grid.getLadderCenterXAtY(this.y, ladder.centerX));
                this.anims.play('player_climb', true);
                this.playStepSound(delta);

                if (this.y <= ladder.topY) {
                    this.setY(ladder.topY);
                    this.setX(this.grid.getLadderCenterXAtY(ladder.topY + 2, this.x));
                    this.setVelocityY(0);
                    this.playerState = PlayerState.Idle;
                    this.showStaticFrame('player_idle');
                }
                return;
            } else if (input.down && (hasLadderBelow || this.playerState === PlayerState.Climbing)) {
                this.playerState = PlayerState.Climbing;
                this.setVelocityX(0);
                this.setVelocityY(GameConstants.PLAYER_CLIMB_SPEED);
                this.setX(this.grid.getLadderCenterXAtY(this.y, ladder.centerX));
                this.anims.play('player_climb', true);
                this.playStepSound(delta);

                if (this.y >= ladder.bottomY) {
                    this.setY(ladder.bottomY);
                    this.setVelocityY(0);
                    this.playerState = PlayerState.Idle;
                    this.showStaticFrame('player_idle');
                }
                return;
            } else if (this.playerState === PlayerState.Climbing) {
                // En escalera sin pulsar arriba ni abajo
                if (input.left || input.right) {
                    const feetRow = Math.round((this.y - this.grid.offsetY) / this.grid.tileSize);
                    const curCol = this.grid.worldToTile(this.x, this.y - 4).col;
                    const targetCol = input.left ? curCol - 1 : curCol + 1;
                    const isAtPlatform = this.grid.isStandable(targetCol, feetRow) &&
                                         Math.abs(this.y - this.grid.tileTopY(feetRow)) <= 8;

                    if (isAtPlatform) {
                        this.setY(this.grid.tileTopY(feetRow));
                        this.playerState = PlayerState.Walking;
                        this.setX(this.x + (input.left ? -10 : 10));
                        this.setVelocityY(0);
                        this.setVelocityX(input.left ? -GameConstants.PLAYER_WALK_SPEED : GameConstants.PLAYER_WALK_SPEED);
                        return;
                    } else {
                        // En mitad de la escalera: permanecer seguro en ella sin caer
                        this.setVelocityX(0);
                        this.setVelocityY(0);
                        this.anims.stop();
                        return;
                    }
                } else {
                    this.setVelocityX(0);
                    this.setVelocityY(0);
                    this.anims.stop();
                    return;
                }
            }
        } else if (this.playerState === PlayerState.Climbing) {
            // Salió del rango de la escalera
            this.setVelocityY(0);
            this.playerState = PlayerState.Idle;
        }

        // 4. Comprobar si hay soporte bajo los pies
        const feetTile = this.grid.worldToTile(this.x, this.y + 2);
        const hasGround = this.grid.isStandable(feetTile.col, feetTile.row) || this.body?.blocked.down;

        // Comprobar inicio de salto arcade MSX (nueva pulsación de arriba, sin escalera ascendente y con suelo)
        if (upJustPressed && hasGround && !hasLadderAbove && this.playerState !== PlayerState.Jumping) {
            this.playerState = PlayerState.Jumping;
            this.setVelocityY(GameConstants.PLAYER_JUMP_VELOCITY);
            this.audio.playJump();
        }

        if (this.playerState === PlayerState.Jumping) {
            // Aplicar gravedad durante el salto
            let currentVy = this.body?.velocity.y ?? 0;

            // Colisión con el techo: si la cabeza toca un bloque sólido mientras sube, se corta el ascenso
            if (currentVy < 0) {
                const headTile = this.grid.worldToTile(this.x, this.y - 28);
                if (this.grid.isSolid(headTile.col, headTile.row)) {
                    currentVy = 0;
                    this.setY(this.grid.tileBottomY(headTile.row) + 28);
                }
            }

            this.setVelocityY(Math.min(currentVy + GameConstants.GRAVITY * (delta / 1000), GameConstants.MAX_FALL_SPEED));

            // Si ya alcanzó el descenso y toca suelo, aterriza
            if (currentVy > 0 && hasGround) {
                this.playerState = PlayerState.Idle;
                this.setVelocityY(0);
                this.snapToGround(feetTile.row);
            }
        } else if (!hasGround) {
            // Caída libre por gravedad
            this.playerState = PlayerState.Falling;
            this.setVelocityY(Math.min((this.body?.velocity.y ?? 0) + GameConstants.GRAVITY * (delta / 1000), GameConstants.MAX_FALL_SPEED));
        } else {
            // En suelo sólido
            if (this.playerState === PlayerState.Falling) {
                this.playerState = PlayerState.Idle;
                this.setVelocityY(0);
                this.snapToGround(feetTile.row);
            }
        }

        // Límite de seguridad: nunca caer por debajo de la zona inferior de la pirámide
        const maxBottomY = this.grid.tileBottomY(this.grid.rows - 1);
        if (this.y >= maxBottomY) {
            this.setY(maxBottomY);
            if ((this.body?.velocity.y ?? 0) > 0) {
                this.setVelocityY(0);
            }
            if (this.playerState === PlayerState.Falling || this.playerState === PlayerState.Jumping) {
                this.playerState = PlayerState.Idle;
                this.showStaticFrame('player_idle');
            }
        }

        // 5. Comprobar acción de excavar con pico (botón pico dedicado, o Espacio/Z si no hay cuchillos)
        const wantsPickaxe = input.actionDig || (input.actionThrow && this.knivesCount === 0);
        if (wantsPickaxe && this.pickaxeUses > 0 && hasGround) {
            const digDir = input.down ? DirectionType.Down : this.facing;
            if (this.tryStartDigging(digDir)) {
                return;
            }
        }

        // 6. Comprobar acción de lanzar cuchillo
        if (input.actionThrow && this.knivesCount > 0) {
            this.throwKnife();
            return;
        }

        // 7. Movimiento horizontal
        const walkSpeed = GameConstants.PLAYER_WALK_SPEED;
        if (input.left) {
            this.facing = DirectionType.Left;
            this.setFlipX(true);
            this.setVelocityX(-walkSpeed);

            // Comprobar colisión frontal con muro
            const leftCol = this.grid.worldToTile(this.x - 12, this.y - 16).col;
            const myRow = this.grid.worldToTile(this.x, this.y - 16).row;
            if (this.grid.isSolid(leftCol, myRow)) {
                this.setVelocityX(0);
            } else {
                if (this.playerState !== PlayerState.Jumping) {
                    this.playerState = PlayerState.Walking;
                    this.anims.play('player_walk', true);
                    this.playStepSound(delta);
                }
            }
        } else if (input.right) {
            this.facing = DirectionType.Right;
            this.setFlipX(false);
            this.setVelocityX(walkSpeed);

            // Comprobar colisión frontal con muro
            const rightCol = this.grid.worldToTile(this.x + 12, this.y - 16).col;
            const myRow = this.grid.worldToTile(this.x, this.y - 16).row;
            if (this.grid.isSolid(rightCol, myRow)) {
                this.setVelocityX(0);
            } else {
                if (this.playerState !== PlayerState.Jumping) {
                    this.playerState = PlayerState.Walking;
                    this.anims.play('player_walk', true);
                    this.playStepSound(delta);
                }
            }
        } else {
            // En reposo
            this.setVelocityX(0);
            if (this.playerState !== PlayerState.Falling && this.playerState !== PlayerState.Jumping) {
                this.playerState = PlayerState.Idle;
                this.showStaticFrame('player_idle');
            }
        }
    }

    /**
     * Intenta iniciar la excavación de un bloque adyacente o del suelo.
     */
    private tryStartDigging(dir: DirectionType): boolean {
        const myTile = this.grid.worldToTile(this.x, this.y - 8);
        const sign = this.facing === DirectionType.Left ? -1 : 1;
        const candidates: Array<{ col: number; row: number }> = dir === DirectionType.Down
            ? [
                { col: myTile.col, row: myTile.row + 1 },
                { col: myTile.col + sign, row: myTile.row + 1 }
            ]
            : [
                { col: myTile.col + (dir === DirectionType.Left ? -1 : 1), row: myTile.row },
                { col: myTile.col + (dir === DirectionType.Left ? -1 : 1), row: myTile.row + 1 },
                { col: myTile.col + (dir === DirectionType.Left ? -1 : 1), row: myTile.row - 1 },
                { col: myTile.col, row: myTile.row + 1 }
            ];

        for (const candidate of candidates) {
            if (this.grid.isInteriorDiggable(candidate.col, candidate.row)) {
                this.playerState = PlayerState.Digging;
                this.digTimeRemaining = GameConstants.DIG_DURATION_MS;
                this.digTargetCol = candidate.col;
                this.digTargetRow = candidate.row;
                this.setVelocityX(0);
                this.setVelocityY(0);
                this.showStaticFrame('player_dig');
                this.setScale(1.08, 0.94);
                this.audio.playDig();
                return true;
            }
        }
        return false;
    }

    /**
     * Actualiza el progreso de excavación mientras el temporizador desciende.
     */
    private updateDigging(delta: number): void {
        this.digTimeRemaining -= delta;
        if (this.digTimeRemaining <= 0) {
            // Completar excavación
            const brokeCompletely = this.grid.digBlock(this.digTargetCol, this.digTargetRow);
            this.audio.playDig();
            if (brokeCompletely) {
                this.pickaxeUses--;
            }
            this.setScale(1, 1);
            this.playerState = PlayerState.Idle;
            this.showStaticFrame('player_idle');
        }
    }

    /**
     * Lanza un cuchillo arrojadizo horizontalmente si se cuenta con inventario.
     */
    public throwKnife(): void {
        if (this.knivesCount <= 0) return;
        this.knivesCount--;
        this.audio.playKnifeThrow();

        const spawnY = this.y - 16;
        const spawnX = this.facing === DirectionType.Right ? this.x + 16 : this.x - 16;

        if (this.onThrowKnifeCallback) {
            this.onThrowKnifeCallback(spawnX, spawnY, this.facing);
        }
    }

    /**
     * Reproduce el sonido de pasos al caminar a intervalos regulares.
     */
    private playStepSound(delta: number): void {
        this.stepSoundTimer += delta;
        if (this.stepSoundTimer >= 260) {
            this.stepSoundTimer = 0;
            this.audio.playStep();
        }
    }

    /**
     * Muestra un fotograma estático deteniendo antes cualquier animación en curso.
     * Sin el `anims.stop()`, la animación de caminar/escalar seguiría sobrescribiendo la textura.
     */
    private showStaticFrame(textureKey: string): void {
        if (this.anims.isPlaying) {
            this.anims.stop();
        }
        if (this.texture.key !== textureKey) {
            this.setTexture(textureKey);
        }
    }

    /**
     * Ajusta la coordenada Y para asentar a Vick exactamente sobre la plataforma.
     */
    private snapToGround(groundRow: number): void {
        this.setY(this.grid.tileTopY(groundRow));
    }

    /**
     * Comprueba si el jugador está actualmente muerto o en estado de invulnerabilidad.
     */
    public isInvulnerableOrDead(): boolean {
        return this.isDead || this.playerState === PlayerState.Dead;
    }

    /**
     * Recibe daño letal por impacto de momia o trampa.
     * Descuenta una vida y reinicia la posición.
     */
    public takeDamage(respawnCol: number, respawnRow: number): boolean {
        if (this.isDead || this.playerState === PlayerState.Dead) {
            return this.lives > 0;
        }

        this.lives--;
        this.isDead = true;
        this.playerState = PlayerState.Dead;
        this.setVelocity(0, 0);
        this.audio.playDeath();

        // Reposicionar de inmediato en el punto de spawn seguro (asentado en la plataforma)
        this.setX(respawnCol * this.grid.tileSize + this.grid.tileSize / 2);
        this.setY(this.grid.tileBottomY(respawnRow));

        // Efecto visual de parpadeo de invulnerabilidad
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.alpha = 1;
                if (this.lives > 0) {
                    this.isDead = false;
                    this.playerState = PlayerState.Idle;
                }
            }
        });

        return this.lives > 0;
    }

    // Métodos de acceso al inventario y estado
    public getLives(): number { return this.lives; }
    public setLives(lives: number): void { this.lives = lives; }
    public getPickaxeUses(): number { return this.pickaxeUses; }
    public addPickaxe(uses: number = GameConstants.PICKAXE_DEFAULT_USES): void {
        this.pickaxeUses += uses;
        this.audio.playItemPickup();
    }
    public getKnivesCount(): number { return this.knivesCount; }
    public addKnife(amount: number = 1): void {
        this.knivesCount += amount;
        this.audio.playItemPickup();
    }
    public getPlayerState(): PlayerState { return this.playerState; }
    public setPlayerState(state: PlayerState): this {
        this.playerState = state;
        return this;
    }
    public getFacing(): DirectionType { return this.facing; }
}
