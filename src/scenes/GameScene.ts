/**
 * @file GameScene.ts
 * Escena principal de gameplay de plataformas, puzles y combate para King's Valley.
 */

import * as Phaser from 'phaser';
import { GameConstants } from '../core/GameConstants.ts';
import { DirectionType } from '../core/Direction.ts';
import { TileType } from '../grid/TileType.ts';
import { ChamberGrid } from '../grid/ChamberGrid.ts';
import { ChamberLevels, type ChamberData } from '../grid/ChamberLevels.ts';
import { Player } from '../entities/Player.ts';
import { PlayerState } from '../entities/PlayerState.ts';
import { Mummy } from '../entities/Mummy.ts';
import { MummyType } from '../entities/MummyType.ts';
import { Knife, KnifeState } from '../entities/Knife.ts';
import { Pickaxe } from '../entities/Pickaxe.ts';
import { Gem } from '../entities/Gem.ts';
import { ExitDoor } from '../entities/ExitDoor.ts';
import { MovingFloorTrap } from '../entities/MovingFloorTrap.ts';
import { HUD } from '../graphics/HUD.ts';
import { InputManager } from '../input/InputManager.ts';
import { MSXAudio } from '../audio/MSXAudio.ts';
import { MSXPalette } from '../graphics/MSXPalette.ts';

export interface GameSceneInitData {
    stage?: number;
    score?: number;
    lives?: number;
    hiScore?: number;
}

/**
 * Escena principal de simulación y renderizado del juego King's Valley.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Esta clase orquesta el bucle completo del gameplay:
 * - Carga el diseño de la cámara de la pirámide (`ChamberLevels`) y genera los sprites de la cuadrícula.
 * - Gestiona a Vick (`Player`), las momias patrulleras (`Mummy`), los cuchillos arrojadizos (`Knife`),
 *   los picos recolectables (`Pickaxe`), las gemas sagradas (`Gem`) y la puerta de escape (`ExitDoor`).
 * - Evalúa las colisiones e interacciones: recolección de tesoros, excavación de bloques con polvo de arenisca,
 *   combate a distancia contra momias, daño al jugador y condición de victoria para avanzar de fase.
 * - Mantiene el HUD actualizado y sincronizado con la banda sonora y efectos chiptune de `MSXAudio`.
 * 
 * ¿CÓMO SE USA?:
 * Es iniciada desde `TitleScene` o por cambio de nivel:
 * ```ts
 * this.scene.start('GameScene', { stage: 1, score: 0, lives: 3 });
 * ```
 */
export class GameScene extends Phaser.Scene {
    private stage: number = 1;
    private score: number = 0;
    private hiScore: number = 5000;
    private lives: number = GameConstants.INITIAL_LIVES;
    private chamberData!: ChamberData;
    private grid!: ChamberGrid;
    private player!: Player;
    private exitDoor!: ExitDoor;
    private hud!: HUD;
    private inputManager!: InputManager;
    private audio!: MSXAudio;

    // Colecciones de entidades en escena
    private mummies: Mummy[] = [];
    private gems: Gem[] = [];
    private pickaxes: Pickaxe[] = [];
    private knives: Knife[] = [];
    private movingFloors: MovingFloorTrap[] = [];
    private tileSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();

    private remainingGems: number = 0;
    private isStageTransitioning: boolean = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    public init(data: GameSceneInitData): void {
        this.stage = data.stage ?? 1;
        this.score = data.score ?? 0;
        this.lives = data.lives ?? GameConstants.INITIAL_LIVES;

        const savedHi = typeof localStorage !== 'undefined' ? localStorage.getItem('kings_valley_hi_score') : null;
        const storedHi = savedHi ? parseInt(savedHi, 10) : 5000;
        this.hiScore = Math.max(storedHi, data.hiScore ?? 5000, this.score);

        this.isStageTransitioning = false;
        this.mummies = [];
        this.gems = [];
        this.pickaxes = [];
        this.knives = [];
        this.movingFloors = [];
        this.tileSprites.clear();
    }

