/**
 * @file BootScene.ts
 * Escena de inicialización de recursos y texturas procedimentales para King's Valley.
 */

import * as Phaser from 'phaser';
import { SpriteFactory } from '../graphics/SpriteFactory.ts';
import { MSXAudio } from '../audio/MSXAudio.ts';

/**
 * Escena de arranque e inicialización técnica del juego.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Actúa como punto de inicio en el ciclo de vida de Phaser. Se encarga de instanciar la `SpriteFactory`
 * para generar dinámicamente en memoria todos los sprites pixel-art, tiles de pirámide, escaleras,
 * gemas y enemigos con la paleta de 16 colores de MSX. También prepara el motor de audio `MSXAudio`
 * y transiciona inmediatamente a la pantalla de título `TitleScene`.
 * 
 * ¿CÓMO SE USA?:
 * Es la primera escena cargada en la configuración de Phaser (`main.ts`):
 * ```ts
 * const config: Phaser.Types.Core.GameConfig = {
 *     scene: [BootScene, TitleScene, GameScene, GameOverScene]
 * };
 * ```
 */
export class BootScene extends Phaser.Scene {
    /**
     * Identificador único de la escena en Phaser.
     */
    constructor() {
        super({ key: 'BootScene' });
    }

    /**
     * Inicializa los sistemas básicos y genera todas las texturas procedurales antes de comenzar.
     */
    public create(): void {
        // 1. Generar todos los sprites y tiles retro en memoria
        const spriteFactory = new SpriteFactory(this);
        spriteFactory.generateAllTextures();

        // 2. Pre-inicializar el singleton de audio MSX
        MSXAudio.getInstance();

        // 3. Pasar a la pantalla de título
        this.scene.start('TitleScene');
    }
}
