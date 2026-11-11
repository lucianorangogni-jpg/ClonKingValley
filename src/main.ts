/**
 * @file main.ts
 * Punto de entrada principal y configuración del motor Phaser para King's Valley MSX.
 */

import * as Phaser from 'phaser';
import { GameConstants } from './core/GameConstants.ts';
import { BootScene } from './scenes/BootScene.ts';
import { TitleScene } from './scenes/TitleScene.ts';
import { PyramidMapScene } from './scenes/PyramidMapScene.ts';
import { GameScene } from './scenes/GameScene.ts';
import { GameOverScene } from './scenes/GameOverScene.ts';

/**
 * Configuración maestra del juego King's Valley en Phaser 3.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Define las opciones de inicialización del motor gráfico y de física:
 * - Resolución virtual fija de 800x600 píxeles.
 * - Renderizado en modo pixel-perfect (`pixelArt: true`, `roundPixels: true`) para garantizar
 *   la estética retro nítida sin suavizado bilineal ni desenfoques.
 * - Motor de física Arcade para la detección de colisiones de proyectiles y entidades.
 * - Registro ordenado del flujo de escenas (`BootScene` -> `TitleScene` -> `GameScene` -> `GameOverScene`).
 * 
 * ¿CÓMO SE USA?:
 * Se ejecuta automáticamente al cargar el documento HTML en el navegador:
 * ```ts
 * const game = new Phaser.Game(config);
 * ```
 */
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GameConstants.GAME_WIDTH,
    height: GameConstants.GAME_HEIGHT,
    backgroundColor: '#000000',
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [BootScene, TitleScene, PyramidMapScene, GameScene, GameOverScene]
};

// Instanciación del juego
export const game = new Phaser.Game(config);