    public create(): void {
        this.audio = MSXAudio.getInstance();
        this.audio.startMusic();

        this.cameras.main.setBackgroundColor(MSXPalette.BLACK);
        this.physics.world.setBounds(
            0,
            GameConstants.HUD_HEIGHT,
            GameConstants.GAME_WIDTH,
            GameConstants.GAME_HEIGHT - GameConstants.HUD_HEIGHT
        );

        // 0. Fondo oscuro de pirámide con jeroglíficos de referencia
        this.add.image(0, GameConstants.HUD_HEIGHT, 'bg_chamber').setOrigin(0, 0).setDepth(0);

        // 1. Cargar datos del nivel
        this.chamberData = ChamberLevels.getLevel(this.stage);

        // 2. Inicializar cuadrícula lógica alineada bajo el HUD
        this.grid = new ChamberGrid(
            GameConstants.GRID_COLS,
            GameConstants.GRID_ROWS,
            GameConstants.TILE_SIZE,
            GameConstants.HUD_HEIGHT
        );
        this.grid.loadLayout(this.chamberData.layout);

        // Observador para actualizar sprites cuando un bloque es excavado
        this.grid.setTileChangedListener((col, row, newType) => {
            this.handleTileChanged(col, row, newType);
        });

        // 3. Renderizar tiles visuales en la escena
        this.renderChamberTiles();

        // 4. Instanciar puerta de salida
        const doorWorld = this.grid.tileToWorld(this.chamberData.exitDoor.col, this.chamberData.exitDoor.row);
        this.exitDoor = new ExitDoor(this, doorWorld.x, doorWorld.y);

        // 5. Instanciar gemas sagradas
        this.remainingGems = this.chamberData.gems.length;
        for (const gemSpawn of this.chamberData.gems) {
            const pos = this.grid.tileToWorld(gemSpawn.col, gemSpawn.row);
            const gem = new Gem(this, pos.x, pos.y, gemSpawn.color ?? 'pink');
            this.gems.push(gem);
        }

        // 6. Instanciar picos en la cámara
        for (const pickSpawn of this.chamberData.pickaxes) {
            const pos = this.grid.tileToWorld(pickSpawn.col, pickSpawn.row);
            const pickaxe = new Pickaxe(this, pos.x, pos.y);
            this.pickaxes.push(pickaxe);
        }

        // 7. Instanciar cuchillos iniciales recogibles en el suelo
        for (const knifeSpawn of this.chamberData.knives) {
            const pos = this.grid.tileToWorld(knifeSpawn.col, knifeSpawn.row);
            const knife = new Knife(this, pos.x, pos.y, DirectionType.Right, this.grid, true);
            this.knives.push(knife);
        }

        // 8. Instanciar al protagonista Vick
        const pSpawn = this.chamberData.playerSpawn;
        const playerX = pSpawn.col * this.grid.tileSize + this.grid.tileSize / 2;
        const playerY = this.grid.tileBottomY(pSpawn.row);
        this.player = new Player(this, playerX, playerY, this.grid);
        this.player.setLives(this.lives);

        // Registrar acción de lanzamiento de cuchillo desde el jugador
        this.player.setOnThrowKnife((x, y, dir) => {
            const thrownKnife = new Knife(this, x, y, dir, this.grid, false);
            this.knives.push(thrownKnife);
        });

        // 9. Instanciar momias enemigas
        for (const mSpawn of this.chamberData.mummies) {
            const mX = mSpawn.col * this.grid.tileSize + this.grid.tileSize / 2;
            const mY = this.grid.tileBottomY(mSpawn.row);
            const mType =
                mSpawn.type === 'red' ? MummyType.Red :
                mSpawn.type === 'yellow' ? MummyType.Yellow : MummyType.White;
            const mummy = new Mummy(this, mX, mY, mType, this.grid);
            this.mummies.push(mummy);
        }

        // 9b. Instanciar pisos movedizos mecánicos
        for (const mf of this.chamberData.movingFloors ?? []) {
            const trap = new MovingFloorTrap(this, mf.col, mf.row, mf.length, mf.direction, this.grid, mf.speed ?? 75);
            this.movingFloors.push(trap);
        }

        // 10. Inicializar gestor de entrada y HUD
        this.inputManager = new InputManager(this);
        this.hud = new HUD(this);
        this.updateHUDDisplay();
    }

