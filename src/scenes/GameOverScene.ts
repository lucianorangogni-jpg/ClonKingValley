/**
 * @file GameOverScene.ts
 * Pantalla de fin de partida (Game Over) para King's Valley.
 */

import * as Phaser from 'phaser';
import { MSXPalette } from '../graphics/MSXPalette.ts';
import { GameConstants } from '../core/GameConstants.ts';
import { MSXAudio } from '../audio/MSXAudio.ts';

export interface GameOverData {
    score: number;
    hiScore: number;
    stage: number;
}

/**
 * Escena de Game Over retro estilo MSX.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Se activa cuando el jugador pierde la totalidad de sus vidas. Muestra el mensaje monumental
 * de "G A M E   O V E R", la puntuación final obtenida, el récord histórico y permite al jugador
 * reiniciar la partida inmediatamente pulsando la barra espaciadora o volver al menú principal.
 * 
 * ¿CÓMO SE USA?:
 * Es invocada desde `GameScene` cuando las vidas de Vick llegan a 0:
 * ```ts
 * this.scene.start('GameOverScene', { score, hiScore, stage });
 * ```
 */
export class GameOverScene extends Phaser.Scene {
    private score: number = 0;
    private hiScore: number = 0;
    private stage: number = 1;
    private audio!: MSXAudio;

    constructor() {
        super({ key: 'GameOverScene' });
    }

    public init(data: GameOverData): void {
        this.score = data.score || 0;
        const savedHi = typeof localStorage !== 'undefined' ? localStorage.getItem('kings_valley_hi_score') : null;
        const storedHi = savedHi ? parseInt(savedHi, 10) : 5000;
        this.hiScore = Math.max(storedHi, data.hiScore || 0, this.score);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('kings_valley_hi_score', this.hiScore.toString());
        }
        this.stage = data.stage || 1;
    }

    public create(): void {
        this.audio = MSXAudio.getInstance();
        this.audio.stopMusic();
        this.audio.playDeath();

        const width = GameConstants.GAME_WIDTH;
        const height = GameConstants.GAME_HEIGHT;

        this.cameras.main.setBackgroundColor(MSXPalette.BLACK);

        // Texto GAME OVER en rojo sangre MSX
        this.add.text(width / 2, 160, "G A M E   O V E R", {
            fontFamily: '"Courier New", monospace',
            fontSize: '40px',
            fontStyle: 'bold',
            color: MSXPalette.LIGHT_RED
        }).setOrigin(0.5);

        // Puntuaciones
        this.add.text(width / 2, 260, `FINAL SCORE: ${this.score.toString().padStart(5, '0')}`, {
            fontFamily: '"Courier New", monospace',
            fontSize: '22px',
            fontStyle: 'bold',
            color: MSXPalette.CYAN
        }).setOrigin(0.5);

        this.add.text(width / 2, 310, `HI-SCORE:    ${this.hiScore.toString().padStart(5, '0')}`, {
            fontFamily: '"Courier New", monospace',
            fontSize: '20px',
            fontStyle: 'bold',
            color: MSXPalette.LIGHT_YELLOW
        }).setOrigin(0.5);

        this.add.text(width / 2, 360, `REACHED STAGE: ${this.stage}`, {
            fontFamily: '"Courier New", monospace',
            fontSize: '18px',
            fontStyle: 'bold',
            color: MSXPalette.WHITE
        }).setOrigin(0.5);

        // Prompt para reintentar
        const prompt = this.add.text(width / 2, 450, "PRESS SPACE TO PLAY AGAIN", {
            fontFamily: '"Courier New", monospace',
            fontSize: '18px',
            fontStyle: 'bold',
            color: MSXPalette.LIGHT_GREEN
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                prompt.setVisible(!prompt.visible);
            }
        });

        // Controles de reinicio
        this.input.keyboard?.on('keydown-SPACE', () => this.restartGame());
        this.input.keyboard?.on('keydown-ENTER', () => this.restartGame());
        this.input.on('pointerdown', () => this.restartGame());
    }

    private restartGame(): void {
        this.audio.playGemPickup();
        this.scene.start('PyramidMapScene', { stage: 1, score: 0, lives: GameConstants.INITIAL_LIVES });
    }
}
