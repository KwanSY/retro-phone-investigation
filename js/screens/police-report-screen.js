// js/screens/police-report-screen.js - Windows XP Style Police Report Form
import { state } from '../state.js';
import { playSubmitSound, playCrtBootSound, playButtonClickSound } from '../ui/audio-manager.js';
import { drawXPDesktop, drawXPWindow, drawXPButton, drawXPInputBox, drawXPSelectBox, drawXPMsgBox } from '../ui/xp-theme.js';

const CATEGORIES = ['咨询类', '误拨', '无法核实', '其他'];
const RESULT_SUGGESTIONS = ['无实质警情', '情节轻微', '已记录备查'];

let reportState = {
    activeField: null,       // 'content' or 'result'
    contentText: '',         // 警情内容
    categoryIdx: -1,         // 警情分类 index
    resultText: '',          // 处理结果
    showCategoryDropdown: false,
    showResultDropdown: false,
    cursorBlink: 0,
};

let submitState = {
    phase: null,             // null, 'POPUP'
};

let bootState = {
    active: true,
    startTime: 0,
    soundPlayed: false,
};

let hiddenInput = null;

function getHiddenInput() {
    if (!hiddenInput) {
        hiddenInput = document.createElement('textarea');
        hiddenInput.style.position = 'fixed';
        hiddenInput.style.left = '-9999px';
        hiddenInput.style.top = '-9999px';
        hiddenInput.style.opacity = '0';
        hiddenInput.setAttribute('autocomplete', 'off');
        document.body.appendChild(hiddenInput);

        hiddenInput.addEventListener('input', () => {
            if (state.screen !== 'POLICE_REPORT') return;
            if (reportState.activeField === 'content') {
                reportState.contentText = hiddenInput.value.slice(0, 200);
            } else if (reportState.activeField === 'result') {
                reportState.resultText = hiddenInput.value.replace(/\n/g, '').slice(0, 20);
            }
        });

        hiddenInput.addEventListener('keydown', (e) => {
            if (state.screen !== 'POLICE_REPORT') return;
            if (!reportState.activeField) return;

            if (e.key === 'Enter' && reportState.activeField === 'result') {
                e.preventDefault();
                reportState.activeField = null;
                reportState.showCategoryDropdown = false;
                reportState.showResultDropdown = false;
                hiddenInput.blur();
            }
        });
    }
    return hiddenInput;
}

function focusField(field) {
    if (submitState.phase) return;
    reportState.activeField = field;
    reportState.cursorBlink = 0;
    let input = getHiddenInput();
    if (field === 'content') {
        input.value = reportState.contentText;
    } else if (field === 'result') {
        input.value = reportState.resultText;
    }
    setTimeout(() => input.focus(), 0);
}

function blurField() {
    reportState.activeField = null;
    let input = getHiddenInput();
    input.blur();
}

function resetForm() {
    if (submitState.phase) return;
    reportState.contentText = '';
    reportState.categoryIdx = -1;
    reportState.resultText = '';
    reportState.showCategoryDropdown = false;
    reportState.showResultDropdown = false;
    reportState.activeField = null;
    let input = getHiddenInput();
    input.value = '';
    input.blur();
}

