// js/screens/police-report-screen.js - Windows 110 Police Dispatch Workstation Form
import { state } from '../state.js';
import { playSubmitSound, playCrtBootSound, playButtonClickSound } from '../ui/audio-manager.js';
import { 
    drawDeskEnvironment, 
    drawCRTMonitorFrame, 
    draw110DispatchWindow, 
    drawXPButton, 
    drawXPInputBox, 
    drawXPSelectBox, 
    drawXPTextareaWithScrollbar, 
    drawXPMsgBox, 
    drawLockIcon, 
    drawSmartABCBar 
} from '../ui/xp-theme.js';

const CATEGORIES = ['咨询类', '误拨', '无法核实', '其他'];
const RESULT_SUGGESTIONS = ['无实质警情', '情节轻微', '已记录备查'];

let reportState = {
    activeField: null,       // 'content' or 'result'
    contentText: '',         // 警情内容 (自由输入，不预填)
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

    // 1. Render Full Night Duty Desk Environment
    drawDeskEnvironment(ctx, w, h);

    // CRT Monitor Frame & Screen glass bounds (scaled to fit comfortably on 1200x760 canvas)
    let sx = 224, sy = 94, sw = 742, sh = 567;

    let isInteractive = !submitState.phase && !bootState.active;

    // 2. Render Screen Glass Content (110 Dispatch System V2.3 fills 100% of the screen glass)
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sw, sh);
    ctx.clip();
    ctx.translate(sx, sy);

    let body = draw110DispatchWindow(ctx, 0, 0, sw, sh, '110接处警系统 V2.3 —— 接处警工作台 ——', '2010-06-09 23:56:13');
    let bx = body.x, by = body.y, bw = body.w, bh = body.h;

    // Fill form background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx, by, bw, bh);

    let labelX = bx + 32;
    let valueX = bx + 115;
    let fieldW = bw - 150;

    reportState.cursorBlink++;

    function drawLabel(text, y) {
        ctx.font = 'bold 12px "SimSun", "Songti SC", sans-serif';
        ctx.fillStyle = submitState.phase ? '#666666' : '#000000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, labelX, y + 10);
    }

    function drawReadonly(text, y) {
        ctx.font = '12px "SimSun", "Songti SC", sans-serif';
        ctx.fillStyle = submitState.phase ? '#777777' : '#222222';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, valueX, y + 10);
    }

    // --- Form Fields ---

    // 1) 单号
    let rowY = by + 12;
    drawLabel('单　　号：', rowY);
    drawReadonly('110-20100609-0047', rowY);

    // 2) 接警时间
    rowY = by + 38;
    drawLabel('接警时间：', rowY);
    drawReadonly('2010-06-09 23:52:41', rowY);
    drawLockIcon(ctx, valueX + 145, rowY + 3);

    // 3) 来电号码
    rowY = by + 64;
    drawLabel('来电号码：', rowY);
    drawReadonly('139XXXX2759', rowY);
    drawLockIcon(ctx, valueX + 95, rowY + 3);

    // 4) 报警人 (显示全名：许念)
    rowY = by + 90;
    drawLabel('报 警 人：', rowY);
    drawReadonly('许念  女    单位/学校：市二中', rowY);
    drawLockIcon(ctx, valueX + 205, rowY + 3);

    // 5) 事发地址
    rowY = by + 118;
    drawLabel('事发地址：', rowY);
    drawXPInputBox(ctx, valueX, rowY - 2, fieldW, 22, '', false, true);
    if (isInteractive) {
        state.addRegion(sx + valueX, sy + rowY - 2, fieldW, 22, () => {
            blurField();
            reportState.showCategoryDropdown = false;
            reportState.showResultDropdown = false;
        });
    }

    // 6) 警情内容 - multiline textarea with vertical scrollbar
    rowY = by + 148;
    let contentH = 115;
    drawLabel('警情内容：', rowY);
    let contentFocused = reportState.activeField === 'content';
    drawXPTextareaWithScrollbar(ctx, valueX, rowY - 2, fieldW, contentH, reportState.contentText, contentFocused, Boolean(submitState.phase), reportState.cursorBlink);
    if (isInteractive) {
        state.addRegion(sx + valueX, sy + rowY - 2, fieldW, contentH, () => {
            focusField('content');
            reportState.showCategoryDropdown = false;
            reportState.showResultDropdown = false;
        });
    }

    // 7) 警情分类
    rowY = by + 272;
    let selectH = 26;
    let selectW = 210;
    drawLabel('警情分类：', rowY);
    let catDisplay = reportState.categoryIdx >= 0 ? `【 ${CATEGORIES[reportState.categoryIdx]} 】` : '【 请选择警情分类 】';
    drawXPSelectBox(ctx, valueX, rowY - 2, selectW, selectH, catDisplay, reportState.showCategoryDropdown);
    if (isInteractive) {
        state.addRegion(sx + valueX, sy + rowY - 2, selectW, selectH, () => {
            reportState.showCategoryDropdown = !reportState.showCategoryDropdown;
            reportState.showResultDropdown = false;
            blurField();
        });
    }

    // 8) 处理结果 - combo box
    rowY = by + 308;
    let comboH = 26;
    let comboW = 210;
    let comboBtnW = 18;
    drawLabel('处理结果：', rowY);
    let resultFocused = reportState.activeField === 'result';

    drawXPInputBox(ctx, valueX, rowY - 2, comboW - comboBtnW, comboH, reportState.resultText, resultFocused, Boolean(submitState.phase), false, reportState.cursorBlink);

    let btnX = valueX + comboW - comboBtnW;
    drawXPButton(ctx, btnX, rowY - 2, comboBtnW, comboH, '▼', false, isInteractive, false);

    if (isInteractive) {
        state.addRegion(sx + valueX, sy + rowY - 2, comboW, comboH, () => {
            reportState.showResultDropdown = !reportState.showResultDropdown;
            reportState.showCategoryDropdown = false;
            focusField('result');
        });
    }

    // --- Submit & Reset Buttons ---
    let btnY = by + 352;
    let submitEnabled = reportState.categoryIdx >= 0 && isInteractive;
    let submitHover = state.mouseX >= sx + bx + bw / 2 - 105 && state.mouseX <= sx + bx + bw / 2 - 10 &&
                      state.mouseY >= sy + btnY && state.mouseY <= sy + btnY + 28;

    drawXPButton(ctx, bx + bw / 2 - 105, btnY, 95, 28, '【 提 交 】', true, submitEnabled, submitHover);

    if (submitEnabled) {
        state.addRegion(sx + bx + bw / 2 - 105, sy + btnY, 95, 28, () => {
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

    let resetHover = state.mouseX >= sx + bx + bw / 2 + 10 && state.mouseX <= sx + bx + bw / 2 + 105 &&
                     state.mouseY >= sy + btnY && state.mouseY <= sy + btnY + 28;

    drawXPButton(ctx, bx + bw / 2 + 10, btnY, 95, 28, '【 重 置 】', false, isInteractive, resetHover);
    if (isInteractive) {
        state.addRegion(sx + bx + bw / 2 + 10, sy + btnY, 95, 28, () => {
            resetForm();
        });
    }

    // Floating Smart ABC Bar on Bottom Right of screen
    drawSmartABCBar(ctx, bx + bw - 215, by + bh - 28);

    // Dropdown overlays
    if (isInteractive && reportState.showCategoryDropdown) {
        let ddY = by + 272 - 2 + selectH;
        let ddItemH = 26;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 1;
        ctx.fillRect(valueX, ddY, selectW, ddItemH * CATEGORIES.length + 2);
        ctx.strokeRect(valueX, ddY, selectW, ddItemH * CATEGORIES.length + 2);

        for (let i = 0; i < CATEGORIES.length; i++) {
            let iy = ddY + 1 + i * ddItemH;
            let isHover = state.mouseX >= sx + valueX && state.mouseX <= sx + valueX + selectW &&
                          state.mouseY >= sy + iy && state.mouseY <= sy + iy + ddItemH;

            if (isHover) {
                ctx.fillStyle = '#000080';
                ctx.fillRect(valueX + 1, iy, selectW - 2, ddItemH);
            }

            ctx.font = '12px "SimSun", "Songti SC", sans-serif';
            ctx.fillStyle = isHover ? '#ffffff' : '#000000';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(CATEGORIES[i], valueX + 8, iy + 12);

            state.addRegion(sx + valueX, sy + iy, selectW, ddItemH, () => {
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
        let ddY = by + 248 - 2 + comboH;
        let ddItemH = 24;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 1;
        ctx.fillRect(valueX, ddY, comboW, ddItemH * RESULT_SUGGESTIONS.length + 2);
        ctx.strokeRect(valueX, ddY, comboW, ddItemH * RESULT_SUGGESTIONS.length + 2);

        for (let i = 0; i < RESULT_SUGGESTIONS.length; i++) {
            let iy = ddY + 1 + i * ddItemH;
            let isHover = state.mouseX >= sx + valueX && state.mouseX <= sx + valueX + comboW &&
                          state.mouseY >= sy + iy && state.mouseY <= sy + iy + ddItemH;

            if (isHover) {
                ctx.fillStyle = '#000080';
                ctx.fillRect(valueX + 1, iy, comboW - 2, ddItemH);
            }

            ctx.font = '12px "SimSun", "Songti SC", sans-serif';
            ctx.fillStyle = isHover ? '#ffffff' : '#000000';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(RESULT_SUGGESTIONS[i], valueX + 8, iy + 12);

            state.addRegion(sx + valueX, sy + iy, comboW, ddItemH, () => {
                reportState.resultText = RESULT_SUGGESTIONS[i];
                reportState.showResultDropdown = false;
                getHiddenInput().value = RESULT_SUGGESTIONS[i];
            });
        }
    }

    // --- Windows XP Classic "已提交" Popup MsgBox ---
    if (submitState.phase === 'POPUP') {
        let popW = 340, popH = 145;
        let popX = Math.round((sw - popW) / 2);
        let popY = Math.round((sh - popH) / 2);

        drawXPMsgBox(ctx, popX, popY, popW, popH, '提示', '接警记录单已成功提交并归档。');

        let btnW = 80, btnH = 26;
        let popBodyY = popY + 32;
        let popBodyH = popH - 37;
        let confirmBtnX = popX + 3 + (popW - 6) / 2 - btnW / 2;
        let confirmBtnY = popBodyY + popBodyH - 38;

        // Click handler on '确定' button
        state.addRegion(sx + confirmBtnX, sy + confirmBtnY, btnW, btnH, () => {
            playButtonClickSound();
            submitState.phase = null;
            bootState.active = true;
            bootState.soundPlayed = false;
            state.screen = 'CLOCK_TRANSITION';
        });

        // Click handler on Titlebar Close '✕' button
        state.addRegion(sx + popX + popW - 26, sy + popY + 5, 21, 21, () => {
            playButtonClickSound();
            submitState.phase = null;
            bootState.active = true;
            bootState.soundPlayed = false;
            state.screen = 'CLOCK_TRANSITION';
        });
    }

    // --- CRT Boot Power-On Opening Effect ---
    if (bootState.active) {
        let bootElapsed = now - bootState.startTime;

        if (bootElapsed >= 1000) {
            bootState.active = false;
        } else {
            ctx.save();
            if (bootElapsed < 350) {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, sw, sh);

                let progress = bootElapsed / 350;
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
                let progress = (bootElapsed - 350) / 650;
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
    }

    ctx.restore(); // End screen clipping & translation

    // 3. Render CRT Monitor Bezel with authentic bevels, power button & recording badge
    drawCRTMonitorFrame(ctx, sx, sy, sw, sh);

    // Click away to close dropdowns
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
