// js/ui/xp-theme.js - Windows Classic Theme Renderer & Utilities

/**
 * Draw classic Windows 3D border
 */
function draw3DBorder(ctx, x, y, w, h, raised) {
    // Outer
    ctx.fillStyle = raised ? '#ffffff' : '#808080';
    ctx.fillRect(x, y, w, 1); // Top
    ctx.fillRect(x, y, 1, h); // Left

    ctx.fillStyle = raised ? '#000000' : '#ffffff';
    ctx.fillRect(x, y + h - 1, w, 1); // Bottom
    ctx.fillRect(x + w - 1, y, 1, h); // Right

    // Inner
    ctx.fillStyle = raised ? '#D4D0C8' : '#404040';
    ctx.fillRect(x + 1, y + 1, w - 2, 1); // Inner Top
    ctx.fillRect(x + 1, y + 1, 1, h - 2); // Inner Left

    ctx.fillStyle = raised ? '#808080' : '#D4D0C8';
    ctx.fillRect(x + 1, y + h - 2, w - 2, 1); // Inner Bottom
    ctx.fillRect(x + w - 2, y + 1, 1, h - 2); // Inner Right
}

/**
 * Draw the Windows Classic Desktop background
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} w 
 * @param {number} h 
 */
export function drawXPDesktop(ctx, w, h) {
    ctx.fillStyle = '#008080';
    ctx.fillRect(0, 0, w, h);
}

/**
 * Draw a classic Windows Window Frame
 * Returns the inner content area bounds { x, y, w, h }
 */
export function drawXPWindow(ctx, x, y, w, h, title, iconStr = '💻') {
    ctx.save();

    // Body background
    ctx.fillStyle = '#D4D0C8';
    ctx.fillRect(x, y, w, h);

    // 3D raised outer border
    draw3DBorder(ctx, x, y, w, h, true);

    // Window Titlebar Height
    let titleH = 20;

    // Titlebar
    ctx.fillStyle = '#000080';
    ctx.fillRect(x + 3, y + 3, w - 6, titleH);

    // Titlebar Icon & Text
    ctx.font = 'bold 12px "Tahoma", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconStr, x + 6, y + 3 + titleH / 2);
    ctx.fillText(title, x + 24, y + 3 + titleH / 2);

    // Window Control Buttons on Top Right
    let btnW = 16, btnH = 14;
    let btnY = y + 6;
    let closeX = x + w - 3 - btnW - 2;
    let maxX = closeX - btnW - 2;
    let minX = maxX - btnW;

    drawXPControlBtn(ctx, minX, btnY, btnW, btnH, '_');
    drawXPControlBtn(ctx, maxX, btnY, btnW, btnH, '□');
    drawXPControlBtn(ctx, closeX, btnY, btnW, btnH, '✕');

    // Window Inner Body Area
    let bodyX = x + 3;
    let bodyY = y + 3 + titleH + 2;
    let bodyW = w - 6;
    let bodyH = h - (3 + titleH + 2) - 3;

    // Inset border around content
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1;
    ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

    ctx.restore();

    return { x: bodyX + 1, y: bodyY + 1, w: bodyW - 2, h: bodyH - 2 };
}

/**
 * Draw Window control buttons
 */
function drawXPControlBtn(ctx, x, y, w, h, symbol) {
    ctx.fillStyle = '#D4D0C8';
    ctx.fillRect(x, y, w, h);
    draw3DBorder(ctx, x, y, w, h, true);

    ctx.font = 'bold 10px "Tahoma", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x + w / 2, y + h / 2 + 1);
    ctx.textAlign = 'left';
}

/**
 * Draw classic 3D Push Button
 */
export function drawXPButton(ctx, x, y, w, h, text, isPrimary = false, enabled = true, isHover = false) {
    ctx.save();

    ctx.fillStyle = isHover ? '#E0DCD0' : '#D4D0C8';
    ctx.fillRect(x, y, w, h);

    draw3DBorder(ctx, x, y, w, h, true);

    if (isPrimary && enabled) {
        ctx.strokeStyle = '#000000';
        ctx.setLineDash([1, 1]);
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
        ctx.setLineDash([]);
    }

    ctx.font = '12px "Tahoma", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = enabled ? '#000000' : '#808080';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);

    ctx.restore();
}