export function drawPoliceReportScreen(ctx, canvas) {
    let w = canvas.width, h = canvas.height;
    let now = performance.now();

    // 1. CRT Power-on Boot Sound Trigger
    if (bootState.active && !bootState.soundPlayed) {
        playCrtBootSound();
        bootState.startTime = now;
        bootState.soundPlayed = true;
    }

    // 2. Draw Windows XP Desktop Background
    drawXPDesktop(ctx, w, h);

    let isInteractive = !submitState.phase && !bootState.active;

    // 3. Draw Windows XP Dialog Window
    let winW = 700, winH = 570;
    let winX = (w - winW) / 2;
    let winY = (h - winH) / 2 - 10;

    let body = drawXPWindow(ctx, winX, winY, winW, winH, '接 警 记 录 单  - [ 110-20100609-0047 ]', '📝');
    let bx = body.x, by = body.y, bw = body.w;

    let labelX = bx + 25;
    let valueX = bx + 120;
    let fieldW = bw - 150;

    reportState.cursorBlink++;

    function drawLabel(text, y) {
        ctx.font = 'bold 13px "Tahoma", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = submitState.phase ? '#666666' : '#000000';
        ctx.fillText(text, labelX, y + 15);
    }

    function drawReadonly(text, y) {
        ctx.font = '13px "Tahoma", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = submitState.phase ? '#777777' : '#222222';
        ctx.fillText(text, valueX, y + 15);
    }

    // --- Form Fields ---

    // 1) 单号
    let rowY = by + 20;
    drawLabel('单　号：', rowY);
    drawReadonly('110-20100609-0047', rowY);

    // 2) 接警时间
    rowY = by + 50;
    drawLabel('接警时间：', rowY);
    drawReadonly('2010-06-09  23:52:41', rowY);

    // 3) 来电号码
    rowY = by + 80;
    drawLabel('来电号码：', rowY);
    drawReadonly('139XXXX2759', rowY);

    // 4) 报警人
    rowY = by + 110;
    drawLabel('报 警 人：', rowY);
    drawReadonly('许某  女  市二中', rowY);

    // 5) 事发地址
    rowY = by + 145;
    drawLabel('事发地址：', rowY);
    drawXPInputBox(ctx, valueX, rowY - 2, fieldW, 26, '', false, true);
    if (isInteractive) {
        state.addRegion(valueX, rowY - 2, fieldW, 26, () => {
            blurField();
            reportState.showCategoryDropdown = false;
            reportState.showResultDropdown = false;
        });
    }

    // 6) 警情内容 - multi-line height 110
    rowY = by + 185;
    let contentH = 110;
    drawLabel('警情内容：', rowY);
    let contentFocused = reportState.activeField === 'content';
    drawXPInputBox(ctx, valueX, rowY - 2, fieldW, contentH, reportState.contentText, contentFocused, Boolean(submitState.phase), true, reportState.cursorBlink);
    if (isInteractive) {
        state.addRegion(valueX, rowY - 2, fieldW, contentH, () => {
            focusField('content');
            reportState.showCategoryDropdown = false;
            reportState.showResultDropdown = false;
        });
    }

    // 7) 警情分类
    rowY = by + 310;
    let selectH = 26;
    drawLabel('警情分类：', rowY);
    let catDisplay = reportState.categoryIdx >= 0 ? CATEGORIES[reportState.categoryIdx] : '—— 请选择警情分类 ——';
    drawXPSelectBox(ctx, valueX, rowY - 2, fieldW, selectH, catDisplay, reportState.showCategoryDropdown);
    if (isInteractive) {
        state.addRegion(valueX, rowY - 2, fieldW, selectH, () => {
            reportState.showCategoryDropdown = !reportState.showCategoryDropdown;
            reportState.showResultDropdown = false;
            blurField();
        });
    }

    // 8) 处理结果 - combo box (clicking anywhere on the box toggles dropdown & focuses field)
    rowY = by + 355;
    let comboH = 26;
    let comboBtnW = 20;
    drawLabel('处理结果：', rowY);
    let resultFocused = reportState.activeField === 'result';

    drawXPInputBox(ctx, valueX, rowY - 2, fieldW - comboBtnW, comboH, reportState.resultText, resultFocused, Boolean(submitState.phase), false, reportState.cursorBlink);

    let btnX = valueX + fieldW - comboBtnW;
    drawXPButton(ctx, btnX, rowY - 2, comboBtnW, comboH, '▼', false, isInteractive, false);

    if (isInteractive) {
        state.addRegion(valueX, rowY - 2, fieldW, comboH, () => {
            reportState.showResultDropdown = !reportState.showResultDropdown;
            reportState.showCategoryDropdown = false;
            focusField('result');
        });
    }

    // Buttons at bottom right
    let btnY = by + 450;
    let submitEnabled = reportState.categoryIdx >= 0 && isInteractive;
    let submitHover = state.mouseX >= bx + bw / 2 - 120 && state.mouseX <= bx + bw / 2 - 20 &&
                      state.mouseY >= btnY && state.mouseY <= btnY + 32;

    drawXPButton(ctx, bx + bw / 2 - 120, btnY, 100, 32, '提  交', true, submitEnabled, submitHover);

    if (submitEnabled) {
        state.addRegion(bx + bw / 2 - 120, btnY, 100, 32, () => {
            playSubmitSound();
            state.reportCategory = CATEGORIES[reportState.categoryIdx];
            state.reportResult = reportState.resultText || '无实质警情';
            reportState.showCategoryDropdown = false;
            reportState.showResultDropdown = false;
            blurField();
            submitState.phase = 'POPUP';
            state.introPlayed = true;
        });
    }

    let resetHover = state.mouseX >= bx + bw / 2 + 20 && state.mouseX <= bx + bw / 2 + 120 &&
                     state.mouseY >= btnY && state.mouseY <= btnY + 32;

    drawXPButton(ctx, bx + bw / 2 + 20, btnY, 100, 32, '重  置', false, isInteractive, resetHover);
    if (isInteractive) {
        state.addRegion(bx + bw / 2 + 20, btnY, 100, 32, () => {
            resetForm();
        });
    }

    // Dropdown overlays
    if (isInteractive && reportState.showCategoryDropdown) {
        let ddY = by + 310 - 2 + selectH;
        let ddItemH = 26;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#316ac5';
        ctx.lineWidth = 1;
        ctx.fillRect(valueX, ddY, fieldW, ddItemH * CATEGORIES.length + 2);
        ctx.strokeRect(valueX, ddY, fieldW, ddItemH * CATEGORIES.length + 2);

        for (let i = 0; i < CATEGORIES.length; i++) {
            let iy = ddY + 1 + i * ddItemH;
            let isHover = state.mouseX >= valueX && state.mouseX <= valueX + fieldW &&
                          state.mouseY >= iy && state.mouseY <= iy + ddItemH;

            if (isHover) {
                ctx.fillStyle = '#316ac5';
                ctx.fillRect(valueX + 1, iy, fieldW - 2, ddItemH);
            }

            ctx.font = '13px "Tahoma", "Microsoft YaHei", sans-serif';
            ctx.fillStyle = isHover ? '#ffffff' : '#000000';
            ctx.fillText(CATEGORIES[i], valueX + 8, iy + 17);

            state.addRegion(valueX, iy, fieldW, ddItemH, () => {
                reportState.categoryIdx = i;
                reportState.showCategoryDropdown = false;
                if (i === 0) {
                    reportState.resultText = '无实质警情';
                    getHiddenInput().value = '无实质警情';
                }
            });
        }
    }

    if (isInteractive && reportState.showResultDropdown) {
        let ddY = by + 355 - 2 + comboH;
        let ddItemH = 26;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#316ac5';
        ctx.lineWidth = 1;
        ctx.fillRect(valueX, ddY, fieldW, ddItemH * RESULT_SUGGESTIONS.length + 2);
        ctx.strokeRect(valueX, ddY, fieldW, ddItemH * RESULT_SUGGESTIONS.length + 2);

        for (let i = 0; i < RESULT_SUGGESTIONS.length; i++) {
            let iy = ddY + 1 + i * ddItemH;
            let isHover = state.mouseX >= valueX && state.mouseX <= valueX + fieldW &&
                          state.mouseY >= iy && state.mouseY <= iy + ddItemH;

            if (isHover) {
                ctx.fillStyle = '#316ac5';
                ctx.fillRect(valueX + 1, iy, fieldW - 2, ddItemH);
            }

            ctx.font = '13px "Tahoma", "Microsoft YaHei", sans-serif';
            ctx.fillStyle = isHover ? '#ffffff' : '#000000';
            ctx.fillText(RESULT_SUGGESTIONS[i], valueX + 8, iy + 17);

            state.addRegion(valueX, iy, fieldW, ddItemH, () => {
                reportState.resultText = RESULT_SUGGESTIONS[i];
                reportState.showResultDropdown = false;
                getHiddenInput().value = RESULT_SUGGESTIONS[i];
            });
        }
    }

    // --- Windows XP Classic "已提交" Popup MsgBox (WAITS FOR USER CLICK ON "确定") ---
    if (submitState.phase === 'POPUP') {
        let popW = 340, popH = 145;
        let popX = (w - popW) / 2;
        let popY = (h - popH) / 2;

        drawXPMsgBox(ctx, popX, popY, popW, popH, '提示', '接警记录单已成功提交并归档。');

        let btnW = 80, btnH = 26;
        let popBodyY = popY + 32;
        let popBodyH = popH - 37;
        let confirmBtnX = popX + 3 + (popW - 6) / 2 - btnW / 2;
        let confirmBtnY = popBodyY + popBodyH - 38;

        // Click handler on '确定' button
        state.addRegion(confirmBtnX, confirmBtnY, btnW, btnH, () => {
            playButtonClickSound();
            submitState.phase = null;
            bootState.active = true; // prepare for next transition
            bootState.soundPlayed = false;
            state.screen = 'CLOCK_TRANSITION';
        });

        // Click handler on Titlebar Close '✕' button
        state.addRegion(popX + popW - 26, popY + 5, 21, 21, () => {
            playButtonClickSound();
            submitState.phase = null;
            bootState.active = true;
            bootState.soundPlayed = false;
            state.screen = 'CLOCK_TRANSITION';
        });
    }

    // --- CRT Boot Power-On Opening Effect (Point -> Horizontal -> Vertical) ---
    if (bootState.active) {
        let bootElapsed = now - bootState.startTime;

        if (bootElapsed >= 1000) {
            bootState.active = false;
        } else {
            ctx.save();
            if (bootElapsed < 350) {
                // Phase 1: Pitch black, expanding HORIZONTALLY from center point
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, w, h);

                let progress = bootElapsed / 350;
                let lineW = w * progress;
                let startX = (w - lineW) / 2;

                ctx.strokeStyle = '#ffffff';
                ctx.shadowColor = '#66aacc';
                ctx.shadowBlur = 18;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(startX, h / 2);
                ctx.lineTo(startX + lineW, h / 2);
                ctx.stroke();
            } else {
                // Phase 2: Full width horizontal line expanding VERTICALLY outwards
                let progress = (bootElapsed - 350) / 650;
                let openH = (h / 2) * progress;

                // Top black curtain
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, w, h / 2 - openH);
                // Bottom black curtain
                ctx.fillRect(0, h / 2 + openH, w, h / 2 - openH);

                // Upper & Lower glowing phosphor border lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.shadowColor = '#66aacc';
                ctx.shadowBlur = 12;
                ctx.lineWidth = 2.5;

                ctx.beginPath();
                ctx.moveTo(0, h / 2 - openH);
                ctx.lineTo(w, h / 2 - openH);
                ctx.moveTo(0, h / 2 + openH);
                ctx.lineTo(w, h / 2 + openH);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    // Non-interactive desktop background click-away
    if (isInteractive) {
        state.clickRegions.splice(0, 0, {
            x: 0, y: 0, w: w, h: h,
            onClick: () => {
                reportState.showCategoryDropdown = false;
                reportState.showResultDropdown = false;
                blurField();
            }
        });
    }
}
