// js/screens/clock-screen.js - Clock transition + Case notification cutscene (Windows XP Theme)
import { state } from '../state.js';
import { wrapText } from '../ui/canvas-utils.js';
import { playNotificationAlertSound, playButtonClickSound, playNotificationSound, playCrtBootSound } from '../ui/audio-manager.js';
import { drawXPDesktop, drawXPWindow, drawXPButton, drawCRTMonitorFrame } from '../ui/xp-theme.js';

// --- Phase constants ---
const PHASE = {
    CLOCK:             'CLOCK',
    NOTIFICATION:      'NOTIFICATION',
    SHUTDOWN_CUTSCENE: 'SHUTDOWN_CUTSCENE',
};

// --- Clock sequence entries ---
const CLOCK_ENTRIES = [
    { date: '2010.06.09', time: '23:59:56' },
    { date: '2010.06.09', time: '23:59:57' },
    { date: '2010.06.09', time: '23:59:58' },
    { date: '2010.06.09', time: '23:59:59' },
    { date: '2010.06.10', time: '00:00:00' },
];

const TICK_DURATION = 1000;
const WHITE_DAYBREAK_DURATION = 2000; // 2 seconds hold on White Screen

// --- Notification text ---
const NOTIF_TITLE = '【 案 件 通 报 】';
const NOTIF_BODY =
    '2010年6月10日 06:47，接群众报警：城东区泗水北路旧纺织厂宿舍3号楼下发现一具女尸。\n' +
    '\n' +
    '死者：许念，女，16岁，市二中高二（3）班学生。\n' +
    '\n' +
    '初步判断为坠楼，具体死因待勘。\n' +
    '\n' +
    '请原接警值班民警出现场，配合调查。';
const NOTIF_FOOTER = '指挥中心  2010-06-10';

// --- Module-local state ---
let clockState = null;

function resetClockState() {
    clockState = {
        phase: PHASE.CLOCK,
        phaseStart: 0,
        initialized: false,
        cutsceneStart: 0,
        playedSmsSound: false,
        notifCrtBooted: false,
    };
}

export function drawClockScreen(ctx, canvas) {
    let w = canvas.width, h = canvas.height;
    if (w === 0 || h === 0) return;

    if (!clockState) resetClockState();
    let now = performance.now();

    if (!clockState.initialized) {
        clockState.phaseStart = now;
        clockState.initialized = true;
    }

    let elapsed = now - clockState.phaseStart;

    if (clockState.phase === PHASE.CLOCK) {
        drawClockPhase(ctx, w, h, now, elapsed);
        return;
    }

    if (clockState.phase === PHASE.NOTIFICATION) {
        drawNotificationPhase(ctx, w, h, now, elapsed);
        return;
    }

    if (clockState.phase === PHASE.SHUTDOWN_CUTSCENE) {
        drawShutdownCutscene(ctx, w, h, now);
        return;
    }
}

// =====================================================================
// Phase 1: CLOCK (Standby monitor mode -> White Screen Daybreak)
// =====================================================================
function drawClockPhase(ctx, w, h, now, elapsed) {
    let totalTickTime = CLOCK_ENTRIES.length * TICK_DURATION; // 5s for :56 to 00:00:00
    let totalClockDuration = totalTickTime + WHITE_DAYBREAK_DURATION; // 5s + 2s white screen = 7s total

    if (elapsed < totalTickTime) {
        // --- Standby Pitch Black Screen with Amber Digital Clock ---
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        let idx = Math.min(CLOCK_ENTRIES.length - 1, Math.floor(elapsed / TICK_DURATION));
        let dateStr = CLOCK_ENTRIES[idx].date;
        let timeStr = CLOCK_ENTRIES[idx].time;

        let colonVisible = Math.floor(now / 500) % 2 === 0;
        let displayTime = colonVisible ? timeStr : timeStr.replace(/:/g, ' ');
        let displayStr = `${dateStr}  ${displayTime}`;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '48px "Courier New", monospace';

        ctx.shadowColor = '#ffbf00';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffbf00';
        ctx.fillText(displayStr, w / 2, h / 2);

        ctx.shadowBlur = 8;
        ctx.fillText(displayStr, w / 2, h / 2);

        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.restore();

        drawScanlines(ctx, w, h);
    } else {
        // --- Daybreak White Screen (2 seconds) ---
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        let dateStr = '2010.06.10';
        let timeStr = '08:00:00';
        let colonVisible = Math.floor(now / 500) % 2 === 0;
        let displayTime = colonVisible ? timeStr : timeStr.replace(/:/g, ' ');
        let displayStr = `${dateStr}  ${displayTime}`;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 48px "Courier New", monospace';
        ctx.fillStyle = '#333333';
        ctx.fillText(displayStr, w / 2, h / 2);
        ctx.restore();
    }

    // Transition to Notification Phase
    if (elapsed >= totalClockDuration) {
        clockState.phase = PHASE.NOTIFICATION;
        clockState.phaseStart = performance.now();
        clockState.notifCrtBooted = false;
    }
}

