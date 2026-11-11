/**
 * @file MSXAudio.ts
 * Emulador de sintetizador de audio PSG (AY-3-8910) para King's Valley MSX.
 */

/**
 * Gestor de audio y sintetizador PSG WebAudio chiptune para King's Valley.
 * 
 * ¿PARA QUÉ ESTÁ?:
 * Esta clase recrea fielmente el sonido de 8 bits del chip de sonido PSG (Programmable Sound Generator)
 * del hardware MSX original sin requerir archivos de audio externos (.wav/.mp3).
 * Utiliza osciladores de onda cuadrada (`square`) y generadores de ruido blanco pseudoaleatorio para reproducir
 * los efectos de sonido clásicos (cavar arenisca, pasos, lanzamiento de cuchillo, eliminación de momias,
 * recogida de gemas sagradas) y la legendaria melodía principal de King's Valley en bucle continuo.
 * 
 * ¿CÓMO SE USA?:
 * Se instancia típicamente como singleton o a nivel de juego/escena:
 * ```ts
 * const audio = MSXAudio.getInstance();
 * audio.init(); // Se llama tras la primera interacción de usuario
 * audio.playStep();
 * audio.playDig();
 * audio.playGemPickup();
 * audio.playKnifeThrow();
 * audio.startMusic();
 * audio.stopMusic();
 * ```
 */
export class MSXAudio {
    private static instance: MSXAudio | null = null;
    private ctx: AudioContext | null = null;
    private musicInterval: number | null = null;
    private isMuted: boolean = false;
    private currentNoteIndex: number = 0;

    /**
     * Notas de la melodía clásica de King's Valley (frecuencias en Hz).
     * Secuencia de notas del tema principal retro MSX 1985.
     */
    private readonly THEME_NOTES: readonly { freq: number; dur: number }[] = [
        // Frase A
        { freq: 523.25, dur: 0.18 }, // C5
        { freq: 587.33, dur: 0.18 }, // D5
        { freq: 659.25, dur: 0.18 }, // E5
        { freq: 783.99, dur: 0.36 }, // G5
        { freq: 659.25, dur: 0.18 }, // E5
        { freq: 587.33, dur: 0.18 }, // D5
        { freq: 523.25, dur: 0.36 }, // C5

        // Frase B
        { freq: 440.00, dur: 0.18 }, // A4
        { freq: 523.25, dur: 0.18 }, // C5
        { freq: 587.33, dur: 0.36 }, // D5
        { freq: 523.25, dur: 0.18 }, // C5
        { freq: 440.00, dur: 0.18 }, // A4
        { freq: 392.00, dur: 0.36 }, // G4

        // Frase C (Rápida arpegiada)
        { freq: 523.25, dur: 0.14 }, // C5
        { freq: 659.25, dur: 0.14 }, // E5
        { freq: 783.99, dur: 0.14 }, // G5
        { freq: 1046.50, dur: 0.28 }, // C6
        { freq: 987.77, dur: 0.14 }, // B5
        { freq: 783.99, dur: 0.14 }, // G5
        { freq: 880.00, dur: 0.42 }  // A5
    ];

    /**
     * Constructor privado para patrón Singleton.
     */
    private constructor() {
        // Inicialización diferida del AudioContext para cumplir con las políticas de navegadores
    }

    /**
     * Obtiene la instancia única de MSXAudio.
     */
    public static getInstance(): MSXAudio {
        if (!MSXAudio.instance) {
            MSXAudio.instance = new MSXAudio();
        }
        return MSXAudio.instance;
    }

