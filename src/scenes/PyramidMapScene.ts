/**
 * @file PyramidMapScene.ts
 * Pantalla intermedia "- PYRAMID'S MAP -" inspirada fielmente en `assets/Mapa.jpg`.
 */

import * as Phaser from 'phaser';
import { GameConstants } from '../core/GameConstants.ts';
import { MSXPalette } from '../graphics/MSXPalette.ts';
import { MSXAudio } from '../audio/MSXAudio.ts';

export interface PyramidMapInitData {
    stage?: number;
    score?: number;
    lives?: number;
    hiScore?: number;
}

interface PyramidNode {
    x: number;
    y: number;
}

/**
 * Escena de mapa de progreso de pirámides entre cámaras (`- PYRAMID'S MAP -`).
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Recrea la icónica pantalla de mapa en pergamino rasgado de King's Valley (`Mapa.jpg`)
 * mostrando las 15 pirámides conectadas hasta la meta (`GOAL`) y animando la flecha de avance
 * hacia la cámara actual antes de iniciar la partida o al completar un nivel.
 * 
 * ¿CÓMO SE USA?:
 * ```ts
 * this.scene.start('PyramidMapScene', { stage: 2, score: 2000, lives: 3 });
 * ```
 */
export class PyramidMapScene extends Phaser.Scene {
    private targetStage: number = 1;
    private score: number = 0;
    private lives: number = GameConstants.INITIAL_LIVES;
    private hiScore: number = 5000;
    private hasStarted: boolean = false;
    private autoTimer?: Phaser.Time.TimerEvent;

    constructor() {
        super({ key: 'PyramidMapScene' });
    }

    public init(data: PyramidMapInitData): void {
        this.targetStage = Math.max(1, data.stage ?? 1);
        this.score = data.score ?? 0;
        this.lives = data.lives ?? GameConstants.INITIAL_LIVES;
        this.hiScore = data.hiScore ?? 5000;
        this.hasStarted = false;
    }