// =====================================================================
// Phase 2: CASE NOTIFICATION (Windows XP Window on XP Desktop + CRT Boot)
// =====================================================================
function drawNotificationPhase(ctx, w, h, now, elapsed) {
    if (!clockState.notifCrtBooted) {
        playCrtBootSound();
        playNotificationAlertSound();
        clockState.notifCrtBooted = true;
    }

    let sh = 680;
    let sw = Math.round(sh * (4 / 3)); // 907
    let sx = Math.round((w - sw) / 2); // 146
    let sy = Math.round((h - sh) / 2 - 8); // 32

    // Dark Room Background
    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sw, sh);
    ctx.clip();
    ctx.translate(sx, sy);

    // 1. Draw XP Desktop Wallpaper
    drawXPDesktop(ctx, sw, sh);

    // 2. Draw Windows Case Notification Dialog Window
    let winW = 620, winH = 480;
    let winX = Math.round((sw - winW) / 2);
    let winY = Math.round((sh - winH) / 2 - 10);

    let body = drawXPWindow(ctx, winX, winY, winW, winH, '系统通知 - [ 案件通报 ]', '📢');
    let bx = body.x, by = body.y, bw = body.w;

    let padding = 25;
    let contentX = bx + padding;
    let contentY = by + 20;
    let contentMaxW = bw - padding * 2;

    // Notification Title
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px "Microsoft YaHei", "SimHei", sans-serif';
    ctx.fillStyle = '#cc1111';
    ctx.fillText(NOTIF_TITLE, bx + bw / 2, contentY);

    // Body text
    let bodyY = contentY + 30;
    ctx.textAlign = 'left';
    ctx.font = '14px "Microsoft YaHei", "SimSun", sans-serif';
    ctx.fillStyle = '#222222';

    let bodyHeight = wrapText(ctx, NOTIF_BODY, contentX, bodyY, contentMaxW, 23);

    // Footer
    let footerY = bodyY + bodyHeight + 12;
    ctx.textAlign = 'right';
    ctx.font = '13px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#555555';
    ctx.fillText(NOTIF_FOOTER, bx + bw - padding, footerY);

    // --- 关联警情 & 定性 (Fades in 2s AFTER window fully opens, i.e., 1000ms boot + 2000ms = 3000ms) ---
    if (elapsed >= 3000) {
        let metaAlpha = Math.min(1, (elapsed - 3000) / 400);

        ctx.save();
        ctx.globalAlpha = metaAlpha;

        let lineY = footerY + 16;
        let metaY = lineY + 22; // padded spacing below line

        // Inset separator line
        ctx.strokeStyle = '#d0ccb8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(contentX, lineY);
        ctx.lineTo(bx + bw - padding, lineY);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.font = '13px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#8b5a00';

        ctx.fillText('关联警情：2010年6月9日 23:52 · 110呼入 · 通话47秒', contentX, metaY);
        let categoryStr = state.reportCategory || '咨询类';
        let resultStr = state.reportResult || '无实质警情';
        ctx.fillText(`定性：${categoryStr}，${resultStr}。`, contentX, metaY + 22);

        ctx.restore();
    }

    // --- 【出 现 场】 Button (displays 1s after metadata fades in, i.e., 4000ms) ---
    if (elapsed >= 4000) {
        let btnW = 120;
        let btnH = 32;
        let btnX = bx + bw / 2 - btnW / 2;
        let btnY = by + body.h - 45;

        let isHover = state.mouseX >= sx + btnX && state.mouseX <= sx + btnX + btnW &&
                      state.mouseY >= sy + btnY && state.mouseY <= sy + btnY + btnH;

        drawXPButton(ctx, btnX, btnY, btnW, btnH, '出 现 场', true, true, isHover);

        // Click handler to trigger Shutdown Cutscene
        state.addRegion(sx + btnX, sy + btnY, btnW, btnH, () => {
            playButtonClickSound();
            clockState.phase = PHASE.SHUTDOWN_CUTSCENE;
            clockState.cutsceneStart = performance.now();
            clockState.playedSmsSound = false;
        });
    }

    // --- CRT Opening Expansion Overlay ---
    if (elapsed < 1000) {
        ctx.save();
        if (elapsed < 350) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, sw, sh);

            let progress = elapsed / 350;
            let lineW = sw * progress;
            let startX = (sw - lineW) / 2;

            ctx.strokeStyle = '#ffffff';
            ctx.shadowColor = '#66aacc';
            ctx.shadowBlur = 18;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX, sh / 2);
            ctx.lineTo(startX + lineW, sh / 2);
            ctx.stroke();
        } else {
            let progress = (elapsed - 350) / 650;
            let openH = (sh / 2) * progress;

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, sw, sh / 2 - openH);
            ctx.fillRect(0, sh / 2 + openH, sw, sh / 2 - openH);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.shadowColor = '#66aacc';
            ctx.shadowBlur = 12;
            ctx.lineWidth = 2.5;

            ctx.beginPath();
            ctx.moveTo(0, sh / 2 - openH);
            ctx.lineTo(sw, sh / 2 - openH);
            ctx.moveTo(0, sh / 2 + openH);
            ctx.lineTo(sw, sh / 2 + openH);
            ctx.stroke();
        }
        ctx.restore();
    }

    ctx.restore(); // End CRT screen clip

    // Render Beige CRT Monitor Housing OVER screen
    drawCRTMonitorFrame(ctx, sx, sy, sw, sh);
}

