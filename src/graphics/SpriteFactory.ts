/**
 * @file SpriteFactory.ts
 * Generador procedural de sprites, fondos, jeroglíficos y texturas retro MSX para King's Valley.
 */

import * as Phaser from 'phaser';
import { MSXPalette } from './MSXPalette.ts';
import { GameConstants } from '../core/GameConstants.ts';
import type { GemColorVariant } from '../grid/ChamberLevels.ts';

interface StairPalette {
    highlight: string;
    mid: string;
    shadow: string;
}

/**
 * Fábrica de generación procedural de texturas pixel-art adaptada fielmente a `PantallaEjemplo.png` y `Mapa.jpg`.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Genera en memoria todas las texturas en resolución retro MSX (tiles de pirámide 25x25, ladrillos rosados
 * excavables, escaleras diagonales blancas y marrones, fondo con jeroglíficos egipcios, Vick con casco azul,
 * momias blanca/dorada/roja, gemas facetadas, picos cyan, dagas e iconos del mapa).
 * 
 * ¿CÓMO SE USA?:
 * ```ts
 * const factory = new SpriteFactory(this);
 * factory.generateAllTextures();
 * ```
 */
export class SpriteFactory {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Genera la totalidad de texturas y registra las animaciones necesarias en Phaser.
     */
    public generateAllTextures(): void {
        this.generateChamberBackground();
        this.generateTiles();
        this.generateDiagonalStairs();
        this.generateMovingFloorTiles();
        this.generatePlayer();
        this.generateMummies();
        this.generateItems();
        this.generateMapAssets();
        this.generateParticles();
        this.createAnimations();
    }

    /**
     * Dibuja el fondo oscuro de ladrillos sutiles con jeroglíficos egipcios de `PantallaEjemplo.png`.
     */
    private generateChamberBackground(): void {
        const w = GameConstants.GAME_WIDTH;
        const h = GameConstants.GRID_ROWS * GameConstants.TILE_SIZE;
        const size = GameConstants.TILE_SIZE;

        this.createCanvasTexture('bg_chamber', w, h, (ctx) => {
            ctx.fillStyle = MSXPalette.BLACK;
            ctx.fillRect(0, 0, w, h);

            // Patrón sutil de ladrillos oscuros MSX en la pared del fondo
            ctx.fillStyle = '#1b1d20';
            for (let y = 0; y < h; y += 12) {
                ctx.fillRect(0, y, w, 1);
                const stagger = ((y / 12) % 2) * 12;
                for (let x = stagger; x < w; x += 25) {
                    ctx.fillRect(x, y, 1, 12);
                    ctx.fillRect(x + 6, y + 6, 3, 1);
                }
            }

            // Jeroglíficos en azul petróleo oscuro inspirados directamente en PantallaEjemplo.png
            const hiero = '#0f4a52';
            const hieroDim = '#0a3339';

            const drawSphinxMask = (ox: number, oy: number) => {
                ctx.fillStyle = hiero;
                ctx.fillRect(ox + 8, oy + 4, 12, 6);
                ctx.fillRect(ox + 28, oy + 4, 12, 6);
                ctx.fillStyle = hieroDim;
                ctx.fillRect(ox + 11, oy + 6, 6, 2);
                ctx.fillRect(ox + 31, oy + 6, 6, 2);
                ctx.fillStyle = hiero;
                ctx.fillRect(ox + 4, oy + 14, 40, 4);
                ctx.fillRect(ox + 10, oy + 20, 28, 12);
                ctx.fillStyle = MSXPalette.BLACK;
                ctx.fillRect(ox + 18, oy + 24, 12, 8);
            };

            const drawEyeOfHorus = (ox: number, oy: number) => {
                ctx.fillStyle = hiero;
                ctx.fillRect(ox + 4, oy + 4, 34, 4);
                ctx.fillRect(ox + 8, oy + 10, 26, 12);
                ctx.fillStyle = MSXPalette.BLACK;
                ctx.fillRect(ox + 16, oy + 13, 10, 6);
                ctx.fillStyle = hiero;
                ctx.fillRect(ox + 19, oy + 14, 4, 4);
                ctx.fillRect(ox + 12, oy + 24, 4, 12);
                ctx.fillRect(ox + 22, oy + 24, 10, 4);
                ctx.fillRect(ox + 28, oy + 28, 4, 8);
            };

            const drawAnkh = (ox: number, oy: number) => {
                ctx.fillStyle = hiero;
                ctx.fillRect(ox + 6, oy + 2, 12, 12);
                ctx.fillStyle = MSXPalette.BLACK;
                ctx.fillRect(ox + 9, oy + 5, 6, 6);
                ctx.fillStyle = hiero;
                ctx.fillRect(ox + 2, oy + 16, 20, 4);
                ctx.fillRect(ox + 10, oy + 14, 4, 18);
            };

            const drawScarab = (ox: number, oy: number) => {
                ctx.fillStyle = hiero;
                ctx.fillRect(ox + 10, oy + 4, 24, 6);
                ctx.fillRect(ox + 4, oy + 12, 36, 4);
                ctx.fillRect(ox + 14, oy + 16, 16, 14);
                ctx.fillRect(ox + 8, oy + 20, 4, 10);
                ctx.fillRect(ox + 32, oy + 20, 4, 10);
            };

            const drawSerpent = (ox: number, oy: number) => {
                ctx.fillStyle = hiero;
                ctx.fillRect(ox + 6, oy + 2, 10, 4);
                ctx.fillRect(ox + 4, oy + 8, 12, 4);
                ctx.fillRect(ox + 8, oy + 14, 12, 4);
                ctx.fillRect(ox + 4, oy + 20, 12, 4);
                ctx.fillRect(ox + 8, oy + 26, 10, 4);
            };

            drawSphinxMask(3 * size, 1 * size);
            drawScarab(28 * size, 0.5 * size);
            drawSerpent(13 * size, 4 * size);
            drawAnkh(19 * size, 4 * size);
            drawEyeOfHorus(2 * size, 11.5 * size);
            drawScarab(4 * size, 17.2 * size);
            drawSphinxMask(20 * size, 15.5 * size);
            drawAnkh(27 * size, 17 * size);
        });
    }

