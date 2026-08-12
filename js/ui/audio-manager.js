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
    
    // Clear Nokia "嘀—嘀" SMS Chime
    // Beep 1 ("嘀"): E6 (1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.5, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // Beep 2 ("嘀"): E6 (1318.5 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now + 0.13);
    gain2.gain.setValueAtTime(0.35, now + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.13);
    osc2.stop(now + 0.22);

    // High resolution tail: A6 (1760 Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1760, now + 0.26);
    gain3.gain.setValueAtTime(0.4, now + 0.26);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.26);
    osc3.stop(now + 0.42);
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

/**
 * Phone Ring Sound (Old-style landline dual-tone ring)
 * Two sine oscillators at 440Hz + 480Hz, 2 ring bursts
 * Returns total duration in ms so caller can time the sequence
 */
export function playPhoneRingSound() {
    const ctx = getAudioContext();
    if (!ctx) return 5000;

    const now = ctx.currentTime;
    const ringOn = 1.0;   // each ring burst duration (seconds)
    const ringOff = 1.5;  // silence between bursts
    const ringCount = 2;
    const totalDuration = ringCount * ringOn + (ringCount - 1) * ringOff + 0.5;

    for (let r = 0; r < ringCount; r++) {
        let tStart = now + r * (ringOn + ringOff);

        // Dual-tone: 440Hz + 480Hz (standard US ring cadence)
        [440, 480].forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, tStart);

            // Ring envelope: quick attack, sustain, quick release
            gain.gain.setValueAtTime(0.001, tStart);
            gain.gain.linearRampToValueAtTime(0.12, tStart + 0.02);
            gain.gain.setValueAtTime(0.12, tStart + ringOn - 0.02);
            gain.gain.linearRampToValueAtTime(0.001, tStart + ringOn);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(tStart);
            osc.stop(tStart + ringOn);
        });
    }

    return totalDuration * 1000;
}

/**
 * Phone Pickup Sound (Short click/clunk)
 * Quick noise burst ~50ms at low volume
 */
export function playPhonePickupSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.05;

    // Generate white noise buffer
    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Low-pass filter for a thuddy click
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + duration);
}

/**
 * Phone Hangup Sound (Disconnect click + brief dial tone)
 * Short noise click (30ms) followed by a 480Hz sine tone (200ms) that fades out
 * Total duration ~300ms
 */
export function playPhoneHangupSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // --- Click: 30ms noise burst (slightly brighter than pickup) ---
    const clickDuration = 0.03;
    const bufferSize = Math.ceil(ctx.sampleRate * clickDuration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.18, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + clickDuration);

    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'lowpass';
    clickFilter.frequency.setValueAtTime(1200, now);

    noise.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + clickDuration);

    // --- Disconnect tone: 480Hz sine, 200ms, fading out ---
    const toneStart = now + 0.05;
    const toneDuration = 0.2;

    const osc = ctx.createOscillator();
    const toneGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, toneStart);

    toneGain.gain.setValueAtTime(0.14, toneStart);
    toneGain.gain.exponentialRampToValueAtTime(0.001, toneStart + toneDuration);

    osc.connect(toneGain);
    toneGain.connect(ctx.destination);
    osc.start(toneStart);
    osc.stop(toneStart + toneDuration);
}

/**
 * Submit Form Sound (Low thud + confirmation tone)
 */
export function playSubmitSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Low thud
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(80, now);
    bassGain.gain.setValueAtTime(0.2, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    bass.connect(bassGain);
    bassGain.connect(ctx.destination);
    bass.start(now);
    bass.stop(now + 0.1);

    // Confirmation tone
    const tone = ctx.createOscillator();
    const toneGain = ctx.createGain();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(660, now + 0.05);
    toneGain.gain.setValueAtTime(0.15, now + 0.05);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    tone.connect(toneGain);
    toneGain.connect(ctx.destination);
    tone.start(now + 0.05);
    tone.stop(now + 0.2);
}

/**
 * Case Notification Sound (Ascending alert chime)
 */
export function playNotificationAlertSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const tones = [
        { freq: 523.25, start: 0.0, dur: 0.15 },
        { freq: 659.25, start: 0.12, dur: 0.15 },
        { freq: 783.99, start: 0.24, dur: 0.25 },
    ];

    tones.forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(t.freq, now + t.start);

        gain.gain.setValueAtTime(0.12, now + t.start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t.start);
        osc.stop(now + t.start + t.dur);
    });
}

/**
 * General Button Click Sound
 */
export function playButtonClickSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
}

/**
 * CRT Degauss / Old Monitor Power-On Sound ("嗡" heavy degaussing hum)
 */
export function playCrtBootSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dur = 1.2;

    // 1. Heavy Degaussing Thud (Coil punch: 70Hz -> 25Hz)
    const degauss = ctx.createOscillator();
    const degaussGain = ctx.createGain();
    degauss.type = 'sine';
    degauss.frequency.setValueAtTime(80, now);
    degauss.frequency.exponentialRampToValueAtTime(25, now + 0.4);

    degaussGain.gain.setValueAtTime(0.001, now);
    degaussGain.gain.linearRampToValueAtTime(0.35, now + 0.04);
    degaussGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    degauss.connect(degaussGain);
    degaussGain.connect(ctx.destination);
    degauss.start(now);
    degauss.stop(now + 0.5);

    // 2. Power Capacitor & Coil Hum ("嗡" 100Hz -> 50Hz)
    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    hum.type = 'triangle';
    hum.frequency.setValueAtTime(110, now + 0.05);
    hum.frequency.exponentialRampToValueAtTime(45, now + dur);

    humGain.gain.setValueAtTime(0.001, now + 0.05);
    humGain.gain.linearRampToValueAtTime(0.2, now + 0.15);
    humGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    hum.connect(humGain);
    humGain.connect(ctx.destination);
    hum.start(now + 0.05);
    hum.stop(now + dur);

    // 3. High Frequency Flyback Transformer Whine (~15.6kHz CRT sync tone)
    const whine = ctx.createOscillator();
    const whineGain = ctx.createGain();
    whine.type = 'sine';
    whine.frequency.setValueAtTime(14500, now);
    whine.frequency.linearRampToValueAtTime(15625, now + 0.4);

    whineGain.gain.setValueAtTime(0.001, now);
    whineGain.gain.linearRampToValueAtTime(0.04, now + 0.1);
    whineGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    whine.connect(whineGain);
    whineGain.connect(ctx.destination);
    whine.start(now);
    whine.stop(now + 0.8);
}



