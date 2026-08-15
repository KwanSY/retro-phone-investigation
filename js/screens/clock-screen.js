// js/screens/clock-screen.js - Clock transition + Case notification cutscene (Windows XP Theme)
import { state } from '../state.js';
import { wrapText } from '../ui/canvas-utils.js';
import { playNotificationAlertSound, playButtonClickSound, playNotificationSound, playCrtBootSound } from '../ui/audio-manager.js';
import { 
    drawDeskEnvironment, 
    drawCRTMonitorFrame, 
    draw110DispatchWindow, 
    drawXPWindow, 
    drawXPButton, 
    drawXPInputBox, 
    drawXPSelectBox, 
    drawXPTextareaWithScrollbar, 
    drawLockIcon, 
    drawSmartABCBar 
} from '../ui/xp-theme.js';

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
];

const TICK_DURATION = 1000;
const DAY_STATE_DURATION = 2000; // 2 seconds hold on Day State 08:00:00

// --- Notification text ---
const NOTIF_TITLE = '【案件通报】';
const NOTIF_BODY =
    '2010年6月10日 06:47，接群众报警：城东区泗水北路旧纺织厂宿舍3号楼下发现一具女尸。\n' +
    '\n' +
    '死者：许念，女，16岁，市二中高二（3）班学生。\n' +
    '\n' +
    '初步判断为坠楼，具体死因待勘。请原接警值班民警出现场，配合调查。';
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
// Phase 1: STAGE 4 - STANDBY BIG CLOCK JUMP (23:59:59 -> 08:00:00)
// =====================================================================
function drawClockPhase(ctx, w, h, now, elapsed) {
    let totalNightTime = CLOCK_ENTRIES.length * TICK_DURATION; // 4s
    let totalClockDuration = totalNightTime + DAY_STATE_DURATION; // 4s + 2s = 6s total

    if (elapsed < totalNightTime) {
        // --- Standby Night Mode: Pitch Black Screen with Glowing Amber Digital Clock ---
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        let idx = Math.min(CLOCK_ENTRIES.length - 1, Math.floor(elapsed / TICK_DURATION));
        let dateStr = CLOCK_ENTRIES[idx].date;
        let timeStr = CLOCK_ENTRIES[idx].time;

        let colonVisible = Math.floor(now / 500) % 2 === 0;
        let displayTime = colonVisible ? timeStr : timeStr.replace(/:/g, ' ');

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Date on top
        ctx.font = '32px "Courier New", monospace';
        ctx.fillStyle = '#ffbf00';
        ctx.shadowColor = '#ffbf00';
        ctx.shadowBlur = 14;
        ctx.fillText(dateStr, w / 2, h / 2 - 45);

        // Huge Time below
        ctx.font = 'bold 72px "Courier New", monospace';
        ctx.shadowBlur = 20;
        ctx.fillText(displayTime, w / 2, h / 2 + 25);
        ctx.shadowBlur = 0;
        ctx.restore();

        drawScanlines(ctx, w, h);
    } else {
        // --- Day State Hard Cut (#E8E0D4 Warm Light Daybreak Screen) ---
        ctx.fillStyle = '#e8ded0';
        ctx.fillRect(0, 0, w, h);

        let dateStr = '2010.06.10';
        let timeStr = '08:00:00';
        let colonVisible = Math.floor(now / 500) % 2 === 0;
        let displayTime = colonVisible ? timeStr : timeStr.replace(/:/g, ' ');

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Date on top
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.fillStyle = '#222222';
        ctx.fillText(dateStr, w / 2, h / 2 - 45);

        // Huge Time below
        ctx.font = 'bold 72px "Courier New", monospace';
        ctx.fillText(displayTime, w / 2, h / 2 + 25);
        ctx.restore();
    }

    // Transition to Stage 5-7 Notification Phase
    if (elapsed >= totalClockDuration) {
        clockState.phase = PHASE.NOTIFICATION;
        clockState.phaseStart = performance.now();
        clockState.notifCrtBooted = false;
    }
}

