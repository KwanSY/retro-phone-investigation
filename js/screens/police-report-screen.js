// js/screens/police-report-screen.js - Police report form (接警记录单)
import { state } from '../state.js';
import { roundRect } from '../ui/canvas-utils.js';
import { playSubmitSound } from '../ui/audio-manager.js';

// --- Category & result dropdown options ---
const CATEGORIES = ['咨询类', '误拨', '无法核实', '其他'];
const RESULT_SUGGESTIONS = ['无实质警情', '情节轻微', '已记录备查'];

// --- Module-local state ---
let reportState = {
    activeField: null,       // 'content' or 'result'
    contentText: '',         // 警情内容
    categoryIdx: -1,         // 警情分类 index (-1 = not selected)
    resultText: '',          // 处理结果
    showCategoryDropdown: false,
    showResultDropdown: false,
    cursorBlink: 0,          // for blinking cursor animation
};

let submitState = {
    phase: null,             // null, 'FREEZE', 'STAMP'
    startTime: 0,
};

// --- Hidden textarea for IME / Chinese text support & multi-line ---
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

// --- Main draw function ---
export function drawPoliceReportScreen(ctx, canvas) {
    let w = canvas.width, h = canvas.height;

    // Handle submit animation sequence
    if (submitState.phase) {
        let elapsed = performance.now() - submitState.startTime;
        if (elapsed >= 1500) {
            submitState.phase = null;
            state.screen = 'CLOCK_TRANSITION';
            return;
        }
        if (elapsed >= 500) {
            submitState.phase = 'STAMP';
        }
    }

    // Dark background
    ctx.fillStyle = '#0b0f17';
    ctx.fillRect(0, 0, w, h);

    // Panel dimensions
    let pw = 700, ph = 620;
    let px = (w - pw) / 2;
    let py = (h - ph) / 2;

    let isInteractive = !submitState.phase;

    // Panel background
    ctx.fillStyle = submitState.phase === 'STAMP' ? '#141b26' : '#1a2332';
    ctx.strokeStyle = submitState.phase === 'STAMP' ? '#1e334a' : '#2a4a6b';
    ctx.lineWidth = 1.5;
    roundRect(ctx, px, py, pw, ph, 12, true, true);

    // Subtle inner glow line at top
    ctx.strokeStyle = 'rgba(74, 158, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 30, py + 1);
    ctx.lineTo(px + pw - 30, py + 1);
    ctx.stroke();

    // --- Title ---
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Microsoft YaHei", "SimHei", Arial';
    ctx.fillStyle = submitState.phase === 'STAMP' ? '#3377aa' : '#4a9eff';
    ctx.fillText('接 警 记 录 单', px + pw / 2, py + 38);
    ctx.textAlign = 'left';

    // Separator line under title
    ctx.strokeStyle = 'rgba(74, 158, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 30, py + 52);
    ctx.lineTo(px + pw - 30, py + 52);
    ctx.stroke();

    // --- Layout constants ---
    let labelX = px + 25;
    let valueX = px + 125;
    let fieldW = pw - 155;
    let labelFont = '14px "Microsoft YaHei", "SimHei", Arial';
    let valueFont = '14px "Microsoft YaHei", "SimHei", Arial';
    let labelColor = submitState.phase === 'STAMP' ? '#446688' : '#6688aa';
    let readonlyColor = submitState.phase === 'STAMP' ? '#667788' : '#8899aa';
    let inputBg = submitState.phase === 'STAMP' ? '#091018' : '#0d1520';
    let inputTextColor = submitState.phase === 'STAMP' ? '#aaa' : '#ddd';
    let focusBorder = '#4a9eff';
    let normalBorder = submitState.phase === 'STAMP' ? '#1a3048' : '#2a4a6b';

    reportState.cursorBlink++;

    function drawLabel(text, y) {
        ctx.font = labelFont;
        ctx.fillStyle = labelColor;
        ctx.fillText(text, labelX, y + 14);
    }

    function drawReadonly(text, y) {
        ctx.font = valueFont;
        ctx.fillStyle = readonlyColor;
        ctx.fillText(text, valueX, y + 14);
    }

    function drawInputBox(x, y, bw, bh, text, isFocused, isDisabled, isMultiline = false) {
        ctx.fillStyle = isDisabled ? '#111820' : inputBg;
        ctx.strokeStyle = isFocused && isInteractive ? focusBorder : normalBorder;
        ctx.lineWidth = isFocused && isInteractive ? 1.5 : 1;
        roundRect(ctx, x, y, bw, bh, 4, true, true);

        ctx.font = valueFont;
        ctx.fillStyle = isDisabled ? '#445566' : inputTextColor;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 6, y + 4, bw - 12, bh - 8);
        ctx.clip();

        if (isMultiline) {
            let lines = (text || '').split('\n');
            let lh = 20;
            let lastLineY = y + 18;
            let lastLineW = 0;

            for (let i = 0; i < lines.length; i++) {
                let curY = y + 18 + i * lh;
                ctx.fillText(lines[i], x + 8, curY);
                if (i === lines.length - 1) {
                    lastLineY = curY;
                    lastLineW = ctx.measureText(lines[i]).width;
                }
            }

            if (isFocused && isInteractive && Math.floor(reportState.cursorBlink / 30) % 2 === 0) {
                let cursorX = x + 8 + lastLineW;
                ctx.strokeStyle = '#4a9eff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cursorX, lastLineY - 14);
                ctx.lineTo(cursorX, lastLineY + 2);
                ctx.stroke();
            }
        } else {
            ctx.fillText(text || '', x + 8, y + bh / 2 + 5);

            if (isFocused && isInteractive && Math.floor(reportState.cursorBlink / 30) % 2 === 0) {
                let textW = ctx.measureText(text || '').width;
                let cursorX = x + 8 + textW;
                if (cursorX < x + bw - 8) {
                    ctx.strokeStyle = '#4a9eff';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(cursorX, y + 4);
                    ctx.lineTo(cursorX, y + bh - 4);
                    ctx.stroke();
                }
            }
        }
        ctx.restore();
    }

    function drawSelectBox(x, y, bw, bh, displayText, isOpen) {
        ctx.fillStyle = inputBg;
        ctx.strokeStyle = isOpen && isInteractive ? focusBorder : normalBorder;
        ctx.lineWidth = isOpen && isInteractive ? 1.5 : 1;
        roundRect(ctx, x, y, bw, bh, 4, true, true);

        ctx.font = valueFont;
        ctx.fillStyle = displayText.includes('请选择') ? '#556677' : inputTextColor;
        ctx.fillText(displayText, x + 8, y + bh / 2 + 5);

        let ax = x + bw - 20, ay = y + bh / 2;
        ctx.fillStyle = '#6688aa';
        ctx.beginPath();
        if (isOpen) {
            ctx.moveTo(ax - 4, ay + 2);
            ctx.lineTo(ax + 4, ay + 2);
            ctx.lineTo(ax, ay - 3);
        } else {
            ctx.moveTo(ax - 4, ay - 2);
            ctx.lineTo(ax + 4, ay - 2);
            ctx.lineTo(ax, ay + 3);
        }
        ctx.closePath();
        ctx.fill();
    }

    function drawButton(x, y, bw, bh, text, bgColor, hoverColor, enabled) {
        let isHover = enabled && isInteractive &&
            state.mouseX >= x && state.mouseX <= x + bw &&
            state.mouseY >= y && state.mouseY <= y + bh;
        ctx.fillStyle = isHover ? hoverColor : bgColor;
        ctx.strokeStyle = isHover ? '#5599dd' : 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, bw, bh, 6, true, true);

        ctx.font = 'bold 15px "Microsoft YaHei", "SimHei", Arial';
        ctx.fillStyle = enabled && isInteractive ? '#fff' : '#777';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + bw / 2, y + bh / 2 + 5);
        ctx.textAlign = 'left';
    }

    // --- Form fields ---

    // 1) 单号
    let rowY = py + 70;
    drawLabel('单　号', rowY);
    drawReadonly('110-20100609-0047', rowY);

    // 2) 接警时间
    rowY = py + 100;
    drawLabel('接警时间', rowY);
    drawReadonly('2010-06-09  23:52:41', rowY);

    // 3) 来电号码
    rowY = py + 130;
    drawLabel('来电号码', rowY);
    drawReadonly('139XXXX2759', rowY);

    // 4) 报警人
    rowY = py + 160;
    drawLabel('报 警 人', rowY);
    drawReadonly('许某  女  市二中', rowY);

    // 5) 事发地址
    rowY = py + 200;
    drawLabel('事发地址', rowY);
    drawInputBox(valueX, rowY - 3, fieldW, 28, '', false, true);
    if (isInteractive) {
        state.addRegion(valueX, rowY - 3, fieldW, 28, () => {
            blurField();
            reportState.showCategoryDropdown = false;
            reportState.showResultDropdown = false;
        });
    }

    // 6) 警情内容 - multi-line height 80
    rowY = py + 245;
    let contentH = 80;
    drawLabel('警情内容', rowY);
    let contentFocused = reportState.activeField === 'content';
    drawInputBox(valueX, rowY - 3, fieldW, contentH, reportState.contentText, contentFocused, false, true);
    if (isInteractive) {
        state.addRegion(valueX, rowY - 3, fieldW, contentH, () => {
            focusField('content');
            reportState.showCategoryDropdown = false;
            reportState.showResultDropdown = false;
        });
    }

    // 7) 警情分类
    rowY = py + 345;
    let selectH = 28;
    drawLabel('警情分类', rowY);
    let catDisplay = reportState.categoryIdx >= 0 ? CATEGORIES[reportState.categoryIdx] : '—— 请选择 ——';
    drawSelectBox(valueX, rowY - 3, fieldW, selectH, catDisplay, reportState.showCategoryDropdown);
    if (isInteractive) {
        state.addRegion(valueX, rowY - 3, fieldW, selectH, () => {
            reportState.showCategoryDropdown = !reportState.showCategoryDropdown;
            reportState.showResultDropdown = false;
            blurField();
        });
    }

    // 8) 处理结果 - combo box
    rowY = py + 395;
    let comboH = 28;
    let comboBtnW = 30;
    drawLabel('处理结果', rowY);
    let resultFocused = reportState.activeField === 'result';
    drawInputBox(valueX, rowY - 3, fieldW - comboBtnW, comboH, reportState.resultText, resultFocused, false);

    let btnX = valueX + fieldW - comboBtnW;
    ctx.fillStyle = inputBg;
    ctx.strokeStyle = reportState.showResultDropdown && isInteractive ? focusBorder : normalBorder;
    ctx.lineWidth = 1;
    roundRect(ctx, btnX, rowY - 3, comboBtnW, comboH, { tl: 0, tr: 4, br: 4, bl: 0 }, true, true);

    let arrowCx = btnX + comboBtnW / 2;
    let arrowCy = rowY - 3 + comboH / 2;
    ctx.fillStyle = '#6688aa';
    ctx.beginPath();
    if (reportState.showResultDropdown) {
        ctx.moveTo(arrowCx - 4, arrowCy + 2);
        ctx.lineTo(arrowCx + 4, arrowCy + 2);
        ctx.lineTo(arrowCx, arrowCy - 3);
    } else {
        ctx.moveTo(arrowCx - 4, arrowCy - 2);
        ctx.lineTo(arrowCx + 4, arrowCy - 2);
        ctx.lineTo(arrowCx, arrowCy + 3);
    }
    ctx.closePath();
    ctx.fill();

    if (isInteractive) {
        state.addRegion(valueX, rowY - 3, fieldW - comboBtnW, comboH, () => {
            focusField('result');
            reportState.showCategoryDropdown = false;
            reportState.showResultDropdown = false;
        });
        state.addRegion(btnX, rowY - 3, comboBtnW, comboH, () => {
            reportState.showResultDropdown = !reportState.showResultDropdown;
            reportState.showCategoryDropdown = false;
            blurField();
        });
    }

    // 9) Submit button
    let btnY = py + 465;
    let submitEnabled = reportState.categoryIdx >= 0 && isInteractive;
    let submitBg = submitEnabled ? '#2a6db5' : '#3d4b5c';
    let submitHover = '#3580cc';
    drawButton(px + pw / 2 - 150, btnY, 120, 40, '提　交', submitBg, submitHover, submitEnabled);
    if (submitEnabled) {
        state.addRegion(px + pw / 2 - 150, btnY, 120, 40, () => {
            playSubmitSound();
            state.reportCategory = CATEGORIES[reportState.categoryIdx];
            state.reportResult = reportState.resultText || '无实质警情';
            reportState.showCategoryDropdown = false;
            reportState.showResultDropdown = false;
            blurField();
            submitState.phase = 'FREEZE';
            submitState.startTime = performance.now();
            state.introPlayed = true;
        });
    }

    // 10) Reset button
    drawButton(px + pw / 2 + 30, btnY, 120, 40, '重　置', '#2d3748', '#3d4b5c', isInteractive);
    if (isInteractive) {
        state.addRegion(px + pw / 2 + 30, btnY, 120, 40, () => {
            resetForm();
        });
    }

    // Dropdowns (if open and interactive)
    if (isInteractive && reportState.showCategoryDropdown) {
        let ddY = py + 345 - 3 + selectH;
        let ddItemH = 30;
        ctx.fillStyle = '#141e2c';
        ctx.strokeStyle = '#2a4a6b';
        ctx.lineWidth = 1;
        roundRect(ctx, valueX, ddY, fieldW, ddItemH * CATEGORIES.length + 2, 4, true, true);

        for (let i = 0; i < CATEGORIES.length; i++) {
            let iy = ddY + 1 + i * ddItemH;
            let isHover = state.mouseX >= valueX && state.mouseX <= valueX + fieldW &&
                          state.mouseY >= iy && state.mouseY <= iy + ddItemH;

            if (isHover) {
                ctx.fillStyle = 'rgba(74, 158, 255, 0.15)';
                ctx.fillRect(valueX + 1, iy, fieldW - 2, ddItemH);
            }

            ctx.font = valueFont;
            ctx.fillStyle = isHover ? '#fff' : '#ccc';
            ctx.fillText(CATEGORIES[i], valueX + 10, iy + 20);

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
        let ddY = py + 395 - 3 + comboH;
        let ddItemH = 30;
        ctx.fillStyle = '#141e2c';
        ctx.strokeStyle = '#2a4a6b';
        ctx.lineWidth = 1;
        roundRect(ctx, valueX, ddY, fieldW, ddItemH * RESULT_SUGGESTIONS.length + 2, 4, true, true);

        for (let i = 0; i < RESULT_SUGGESTIONS.length; i++) {
            let iy = ddY + 1 + i * ddItemH;
            let isHover = state.mouseX >= valueX && state.mouseX <= valueX + fieldW &&
                          state.mouseY >= iy && state.mouseY <= iy + ddItemH;

            if (isHover) {
                ctx.fillStyle = 'rgba(74, 158, 255, 0.15)';
                ctx.fillRect(valueX + 1, iy, fieldW - 2, ddItemH);
            }

            ctx.font = valueFont;
            ctx.fillStyle = isHover ? '#fff' : '#ccc';
            ctx.fillText(RESULT_SUGGESTIONS[i], valueX + 10, iy + 20);

            state.addRegion(valueX, iy, fieldW, ddItemH, () => {
                reportState.resultText = RESULT_SUGGESTIONS[i];
                reportState.showResultDropdown = false;
                getHiddenInput().value = RESULT_SUGGESTIONS[i];
            });
        }
    }

    // --- STAMP overlay if in STAMP phase ---
    if (submitState.phase === 'STAMP') {
        // Semi-transparent dark overlay for grey-out feel
        ctx.fillStyle = 'rgba(10, 15, 25, 0.35)';
        ctx.fillRect(px, py, pw, ph);

        // Dark red stamp "已办结" at bottom right
        ctx.save();
        let stampX = px + pw - 150;
        let stampY = py + ph - 110;
        ctx.translate(stampX, stampY);
        ctx.rotate(-15 * Math.PI / 180);

        // Double ring border
        ctx.strokeStyle = '#8b0000';
        ctx.lineWidth = 3;
        roundRect(ctx, -60, -30, 120, 60, 8, false, true);

        ctx.strokeStyle = '#8b0000';
        ctx.lineWidth = 1;
        roundRect(ctx, -55, -25, 110, 50, 5, false, true);

        // Stamp text
        ctx.font = 'bold 26px "Microsoft YaHei", "SimHei", Arial';
        ctx.fillStyle = '#8b0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('已办结', 0, 0);

        ctx.restore();
    }

    // Background click-away region if interactive
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