    /**
     * Dibuja los tiles de la cuadrícula: bloques dorados tallados, ladrillos rosados excavables y puertas.
     */
    private generateTiles(): void {
        const size = GameConstants.TILE_SIZE;

        // 1. Bloque dorado tallado de la pirámide (estilo exacto PantallaEjemplo.png)
        this.createCanvasTexture('tile_solid', size, size, (ctx) => {
            ctx.fillStyle = '#c88c32';
            ctx.fillRect(0, 0, size, size);

            // Bisel iluminado superior e izquierdo
            ctx.fillStyle = MSXPalette.LIGHT_YELLOW;
            ctx.fillRect(0, 0, size - 1, 3);
            ctx.fillRect(0, 0, 3, size - 1);

            // Sombra inferior y derecha
            ctx.fillStyle = '#5a2d0c';
            ctx.fillRect(1, size - 3, size - 1, 3);
            ctx.fillRect(size - 3, 1, 3, size - 1);

            // Relieve espiral/cartela interior clásico MSX
            ctx.fillStyle = '#925418';
            ctx.fillRect(5, 5, size - 10, size - 10);
            ctx.fillStyle = '#d4a040';
            ctx.fillRect(7, 7, size - 14, size - 14);
            ctx.fillStyle = '#703d10';
            ctx.fillRect(10, 10, 5, 5);
            ctx.fillStyle = MSXPalette.BLACK;
            ctx.fillRect(0, size - 1, size, 1);
            ctx.fillRect(size - 1, 0, 1, size);
        });

        // 2. Ladrillo rosado/terracota excavable (esquina inferior izquierda de PantallaEjemplo.png)
        this.createCanvasTexture('tile_diggable', size, size, (ctx) => {
            ctx.fillStyle = '#d65d78';
            ctx.fillRect(0, 0, size, size);

            // Hiladas horizontales de ladrillo rosado con brillo dorado superior
            ctx.fillStyle = MSXPalette.LIGHT_YELLOW;
            ctx.fillRect(0, 0, size, 2);
            ctx.fillRect(0, 12, size, 2);

            ctx.fillStyle = '#f28c98';
            ctx.fillRect(1, 2, size - 2, 2);
            ctx.fillRect(1, 14, size - 2, 2);

            ctx.fillStyle = '#9e3848';
            ctx.fillRect(0, 10, size, 2);
            ctx.fillRect(0, size - 2, size, 2);

            // Llagas verticales alternadas
            ctx.fillStyle = MSXPalette.BLACK;
            ctx.fillRect(12, 0, 2, 12);
            ctx.fillRect(4, 12, 2, 13);
            ctx.fillRect(20, 12, 2, 13);
            ctx.fillRect(0, 11, size, 1);
            ctx.fillRect(0, size - 1, size, 1);
        });

        // 3. Ladrillo excavable agrietado
        this.createCanvasTexture('tile_diggable_cracked', size, size, (ctx) => {
            ctx.fillStyle = '#c85068';
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = MSXPalette.LIGHT_YELLOW;
            ctx.fillRect(0, 0, size, 2);
            ctx.fillRect(0, 12, size, 2);

            ctx.fillStyle = MSXPalette.BLACK;
            ctx.fillRect(4, 3, 4, 3);
            ctx.fillRect(7, 6, 3, 5);
            ctx.fillRect(9, 11, 5, 3);
            ctx.fillRect(14, 14, 4, 5);
            ctx.fillRect(17, 19, 3, 5);
        });

        // 4. Escalera vertical clásica (respaldo si hay tramos verticales de 1 columna)
        this.createCanvasTexture('tile_ladder', size, size, (ctx) => {
            ctx.fillStyle = MSXPalette.LIGHT_YELLOW;
            ctx.fillRect(3, 0, 3, size);
            ctx.fillRect(size - 6, 0, 3, size);

            ctx.fillStyle = MSXPalette.WHITE;
            for (let y = 3; y < size; y += 6) {
                ctx.fillRect(6, y, size - 12, 2);
                ctx.fillStyle = MSXPalette.GRAY;
                ctx.fillRect(6, y + 2, size - 12, 1);
                ctx.fillStyle = MSXPalette.WHITE;
            }
        });

        // 5. Puerta de Salida Cerrada
        this.createCanvasTexture('door_closed', size, size, (ctx) => {
            ctx.fillStyle = MSXPalette.DARK_RED;
            ctx.fillRect(2, 2, size - 4, size - 2);
            ctx.fillStyle = MSXPalette.LIGHT_YELLOW;
            ctx.fillRect(2, 2, size - 4, 2);
            ctx.fillRect(2, 2, 2, size - 2);
            ctx.fillRect(size - 4, 2, 2, size - 2);
            ctx.fillStyle = MSXPalette.DARK_YELLOW;
            ctx.fillRect(8, 8, size - 16, size - 14);
            ctx.fillStyle = MSXPalette.BLACK;
            ctx.fillRect(11, 11, 3, 3);
        });

        // 6. Puerta de Salida Abierta
        this.createCanvasTexture('door_open', size, size, (ctx) => {
            ctx.fillStyle = MSXPalette.BLACK;
            ctx.fillRect(2, 2, size - 4, size - 2);
            ctx.fillStyle = MSXPalette.CYAN;
            ctx.fillRect(5, 5, size - 10, size - 7);
            ctx.fillStyle = MSXPalette.WHITE;
            ctx.fillRect(8, 8, size - 16, size - 10);
            ctx.fillStyle = MSXPalette.LIGHT_YELLOW;
            ctx.strokeRect(2.5, 2.5, size - 5, size - 3);
        });
    }