// =====================================================================
// Phase 3: SHUTDOWN CUTSCENE & GAME TITLE CARD
// =====================================================================
function drawShutdownCutscene(ctx, w, h, now) {
    let elapsed = now - clockState.cutsceneStart;

    // 0 - 600ms: Shutdown fade to black (monitor power off)
    // 600ms: Play Nokia SMS chime ("嘀—嘀")
    // 600ms - 5600ms: Title card on pitch black (5 seconds hold)
    // 5600ms - 6600ms: Fade out to black (1 second)

    // Pitch black screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    if (elapsed < 600) {
        // Monitor turning off fade
        let dim = elapsed / 600;
        ctx.fillStyle = `rgba(0, 0, 0, ${dim})`;
        ctx.fillRect(0, 0, w, h);
        return;
    }

    // Play Nokia SMS Sound ONCE right at 600ms when screen is fully black
    if (!clockState.playedSmsSound) {
        playNotificationSound();
        clockState.playedSmsSound = true;
    }

    let alpha = 1;
    if (elapsed >= 3600) {
        alpha = Math.max(0, 1 - (elapsed - 3600) / 1000);
    }

    if (elapsed >= 4600) {
        clockState = null;
        state.screen = 'START_SCREEN';
        return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    // Large Game Title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 42px "Microsoft YaHei", "SimHei", sans-serif';
    ctx.fillStyle = '#ffffff';

    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 12;
    ctx.fillText('最后一条信息', w / 2, h / 2 - 20);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '15px "Courier New", "SimSun", monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText('记录编号 110-20100609-0047 · 已归档', w / 2, h / 2 + 35);

    ctx.restore();
}

// =====================================================================
// Scanline overlay helper
// =====================================================================
function drawScanlines(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 3) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
    }
    ctx.restore();
}
