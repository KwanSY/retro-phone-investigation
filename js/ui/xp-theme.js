// js/ui/xp-theme.js - Windows XP Theme Renderer & Utilities
import { roundRect } from './canvas-utils.js';

// Preload the uploaded Windows XP desktop image
let xpWallpaper = new Image();
xpWallpaper.src = 'js/ui/windows_xp_desktop.jfif';
let wallpaperLoaded = false;
xpWallpaper.onload = () => {
    wallpaperLoaded = true;
};

/**
 * Draw the Windows XP Desktop background
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} w 
 * @param {number} h 
 */
export function drawXPDesktop(ctx, w, h) {
    if (wallpaperLoaded && xpWallpaper.complete && xpWallpaper.naturalWidth > 0) {
        ctx.drawImage(xpWallpaper, 0, 0, w, h);
    } else {
        // Procedural XP Bliss Wallpaper Fallback
        // Sky gradient
        let skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
        skyGrad.addColorStop(0, '#005bb5');
        skyGrad.addColorStop(0.4, '#3993e2');
        skyGrad.addColorStop(1, '#8fc4f7');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.65);

        // Green Hill curve
        ctx.fillStyle = '#4c9920';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.55);
        ctx.bezierCurveTo(w * 0.35, h * 0.45, w * 0.65, h * 0.65, w, h * 0.5);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        // Hill highlight gradient overlay
        let hillGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
        hillGrad.addColorStop(0, 'rgba(140, 210, 40, 0.4)');
        hillGrad.addColorStop(1, 'rgba(30, 90, 10, 0.9)');
        ctx.fillStyle = hillGrad;
        ctx.fillRect(0, h * 0.5, w, h * 0.5);

        // Procedural Taskbar at bottom
        let barH = 30;
        let barY = h - barH;
        let barGrad = ctx.createLinearGradient(0, barY, 0, h);
        barGrad.addColorStop(0, '#245edb');
        barGrad.addColorStop(0.1, '#3f8cf3');
        barGrad.addColorStop(0.4, '#245edb');
        barGrad.addColorStop(1, '#1941a5');
        ctx.fillStyle = barGrad;
        ctx.fillRect(0, barY, w, barH);

        // Start button
        let startW = 100;
        let startGrad = ctx.createLinearGradient(0, barY, 0, h);
        startGrad.addColorStop(0, '#388e3c');
        startGrad.addColorStop(0.5, '#4caf50');
        startGrad.addColorStop(1, '#2e7d32');
        ctx.fillStyle = startGrad;
        roundRect(ctx, 0, barY, startW, barH, { tl: 0, tr: 8, br: 8, bl: 0 }, true, false);

        ctx.font = 'bold italic 14px "Tahoma", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 3;
        ctx.fillText('start', 30, barY + 20);
        ctx.shadowBlur = 0;
    }
}

/**
 * Draw a classic Windows XP Luna Blue Window Frame
 * Returns the inner content area bounds { x, y, w, h }
 */