    /**
     * Genera las variantes diagonales de escaleras de piedra (blancas/celestes y doradas/marrones).
     */
    private generateDiagonalStairs(): void {
        const size = GameConstants.TILE_SIZE;

        const whitePal: StairPalette = {
            highlight: MSXPalette.WHITE,
            mid: MSXPalette.CYAN,
            shadow: '#385888'
        };
        const brownPal: StairPalette = {
            highlight: MSXPalette.LIGHT_YELLOW,
            mid: '#c88028',
            shadow: '#643810'
        };

        const variants: Array<{ prefix: string; pal: StairPalette }> = [
            { prefix: 'white', pal: whitePal },
            { prefix: 'brown', pal: brownPal }
        ];

        for (const { prefix, pal } of variants) {
            // Remate superior de escalera atravesando una plataforma (2 celdas horizontales)
            this.createCanvasTexture(`tile_stair_${prefix}_cap`, size, size, (ctx) => {
                ctx.fillStyle = pal.shadow;
                ctx.fillRect(0, 2, size, size - 4);
                for (let y = 3; y < size - 3; y += 5) {
                    ctx.fillStyle = pal.highlight;
                    ctx.fillRect(0, y, size, 2);
                    ctx.fillStyle = MSXPalette.BLACK;
                    ctx.fillRect(0, y + 2, size, 2);
                }
            });

            // Escalones diagonales ocupando los 4 cuadrantes de una escalera de 2 columnas
            const drawStepPair = (
                ctx: CanvasRenderingContext2D,
                xStart: number,
                yStart: number,
                dxPerStep: number,
                dyPerStep: number
            ) => {
                for (let s = 0; s < 3; s++) {
                    const sx = xStart + s * dxPerStep;
                    const sy = yStart + s * dyPerStep;
                    ctx.fillStyle = pal.highlight;
                    ctx.fillRect(sx, sy, 11, 3);
                    ctx.fillStyle = pal.mid;
                    ctx.fillRect(sx + 1, sy + 3, 10, 2);
                    ctx.fillStyle = pal.shadow;
                    ctx.fillRect(sx + 2, sy + 5, 9, 2);
                }
            };

            // Escalera '/' (baja hacia izquierda): lado izquierdo de la fila (mitad inferior-derecha)
            this.createCanvasTexture(`tile_stair_${prefix}_slash_l`, size, size, (ctx) => {
                drawStepPair(ctx, 14, 12, -5, 4);
            });
            // Escalera '/' lado derecho de la fila (mitad superior-izquierda)
            this.createCanvasTexture(`tile_stair_${prefix}_slash_r`, size, size, (ctx) => {
                drawStepPair(ctx, 8, 1, -5, 4);
            });

            // Escalera '\' (baja hacia derecha): lado izquierdo de la fila (mitad superior-derecha)
            this.createCanvasTexture(`tile_stair_${prefix}_backslash_l`, size, size, (ctx) => {
                drawStepPair(ctx, 6, 1, 5, 4);
            });
            // Escalera '\' lado derecho de la fila (mitad inferior-izquierda)
            this.createCanvasTexture(`tile_stair_${prefix}_backslash_r`, size, size, (ctx) => {
                drawStepPair(ctx, 0, 12, 5, 4);
            });
        }
    }