    public update(time: number, delta: number): void {
        if (this.isStageTransitioning) return;

        // Comprobar reinicio manual con tecla R
        if (this.inputManager.isRestartRequested()) {
            this.scene.restart({ stage: this.stage, score: this.score, lives: this.player.getLives() });
            return;
        }

        // Comprobar silenciar audio con tecla M
        if (this.inputManager.isMuteRequested()) {
            this.audio.toggleMute();
        }

        // 1. Actualizar entrada del jugador
        const input = this.inputManager.pollInput();
        this.player.updatePlayer(delta, input);

        // 1b. Actualizar pisos movedizos (arrastre continuo a jugador y momias)
        for (const trap of this.movingFloors) {
            trap.updateTrap(delta, this.player, this.mummies);
        }

        // 2. Actualizar momias
        for (let i = this.mummies.length - 1; i >= 0; i--) {
            const mummy = this.mummies[i];
            if (!mummy.active) {
                this.mummies.splice(i, 1);
                continue;
            }
            mummy.updateMummy(delta, this.player.x, this.player.y);

            // Colisión con el jugador (daño letal)
            if (this.checkOverlap(this.player, mummy)) {
                this.handlePlayerHit();
            }
        }

        // 3. Actualizar cuchillos y comprobar impactos
        for (let i = this.knives.length - 1; i >= 0; i--) {
            const knife = this.knives[i];
            if (!knife.active) {
                this.knives.splice(i, 1);
                continue;
            }
            knife.updateKnife(delta);

            if (knife.getState() === KnifeState.Flying) {
                // Comprobar si impacta con alguna momia
                for (const mummy of this.mummies) {
                    if (mummy.isAlive() && this.checkOverlap(knife, mummy)) {
                        mummy.defeat();
                        this.score += GameConstants.SCORE_MUMMY;
                        this.spawnSparks(mummy.x, mummy.y - 12);
                        knife.dropToFloor();
                        break;
                    }
                }
            } else if (knife.getState() === KnifeState.Dropped) {
                // Recogida de cuchillo del suelo por el jugador
                if (this.checkOverlap(this.player, knife)) {
                    this.player.addKnife();
                    knife.destroy();
                    this.knives.splice(i, 1);
                }
            }
        }

        // 4. Comprobar recolección de picos
        for (let i = this.pickaxes.length - 1; i >= 0; i--) {
            const pick = this.pickaxes[i];
            if (pick.active && this.checkOverlap(this.player, pick)) {
                this.player.addPickaxe(pick.getUses());
                pick.collect();
                this.pickaxes.splice(i, 1);
            }
        }

        // 5. Comprobar recolección de gemas sagradas
        for (let i = this.gems.length - 1; i >= 0; i--) {
            const gem = this.gems[i];
            if (gem.active && this.checkOverlap(this.player, gem)) {
                this.score += GameConstants.SCORE_GEM;
                this.remainingGems--;
                this.audio.playGemPickup();
                this.spawnSparks(gem.x, gem.y);
                gem.collect();
                this.gems.splice(i, 1);

                // Si se recogieron todas las gemas, abrir la puerta de salida
                if (this.remainingGems <= 0) {
                    this.exitDoor.unlock();
                    this.grid.setTile(this.chamberData.exitDoor.col, this.chamberData.exitDoor.row, TileType.ExitDoorOpen);
                }
            }
        }

        // 6. Comprobar llegada a la puerta de salida
        if (this.exitDoor.isOpen() && this.checkOverlap(this.player, this.exitDoor)) {
            this.handleStageClear();
        }

        // 7. Refrescar HUD
        this.updateHUDDisplay();
    }