export function drawXPWindow(ctx, x, y, w, h, title, iconStr = '💻') {
    ctx.save();

    // Window Outer Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;

    // Window Outer Blue Border
    ctx.fillStyle = '#0055ea';
    roundRect(ctx, x, y, w, h, { tl: 8, tr: 8, br: 3, bl: 3 }, true, false);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Window Titlebar Height
    let titleH = 30;

    // Titlebar Gradient (Classic Luna Blue)
    let titleGrad = ctx.createLinearGradient(x, y, x, y + titleH);
    titleGrad.addColorStop(0, '#0058ee');
    titleGrad.addColorStop(0.1, '#3a93ff');
    titleGrad.addColorStop(0.4, '#0055ea');
    titleGrad.addColorStop(0.9, '#0040b8');
    titleGrad.addColorStop(1, '#002490');
    ctx.fillStyle = titleGrad;
    roundRect(ctx, x + 2, y + 2, w - 4, titleH, { tl: 6, tr: 6, br: 0, bl: 0 }, true, false);

    // Titlebar Icon & Text
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(iconStr, x + 8, y + 21);

    ctx.font = 'bold 13px "Tahoma", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;
    ctx.fillText(title, x + 28, y + 21);
    ctx.shadowBlur = 0;

    // Window Control Buttons on Top Right (Minimize, Maximize, Close)
    let btnW = 21, btnH = 21;
    let btnY = y + 5;
    let closeX = x + w - 26;
    let maxX = closeX - 23;
    let minX = maxX - 23;

    // Minimize (_)
    drawXPControlBtn(ctx, minX, btnY, btnW, btnH, '_', false);
    // Maximize (□)
    drawXPControlBtn(ctx, maxX, btnY, btnW, btnH, '□', false);
    // Close (X)
    drawXPControlBtn(ctx, closeX, btnY, btnW, btnH, '✕', true);

    // Window Inner Body Area (#ece9d8 is classic XP dialog grey)
    let bodyX = x + 3;
    let bodyY = y + titleH + 2;
    let bodyW = w - 6;
    let bodyH = h - titleH - 5;

    ctx.fillStyle = '#ece9d8';
    ctx.fillRect(bodyX, bodyY, bodyW, bodyH);

    // Inner bevel line
    ctx.strokeStyle = '#d0ccb8';
    ctx.lineWidth = 1;
    ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

    ctx.restore();

    return { x: bodyX, y: bodyY, w: bodyW, h: bodyH };
}

/**
 * Draw Window control buttons (_, □, ✕)
 */
function drawXPControlBtn(ctx, x, y, w, h, symbol, isClose) {
    if (isClose) {
        let grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, '#e87669');
        grad.addColorStop(0.3, '#d34336');
        grad.addColorStop(1, '#9b1b11');
        ctx.fillStyle = grad;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, w, h, 3, true, true);

        ctx.font = 'bold 11px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(symbol, x + w / 2, y + h / 2 + 4);
    } else {
        let grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, '#7ba6e8');
        grad.addColorStop(0.3, '#3c79e6');
        grad.addColorStop(1, '#1f4fa8');
        ctx.fillStyle = grad;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, w, h, 3, true, true);

        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(symbol, x + w / 2, y + h / 2 + 3);
    }
    ctx.textAlign = 'left';
}

/**
 * Draw classic XP 3D Push Button
 */
export function drawXPButton(ctx, x, y, w, h, text, isPrimary = false, enabled = true, isHover = false) {
    ctx.save();

    let bgGrad = ctx.createLinearGradient(x, y, x, y + h);
    if (!enabled) {
        bgGrad.addColorStop(0, '#f2f0e6');
        bgGrad.addColorStop(1, '#e2dfd2');
        ctx.strokeStyle = '#c5c2b2';
    } else if (isHover) {
        bgGrad.addColorStop(0, '#fff4cc');
        bgGrad.addColorStop(0.5, '#ffe399');
        bgGrad.addColorStop(1, '#ffc83b');
        ctx.strokeStyle = '#e59400';
    } else {
        bgGrad.addColorStop(0, '#ffffff');
        bgGrad.addColorStop(0.4, '#ece9d8');
        bgGrad.addColorStop(1, '#d8d4c0');
        ctx.strokeStyle = isPrimary ? '#003c74' : '#003c74';
    }

    ctx.fillStyle = bgGrad;
    ctx.lineWidth = isPrimary && enabled ? 2 : 1;
    roundRect(ctx, x, y, w, h, 3, true, true);

    // Inner highlight ring if primary & enabled
    if (isPrimary && enabled && !isHover) {
        ctx.strokeStyle = '#cedfef';
        ctx.lineWidth = 1;
        roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 2, false, true);
    }

    ctx.font = '13px "Tahoma", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = enabled ? '#000000' : '#888888';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + w / 2, y + h / 2 + 4);

    ctx.restore();
}

/**
 * Draw classic XP Inset Input Box / Textarea
 */