    /**
     * Dibuja las texturas animadas de los pisos movedizos / cintas mecánicas transportadoras.
     */
    private generateMovingFloorTiles(): void {
        const size = GameConstants.TILE_SIZE;

        for (let frame = 0; frame < 4; frame++) {
            const buildFrame = (dir: 'left' | 'right') => {
                this.createCanvasTexture(`tile_moving_floor_${dir}_${frame}`, size, size, (ctx) => {
                    ctx.fillStyle = MSXPalette.DARK_YELLOW;
                    ctx.fillRect(0, 0, size, size);

                    ctx.fillStyle = MSXPalette.BLACK;
                    ctx.fillRect(0, 0, size, 2);
                    ctx.fillRect(0, size - 2, size, 2);

                    ctx.fillStyle = MSXPalette.GRAY;
                    const shift = dir === 'left' ? (4 - frame) * 2 : frame * 2;
                    for (let r = 0; r < 4; r++) {
                        const rx = (r * 7 + shift) % size;
                        ctx.fillRect(rx, 3, 2, size - 6);
                    }

                    ctx.strokeStyle = dir === 'left' ? MSXPalette.CYAN : MSXPalette.LIGHT_YELLOW;
                    ctx.lineWidth = 2;
                    const arrowShift = dir === 'left' ? (4 - frame) * 3 : frame * 3;
                    for (let a = 0; a < 2; a++) {
                        const ax = (a * 13 + arrowShift) % size;
                        ctx.beginPath();
                        if (dir === 'left') {
                            ctx.moveTo(ax + 7, 8);
                            ctx.lineTo(ax + 2, 12);
                            ctx.lineTo(ax + 7, 17);
                        } else {
                            ctx.moveTo(ax + 2, 8);
                            ctx.lineTo(ax + 7, 12);
                            ctx.lineTo(ax + 2, 17);
                        }
                        ctx.stroke();
                    }
                });
            };
            buildFrame('left');
            buildFrame('right');
        }

        this.createCanvasTexture('tile_moving_floor_0', size, size, (ctx) => {
            ctx.fillStyle = MSXPalette.DARK_YELLOW;
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = MSXPalette.BLACK;
            ctx.fillRect(0, 0, size, 2);
            ctx.fillRect(0, size - 2, size, 2);
        });
    }