    public create(): void {
        const width = GameConstants.GAME_WIDTH;
        const height = GameConstants.GAME_HEIGHT;
        this.cameras.main.setBackgroundColor(MSXPalette.BLACK);

        // Título superior "- PYRAMID'S MAP -"
        this.add.text(width / 2, 66, "- PYRAMID'S MAP -", {
            fontFamily: '"Courier New", monospace',
            fontSize: '28px',
            fontStyle: 'bold',
            color: MSXPalette.WHITE
        }).setOrigin(0.5);

        // Pergamino blanco con bordes rasgados estilo Mapa.jpg
        this.drawParchmentScroll(166, 114, 468, 444);

        // Coordenadas de las 15 pirámides fieles al recorrido en zig-zag de Mapa.jpg
        const nodes: PyramidNode[] = [
            // Fila 1 (izq -> der)
            { x: 234, y: 158 },
            { x: 350, y: 158 },
            { x: 465, y: 158 },
            // Fila 2 (der -> izq)
            { x: 556, y: 226 },
            { x: 465, y: 226 },
            { x: 326, y: 226 },
            // Fila 3 (izq -> der)
            { x: 312, y: 294 },
            { x: 424, y: 294 },
            // Fila 4 (der -> izq)
            { x: 496, y: 362 },
            { x: 382, y: 362 },
            { x: 278, y: 362 },
            // Fila 5 (izq -> der)
            { x: 324, y: 430 },
            { x: 422, y: 430 },
            { x: 512, y: 430 },
            // Fila 6 (meta inferior)
            { x: 556, y: 498 }
        ];

        // Trazado de la ruta negra continua que une las 15 pirámides y el cuadro GOAL
        const pathGfx = this.add.graphics();
        pathGfx.lineStyle(2, 0x000000, 1);
        pathGfx.beginPath();
        pathGfx.moveTo(nodes[0].x, nodes[0].y);
        pathGfx.lineTo(556, 158);
        pathGfx.lineTo(556, 226);
        pathGfx.lineTo(234, 226);
        pathGfx.lineTo(234, 294);
        pathGfx.lineTo(496, 294);
        pathGfx.lineTo(496, 362);
        pathGfx.lineTo(212, 362);
        pathGfx.lineTo(212, 430);
        pathGfx.lineTo(556, 430);
        pathGfx.lineTo(556, 498);
        pathGfx.lineTo(420, 498);
        pathGfx.strokePath();

        // Cuadro GOAL en la parte inferior izquierda del pergamino
        pathGfx.fillStyle(0xffffff, 1);
        pathGfx.fillRect(280, 468, 140, 56);
        pathGfx.strokeRect(280, 468, 140, 56);

        this.add.text(350, 496, 'GOAL', {
            fontFamily: '"Courier New", monospace',
            fontSize: '26px',
            fontStyle: 'bold',
            color: MSXPalette.BLACK
        }).setOrigin(0.5);

        // Dibujar las 15 pirámides 3D terracota
        nodes.forEach((node) => {
            this.add.sprite(node.x, node.y, 'map_pyramid_icon').setDepth(4);
        });

        // Flecha negra indicadora del progreso hacia la pirámide actual
        const activeIdx = Math.min(nodes.length - 1, (this.targetStage - 1) % GameConstants.TOTAL_PYRAMIDS);
        const dest = nodes[activeIdx];
        const prev = activeIdx > 0 ? nodes[activeIdx - 1] : { x: dest.x - 42, y: dest.y };

        const arrowAngle = Math.atan2(dest.y - prev.y, dest.x - prev.x);
        const startX = prev.x + (dest.x - prev.x) * 0.45;
        const startY = prev.y + (dest.y - prev.y) * 0.45;
        const endX = dest.x - Math.cos(arrowAngle) * 24;
        const endY = dest.y - Math.sin(arrowAngle) * 24;

        const arrow = this.add.triangle(startX, startY, -8, -8, -8, 8, 8, 0, 0x000000).setDepth(6);
        arrow.setRotation(arrowAngle);

        this.tweens.add({
            targets: arrow,
            x: endX,
            y: endY,
            duration: 950,
            ease: 'Linear'
        });

        // Etiqueta inferior discreta
        const stageStr = this.targetStage.toString().padStart(2, '0');
        this.add.text(width / 2, height - 20, `ENTERING PYRAMID-${stageStr}   (PRESS SPACE TO START)`, {
            fontFamily: '"Courier New", monospace',
            fontSize: '13px',
            color: MSXPalette.GRAY
        }).setOrigin(0.5);

        MSXAudio.getInstance().playItemPickup();

        this.autoTimer = this.time.delayedCall(2200, () => this.proceedToChamber());
        this.input.keyboard?.on('keydown-SPACE', () => this.proceedToChamber());
        this.input.keyboard?.on('keydown-ENTER', () => this.proceedToChamber());
        this.input.on('pointerdown', () => this.proceedToChamber());
    }

    /**
     * Dibuja un pergamino blanco rectangular con muescas pixeladas en sus bordes.
     */
    private drawParchmentScroll(x: number, y: number, w: number, h: number): void {
        const gfx = this.add.graphics();
        gfx.fillStyle(0xffffff, 1);
        gfx.fillRect(x, y, w, h);

        // Muescas rasgadas horizontales y verticales estilo pixel-art MSX
        gfx.fillStyle(0x000000, 1);
        for (let ix = x + 12; ix < x + w - 16; ix += 28) {
            gfx.fillRect(ix, y, 8, 6);
            gfx.fillRect(ix + 10, y + h - 7, 10, 7);
        }
        for (let iy = y + 14; iy < y + h - 18; iy += 32) {
            gfx.fillRect(x, iy, 7, 10);
            gfx.fillRect(x + w - 7, iy + 12, 7, 12);
        }
    }

    private proceedToChamber(): void {
        if (this.hasStarted) return;
        this.hasStarted = true;
        if (this.autoTimer) {
            this.autoTimer.destroy();
        }
        this.scene.start('GameScene', {
            stage: this.targetStage,
            score: this.score,
            lives: this.lives,
            hiScore: this.hiScore
        });
    }
}
