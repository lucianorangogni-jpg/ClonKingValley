/**
 * @file ExitDoor.ts
 * Entidad de la puerta de salida de la cámara para King's Valley.
 */

import * as Phaser from 'phaser';
import { MSXAudio } from '../audio/MSXAudio.ts';

/**
 * Entidad de la puerta de salida y escape de la cámara de la pirámide.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Controla el portal de salida de cada nivel. Comienza en estado sellado (`door_closed`)
 * e impenetrable. Cuando el jugador recoge la última gema sagrada de la cámara, la puerta se desbloquea,
 * cambia a la textura de portal abierto (`door_open`), reproduce la fanfarria de apertura y permite
 * a Vick cruzarla para avanzar a la siguiente fase o completar la pirámide.
 * 
 * ¿CÓMO SE USA?:
 * Se instancia sobre la casilla de salida configurada en `ChamberLevels`:
 * ```ts
 * const door = new ExitDoor(scene, x, y);
 * // Al recoger todas las gemas:
 * door.unlock();
 * // En el bucle de actualización:
 * if (door.isOpen() && isPlayerOverlapping) {
 *     stageClear();
 * }
 * ```
 */
export class ExitDoor extends Phaser.Physics.Arcade.Sprite {
    private isUnlocked: boolean = false;
    private audio: MSXAudio;

    /**
     * Construye la puerta de salida.
     * @param scene Escena de Phaser
     * @param x Coordenada X del centro
     * @param y Coordenada Y del centro
     */
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'door_closed');

        this.audio = MSXAudio.getInstance();
        this.setOrigin(0.5, 0.5);
        this.setDepth(6);

        scene.add.existing(this);
        scene.physics.add.existing(this, true);
    }

    /**
     * Desbloquea y abre la puerta de salida, reproduciendo la fanfarria triunfal.
     */
    public unlock(): void {
        if (this.isUnlocked) return;
        this.isUnlocked = true;
        this.setTexture('door_open');
        this.audio.playDoorOpened();

        // Efecto de pulsación de luz en el portal abierto
        this.scene.tweens.add({
            targets: this,
            alpha: 0.75,
            duration: 350,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * Comprueba si la puerta se encuentra abierta para el escape de Vick.
     */
    public isOpen(): boolean {
        return this.isUnlocked;
    }
}