// =====================================================================
// Phase 2: STAGE 5-7 - NEXT MORNING DEATH BRIEFING (Workstation + XP Modal)
// =====================================================================
function drawNotificationPhase(ctx, w, h, now, elapsed) {
    if (!clockState.notifCrtBooted) {
        playCrtBootSound();
        clockState.notifCrtBooted = true;
    }

    // 1. Render Full Night Duty Desk Environment
    drawDeskEnvironment(ctx, w, h);

    // CRT Monitor Frame & Screen glass bounds (scaled to fit comfortably on 1200x760 canvas)
    let sx = 224, sy = 94, sw = 742, sh = 567;

    // 2. Render Screen Glass Content
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sw, sh);
    ctx.clip();
    ctx.translate(sx, sy);

    // 2a. Morning Workstation background (blank form waiting for calls)
    let body = draw110DispatchWindow(ctx, 0, 0, sw, sh, '110接处警系统 V2.3 —— 处警调度工作台 ——', '2010-06-10 08:00:15');
    let bx = body.x, by = body.y, bw = body.w, bh = body.h;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx, by, bw, bh);

    let labelX = bx + 32;
    let valueX = bx + 115;
    let fieldW = bw - 150;

    function drawLabel(text, y) {
        ctx.font = 'bold 12px "SimSun", "Songti SC", sans-serif';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, labelX, y + 10);
    }

    function drawReadonly(text, y) {
        ctx.font = '12px "SimSun", "Songti SC", sans-serif';
        ctx.fillStyle = '#555555';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, valueX, y + 10);
    }

    // Morning clean blank form rows
    let r1 = by + 12;
    drawLabel('单　　号：', r1); drawReadonly('110-20100610-0001', r1);
    let r2 = by + 38;
    drawLabel('接警时间：', r2); drawReadonly('2010-06-10 08:00:15', r2); drawLockIcon(ctx, valueX + 145, r2 + 3);
    let r3 = by + 64;
    drawLabel('来电号码：', r3); drawReadonly('—', r3);
    let r4 = by + 90;
    drawLabel('报 警 人：', r4); drawReadonly('—', r4);

    // Multiline form content
    let r5 = by + 118;
    drawLabel('事发地址：', r5);
    drawXPInputBox(ctx, valueX, r5 - 2, fieldW, 22, '', false, true);

    let r6 = by + 148;
    drawLabel('警情内容：', r6);
    drawXPTextareaWithScrollbar(ctx, valueX, r6 - 2, fieldW, 115, '', false, true, 0);

    // Category & Result
    let r7 = by + 272;
    drawLabel('警情分类：', r7);
    drawXPSelectBox(ctx, valueX, r7 - 2, 210, 26, '【 请选择警情分类 】', false);

    let r8 = by + 308;
    drawLabel('处理结果：', r8);
    drawXPInputBox(ctx, valueX, r8 - 2, 210 - 18, 26, '', false, true, false, 0);
    drawXPButton(ctx, valueX + 210 - 18, r8 - 2, 18, 26, '▼', false, false, false);

    // Buttons
    let btnY = by + 352;
    drawXPButton(ctx, bx + bw / 2 - 105, btnY, 95, 28, '【 提 交 】', false, false, false);
    drawXPButton(ctx, bx + bw / 2 + 10, btnY, 95, 28, '【 重 置 】', false, false, false);

    // Floating Smart ABC Bar on Bottom Right
    drawSmartABCBar(ctx, bx + bw - 215, by + bh - 28);

    // --- 2b. Pop up 案件通报 Window after 1.8s ---
    let popupDelay = 1800;
    if (elapsed >= popupDelay) {
        if (!clockState.notifSoundPlayed) {
            playNotificationAlertSound();
            clockState.notifSoundPlayed = true;
        }

        let popElapsed = elapsed - popupDelay;
        let backdropAlpha = Math.min(0.35, (popElapsed / 250) * 0.35);

        // Modal Backdrop Overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${backdropAlpha})`;
        ctx.fillRect(0, 0, sw, sh);

        // Modal Dialog Window: ■ 案件通报
        let popW = 480, popH = 340;
        let popX = Math.round((sw - popW) / 2);
        let popY = Math.round((sh - popH) / 2 - 10);

        let popBody = drawXPWindow(ctx, popX, popY, popW, popH, '案件通报', '📢');
        let pbx = popBody.x, pby = popBody.y, pbw = popBody.w;

        let padX = 24;
        let contentX = pbx + padX;
        let notifY = pby + 16;
        let contentMaxW = pbw - padX * 2;

        // Red Title
        ctx.textAlign = 'center';
        ctx.font = 'bold 15px "SimHei", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#cc0000';
        ctx.fillText(NOTIF_TITLE, pbx + pbw / 2, notifY);

        // Body Text (Songti 13px)
        let textY = notifY + 22;
        ctx.textAlign = 'left';
        ctx.font = '13px "SimSun", "Songti SC", sans-serif';
        ctx.fillStyle = '#111111';

        let bodyHeight = wrapText(ctx, NOTIF_BODY, contentX, textY, contentMaxW, 19);

        // Footer
        let footerY = textY + bodyHeight + 8;
        ctx.textAlign = 'right';
        ctx.font = '12px "SimSun", sans-serif';
        ctx.fillStyle = '#444444';
        ctx.fillText(NOTIF_FOOTER, pbx + pbw - padX, footerY);

        // --- 关联警情 & 定性 (Fades in 2s AFTER window opens, i.e., popElapsed >= 2000ms) ---
        if (popElapsed >= 2000) {
            let metaAlpha = Math.min(1, (popElapsed - 2000) / 400);

            ctx.save();
            ctx.globalAlpha = metaAlpha;

            let lineY = footerY + 12;
            let metaY = lineY + 16;

            // Inset separator line
            ctx.strokeStyle = '#c0b8a4';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(contentX, lineY);
            ctx.lineTo(pbx + pbw - padX, lineY);
            ctx.stroke();

            ctx.textAlign = 'left';
            ctx.font = '12px "SimSun", "Songti SC", sans-serif';
            ctx.fillStyle = '#7a4e00';

            ctx.fillText('关联警情：2010年6月9日 23:52 · 110呼入 · 通话47秒', contentX, metaY);
            let categoryStr = state.reportCategory || '咨询类';
            let resultStr = state.reportResult || '无实质警情';
            ctx.fillText(`定性：${categoryStr}，${resultStr}。`, contentX, metaY + 18);

            ctx.restore();
        }

        // --- 【出 现 场】 Button (displays 1s after metadata fades in, i.e., popElapsed >= 3000ms) ---
        if (popElapsed >= 3000) {
            let btnW = 100;
            let btnH = 28;
            let btnX = pbx + pbw / 2 - btnW / 2;
            let btnY = pby + popBody.h - 38;

            let isHover = state.mouseX >= sx + btnX && state.mouseX <= sx + btnX + btnW &&
                          state.mouseY >= sy + btnY && state.mouseY <= sy + btnY + btnH;

            drawXPButton(ctx, btnX, btnY, btnW, btnH, '【出现场】', true, true, isHover);

            // Click handler to trigger Stage 8 Title Sequence
            state.addRegion(sx + btnX, sy + btnY, btnW, btnH, () => {
                playButtonClickSound();
                clockState.phase = PHASE.SHUTDOWN_CUTSCENE;
                clockState.cutsceneStart = performance.now();
                clockState.playedSmsSound = false;
            });
        }
    }

    // CRT opening expansion overlay
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

    // 3. Render CRT Monitor Bezel with authentic bevels, power button & recording badge
    drawCRTMonitorFrame(ctx, sx, sy, sw, sh);
}

// =====================================================================
// Phase 3: STAGE 8 - FINAL STAGE TITLE SEQUENCE (2010.6.10 08:01)
// =====================================================================
function drawShutdownCutscene(ctx, w, h, now) {
    let elapsed = now - clockState.cutsceneStart;

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

    // Play Nokia SMS Sound ONCE right at 600ms
    if (!clockState.playedSmsSound) {
        playNotificationSound();
        clockState.playedSmsSound = true;
    }

    let alpha = 1;
    if (elapsed >= 3800) {
        alpha = Math.max(0, 1 - (elapsed - 3800) / 1000);
    }

    if (elapsed >= 4800) {
        clockState = null;
        state.screen = 'START_SCREEN';
        return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    // Large Game Title: 《最后一条消息》
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 44px "SimSun", "Songti SC", serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    ctx.shadowBlur = 12;
    ctx.fillText('《最后一条消息》', w / 2, h / 2 - 20);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '14px "Courier New", "SimSun", monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText('记录编号 110-20100609-0047 · 已归档', w / 2, h / 2 + 35);

    ctx.restore();

    // Click to skip title card
    state.addRegion(0, 0, w, h, () => {
        clockState = null;
        state.screen = 'START_SCREEN';
    });
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
