// js/screens/intro-screen.js - Intro call sequence before start screen
import { state } from '../state.js';
import { playPhoneRingSound, stopPhoneRingSound, playPhonePickupSound, playPhoneHangupSound } from '../ui/audio-manager.js';

// --- Dialogue lines ---
const LINES = [
    '110，请讲。',
    '……',
    '……你好。',
    '我叫许念，市二中高二（3）班的。',
    '嗯，你说。什么事？',
    '我想问一下——',
    '如果有人，一直、一直找你麻烦。',
    '报警，有用吗？',
    '什么性质的麻烦？有人身安全威胁吗？',
    '……',
    '……没有了。没事了。',
    '姑娘？你需要——',
    '对不起，打扰了。晚安。',
];

// --- Timing constants (ms) ---
const BLACK_WAIT_MS    = 1000;
const RING_DURATION_MS = 5000;  // updated from playPhoneRingSound return value at runtime
const CHAR_DELAY_MS    = 90;
const LINE_PAUSE_MS    = 1200;
const ELLIPSIS_PAUSE   = 600;
const HANGUP_MS        = 1000;
const HANGUP_SHOW_MS   = 200;
const FADE_DURATION_MS = 1000;

// --- Phases ---
const PHASE = {
    WAIT_CLICK:  'WAIT_CLICK',
    BLACK_WAIT:  'BLACK_WAIT',
    RINGING:     'RINGING',
    PICKUP:      'PICKUP',
    TEXT_REVEAL: 'TEXT_REVEAL',
    HANGUP:      'HANGUP',
    FADE_OUT:    'FADE_OUT',
    DONE:        'DONE',
};

// --- Internal state (self-contained, not on global state) ---
let intro = null;

function resetIntro() {
    intro = {
        phase: PHASE.WAIT_CLICK,
        phaseStart: 0,
        phaseStartSet: false,
        ringStarted: false,
        lineIdx: 0,
        charIdx: 0,
        lineStart: 0,
        ringDuration: RING_DURATION_MS,
        fadePct: 0,
    };
}

function isEllipsisLine(line) {
    return line.trim() === '……';
}

function skipIntro() {
    stopPhoneRingSound();
    state.introPlayed = true;
    state.screen = 'POLICE_REPORT';
    intro = null;
}

export function drawIntroScreen(ctx, canvas) {
    let w = canvas.width, h = canvas.height;
    if (w === 0 || h === 0) return;

    // Lazy init
    if (!intro) resetIntro();
    let now = performance.now();

    // --- Full black background ---
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // --- WAIT_CLICK phase: Show "- 点击开始 -" prompt ---
    if (intro.phase === PHASE.WAIT_CLICK) {
        let pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(now * Math.PI * 2 / 1800));

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '22px "Courier New", "Microsoft YaHei", monospace';
        ctx.fillStyle = `rgba(200, 200, 200, ${pulse})`;
        ctx.fillText('- 点击开始 -', w / 2, h / 2);
        ctx.restore();

        // Full canvas click region to start
        state.addRegion(0, 0, w, h, () => {
            intro.phase = PHASE.RINGING;
            intro.phaseStart = performance.now();
            intro.ringDuration = playPhoneRingSound() || RING_DURATION_MS;
        });
        return;
    }

    if (!intro.phaseStartSet) {
        intro.phaseStart = now;
        intro.phaseStartSet = true;
    }

    let elapsed = now - intro.phaseStart;

    // --- Phase machine ---
    if (intro.phase === PHASE.BLACK_WAIT) {
        if (elapsed >= 300) {
            intro.phase = PHASE.RINGING;
            intro.phaseStart = now;
            intro.ringDuration = playPhoneRingSound() || RING_DURATION_MS;
        }
        return;
    }

    if (intro.phase === PHASE.RINGING) {
        // Visual indicator so the player never sees a confusing black screen
        let ringPulse = 0.5 + 0.5 * Math.sin(now * 0.008);
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '18px "Courier New", "Microsoft YaHei", monospace';
        ctx.fillStyle = `rgba(255, 200, 100, ${ringPulse})`;
        ctx.fillText('📞 110 线路 03 · 呼入中...', w / 2, h / 2 - 15);

        ctx.font = '13px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = 'rgba(160, 160, 160, 0.6)';
        ctx.fillText('- 点击任意处接听 -', w / 2, h / 2 + 25);
        ctx.restore();

        // Clicking during ring picks up immediately
        state.addRegion(0, 0, w, h, () => {
            intro.phase = PHASE.PICKUP;
            intro.phaseStart = performance.now();
            playPhonePickupSound();
        });

        if (elapsed >= intro.ringDuration) {
            intro.phase = PHASE.PICKUP;
            intro.phaseStart = now;
            playPhonePickupSound();
        }
        return;
    }

    if (intro.phase === PHASE.PICKUP) {
        // Short pause after pickup click before text starts
        if (elapsed >= 300) {
            intro.phase = PHASE.TEXT_REVEAL;
            intro.phaseStart = now;
            intro.lineIdx = 0;
            intro.charIdx = 0;
            intro.lineStart = now;
        }
        return;
    }

    if (intro.phase === PHASE.TEXT_REVEAL) {
        drawTextReveal(ctx, w, h, now);
        drawRecordingIndicator(ctx, w, now);

        // Clicking during text reveal advances to the next line or skips
        state.addRegion(0, 0, w, h, () => {
            if (intro.lineIdx < LINES.length - 1) {
                intro.lineIdx++;
                intro.lineStart = performance.now();
                intro.charIdx = 0;
            } else {
                skipIntro();
            }
        });
        return;
    }

    if (intro.phase === PHASE.HANGUP) {
        // First HANGUP_SHOW_MS: still show lines + indicator, then black
        if (elapsed < HANGUP_SHOW_MS) {
            drawAllLines(ctx, w, h);
            drawRecordingIndicator(ctx, w, now);
        }
        if (elapsed >= HANGUP_MS) {
            intro.phase = PHASE.FADE_OUT;
            intro.phaseStart = now;
        }
        return;
    }

    if (intro.phase === PHASE.FADE_OUT) {
        let fadePct = Math.min(1, elapsed / FADE_DURATION_MS);
        if (fadePct >= 1) {
            skipIntro();
        }
        return;
    }
}