export function drawXPInputBox(ctx, x, y, w, h, text, isFocused = false, isDisabled = false, isMultiline = false, cursorBlink = 0) {
    ctx.save();

    // Background
    ctx.fillStyle = isDisabled ? '#ece9d8' : '#ffffff';
    ctx.fillRect(x, y, w, h);

    // Inset 3D border
    ctx.strokeStyle = isDisabled ? '#acaca5' : (isFocused ? '#316ac5' : '#7f9db9');
    ctx.lineWidth = isFocused ? 2 : 1;
    ctx.strokeRect(x, y, w, h);

    // Inset top/left shadow line
    if (!isFocused && !isDisabled) {
        ctx.strokeStyle = '#e3e3e3';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 1, y + h - 1);
        ctx.lineTo(x + w - 1, y + h - 1);
        ctx.lineTo(x + w - 1, y + 1);
        ctx.stroke();
    }

    // Text clipping
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 4, y + 2, w - 8, h - 4);
    ctx.clip();

    ctx.font = '13px "SimSun", "Tahoma", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = isDisabled ? '#888888' : '#000000';

    if (isMultiline) {
        let lines = (text || '').split('\n');
        let lh = 18;
        let lastY = y + 16;
        let lastW = 0;

        for (let i = 0; i < lines.length; i++) {
            let curY = y + 16 + i * lh;
            ctx.fillText(lines[i], x + 6, curY);
            if (i === lines.length - 1) {
                lastY = curY;
                lastW = ctx.measureText(lines[i]).width;
            }
        }

        if (isFocused && !isDisabled && Math.floor(cursorBlink / 30) % 2 === 0) {
            let cursorX = x + 6 + lastW;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cursorX, lastY - 12);
            ctx.lineTo(cursorX, lastY + 2);
            ctx.stroke();
        }
    } else {
        ctx.fillText(text || '', x + 6, y + h / 2 + 4);

        if (isFocused && !isDisabled && Math.floor(cursorBlink / 30) % 2 === 0) {
            let textW = ctx.measureText(text || '').width;
            let cursorX = x + 6 + textW;
            if (cursorX < x + w - 6) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cursorX, y + 4);
                ctx.lineTo(cursorX, y + h - 4);
                ctx.stroke();
            }
        }
    }

    ctx.restore();
    ctx.restore();
}

/**
 * Draw classic XP Select Box
 */
export function drawXPSelectBox(ctx, x, y, w, h, text, isOpen = false) {
    ctx.save();

    // White text background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, w - 18, h);
    ctx.strokeStyle = isOpen ? '#316ac5' : '#7f9db9';
    ctx.lineWidth = isOpen ? 2 : 1;
    ctx.strokeRect(x, y, w, h);

    ctx.font = '13px "Tahoma", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = text.includes('请选择') ? '#888888' : '#000000';
    ctx.fillText(text, x + 6, y + h / 2 + 4);

    // Arrow button on right
    let btnX = x + w - 18;
    let btnW = 18;
    drawXPButton(ctx, btnX, y, btnW, h, '', false, true, false);

    // Down arrow
    let cx = btnX + btnW / 2;
    let cy = y + h / 2;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    if (isOpen) {
        ctx.moveTo(cx - 3, cy + 2);
        ctx.lineTo(cx + 3, cy + 2);
        ctx.lineTo(cx, cy - 2);
    } else {
        ctx.moveTo(cx - 3, cy - 2);
        ctx.lineTo(cx + 3, cy - 2);
        ctx.lineTo(cx, cy + 2);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

/**
 * Draw classic Windows XP Message Box Popup (提示弹窗)
 */
export function drawXPMsgBox(ctx, x, y, w, h, title, message) {
    ctx.save();

    // 1. Semi-transparent backdrop overlay over window
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 2. Draw Window Frame
    let body = drawXPWindow(ctx, x, y, w, h, title, 'ℹ️');

    // 3. Info Icon (blue circle with white 'i')
    let iconX = body.x + 24;
    let iconY = body.y + 35;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#0a5bc4';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 18px "Georgia", serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('i', iconX, iconY);

    // 4. Message Text
    ctx.font = '13px "Tahoma", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, body.x + 55, iconY);

    // 5. '确定' XP Button (with blue focus ring)
    let btnW = 80, btnH = 26;
    let btnX = body.x + body.w / 2 - btnW / 2;
    let btnY = body.y + body.h - 38;

    drawXPButton(ctx, btnX, btnY, btnW, btnH, '确  定', true, true, false);

    ctx.restore();
}

