/**
 * @file TitleScene.ts
 * Pantalla de título retro MSX 1985 para King's Valley.
 */

import * as Phaser from 'phaser';
import { MSXPalette } from '../graphics/MSXPalette.ts';
import { GameConstants } from '../core/GameConstants.ts';
import { MSXAudio } from '../audio/MSXAudio.ts';

/**
 * Escena de menú principal y presentación retro de King's Valley.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Recrea fielmente la pantalla de presentación del juego clásico en MSX (1985).
 * Muestra el logotipo monumental de King's Valley, la información de derechos de autor y homenaje,
 * el selector de juego ("1 PLAYER"), y un texto intermitente de "PUSH SPACE KEY" que invita al usuario
 * a iniciar la partida. Además, esta interacción desbloquea el AudioContext del navegador para permitir
 * la reproducción de los efectos PSG y la banda sonora chiptune.
 * 
 * ¿CÓMO SE USA?:
 * Es invocada automáticamente por `BootScene` tras registrar los recursos:
 * ```ts
 * this.scene.start('TitleScene');
 * ```
 */
export class TitleScene extends Phaser.Scene {
    private audio!: MSXAudio;
    private blinkEvent?: Phaser.Time.TimerEvent;
    private selectedStage: number = 1;
    private stageSelectorText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'TitleScene' });
    }

    public create(): void {
        this.audio = MSXAudio.getInstance();
        this.selectedStage = 1;
        const width = GameConstants.GAME_WIDTH;
        const height = GameConstants.GAME_HEIGHT;

        // Fondo negro puro MSX
        this.cameras.main.setBackgroundColor(MSXPalette.BLACK);

        // Decoración de borde superior e inferior de pirámide
        const borderGfx = this.add.graphics();
        borderGfx.fillStyle(MSXPalette.getColorNumeric(10), 1.0); // Amarillo oscuro
        borderGfx.fillRect(20, 20, width - 40, 6);
        borderGfx.fillRect(20, height - 30, width - 40, 6);

        // Título monumental "KING'S VALLEY"
        this.add.text(width / 2, 90, "K I N G ' S   V A L L E Y", {
            fontFamily: '"Courier New", monospace',
            fontSize: '36px',
            fontStyle: 'bold',
            color: MSXPalette.LIGHT_YELLOW
        }).setOrigin(0.5);

        // Subtítulo retro MSX 1985
        this.add.text(width / 2, 140, "RETRO MSX 1985 ARCADE CLONE", {
            fontFamily: '"Courier New", monospace',
            fontSize: '15px',
            fontStyle: 'bold',
            color: MSXPalette.CYAN
        }).setOrigin(0.5);

        // Ilustración central: pirámide y personajes adaptados
        this.renderPyramidIllustration(width / 2, 240);

        // Selector de jugadores y cámara inicial
        this.add.text(width / 2, 336, "1  P L A Y E R", {
            fontFamily: '"Courier New", monospace',
            fontSize: '20px',
            fontStyle: 'bold',
            color: MSXPalette.WHITE
        }).setOrigin(0.5);

        this.stageSelectorText = this.add.text(width / 2, 372, "<  PYRAMID-01  >", {
            fontFamily: '"Courier New", monospace',
            fontSize: '17px',
            fontStyle: 'bold',
            color: MSXPalette.LIGHT_YELLOW
        }).setOrigin(0.5);

        // Instrucción parpadeante
        const promptText = this.add.text(width / 2, 422, "PUSH SPACE OR ENTER KEY", {
            fontFamily: '"Courier New", monospace',
            fontSize: '18px',
            fontStyle: 'bold',
            color: MSXPalette.LIGHT_GREEN
        }).setOrigin(0.5);

        this.blinkEvent = this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                promptText.setVisible(!promptText.visible);
            }
        });

        // Controles y guía rápida inferior
        this.add.text(width / 2, 490, "LEFT/RIGHT OR 1-3: SELECT PYRAMID   |   ARROWS / WASD TO MOVE & CLIMB\nSPACE / Z TO THROW KNIFE   |   X / C / SHIFT / DOWN+SPACE TO DIG WITH PICKAXE", {
            fontFamily: '"Courier New", monospace',
            fontSize: '13px',
            color: MSXPalette.GRAY,
            align: 'center'
        }).setOrigin(0.5);

        // Registro de eventos de selección y arranque
        this.input.keyboard?.on('keydown-LEFT', () => this.changeStage(-1));
        this.input.keyboard?.on('keydown-RIGHT', () => this.changeStage(1));
        this.input.keyboard?.on('keydown-ONE', () => this.setStage(1));
        this.input.keyboard?.on('keydown-TWO', () => this.setStage(2));
        this.input.keyboard?.on('keydown-THREE', () => this.setStage(3));
        this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
        this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
        this.input.on('pointerdown', () => this.startGame());
    }

    private changeStage(delta: number): void {
        const next = ((this.selectedStage - 1 + delta + 3) % 3) + 1;
        this.setStage(next);
    }

    private setStage(stage: number): void {
        this.selectedStage = stage;
        this.stageSelectorText.setText(`<  PYRAMID-${stage.toString().padStart(2, '0')}  >`);
        this.audio.playStep();
    }

    /**
     * Dibuja una ilustración retro de una pirámide con Vick azul, momia dorada y gemas.
     */
    private renderPyramidIllustration(centerX: number, centerY: number): void {
        const gfx = this.add.graphics();

        // Pirámide dorada escalonada
        gfx.fillStyle(MSXPalette.getColorNumeric(10), 1.0);
        gfx.beginPath();
        gfx.moveTo(centerX, centerY - 60);
        gfx.lineTo(centerX + 120, centerY + 50);
        gfx.lineTo(centerX - 120, centerY + 50);
        gfx.closePath();
        gfx.fill();

        // Sombra lateral
        gfx.fillStyle(MSXPalette.getColorNumeric(6), 0.4);
        gfx.beginPath();
        gfx.moveTo(centerX, centerY - 60);
        gfx.lineTo(centerX + 120, centerY + 50);
        gfx.lineTo(centerX, centerY + 50);
        gfx.closePath();
        gfx.fill();

        // Mostrar sprites actualizados de Vick, momia dorada y gemas
        this.add.sprite(centerX - 44, centerY + 30, 'player_idle').setScale(1.5);
        this.add.sprite(centerX + 44, centerY + 30, 'mummy_yellow_0').setScale(1.5);
        this.add.sprite(centerX - 14, centerY - 12, 'gem_pink').setScale(1.3);
        this.add.sprite(centerX + 14, centerY - 12, 'gem_green').setScale(1.3);
    }

    /**
     * Inicia el juego mostrando la pantalla `- PYRAMID'S MAP -` hacia la cámara elegida.
     */
    private startGame(): void {
        this.audio.init();
        this.audio.playGemPickup();
        if (this.blinkEvent) {
            this.blinkEvent.destroy();
        }
        this.scene.start('PyramidMapScene', {
            stage: this.selectedStage,
            score: 0,
            lives: GameConstants.INITIAL_LIVES
        });
    }
}
