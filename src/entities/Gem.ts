/**
 * @file Gem.ts
 * Objeto recolectable de gema sagrada (Soul Stone) para King's Valley.
 */

import * as Phaser from 'phaser';
import type { GemColorVariant } from '../grid/ChamberLevels.ts';

/**
 * Entidad de gema sagrada / esfera mística de la pirámide.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Constituye el objetivo principal de cada fase en King's Valley. Para que la puerta de salida
 * sellada se desbloquee y permita al jugador escapar al siguiente nivel, Vick debe recolectar
 * la totalidad de gemas sagradas de la cámara. Cada gema recogida otorga 100 puntos y reproduce
 * el icónico arpegio ascendente retro MSX.
 * 
 * ¿CÓMO SE USA?:
 * Se instancia en las celdas designadas por la cámara y se gestiona mediante solapamiento con Vick:
 * ```ts
 * const gem = new Gem(scene, x, y, 'pink');
 * ```
 */
export class Gem extends Phaser.Physics.Arcade.Sprite {
    /**
     * Construye una gema sagrada.
     * @param scene Escena de Phaser
     * @param x Coordenada X inicial
     * @param y Coordenada Y inicial
     * @param colorVariant Variante visual ('pink' | 'green' | 'blue' | 'yellow')
     */
    constructor(scene: Phaser.Scene, x: number, y: number, colorVariant: GemColorVariant = 'pink') {
        const textureKey = `gem_${colorVariant}`;
        super(scene, x, y, textureKey);

        this.setOrigin(0.5, 0.5);
        this.setDepth(7);

        scene.add.existing(this);
        scene.physics.add.existing(this, true); // Cuerpo estático para recolección

        // Destello sutil estilo MSX sin alterar el diseño de referencia
        scene.tweens.add({
            targets: this,
            y: y - 2,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Efecto de recolección y destrucción de la gema.
     */
    public collect(): void {
        this.destroy();
    }
}