    /**
     * Inicializa o reactiva el AudioContext tras una interacción del usuario.
     */
    public init(): void {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Alterna el estado de silencio global.
     */
    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopMusic();
        }
        return this.isMuted;
    }

    /**
     * Reproduce un sonido de paso sutil al caminar sobre plataformas o escaleras.
     */
    public playStep(): void {
        if (this.isMuted || !this.ensureContext()) return;
        this.playTone(220, 0.04, 'square', 0.05);
    }

    /**
     * Reproduce el salto ágil de Vick emulando el sonido ascendente del PSG.
     */
    public playJump(): void {
        if (this.isMuted || !this.ensureContext()) return;
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    /**
     * Reproduce el crujido de excavación de arenisca con el pico.
     */
    public playDig(): void {
        if (this.isMuted || !this.ensureContext()) return;
        this.playNoise(0.08, 0.15);
        this.playTone(180, 0.06, 'sawtooth', 0.1);
    }

    /**
     * Reproduce el sonido de lanzamiento del cuchillo.
     */
    public playKnifeThrow(): void {
        if (this.isMuted || !this.ensureContext()) return;
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    /**
     * Reproduce el sonido al impactar y derrotar a una momia.
     */
    public playMummyDefeated(): void {
        if (this.isMuted || !this.ensureContext()) return;
        this.playNoise(0.2, 0.2);
        this.playTone(330, 0.1, 'square', 0.15, 0.0);
        this.playTone(440, 0.1, 'square', 0.15, 0.08);
        this.playTone(660, 0.15, 'square', 0.15, 0.16);
    }

    /**
     * Reproduce el tintineo brillante de recogida de una gema sagrada (Soul Stone).
     */
    public playGemPickup(): void {
        if (this.isMuted || !this.ensureContext()) return;
        this.playTone(587.33, 0.08, 'square', 0.15, 0.0);
        this.playTone(783.99, 0.08, 'square', 0.15, 0.07);
        this.playTone(1174.66, 0.14, 'square', 0.15, 0.14);
    }

    /**
     * Reproduce el sonido de recogida de herramienta (pico o cuchillo del suelo).
     */
    public playItemPickup(): void {
        if (this.isMuted || !this.ensureContext()) return;
        this.playTone(440, 0.08, 'square', 0.12, 0.0);
        this.playTone(659, 0.12, 'square', 0.12, 0.07);
    }

    /**
     * Reproduce la fanfarria de apertura de la puerta sellada de salida de la cámara.
     */
    public playDoorOpened(): void {
        if (this.isMuted || !this.ensureContext()) return;
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, idx) => {
            this.playTone(freq, 0.12, 'square', 0.15, idx * 0.1);
        });
    }

    /**
     * Reproduce el jingle de pérdida de vida (Game Over o caída en trampa).
     */
    public playDeath(): void {
        if (this.isMuted || !this.ensureContext()) return;
        const notes = [587, 523, 493, 440, 392, 349, 329];
        notes.forEach((freq, idx) => {
            this.playTone(freq, 0.15, 'square', 0.18, idx * 0.12);
        });
    }

    /**
     * Reproduce la fanfarria de nivel superado (Stage Clear).
     */
    public playStageClear(): void {
        if (this.isMuted || !this.ensureContext()) return;
        const notes = [523, 659, 783, 1046, 783, 1046];
        notes.forEach((freq, idx) => {
            this.playTone(freq, 0.18, 'square', 0.2, idx * 0.14);
        });
    }

    /**
     * Inicia la reproducción en bucle de la melodía principal retro de King's Valley.
     */
    public startMusic(): void {
        if (this.isMuted || this.musicInterval !== null || !this.ensureContext()) return;

        this.currentNoteIndex = 0;
        const playNextStep = () => {
            if (this.isMuted) return;
            const note = this.THEME_NOTES[this.currentNoteIndex];
            this.playTone(note.freq, note.dur, 'square', 0.06);

            // Bajo rítmico PSG simultáneo
            if (this.currentNoteIndex % 2 === 0) {
                this.playTone(note.freq / 2, note.dur * 0.9, 'triangle', 0.05);
            }

            this.currentNoteIndex = (this.currentNoteIndex + 1) % this.THEME_NOTES.length;
            const nextDuration = (note.dur * 1000) * 1.05;
            this.musicInterval = window.setTimeout(playNextStep, nextDuration);
        };

        playNextStep();
    }

    /**
     * Detiene la melodía de fondo.
     */
    public stopMusic(): void {
        if (this.musicInterval !== null) {
            clearTimeout(this.musicInterval);
            this.musicInterval = null;
        }
    }

    /**
     * Reproduce un tono elemental de frecuencia determinada.
     */
    private playTone(
        freq: number,
        duration: number,
        type: OscillatorType = 'square',
        volume: number = 0.1,
        delaySeconds: number = 0
    ): void {
        if (!this.ctx) return;
        const startTime = this.ctx.currentTime + delaySeconds;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    /**
     * Genera una ráfaga de ruido blanco emulando el canal de ruido del PSG.
     */
    private playNoise(duration: number, volume: number = 0.1): void {
        if (!this.ctx) return;
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start();
    }

    /**
     * Comprueba y asegura que el AudioContext esté instanciado y activo.
     */
    private ensureContext(): boolean {
        this.init();
        return this.ctx !== null && this.ctx.state === 'running';
    }
}