// --- Text reveal logic ---
function drawTextReveal(ctx, w, h, now) {
    let lineY = h * 0.25;
    let lineSpacing = 34;

    ctx.textAlign = 'center';
    ctx.font = '20px "Courier New", monospace';

    // Draw all fully-revealed lines
    for (let i = 0; i < intro.lineIdx; i++) {
        ctx.fillStyle = '#c8c8c8';
        ctx.fillText(LINES[i], w / 2, lineY + i * lineSpacing);
    }

    // Current line typewriter
    if (intro.lineIdx < LINES.length) {
        let line = LINES[intro.lineIdx];
        let ellipsis = isEllipsisLine(line);
        let charDelay = ellipsis ? 0 : CHAR_DELAY_MS;

        if (ellipsis) {
            // Ellipsis lines: show instantly, short pause
            ctx.fillStyle = '#c8c8c8';
            ctx.fillText(line, w / 2, lineY + intro.lineIdx * lineSpacing);

            let sinceLineStart = now - intro.lineStart;
            if (sinceLineStart >= ELLIPSIS_PAUSE) {
                intro.lineIdx++;
                intro.lineStart = now;
                intro.charIdx = 0;
            }
        } else {
            // Normal typewriter
            let sinceLineStart = now - intro.lineStart;
            let charsToShow = Math.min(line.length, Math.floor(sinceLineStart / CHAR_DELAY_MS));
            intro.charIdx = charsToShow;

            let partial = line.substring(0, charsToShow);
            ctx.fillStyle = '#c8c8c8';
            ctx.fillText(partial, w / 2, lineY + intro.lineIdx * lineSpacing);

            // Line fully revealed → pause then next
            if (charsToShow >= line.length) {
                let timeSinceComplete = sinceLineStart - line.length * CHAR_DELAY_MS;
                if (timeSinceComplete >= LINE_PAUSE_MS) {
                    intro.lineIdx++;
                    intro.lineStart = now;
                    intro.charIdx = 0;
                }
            }
        }
    }

    // All lines done → transition to hangup
    if (intro.lineIdx >= LINES.length) {
        intro.phase = PHASE.HANGUP;
        intro.phaseStart = now;
        playPhoneHangupSound();
    }

    ctx.textAlign = 'left';
}

// --- Draw all lines fully revealed ---
function drawAllLines(ctx, w, h) {
    let lineY = h * 0.25;
    let lineSpacing = 34;

    ctx.textAlign = 'center';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillStyle = '#c8c8c8';

    for (let i = 0; i < LINES.length; i++) {
        ctx.fillText(LINES[i], w / 2, lineY + i * lineSpacing);
    }
    ctx.textAlign = 'left';
}

// --- Recording indicator ---
function drawRecordingIndicator(ctx, w, now) {
    let dotOpacity = 0.15 + 0.25 * (0.5 + 0.5 * Math.sin(now * Math.PI * 2 / 1000));

    ctx.save();
    ctx.textAlign = 'right';
    ctx.font = '14px "Courier New", monospace';

    // Label text at fixed low opacity
    ctx.fillStyle = 'rgba(128, 128, 128, 0.4)';
    ctx.fillText('常驻 线路 03 · 录音中', w - 50, 30);

    // Pulsing red dot
    ctx.fillStyle = `rgba(255, 60, 60, ${dotOpacity})`;
    ctx.fillText('●', w - 20, 30);

    ctx.restore();
}
