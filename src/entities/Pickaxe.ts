/**
 * @file Pickaxe.ts
 * Objeto recolectable de pico para excavar arenisca en King's Valley.
 */

import * as Phaser from 'phaser';
import { GameConstants } from '../core/GameConstants.ts';

/**
 * Entidad recolectable de pico (Pickaxe).
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Representa la herramienta que confiere a Vick la capacidad de excavar bloques de arenisca
 * destructibles. Al ser recogido, otorga usos de durabilidad al inventario del jugador
 * para abrir pasadizos y trampas en la cámara de la pirámide.
 * 
 * ¿CÓMO SE USA?:
 * Se instancia en las posiciones definidas por el diseño del nivel (`ChamberLevels`)
 * y se comprueba la colisión o solapamiento con el jugador en `GameScene.ts`:
 * ```ts
 * const pickaxe = new Pickaxe(scene, x, y);
 * scene.physics.add.overlap(player, pickaxe, () => {
 *     player.addPickaxe(pickaxe.getUses());
 *     pickaxe.collect();
 * });
 * ```
 */
export class Pickaxe extends Phaser.Physics.Arcade.Sprite {
    private uses: number;

    /**
     * Construye un objeto pico.
     * @param scene Escena de Phaser
     * @param x Coordenada X inicial
     * @param y Coordenada Y inicial
     * @param uses Número de bloques que permite excavar (por defecto 3)
     */
    constructor(scene: Phaser.Scene, x: number, y: number, uses: number = GameConstants.PICKAXE_DEFAULT_USES) {
        super(scene, x, y, 'item_pickaxe');

        this.uses = uses;
        this.setOrigin(0.5, 0.5);
        this.setDepth(7);

        scene.add.existing(this);
        scene.physics.add.existing(this, true); // Cuerpo estático

        // Efecto de flotación sutil retro
        scene.tweens.add({
            targets: this,
            y: y - 3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Devuelve el número de usos que otorga este pico.
     */
    public getUses(): number {
        return this.uses;
    }

    /**
     * Realiza la recolección del pico y lo destruye de la escena.
     */
    public collect(): void {
        this.destroy();
    }
}
