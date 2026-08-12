// js/screens/clock-screen.js - Clock transition + case notification cutscene
import { state } from '../state.js';
import { roundRect, wrapText } from '../ui/canvas-utils.js';
import { playNotificationAlertSound, playButtonClickSound } from '../ui/audio-manager.js';

// --- Phase constants ---
const PHASE = {
    CLOCK:        'CLOCK',
    NOTIFICATION: 'NOTIFICATION',
};

// --- Clock sequence: entries displayed in order ---
const CLOCK_ENTRIES = [
    { date: '2010.06.09', time: '23:59:56' },
    { date: '2010.06.09', time: '23:59:57' },
    { date: '2010.06.09', time: '23:59:58' },
    { date: '2010.06.09', time: '23:59:59' },
    { date: '2010.06.10', time: '00:00:00' },
];

const TICK_DURATION = 1000;
const MIDNIGHT_HOLD_MS = 1000;
const JUMP_HOLD_MS = 1000;

// --- Notification text ---
const NOTIF_TITLE = '【案件通报】';
const NOTIF_BODY =
    '2010年6月10日 06:47，接群众报警：城东区泗水北路旧纺织厂宿舍3号楼下发现一具女尸。\n' +
    '\n' +
    '死者：许念，女，16岁，市二中高二（3）班学生。\n' +
    '\n' +
    '初步判断为坠楼，具体死因待勘。\n' +
    '\n' +
    '请原接警值班民警出现场，配合调查。';
const NOTIF_FOOTER = '指挥中心  2010-06-10';

// --- Internal state ---
let clockState = null;

function resetClockState() {
    clockState = {
        phase: PHASE.CLOCK,
        phaseStart: 0,
        initialized: false,
        playedAlertSound: false,
    };
}

// =====================================================================
// Main draw function
// =====================================================================
export function drawClockScreen(ctx, canvas) {
    let w = canvas.width, h = canvas.height;
    if (w === 0 || h === 0) return;

    if (!clockState) resetClockState();
    let now = performance.now();

    if (!clockState.initialized) {
        clockState.phaseStart = now;
        clockState.initialized = true;
    }

    // Black background every frame
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    let elapsed = now - clockState.phaseStart;

    if (clockState.phase === PHASE.CLOCK) {
        drawClockPhase(ctx, w, h, now, elapsed);
        return;
    }

    if (clockState.phase === PHASE.NOTIFICATION) {
        drawNotificationPhase(ctx, w, h, now, elapsed);
        return;
    }
}

// =====================================================================
// Phase 1: CLOCK
// =====================================================================
function drawClockPhase(ctx, w, h, now, elapsed) {
    let totalTickTime = CLOCK_ENTRIES.length * TICK_DURATION; // 5s for :56 to 00:00:00
    let totalClockDuration = totalTickTime + JUMP_HOLD_MS;    // 5s + 1s hold on 08:00:00 = 6s total

    let dateStr, timeStr;
    if (elapsed < totalTickTime) {
        let idx = Math.min(CLOCK_ENTRIES.length - 1, Math.floor(elapsed / TICK_DURATION));
        dateStr = CLOCK_ENTRIES[idx].date;
        timeStr = CLOCK_ENTRIES[idx].time;
    } else {
        dateStr = '2010.06.10';
        timeStr = '08:00:00';
    }

    let colonVisible = Math.floor(now / 500) % 2 === 0;
    let displayTime = colonVisible ? timeStr : timeStr.replace(/:/g, ' ');
    let displayStr = `${dateStr}  ${displayTime}`;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '48px "Courier New", monospace';

    ctx.shadowColor = '#66aacc';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#66aacc';
    ctx.fillText(displayStr, w / 2, h / 2);

    ctx.shadowBlur = 8;
    ctx.fillText(displayStr, w / 2, h / 2);

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.restore();

    drawScanlines(ctx, w, h);

    if (elapsed >= totalClockDuration) {
        clockState.phase = PHASE.NOTIFICATION;
        clockState.phaseStart = performance.now();
        playNotificationAlertSound();
    }
}

// =====================================================================
// Phase 2: CASE_NOTIFICATION
// =====================================================================
function drawNotificationPhase(ctx, w, h, now, elapsed) {
    let opacity = Math.min(1, elapsed / 500);

    ctx.save();
    ctx.globalAlpha = opacity;

    let panelW = 660;
    let panelH = 500;
    let panelX = (w - panelW) / 2;
    let panelY = (h - panelH) / 2;
    let padding = 32;

    // Panel background
    ctx.fillStyle = 'rgba(20, 10, 10, 0.95)';
    ctx.strokeStyle = '#cc4444';
    ctx.lineWidth = 2;
    roundRect(ctx, panelX, panelY, panelW, panelH, 12, true, true);

    // Title
    let contentX = panelX + padding;
    let contentY = panelY + padding + 16;
    let contentMaxW = panelW - padding * 2;

    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillStyle = '#cc4444';
    ctx.fillText(NOTIF_TITLE, w / 2, contentY);

    // Body text
    let bodyY = contentY + 36;
    ctx.textAlign = 'left';
    ctx.font = '15px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillStyle = '#cccccc';

    let bodyHeight = wrapText(ctx, NOTIF_BODY, contentX, bodyY, contentMaxW, 25);

    // Footer
    let footerY = bodyY + bodyHeight + 15;
    ctx.textAlign = 'right';
    ctx.font = '15px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(NOTIF_FOOTER, panelX + panelW - padding, footerY);

    // --- 关联警情 & 定性 (displays after 2s / 2000ms) ---
    if (elapsed >= 2000) {
        let metaY = footerY + 30;

        // Separator line
        ctx.strokeStyle = 'rgba(204, 68, 68, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(contentX, metaY - 12);
        ctx.lineTo(panelX + panelW - padding, metaY - 12);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.font = '14px "Microsoft YaHei", "PingFang SC", sans-serif';
        ctx.fillStyle = '#d4a359';

        ctx.fillText('关联警情：2010年6月9日 23:52 · 110呼入 · 通话47秒', contentX, metaY + 6);
        let categoryStr = state.reportCategory || '咨询类';
        let resultStr = state.reportResult || '无实质警情';
        ctx.fillText(`定性：${categoryStr}，${resultStr}。`, contentX, metaY + 28);
    }

    // --- 【出现场】 button (displays after 3s / 3000ms) ---
    if (elapsed >= 3000) {
        let btnW = 160;
        let btnH = 42;
        let btnX = (w - btnW) / 2;
        let btnY = panelY + panelH - 60;

        let isHover = state.mouseX >= btnX && state.mouseX <= btnX + btnW &&
                      state.mouseY >= btnY && state.mouseY <= btnY + btnH;

        ctx.fillStyle = isHover ? '#243a52' : '#162333';
        ctx.strokeStyle = isHover ? '#66b2ff' : '#4a9eff';
        ctx.lineWidth = 1.5;
        roundRect(ctx, btnX, btnY, btnW, btnH, 6, true, true);

        ctx.font = 'bold 17px "Microsoft YaHei", "PingFang SC", sans-serif';
        ctx.fillStyle = isHover ? '#ffffff' : '#66b2ff';
        ctx.textAlign = 'center';
        ctx.fillText('出 现 场', w / 2, btnY + 26);
        ctx.textAlign = 'left';

        // Click handler
        state.addRegion(btnX, btnY, btnW, btnH, () => {
            playButtonClickSound();
            clockState = null;
            state.screen = 'START_SCREEN';
        });
    }

    ctx.restore();
}

// =====================================================================
// Scanline overlay effect
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

