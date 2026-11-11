/**
 * @file HUD.ts
 * Visualizador en pantalla (Heads-Up Display) de estado, inventario y puntuación en King's Valley.
 */

import * as Phaser from 'phaser';
import { MSXPalette } from './MSXPalette.ts';
import { GameConstants } from '../core/GameConstants.ts';

/**
 * Gestor del HUD retro superior de King's Valley estilo MSX.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Renderiza en la cabecera del juego la información vital del jugador: puntuación actual (`SCORE`),
 * récord histórico (`HI-SCORE`), fase actual (`STAGE`), vidas restantes (`REST`), gemas pendientes
 * para abrir la puerta (`GEMS`), usos restantes del pico (`PICK`) y cuchillos disponibles (`KNIFE`).
 * Utiliza tipografía retro y los colores auténticos de la paleta MSX de 16 colores.
 * 
 * ¿CÓMO SE USA?:
 * Se inicializa en `GameScene.ts` y se refresca cuando cambian los valores del juego:
 * ```ts
 * const hud = new HUD(this);
 * hud.updateHUD({
 *     score: 1200,
 *     hiScore: 5000,
 *     stage: 1,
 *     lives: 3,
 *     gemsRemaining: 2,
 *     pickaxeUses: 3,
 *     knivesCount: 1
 * });
 * ```
 */
export interface HUDData {
    score: number;
    hiScore: number;
    stage: number;
    lives: number;
    gemsRemaining: number;
    pickaxeUses: number;
    knivesCount: number;
}

export class HUD {
    private scene: Phaser.Scene;
    private scoreText!: Phaser.GameObjects.Text;
    private stageText!: Phaser.GameObjects.Text;
    private statusText!: Phaser.GameObjects.Text;
    private backgroundBar!: Phaser.GameObjects.Graphics;

    /**
     * Construye el HUD en la parte superior de la pantalla.
     * @param scene Escena de Phaser
     */
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createHUD();
    }

    /**
     * Crea los elementos visuales del HUD con estilo clásico MSX de `PantallaEjemplo.png`.
     */
    private createHUD(): void {
        const width = GameConstants.GAME_WIDTH;
        const height = GameConstants.HUD_HEIGHT;

        // Barra de fondo negra pura MSX
        this.backgroundBar = this.scene.add.graphics();
        this.backgroundBar.setDepth(20);
        this.backgroundBar.fillStyle(MSXPalette.getColorNumeric(1), 1.0);
        this.backgroundBar.fillRect(0, 0, width, height);
        this.backgroundBar.lineStyle(1, MSXPalette.getColorNumeric(10), 0.65);
        this.backgroundBar.lineBetween(0, height - 1, width, height - 1);

        // Línea 1 estilo PantallaEjemplo.png: SCORE-000000 HI-005000 REST-03
        this.scoreText = this.scene.add.text(width / 2, 16, 'SCORE-000000 HI-005000 REST-03', {
            fontFamily: '"Courier New", monospace',
            fontSize: '21px',
            fontStyle: 'bold',
            color: MSXPalette.WHITE
        }).setOrigin(0.5).setDepth(21);

        // Línea 2 estilo PantallaEjemplo.png: PYRAMID-01
        this.stageText = this.scene.add.text(width / 2, 39, 'PYRAMID-01', {
            fontFamily: '"Courier New", monospace',
            fontSize: '20px',
            fontStyle: 'bold',
            color: MSXPalette.WHITE
        }).setOrigin(0.5).setDepth(21);

        // Línea 3 compacta con inventario, gemas restantes y tecla de pico
        this.statusText = this.scene.add.text(width / 2, 60, 'GEMS: 0   PICK [X/C/SHIFT]: 0   KNIFE [SPACE]: 0', {
            fontFamily: '"Courier New", monospace',
            fontSize: '12px',
            fontStyle: 'bold',
            color: MSXPalette.CYAN
        }).setOrigin(0.5).setDepth(21);
    }

    /**
     * Actualiza las cadenas y métricas numéricas mostradas en el HUD.
     */
    public updateHUD(data: HUDData): void {
        const scoreStr = data.score.toString().padStart(6, '0');
        const hiScoreStr = data.hiScore.toString().padStart(6, '0');
        const restStr = Math.max(0, data.lives).toString().padStart(2, '0');
        const stageStr = data.stage.toString().padStart(2, '0');

        this.scoreText.setText(`SCORE-${scoreStr} HI-${hiScoreStr} REST-${restStr}`);
        this.stageText.setText(`PYRAMID-${stageStr}`);
        this.statusText.setText(
            `GEMS: ${Math.max(0, data.gemsRemaining)}   PICK [X/C/SHIFT]: ${data.pickaxeUses}   KNIFE [SPACE]: ${data.knivesCount}`
        );
    }

    /**
     * Destruye los elementos del HUD si se reinicia la escena.
     */
    public destroy(): void {
        this.backgroundBar.destroy();
        this.scoreText.destroy();
        this.stageText.destroy();
        this.statusText.destroy();
    }
}