    /**
     * Dibuja los tiles iniciales de la cuadrícula en base a la matriz del nivel.
     */
    private renderChamberTiles(): void {
        const size = this.grid.tileSize;
        for (let r = 0; r < this.grid.rows; r++) {
            for (let c = 0; c < this.grid.cols; c++) {
                const tile = this.grid.getTile(c, r);
                this.createTileSprite(c, r, tile, size);
            }
        }
    }

    /**
     * Crea un sprite visual para un tile específico y lo almacena en el mapa de tiles.
     */
    private createTileSprite(c: number, r: number, tile: TileType, _size: number): void {
        const key = `${c},${r}`;
        let texture = '';

        if (tile === TileType.SolidWall) texture = 'tile_solid';
        else if (tile === TileType.DiggableSandstone) texture = 'tile_diggable';
        else if (tile === TileType.DiggableSandstoneCracked) texture = 'tile_diggable_cracked';
        else if (tile === TileType.Ladder) texture = this.resolveLadderTexture(c, r);

        if (texture) {
            const pos = this.grid.tileToWorld(c, r);
            const sprite = this.add.sprite(pos.x, pos.y, texture);
            sprite.setDepth(1);
            this.tileSprites.set(key, sprite);
        }
    }

    /**
     * Determina la textura exacta de escalera (vertical, remate en plataforma o tramo diagonal blanco/marrón).
     */
    private resolveLadderTexture(c: number, r: number): string {
        const span = this.grid.getLadderSpan(c, r);
        if (!span || span.leftCol === span.rightCol) {
            return 'tile_ladder';
        }

        const isLeftCell = c === span.leftCol;
        const hasUpLeft = this.grid.isLadder(span.leftCol - 1, r - 1) && this.grid.isLadder(span.leftCol, r - 1);
        const hasUpRight = this.grid.isLadder(span.leftCol + 1, r - 1) && this.grid.isLadder(span.leftCol + 2, r - 1);
        const hasDownLeft = this.grid.isLadder(span.leftCol - 1, r + 1) && this.grid.isLadder(span.leftCol, r + 1);
        const hasDownRight = this.grid.isLadder(span.leftCol + 1, r + 1) && this.grid.isLadder(span.leftCol + 2, r + 1);

        const isCap = !hasUpLeft && !hasUpRight && !this.grid.isLadder(c, r - 1);
        const isSlash = hasUpRight || hasDownLeft;
        const variant = isSlash ? 'white' : 'brown';

        if (isCap) {
            return `tile_stair_${variant}_cap`;
        }
        if (isSlash) {
            return isLeftCell ? 'tile_stair_white_slash_l' : 'tile_stair_white_slash_r';
        }
        if (hasUpLeft || hasDownRight) {
            return isLeftCell ? 'tile_stair_brown_backslash_l' : 'tile_stair_brown_backslash_r';
        }
        return 'tile_ladder';
    }

    /**
     * Actualiza el aspecto de un tile cuando cambia su estado en la cuadrícula (ej: arenisca excavada).
     */
    private handleTileChanged(c: number, r: number, newType: TileType): void {
        const key = `${c},${r}`;
        const existing = this.tileSprites.get(key);

        if (newType === TileType.Empty) {
            if (existing) {
                existing.destroy();
                this.tileSprites.delete(key);
            }
            // Emitir polvo de excavación
            const pos = this.grid.tileToWorld(c, r);
            this.spawnDust(pos.x, pos.y);
        } else if (newType === TileType.DiggableSandstoneCracked) {
            if (existing) {
                const nextTexture = existing.texture.key === 'tile_solid'
                    ? 'tile_solid_cracked'
                    : 'tile_diggable_cracked';
                existing.setTexture(nextTexture);
            }
            const pos = this.grid.tileToWorld(c, r);
            this.spawnDust(pos.x, pos.y);
        }
    }

