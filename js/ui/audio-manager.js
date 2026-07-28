// js/ui/audio-manager.js - Web Audio API Synthesizer Engine for Game SFX

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// User interaction hook to unlock audio context
export function initAudio() {
    getAudioContext();
}

/**
 * Message Notification Sound (High-tech retro dual-tone chime)
 * Triggered when a new message from Ferryman arrives
 */
export function playNotificationSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Tone 1: E6 (1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.5, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Tone 2: A6 (1760 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now + 0.08);
    gain2.gain.setValueAtTime(0.2, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.3);
}

/**
 * Wrong Answer Warning Sound (Descending error buzz)
 * Triggered on the first incorrect option selection
 */
export function playWrongAnswerSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.25);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
}

/**
 * Glitch / Evidence Destroyed Sound (Dramatic warning sweep)
 * Triggered on the second incorrect option selection
 */
export function playGlitchDestroySound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Alarm sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);

    // Sub bass rumble
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'square';
    sub.frequency.setValueAtTime(150, now + 0.1);
    sub.frequency.linearRampToValueAtTime(50, now + 0.6);

    subGain.gain.setValueAtTime(0.2, now + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now + 0.1);
    sub.stop(now + 0.6);
}

/**
 * Game Over Sound (Deep minor chord & bass drop)
 * Triggered when transitioning to the GAME_OVER screen
 */
export function playGameOverSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Heavy bass drop
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(180, now);
    bass.frequency.exponentialRampToValueAtTime(35, now + 1.2);

    bassGain.gain.setValueAtTime(0.35, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    bass.connect(bassGain);
    bassGain.connect(ctx.destination);
    bass.start(now);
    bass.stop(now + 1.2);

    // Minor chord sting (C minor: C4, Eb4, G4)
    [261.63, 311.13, 392.00].forEach(freq => {
        const chord = ctx.createOscillator();
        const chordGain = ctx.createGain();
        chord.type = 'triangle';
        chord.frequency.setValueAtTime(freq, now + 0.1);
        chordGain.gain.setValueAtTime(0.12, now + 0.1);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

        chord.connect(chordGain);
        chordGain.connect(ctx.destination);
        chord.start(now + 0.1);
        chord.stop(now + 1.0);
    });
}