/**
 * Draw classic Inset Input Box / Textarea
 */
export function drawXPInputBox(ctx, x, y, w, h, text, isFocused = false, isDisabled = false, isMultiline = false, cursorBlink = 0) {
    ctx.save();

    ctx.fillStyle = isDisabled ? '#D4D0C8' : '#ffffff';
    ctx.fillRect(x, y, w, h);

    draw3DBorder(ctx, x, y, w, h, false);

    // Text clipping
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 3, y + 3, w - 6, h - 6);
    ctx.clip();

    ctx.font = '12px "SimSun", "Tahoma", sans-serif';
    ctx.fillStyle = isDisabled ? '#808080' : '#000000';
    ctx.textBaseline = 'middle';

    if (isMultiline) {
        let lines = (text || '').split('\n');
        let lh = 18;
        let lastY = y + 10;
        let lastW = 0;

        for (let i = 0; i < lines.length; i++) {
            let curY = y + 10 + i * lh;
            ctx.fillText(lines[i], x + 4, curY);
            if (i === lines.length - 1) {
                lastY = curY;
                lastW = ctx.measureText(lines[i]).width;
            }
        }

        if (isFocused && !isDisabled && Math.floor(cursorBlink / 30) % 2 === 0) {
            let cursorX = x + 4 + lastW;
            ctx.fillStyle = '#000000';
            ctx.fillRect(cursorX, lastY - 6, 1, 12);
        }
    } else {
        ctx.fillText(text || '', x + 4, y + h / 2);

        if (isFocused && !isDisabled && Math.floor(cursorBlink / 30) % 2 === 0) {
            let textW = ctx.measureText(text || '').width;
            let cursorX = x + 4 + textW;
            if (cursorX < x + w - 4) {
                ctx.fillStyle = '#000000';
                ctx.fillRect(cursorX, y + 4, 1, h - 8);
            }
        }
    }

    ctx.restore();
    ctx.restore();
}

/**
 * Draw classic Select Box
 */