    /**
     * Genera partículas de polvo de arenisca al romper bloques.
     */
    private spawnDust(x: number, y: number): void {
        for (let i = 0; i < 6; i++) {
            const p = this.add.sprite(x + (Math.random() * 16 - 8), y + (Math.random() * 16 - 8), 'particle_dust');
            p.setDepth(15);
            this.tweens.add({
                targets: p,
                y: p.y + Math.random() * 20 + 5,
                alpha: 0,
                duration: 350,
                onComplete: () => p.destroy()
            });
        }
    }

    /**
     * Genera chispas mágicas de recogida de gema o derrota de enemigo.
     */
    private spawnSparks(x: number, y: number): void {
        for (let i = 0; i < 5; i++) {
            const p = this.add.sprite(x, y, 'particle_sparkle');
            p.setDepth(15);
            this.tweens.add({
                targets: p,
                x: x + (Math.random() * 30 - 15),
                y: y + (Math.random() * 30 - 15),
                alpha: 0,
                duration: 400,
                onComplete: () => p.destroy()
            });
        }
    }

    /**
     * Maneja el impacto de una momia sobre el jugador.
     */
    private handlePlayerHit(): void {
        if (this.isStageTransitioning || this.player.isInvulnerableOrDead()) return;

        const spawn = this.chamberData.playerSpawn;
        const stillAlive = this.player.takeDamage(spawn.col, spawn.row);
        this.lives = this.player.getLives();
        this.updateHUDDisplay();

        this.isStageTransitioning = true;
        if (!stillAlive) {
            // Se agotaron las vidas (0 vidas) -> Game Over
            this.time.delayedCall(1200, () => {
                this.scene.start('GameOverScene', {
                    score: this.score,
                    hiScore: this.hiScore,
                    stage: this.stage
                });
            });
        } else {
            // Todavía quedan vidas -> Reiniciar en la recámara en la que se perdió
            this.time.delayedCall(1000, () => {
                this.scene.restart({
                    stage: this.stage, // Conserva la recámara actual (ej. 2)
                    score: this.score,
                    lives: this.lives, // Conserva las vidas restantes (ej. 2 o 1)
                    hiScore: this.hiScore
                });
            });
        }
    }

    /**
     * Maneja la victoria de la cámara al cruzar la puerta de salida abierta.
     */
    private handleStageClear(): void {
        this.isStageTransitioning = true;
        this.player.setPlayerState(PlayerState.StageClear);
        this.player.setVelocity(0, 0);
        this.score += GameConstants.SCORE_CHAMBER_CLEAR;
        this.audio.playStageClear();

        // Texto triunfal en pantalla
        const banner = this.add.text(GameConstants.GAME_WIDTH / 2, GameConstants.GAME_HEIGHT / 2, "CHAMBER COMPLETE!", {
            fontFamily: '"Courier New", monospace',
            fontSize: '28px',
            fontStyle: 'bold',
            color: MSXPalette.LIGHT_YELLOW
        }).setOrigin(0.5).setDepth(30);

        this.tweens.add({
            targets: banner,
            scale: 1.2,
            duration: 600,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                banner.destroy();
                // Avanzar a la pantalla de mapa hacia la siguiente pirámide
                this.scene.start('PyramidMapScene', {
                    stage: this.stage + 1,
                    score: this.score,
                    lives: this.player.getLives(),
                    hiScore: Math.max(this.score, this.hiScore)
                });
            }
        });
    }

    /**
     * Comprueba si dos objetos de Phaser con cuerpo de física se solapan en pantalla.
     */
    private checkOverlap(a: Phaser.GameObjects.GameObject, b: Phaser.GameObjects.GameObject): boolean {
        return this.physics.overlap(a, b);
    }

    /**
     * Refresca los números mostrados en el HUD superior.
     */
    private updateHUDDisplay(): void {
        if (!this.hud || !this.player) return;
        this.hud.updateHUD({
            score: this.score,
            hiScore: this.hiScore,
            stage: this.stage,
            lives: this.player.getLives(),
            gemsRemaining: this.remainingGems,
            pickaxeUses: this.player.getPickaxeUses(),
            knivesCount: this.player.getKnivesCount()
        });
    }
}