    /**
     * Genera los sprites del explorador Vick con casco/traje azul tal como aparece en `PantallaEjemplo.png`.
     */
    private generatePlayer(): void {
        const w = 22;
        const h = 32;

        const drawVickBase = (ctx: CanvasRenderingContext2D, legOffset: number = 0, hatOffset: number = 0) => {
            // Casco/gorra azul clásica de Vick con visera
            ctx.fillStyle = MSXPalette.DARK_BLUE;
            ctx.fillRect(4 + hatOffset, 2, 13, 6);
            ctx.fillRect(3 + hatOffset, 6, 17, 3); // Visera hacia adelante
            ctx.fillStyle = MSXPalette.CYAN;
            ctx.fillRect(6 + hatOffset, 3, 6, 2); // Brillo en casco

            // Rostro dorado/tostado
            ctx.fillStyle = '#d49a2a';
            ctx.fillRect(5, 9, 11, 7);
            ctx.fillStyle = MSXPalette.LIGHT_YELLOW;
            ctx.fillRect(10, 9, 5, 5);
            // Ojo y nariz
            ctx.fillStyle = MSXPalette.BLACK;
            ctx.fillRect(12, 10, 2, 2);
            ctx.fillRect(11, 14, 4, 1);

            // Chaqueta / peto azul con cinturón dorado
            ctx.fillStyle = MSXPalette.DARK_BLUE;
            ctx.fillRect(5, 16, 11, 8);
            ctx.fillStyle = MSXPalette.LIGHT_BLUE;
            ctx.fillRect(7, 17, 5, 4);
            ctx.fillStyle = MSXPalette.LIGHT_YELLOW;
            ctx.fillRect(5, 22, 11, 2);

            // Piernas azules y botas doradas/oscuras
            ctx.fillStyle = MSXPalette.DARK_BLUE;
            if (legOffset === 0) {
                ctx.fillRect(6, 24, 4, 5);
                ctx.fillRect(12, 24, 4, 5);
            } else if (legOffset > 0) {
                ctx.fillRect(4, 24, 4, 5);
                ctx.fillRect(13, 24, 4, 6);
            } else {
                ctx.fillRect(4, 24, 4, 6);
                ctx.fillRect(13, 24, 4, 5);
            }

            ctx.fillStyle = '#c88028';
            ctx.fillRect(legOffset > 0 ? 3 : 5, 29, 5, 3);
            ctx.fillRect(legOffset < 0 ? 14 : 12, 29, 5, 3);
        };

        this.createCanvasTexture('player_idle', w, h, (ctx) => drawVickBase(ctx, 0, 0));
        this.createCanvasTexture('player_walk_0', w, h, (ctx) => drawVickBase(ctx, 1, 0));
        this.createCanvasTexture('player_walk_1', w, h, (ctx) => drawVickBase(ctx, -1, 0));

        const drawVickClimb = (ctx: CanvasRenderingContext2D, phase: number) => {
            ctx.fillStyle = MSXPalette.DARK_BLUE;
            ctx.fillRect(4, 2, 14, 7);
            ctx.fillStyle = MSXPalette.CYAN;
            ctx.fillRect(7, 3, 6, 2);
            ctx.fillRect(2, 7, 18, 2);

            ctx.fillStyle = MSXPalette.DARK_BLUE;
            ctx.fillRect(5, 10, 12, 13);
            ctx.fillStyle = MSXPalette.LIGHT_YELLOW;
            ctx.fillRect(5, 21, 12, 2);

            ctx.fillStyle = '#d49a2a';
            ctx.fillRect(2, phase === 0 ? 8 : 12, 3, 5);
            ctx.fillRect(17, phase === 0 ? 12 : 8, 3, 5);

            ctx.fillStyle = MSXPalette.DARK_BLUE;
            ctx.fillRect(5, phase === 0 ? 23 : 25, 4, 5);
            ctx.fillRect(13, phase === 0 ? 25 : 23, 4, 5);

            ctx.fillStyle = '#c88028';
            ctx.fillRect(5, phase === 0 ? 28 : 29, 4, 3);
            ctx.fillRect(13, phase === 0 ? 29 : 28, 4, 3);
        };

        this.createCanvasTexture('player_climb_0', w, h, (ctx) => drawVickClimb(ctx, 0));
        this.createCanvasTexture('player_climb_1', w, h, (ctx) => drawVickClimb(ctx, 1));

        this.createCanvasTexture('player_dig', w, h, (ctx) => {
            drawVickBase(ctx, 0, 1);
            ctx.fillStyle = MSXPalette.CYAN;
            ctx.fillRect(15, 13, 5, 3);
            ctx.fillStyle = MSXPalette.WHITE;
            ctx.fillRect(18, 8, 3, 14);
        });
    }

