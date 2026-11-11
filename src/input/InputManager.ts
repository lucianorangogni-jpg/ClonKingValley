/**
 * @file InputManager.ts
 * Gestor unificado de entrada para teclado y gamepad en King's Valley.
 */

import * as Phaser from 'phaser';
import type { PlayerInputSnapshot } from '../entities/Player.ts';

/**
 * Gestor unificado de controles de teclado y gamepad para King's Valley.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Esta clase abstrae los dispositivos físicos de entrada (flechas del teclado, combinaciones WASD,
 * barra espaciadora, teclas de acción retro y mandos/gamepads USB/Bluetooth).
 * Procesa las pulsaciones en cada fotograma y genera un objeto inmutable `PlayerInputSnapshot`
 * que la entidad `Player` puede consumir limpiamente sin acoplarse a eventos del DOM.
 * 
 * ¿CÓMO SE USA?:
 * Se instancia en `GameScene.ts` en el método `create()` y se consulta en `update()`:
 * ```ts
 * const inputMgr = new InputManager(this);
 * const input = inputMgr.pollInput();
 * player.updatePlayer(delta, input);
 * ```
 */
export class InputManager {
    private scene: Phaser.Scene;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private keyW: Phaser.Input.Keyboard.Key | null = null;
    private keyA: Phaser.Input.Keyboard.Key | null = null;
    private keyS: Phaser.Input.Keyboard.Key | null = null;
    private keyD: Phaser.Input.Keyboard.Key | null = null;
    private keySpace: Phaser.Input.Keyboard.Key | null = null;
    private keyX: Phaser.Input.Keyboard.Key | null = null;
    private keyC: Phaser.Input.Keyboard.Key | null = null;
    private keyShift: Phaser.Input.Keyboard.Key | null = null;
    private keyZ: Phaser.Input.Keyboard.Key | null = null;
    private keyR: Phaser.Input.Keyboard.Key | null = null;
    private keyM: Phaser.Input.Keyboard.Key | null = null;

    // Control de pulsaciones discretas (just pressed) para acciones que no deben repetirse cada tick
    private lastSpaceState: boolean = false;

    /**
     * Construye el gestor de controles para la escena.
     * @param scene Escena de Phaser
     */
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.keyX = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
            this.keyC = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
            this.keyShift = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
            this.keyZ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
            this.keyR = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
            this.keyM = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        }
    }

    /**
     * Sondea el estado de los controles físicos y retorna la instantánea para el jugador.
     */
    public pollInput(): PlayerInputSnapshot {
        const left = (this.cursors?.left.isDown ?? false) || (this.keyA?.isDown ?? false) || this.isPadLeft();
        const right = (this.cursors?.right.isDown ?? false) || (this.keyD?.isDown ?? false) || this.isPadRight();
        const up = (this.cursors?.up.isDown ?? false) || (this.keyW?.isDown ?? false) || this.isPadUp();
        const down = (this.cursors?.down.isDown ?? false) || (this.keyS?.isDown ?? false) || this.isPadDown();

        const spaceIsDown = (this.keySpace?.isDown ?? false) || (this.keyZ?.isDown ?? false) || this.isPadButton(0);
        const pickKeyIsDown =
            (this.keyX?.isDown ?? false) ||
            (this.keyC?.isDown ?? false) ||
            (this.keyShift?.isDown ?? false) ||
            this.isPadButton(2);

        // Detectar pulsación inicial para lanzar cuchillo (o usar pico si no hay cuchillos)
        const actionThrowJustPressed = spaceIsDown && !this.lastSpaceState;
        // Cavar con tecla dedicada de pico (X / C / Shift) o con Abajo + Espacio/Z
        const actionDig = pickKeyIsDown || (spaceIsDown && down);

        this.lastSpaceState = spaceIsDown;

        return {
            left,
            right,
            up,
            down,
            actionThrow: actionThrowJustPressed && !down,
            actionDig
        };
    }

    /**
     * Comprueba si se pulsó la tecla de reinicio de nivel (R).
     */
    public isRestartRequested(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.keyR!);
    }

    /**
     * Comprueba si se pulsó la tecla para alternar silencio (M).
     */
    public isMuteRequested(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.keyM!);
    }

    // Consultas a gamepad auxiliar
    private getPad(): Phaser.Input.Gamepad.Gamepad | null {
        return this.scene.input.gamepad?.getPad(0) ?? null;
    }

    private isPadLeft(): boolean {
        const pad = this.getPad();
        return pad ? pad.left || pad.leftStick.x < -0.3 : false;
    }

    private isPadRight(): boolean {
        const pad = this.getPad();
        return pad ? pad.right || pad.leftStick.x > 0.3 : false;
    }

    private isPadUp(): boolean {
        const pad = this.getPad();
        return pad ? pad.up || pad.leftStick.y < -0.3 : false;
    }

    private isPadDown(): boolean {
        const pad = this.getPad();
        return pad ? pad.down || pad.leftStick.y > 0.3 : false;
    }

    private isPadButton(index: number): boolean {
        const pad = this.getPad();
        return pad ? pad.isButtonDown(index) : false;
    }
}