export function drawXPSelectBox(ctx, x, y, w, h, text, isOpen = false) {
    ctx.save();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, w, h);
    
    draw3DBorder(ctx, x, y, w, h, false);

    ctx.font = '12px "Tahoma", "SimSun", sans-serif';
    ctx.fillStyle = text.includes('请选择') ? '#808080' : '#000000';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 4, y + h / 2);

    let btnW = 16;
    let btnX = x + w - btnW - 2;
    let btnY = y + 2;
    let btnH = h - 4;
    
    ctx.fillStyle = '#D4D0C8';
    ctx.fillRect(btnX, btnY, btnW, btnH);
    draw3DBorder(ctx, btnX, btnY, btnW, btnH, true);

    let cx = btnX + btnW / 2;
    let cy = btnY + btnH / 2;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 1);
    ctx.lineTo(cx + 3, cy - 1);
    ctx.lineTo(cx, cy + 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

/**
 * Draw classic Message Box Popup (提示弹窗)
 */
export function drawXPMsgBox(ctx, x, y, w, h, title, message) {
    ctx.save();

    // Semi-transparent backdrop overlay over window
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    let body = drawXPWindow(ctx, x, y, w, h, title, 'ℹ️');

    // Info Icon (blue circle with white 'i')
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

    // Message Text
    ctx.font = '12px "Tahoma", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, body.x + 55, iconY);

    let btnW = 80, btnH = 26;
    let btnX = body.x + body.w / 2 - btnW / 2;
    let btnY = body.y + body.h - 38;

    drawXPButton(ctx, btnX, btnY, btnW, btnH, '确  定', true, true, false);

    ctx.restore();
}

/**
 * Draw a CRT monitor bezel/frame around the screen area.
 * Creates the look of an old beige CRT monitor.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} sx - Screen glass opening X
 * @param {number} sy - Screen glass opening Y
 * @param {number} sw - Screen glass opening width
 * @param {number} sh - Screen glass opening height
 */
export function drawCRTMonitorFrame(ctx, sx, sy, sw, sh) {
    ctx.save();

    let bSide = 32;
    let bTop = 18;
    let bBot = 38;

    let ox = sx - bSide;
    let oy = sy - bTop;
    let ow = sw + bSide * 2;
    let oh = sh + bTop + bBot;

    // 1. Beveled CRT Monitor Housing with SCREEN CUTOUT HOLE (evenodd)
    ctx.beginPath();
    ctx.roundRect(ox, oy, ow, oh, 10);
    // Counter-clockwise screen cutout path
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx, sy + sh);
    ctx.lineTo(sx + sw, sy + sh);
    ctx.lineTo(sx + sw, sy);
    ctx.closePath();

    ctx.fillStyle = '#CBBFAA';
    ctx.fill('evenodd');

    // 2. Outer Plastic Housing 3D Bevel Highlights & Shadows
    ctx.strokeStyle = '#E6DFC8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(ox + 1.5, oy + 1.5, ow - 3, oh - 3, 9);
    ctx.stroke();

    ctx.strokeStyle = '#948B77';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(ox + 2, oy + 2, ow - 4, oh - 4, 8);
    ctx.stroke();

    // 3. Recessed Screen Glass Frame (Dark Charcoal Inner Bevel Ring)
    let inset = 3;
    ctx.strokeStyle = '#1A1612';
    ctx.lineWidth = inset * 2;
    ctx.strokeRect(sx - inset, sy - inset, sw + inset * 2, sh + inset * 2);

    // Inner Depth Shadows around screen glass
    ctx.fillStyle = '#3A3226';
    ctx.fillRect(sx - inset - 2, sy - inset - 2, sw + inset * 2 + 4, 2);
    ctx.fillRect(sx - inset - 2, sy - inset - 2, 2, sh + inset * 2 + 4);

    ctx.fillStyle = '#E6DFC8';
    ctx.fillRect(sx - inset - 2, sy + sh + inset, sw + inset * 2 + 4, 2);
    ctx.fillRect(sx + sw + inset, sy - inset - 2, 2, sh + inset * 2 + 4);

    // 4. Vintage Monitor Brand Logo (Center Bottom Bezel)
    ctx.font = 'bold italic 11px "Courier New", "Tahoma", sans-serif';
    ctx.fillStyle = '#786E5E';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NIPPON CRT-17X', sx + sw / 2, sy + sh + bBot * 0.42);

    // 5. Power Switch Button (Bottom Right Bezel)
    let pwrX = sx + sw - 75;
    let pwrY = sy + sh + bBot * 0.48;
    let pwrW = 18, pwrH = 14;

    ctx.fillStyle = '#AEA494';
    ctx.fillRect(pwrX, pwrY - pwrH / 2, pwrW, pwrH);
    ctx.strokeStyle = '#786E5E';
    ctx.lineWidth = 1;
    ctx.strokeRect(pwrX, pwrY - pwrH / 2, pwrW, pwrH);

    ctx.fillStyle = '#584E3E';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('⏽', pwrX + pwrW / 2, pwrY + 1);

    // 6. Power LED (Glowing green dot next to power button)
    let ledX = pwrX + pwrW + 16;
    let ledY = pwrY;

    ctx.beginPath();
    ctx.arc(ledX, ledY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#00FF44';
    ctx.shadowColor = '#00FF44';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // LED bezel ring
    ctx.beginPath();
    ctx.arc(ledX, ledY, 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#3A3226';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 7. Glass Glare Overlay (Subtle diagonal glare reflection on CRT screen)
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sw, sh);
    ctx.clip();

    let glareGrad = ctx.createLinearGradient(sx + sw * 0.65, sy, sx + sw, sy + sh * 0.45);
    glareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    glareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.015)');
    glareGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glareGrad;
    ctx.fillRect(sx, sy, sw, sh);
    ctx.restore();

    ctx.restore();
}