    /**
     * Genera las momias enemigas (Blanca, Dorada/Amarilla de `PantallaEjemplo.png`, y Roja).
     */
    private generateMummies(): void {
        const w = 22;
        const h = 32;

        const drawMummy = (
            ctx: CanvasRenderingContext2D,
            baseColor: string,
            shadeColor: string,
            eyeColor: string,
            step: number
        ) => {
            // Cabeza cilíndrica vendada fiel a PantallaEjemplo.png
            ctx.fillStyle = baseColor;
            ctx.fillRect(5, 2, 12, 12);
            ctx.fillStyle = shadeColor;
            ctx.fillRect(5, 5, 12, 2);
            ctx.fillRect(5, 10, 12, 2);
            ctx.fillRect(5, 2, 2, 12);

            // Visor / ojos
            ctx.fillStyle = eyeColor;
            ctx.fillRect(12, 6, 4, 3);

            // Torso y brazos vendados
            ctx.fillStyle = baseColor;
            ctx.fillRect(5, 14, 11, 10);
            ctx.fillStyle = shadeColor;
            ctx.fillRect(5, 17, 11, 2);
            ctx.fillRect(5, 21, 11, 2);

            ctx.fillStyle = baseColor;
            ctx.fillRect(14, 15, 7, 3);
            ctx.fillStyle = shadeColor;
            ctx.fillRect(15, 18, 5, 2);

            // Piernas vendadas alternadas
            ctx.fillStyle = baseColor;
            if (step === 0) {
                ctx.fillRect(6, 24, 4, 8);
                ctx.fillRect(12, 24, 4, 8);
            } else {
                ctx.fillRect(4, 24, 4, 8);
                ctx.fillRect(13, 24, 4, 7);
            }
            ctx.fillStyle = shadeColor;
            ctx.fillRect(6, 28, 4, 2);
            ctx.fillRect(12, 28, 4, 2);
        };

        const variants = [
            { key: 'white', base: MSXPalette.WHITE, shade: '#7b8a8b', eye: MSXPalette.BLACK },
            { key: 'yellow', base: MSXPalette.LIGHT_YELLOW, shade: '#5e7828', eye: MSXPalette.BLACK },
            { key: 'red', base: MSXPalette.MEDIUM_RED, shade: MSXPalette.DARK_RED, eye: MSXPalette.LIGHT_YELLOW }
        ];

        for (const v of variants) {
            this.createCanvasTexture(`mummy_${v.key}_0`, w, h, (ctx) => drawMummy(ctx, v.base, v.shade, v.eye, 0));
            this.createCanvasTexture(`mummy_${v.key}_1`, w, h, (ctx) => drawMummy(ctx, v.base, v.shade, v.eye, 1));
        }
    }

    /**
     * Genera las gemas (rosa, verde, azul, amarilla), picos cyan y cuchillos de `PantallaEjemplo.png`.
     */
    private generateItems(): void {
        // 1. Gemas facetadas estilo PantallaEjemplo.png
        const gemStyles: Record<GemColorVariant, { outer: string; inner: string; dark: string; shape: 'diamond' | 'emerald' }> = {
            pink: { outer: '#f05a78', inner: MSXPalette.WHITE, dark: '#9a2038', shape: 'diamond' },
            green: { outer: MSXPalette.LIGHT_GREEN, inner: MSXPalette.WHITE, dark: MSXPalette.DARK_GREEN, shape: 'emerald' },
            blue: { outer: MSXPalette.CYAN, inner: MSXPalette.WHITE, dark: MSXPalette.DARK_BLUE, shape: 'diamond' },
            yellow: { outer: MSXPalette.LIGHT_YELLOW, inner: MSXPalette.WHITE, dark: '#986018', shape: 'emerald' }
        };

        for (const variant of Object.keys(gemStyles) as GemColorVariant[]) {
            const st = gemStyles[variant];
            this.createCanvasTexture(`gem_${variant}`, 22, 22, (ctx) => {
                if (st.shape === 'diamond') {
                    ctx.fillStyle = st.outer;
                    ctx.beginPath();
                    ctx.moveTo(11, 2);
                    ctx.lineTo(20, 11);
                    ctx.lineTo(11, 20);
                    ctx.lineTo(2, 11);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = st.dark;
                    ctx.beginPath();
                    ctx.moveTo(11, 11);
                    ctx.lineTo(20, 11);
                    ctx.lineTo(11, 20);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = st.inner;
                    ctx.fillRect(7, 6, 4, 4);
                } else {
                    // Gema rectangular corte esmeralda (como la verde de PantallaEjemplo.png)
                    ctx.fillStyle = st.outer;
                    ctx.fillRect(4, 2, 14, 18);
                    ctx.fillStyle = st.dark;
                    ctx.fillRect(11, 5, 6, 14);
                    ctx.fillStyle = st.inner;
                    ctx.fillRect(6, 4, 3, 12);
                    ctx.fillRect(6, 4, 8, 2);
                }
            });
        }

        // Alias genérico gem_0..3 por compatibilidad con TitleScene
        for (let i = 0; i < 4; i++) {
            const variants: GemColorVariant[] = ['pink', 'green', 'blue', 'yellow'];
            const st = gemStyles[variants[i]];
            this.createCanvasTexture(`gem_${i}`, 22, 22, (ctx) => {
                ctx.fillStyle = st.outer;
                ctx.beginPath();
                ctx.moveTo(11, 2);
                ctx.lineTo(20, 11);
                ctx.lineTo(11, 20);
                ctx.lineTo(2, 11);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = st.inner;
                ctx.fillRect(8, 6, 4, 4);
            });
        }

        // 2. Pico azul celeste/blanco fiel a PantallaEjemplo.png
        this.createCanvasTexture('item_pickaxe', 22, 22, (ctx) => {
            // Cabeza curva en arco hacia la izquierda/arriba
            ctx.fillStyle = MSXPalette.CYAN;
            ctx.fillRect(5, 5, 11, 3);
            ctx.fillRect(3, 8, 4, 4);
            ctx.fillRect(15, 8, 4, 7);
            ctx.fillStyle = MSXPalette.WHITE;
            ctx.fillRect(6, 5, 8, 2);
            ctx.fillRect(16, 8, 2, 6);

            // Mango vertical/diagonal apoyado hacia la base
            ctx.fillStyle = '#c0c8d0';
            ctx.fillRect(10, 7, 3, 14);
            ctx.fillStyle = MSXPalette.DARK_BLUE;
            ctx.fillRect(9, 17, 4, 4);
        });

        // 3. Cuchillo clavado verticalmente en el suelo (R01C07 y R19C24 de PantallaEjemplo.png)
        this.createCanvasTexture('item_knife_ground', 20, 22, (ctx) => {
            // Hoja brillante hacia arriba
            ctx.fillStyle = MSXPalette.WHITE;
            ctx.fillRect(9, 4, 3, 12);
            ctx.fillStyle = MSXPalette.CYAN;
            ctx.fillRect(11, 6, 1, 10);
            // Guarda y empuñadura apoyadas en el suelo
            ctx.fillStyle = MSXPalette.GRAY;
            ctx.fillRect(6, 16, 9, 2);
            ctx.fillStyle = MSXPalette.DARK_BLUE;
            ctx.fillRect(9, 18, 3, 4);
        });

        // 4. Cuchillo arrojadizo horizontal en vuelo
        this.createCanvasTexture('item_knife', 22, 10, (ctx) => {
            ctx.fillStyle = MSXPalette.WHITE;
            ctx.fillRect(6, 3, 13, 4);
            ctx.beginPath();
            ctx.moveTo(19, 3);
            ctx.lineTo(22, 5);
            ctx.lineTo(19, 7);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = MSXPalette.DARK_YELLOW;
            ctx.fillRect(1, 2, 5, 6);
            ctx.fillStyle = MSXPalette.DARK_RED;
            ctx.fillRect(0, 4, 2, 2);
        });
    }

    /**
     * Genera los iconos de pirámides tridimensionales para la pantalla `- PYRAMID'S MAP -`.
     */
    private generateMapAssets(): void {
        this.createCanvasTexture('map_pyramid_icon', 30, 24, (ctx) => {
            // Cara izquierda iluminada (terracota rosado claro)
            ctx.fillStyle = '#b47464';
            ctx.beginPath();
            ctx.moveTo(15, 2);
            ctx.lineTo(15, 22);
            ctx.lineTo(2, 16);
            ctx.closePath();
            ctx.fill();

            // Cara derecha sombreada (marrón oscuro)
            ctx.fillStyle = '#6c3c34';
            ctx.beginPath();
            ctx.moveTo(15, 2);
            ctx.lineTo(28, 16);
            ctx.lineTo(15, 22);
            ctx.closePath();
            ctx.fill();
        });
    }

    /**
     * Genera partículas de polvo de excavación y chispas.
     */
    private generateParticles(): void {
        this.createCanvasTexture('particle_dust', 6, 6, (ctx) => {
            ctx.fillStyle = MSXPalette.LIGHT_YELLOW;
            ctx.fillRect(0, 0, 6, 6);
            ctx.fillStyle = '#d65d78';
            ctx.fillRect(1, 1, 4, 4);
        });

        this.createCanvasTexture('particle_sparkle', 6, 6, (ctx) => {
            ctx.fillStyle = MSXPalette.WHITE;
            ctx.fillRect(2, 0, 2, 6);
            ctx.fillRect(0, 2, 6, 2);
        });
    }

    /**
     * Registra las animaciones de sprites en el AnimationManager de Phaser.
     */
    private createAnimations(): void {
        const anims = this.scene.anims;

        if (!anims.exists('player_walk')) {
            anims.create({
                key: 'player_walk',
                frames: [
                    { key: 'player_walk_0' },
                    { key: 'player_idle' },
                    { key: 'player_walk_1' },
                    { key: 'player_idle' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        if (!anims.exists('player_climb')) {
            anims.create({
                key: 'player_climb',
                frames: [
                    { key: 'player_climb_0' },
                    { key: 'player_climb_1' }
                ],
                frameRate: 6,
                repeat: -1
            });
        }

        const mummyAnims: Array<{ key: string; rate: number }> = [
            { key: 'white', rate: 4 },
            { key: 'yellow', rate: 5 },
            { key: 'red', rate: 6 }
        ];
        for (const m of mummyAnims) {
            const animKey = `mummy_${m.key}_walk`;
            if (!anims.exists(animKey)) {
                anims.create({
                    key: animKey,
                    frames: [
                        { key: `mummy_${m.key}_0` },
                        { key: `mummy_${m.key}_1` }
                    ],
                    frameRate: m.rate,
                    repeat: -1
                });
            }
        }

        if (!anims.exists('gem_spin')) {
            anims.create({
                key: 'gem_spin',
                frames: [
                    { key: 'gem_0' },
                    { key: 'gem_1' },
                    { key: 'gem_2' },
                    { key: 'gem_3' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        for (const dir of ['left', 'right']) {
            const animKey = `anim_moving_floor_${dir}`;
            if (!anims.exists(animKey)) {
                anims.create({
                    key: animKey,
                    frames: [
                        { key: `tile_moving_floor_${dir}_0` },
                        { key: `tile_moving_floor_${dir}_1` },
                        { key: `tile_moving_floor_${dir}_2` },
                        { key: `tile_moving_floor_${dir}_3` }
                    ],
                    frameRate: 8,
                    repeat: -1
                });
            }
        }
    }

    /**
     * Crea un canvas en memoria y lo registra como textura en Phaser.
     */
    private createCanvasTexture(
        key: string,
        width: number,
        height: number,
        drawCallback: (ctx: CanvasRenderingContext2D) => void
    ): void {
        if (this.scene.textures.exists(key)) {
            this.scene.textures.remove(key);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.imageSmoothingEnabled = false;
            drawCallback(ctx);
            this.scene.textures.addCanvas(key, canvas);
        }
    }
}
