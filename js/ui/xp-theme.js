/**
 * Draw classic Windows 3D border
 */
export function draw3DBorder(ctx, x, y, w, h, raised) {
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
    ctx.font = 'bold 12px "Tahoma", "Microsoft YaHei", sans-serif';
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
 * Draw small gray lock icon 🔒
 */
export function drawLockIcon(ctx, x, y) {
    ctx.save();
    // Shackle
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + 5, y + 4, 3, Math.PI, 0);
    ctx.lineTo(x + 8, y + 7);
    ctx.moveTo(x + 2, y + 4);
    ctx.lineTo(x + 2, y + 7);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#b0a898';
    ctx.fillRect(x, y + 6, 10, 8);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y + 6, 10, 8);

    // Keyhole
    ctx.fillStyle = '#222222';
    ctx.fillRect(x + 4, y + 8, 2, 3);
    ctx.restore();
}

/**
 * Draw black speech bubble tooltip
 */
export function drawTooltipBubble(ctx, x, y, text, pointLeft = true) {
    ctx.save();
    ctx.font = '11px "Microsoft YaHei", sans-serif';
    let textW = ctx.measureText(text).width;
    let padX = 8, padY = 5;
    let bubbleW = textW + padX * 2;
    let bubbleH = 24;

    let bx = pointLeft ? x + 12 : x - bubbleW - 12;
    let by = y - bubbleH / 2;

    // Bubble box
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.roundRect(bx, by, bubbleW, bubbleH, 6);
    ctx.fill();

    // Pointer arrow
    ctx.beginPath();
    if (pointLeft) {
        ctx.moveTo(x + 2, y);
        ctx.lineTo(bx, y - 4);
        ctx.lineTo(bx, y + 4);
    } else {
        ctx.moveTo(x - 2, y);
        ctx.lineTo(bx + bubbleW, y - 4);
        ctx.lineTo(bx + bubbleW, y + 4);
    }
    ctx.closePath();
    ctx.fill();

    // Text
    ctx.fillStyle = '#f0f0f0';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + padX, by + bubbleH / 2);

    ctx.restore();
}

/**
 * Draw Smart ABC Floating Input Method candidate box
 */
export function drawSmartABCBar(ctx, x, y) {
    ctx.save();
    let w = 210, h = 26;

    ctx.fillStyle = '#dcd8cf';
    ctx.fillRect(x, y, w, h);
    draw3DBorder(ctx, x, y, w, h, true);

    ctx.font = '11px "Tahoma", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'middle';
    ctx.fillText('Smart ABC 输入方式', x + 6, y + h / 2);

    // Indicator icons on right
    let ix = x + w - 45;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ix, y + 4, 16, 18);
    draw3DBorder(ctx, ix, y + 4, 16, 18, false);
    ctx.fillStyle = '#000080';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('标', ix + 3, y + h / 2);

    let ix2 = ix + 20;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ix2, y + 4, 16, 18);
    draw3DBorder(ctx, ix2, y + 4, 16, 18, false);
    ctx.fillStyle = '#000080';
    ctx.fillText('全', ix2 + 3, y + h / 2);

    ctx.restore();
}

/**
 * Draw Red Official Stamp (已办结)
 */
export function drawRedStamp(ctx, x, y, title = '已办结', subtitle = '原发单号 110-20100609-0047') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.08); // slight realistic tilt

    let w = 150, h = 60;

    ctx.strokeStyle = '#c42828';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.strokeStyle = '#c42828';
    ctx.lineWidth = 1;
    ctx.strokeRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);

    ctx.fillStyle = '#c42828';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 20px "SimSun", "Songti SC", serif';
    ctx.fillText(title, 0, -8);

    ctx.font = '10px "SimSun", "Songti SC", serif';
    ctx.fillText(subtitle, 0, 16);

    ctx.restore();
}

/**
 * Draw the clean Night Shift Police Room & Desk Background
 */
export function drawDeskEnvironment(ctx, w, h) {
    ctx.save();

    // 1. Dark Atmospheric Police Station Room Background
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, w, h);

    // Warm ambient desk lamp glow from top-left
    let lampGrad = ctx.createRadialGradient(180, 100, 10, 300, 200, 700);
    lampGrad.addColorStop(0, 'rgba(255, 205, 110, 0.15)');
    lampGrad.addColorStop(0.5, 'rgba(200, 150, 70, 0.05)');
    lampGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lampGrad;
    ctx.fillRect(0, 0, w, h);

    // Rich Dark Walnut Wood Desk Surface at bottom
    let deskGrad = ctx.createLinearGradient(0, 520, 0, h);
    deskGrad.addColorStop(0, '#1c1713');
    deskGrad.addColorStop(0.4, '#15110e');
    deskGrad.addColorStop(1, '#0c0908');
    ctx.fillStyle = deskGrad;
    ctx.fillRect(0, 520, w, h - 520);

    // Desk edge highlight line
    ctx.fillStyle = 'rgba(255, 220, 160, 0.08)';
    ctx.fillRect(0, 520, w, 1.5);

    ctx.restore();
}

/**
 * Draw Beveled CRT Monitor Casing with Screen Opening, Glare, Power Button, and Recording Pill
 */
export function drawCRTBezel(ctx, mx, my, mw, mh, sx, sy, sw, sh) {
    drawCRTMonitorFrame(ctx, sx, sy, sw, sh);
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
 * Draw toolbar retro vector icons (新建, 保存, 派警, 打印, 查询)
 */
function drawToolbarIcon(ctx, type, x, y) {
    ctx.save();
    if (type === 'new') {
        // White document with folded top-right corner
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 9);
        ctx.lineTo(x + 2, y - 9);
        ctx.lineTo(x + 6, y - 5);
        ctx.lineTo(x + 6, y + 7);
        ctx.lineTo(x - 6, y + 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Folded flap
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 9);
        ctx.lineTo(x + 2, y - 5);
        ctx.lineTo(x + 6, y - 5);
        ctx.stroke();

        // Document text lines
        ctx.strokeStyle = '#808080';
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 2); ctx.lineTo(x + 3, y - 2);
        ctx.moveTo(x - 3, y + 1); ctx.lineTo(x + 3, y + 1);
        ctx.moveTo(x - 3, y + 4); ctx.lineTo(x + 1, y + 4);
        ctx.stroke();

        // Green plus badge
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 2, y + 2, 7, 7);
        ctx.strokeStyle = '#15803d';
        ctx.strokeRect(x + 2, y + 2, 7, 7);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 5, y + 3, 1, 5);
        ctx.fillRect(x + 3, y + 5, 5, 1);
    } else if (type === 'save') {
        // 3.5-inch blue floppy disk
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(x - 8, y - 8, 16, 16);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 8, y - 8, 16, 16);

        // Silver metal shutter at top
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x - 5, y - 8, 10, 6);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 2, y - 7, 3, 4);

        // White paper label at bottom
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 6, y + 1, 12, 6);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x - 4, y + 2, 8, 2);
    } else if (type === 'dispatch') {
        // Police Siren / Cruiser Beacon icon
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x - 7, y - 2, 14, 8);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 7, y - 2, 14, 8);

        // Blue/Red Siren dome on top
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x - 3, y - 3, 4, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(x + 3, y - 3, 4, Math.PI, 0);
        ctx.fill();

        // Flash rays
        ctx.strokeStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 6); ctx.lineTo(x - 5, y - 4);
        ctx.moveTo(x + 8, y - 6); ctx.lineTo(x + 5, y - 4);
        ctx.stroke();
    } else if (type === 'print') {
        // Retro Beige Printer
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x - 8, y - 3, 16, 9);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 8, y - 3, 16, 9);

        // Paper in top
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 5, y - 8, 10, 6);
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(x - 5, y - 8, 10, 6);

        // Paper out bottom slot
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 5, y + 3, 10, 4);

        // LED dot
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 4, y - 1, 2, 2);
    } else if (type === 'search') {
        // Magnifying glass
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
        ctx.fill();

        // Glass reflection
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, 4, -Math.PI * 0.7, -Math.PI * 0.2);
        ctx.stroke();

        // Handle
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 3);
        ctx.lineTo(x + 7, y + 7);
        ctx.stroke();
    }
    ctx.restore();
}

/**
 * Draw the full 110 Police Dispatch Workstation Window (110接处警系统 V2.3 —— 接处警工作台 ——)
 * Complete with Titlebar, Menubar, 5-button Toolbar, Content panel, and Statusbar.
 */
export function draw110DispatchWindow(ctx, x, y, w, h, title = '110接处警系统 V2.3 —— 接处警工作台 ——', statusTimeStr = '2010-06-09 23:56:13') {
    ctx.save();

    // 1. Window Body Background
    ctx.fillStyle = '#D4D0C8';
    ctx.fillRect(x, y, w, h);

    // 2. 3D Raised Outer Border
    draw3DBorder(ctx, x, y, w, h, true);

    // 3. Titlebar
    let titleH = 22;
    ctx.fillStyle = '#000080'; // Solid Windows Classic Navy
    ctx.fillRect(x + 3, y + 3, w - 6, titleH);

    // Titlebar Icon & Text
    ctx.font = 'bold 12px "Tahoma", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText('■', x + 7, y + 3 + titleH / 2);
    ctx.fillText(title, x + 24, y + 3 + titleH / 2);

    // Window Controls on Top Right
    let btnW = 16, btnH = 14;
    let btnY = y + 5;
    let closeX = x + w - 3 - btnW - 2;
    let maxX = closeX - btnW - 2;
    let minX = maxX - btnW;

    drawXPControlBtn(ctx, minX, btnY, btnW, btnH, '_');
    drawXPControlBtn(ctx, maxX, btnY, btnW, btnH, '□');
    drawXPControlBtn(ctx, closeX, btnY, btnW, btnH, '✕');

    // 4. Menu Bar
    let menuY = y + 3 + titleH;
    let menuH = 20;
    ctx.fillStyle = '#D4D0C8';
    ctx.fillRect(x + 3, menuY, w - 6, menuH);

    let menus = ['系统(S)', '接警登记', '处警调度', '查询统计', '系统维护', '帮助(H)'];
    ctx.font = '12px "Tahoma", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#000000';
    let mx = x + 10;
    for (let m of menus) {
        ctx.fillText(m, mx, menuY + menuH / 2 + 1);
        mx += ctx.measureText(m).width + 16;
    }

    // 1px 3D divider below Menu Bar
    ctx.fillStyle = '#808080';
    ctx.fillRect(x + 3, menuY + menuH - 1, w - 6, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 3, menuY + menuH, w - 6, 1);

    // 5. Toolbar
    let toolY = menuY + menuH + 1;
    let toolH = 46;
    ctx.fillStyle = '#D4D0C8';
    ctx.fillRect(x + 3, toolY, w - 6, toolH);

    let tools = [
        { type: 'new', label: '[新建]' },
        { type: 'save', label: '[保存]' },
        { type: 'dispatch', label: '[派警]' },
        { type: 'print', label: '[打印]' },
        { type: 'search', label: '[查询]' },
    ];

    let tx = x + 12;
    for (let i = 0; i < tools.length; i++) {
        let t = tools[i];
        let tBtnW = 48;

        // Draw Toolbar Icon
        drawToolbarIcon(ctx, t.type, tx + tBtnW / 2, toolY + 16);

        // Draw Toolbar Label
        ctx.font = '11px "Tahoma", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(t.label, tx + tBtnW / 2, toolY + 36);
        ctx.textAlign = 'left';

        tx += tBtnW + 6;

        // Separator bar after item 1 and item 3
        if (i === 1 || i === 3) {
            ctx.fillStyle = '#808080';
            ctx.fillRect(tx + 2, toolY + 6, 1, toolH - 12);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(tx + 3, toolY + 6, 1, toolH - 12);
            tx += 10;
        }
    }

    // 1px 3D divider below Toolbar
    ctx.fillStyle = '#808080';
    ctx.fillRect(x + 3, toolY + toolH - 1, w - 6, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 3, toolY + toolH, w - 6, 1);

    // 6. Status Bar at Bottom
    let statusH = 22;
    let statusY = y + h - 3 - statusH;
    ctx.fillStyle = '#D4D0C8';
    ctx.fillRect(x + 3, statusY, w - 6, statusH);

    // Main status panel (sunken border)
    let panelW = w - 6 - 80;
    draw3DBorder(ctx, x + 4, statusY + 1, panelW, statusH - 2, false);

    // Online green status dot
    ctx.beginPath();
    ctx.arc(x + 16, statusY + statusH / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Status text
    ctx.font = '12px "Tahoma", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'middle';
    ctx.fillText(`在线  值班员：027  线路：03  ${statusTimeStr}`, x + 26, statusY + statusH / 2 + 1);

    // Right gripper panel
    draw3DBorder(ctx, x + 4 + panelW + 2, statusY + 1, 74, statusH - 2, false);
    // Resize dots
    let rx = x + w - 16;
    let ry = y + h - 6;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx + 2, ry - 2, 2, 2);
    ctx.fillRect(rx - 2, ry - 2, 2, 2);
    ctx.fillRect(rx + 2, ry - 6, 2, 2);
    ctx.fillStyle = '#808080';
    ctx.fillRect(rx + 1, ry - 3, 2, 2);
    ctx.fillRect(rx - 3, ry - 3, 2, 2);
    ctx.fillRect(rx + 1, ry - 7, 2, 2);

    // 7. Inner Main Form Body Area (between Toolbar and Statusbar)
    let bodyX = x + 6;
    let bodyY = toolY + toolH + 4;
    let bodyW = w - 12;
    let bodyH = statusY - bodyY - 4;

    // Inset border around main content
    draw3DBorder(ctx, bodyX, bodyY, bodyW, bodyH, false);

    ctx.restore();

    return { x: bodyX + 2, y: bodyY + 2, w: bodyW - 4, h: bodyH - 4 };
}

/**
 * Draw a classic Windows Textarea with vertical scrollbar on right
 */
export function drawXPTextareaWithScrollbar(ctx, x, y, w, h, text, isFocused = false, isDisabled = false, cursorBlink = 0) {
    ctx.save();

    let scrollbarW = 16;
    let textW = w - scrollbarW;

    // 1. Text background
    ctx.fillStyle = isDisabled ? '#D4D0C8' : '#ffffff';
    ctx.fillRect(x, y, textW, h);

    // 2. Scrollbar track background
    ctx.fillStyle = '#D4D0C8';
    ctx.fillRect(x + textW, y, scrollbarW, h);

    // 3. 3D Sunken Border around whole box
    draw3DBorder(ctx, x, y, w, h, false);

    // 4. Scrollbar Buttons & Thumb
    // Top arrow button
    ctx.fillStyle = '#D4D0C8';
    ctx.fillRect(x + textW + 1, y + 1, scrollbarW - 2, 14);
    draw3DBorder(ctx, x + textW + 1, y + 1, scrollbarW - 2, 14, true);
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x + textW + scrollbarW / 2, y + 5);
    ctx.lineTo(x + textW + scrollbarW / 2 - 3, y + 9);
    ctx.lineTo(x + textW + scrollbarW / 2 + 3, y + 9);
    ctx.closePath();
    ctx.fill();

    // Bottom arrow button
    ctx.fillStyle = '#D4D0C8';
    ctx.fillRect(x + textW + 1, y + h - 15, scrollbarW - 2, 14);
    draw3DBorder(ctx, x + textW + 1, y + h - 15, scrollbarW - 2, 14, true);
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x + textW + scrollbarW / 2, y + h - 6);
    ctx.lineTo(x + textW + scrollbarW / 2 - 3, y + h - 10);
    ctx.lineTo(x + textW + scrollbarW / 2 + 3, y + h - 10);
    ctx.closePath();
    ctx.fill();

    // Scroll Thumb / Handle
    let thumbH = 34;
    let thumbY = y + 15;
    ctx.fillStyle = '#D4D0C8';
    ctx.fillRect(x + textW + 1, thumbY, scrollbarW - 2, thumbH);
    draw3DBorder(ctx, x + textW + 1, thumbY, scrollbarW - 2, thumbH, true);

    // 5. Text rendering with clipping
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 3, y + 3, textW - 6, h - 6);
    ctx.clip();

    ctx.font = '13px "SimSun", "Tahoma", sans-serif';
    ctx.fillStyle = isDisabled ? '#666666' : '#000000';
    ctx.textBaseline = 'middle';

    let lines = (text || '').split('\n');
    let lh = 20;
    let lastY = y + 12;
    let lastW = 0;

    for (let i = 0; i < lines.length; i++) {
        let curY = y + 12 + i * lh;
        ctx.fillText(lines[i], x + 6, curY);
        if (i === lines.length - 1) {
            lastY = curY;
            lastW = ctx.measureText(lines[i]).width;
        }
    }

    // Blinking vertical cursor |
    if (isFocused && !isDisabled && Math.floor(cursorBlink / 30) % 2 === 0) {
        let cursorX = x + 6 + lastW;
        ctx.fillStyle = '#000000';
        ctx.fillRect(cursorX, lastY - 7, 1.5, 14);
    }

    ctx.restore();
    ctx.restore();
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

let deskBgImg = null;
let deskBgLoaded = false;

function getDeskBgImage() {
    if (!deskBgImg) {
        deskBgImg = new Image();
        deskBgImg.src = 'assets/retro_police_desk.jpg';
        deskBgImg.onload = () => {
            deskBgLoaded = true;
        };
    }
    return deskBgImg;
}
getDeskBgImage();

let crtBezelImg = null;
let crtBezelLoaded = false;

function getCRTBezelImage() {
    if (!crtBezelImg) {
        crtBezelImg = new Image();
        crtBezelImg.src = 'assets/user_crt_bezel.png';
        crtBezelImg.onload = () => {
            crtBezelLoaded = true;
        };
    }
    return crtBezelImg;
}

// Preload bezel immediately
getCRTBezelImage();

/**
 * Draw a CRT monitor bezel/frame around the screen area.
 * Uses the photorealistic textured CRT frame image with precise cutout alignment.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} sx - Screen glass opening X
 * @param {number} sy - Screen glass opening Y
 * @param {number} sw - Screen glass opening width
 * @param {number} sh - Screen glass opening height
 */
export function drawCRTMonitorFrame(ctx, sx, sy, sw, sh) {
    ctx.save();

    let img = getCRTBezelImage();
    if (img && img.complete && img.naturalWidth > 0) {
        // Cutout coordinates in user style image (1024 x 847)
        let holeX = 81, holeY = 96, holeW = 849, holeH = 649;

        let scale = sw / holeW;
        let bezelW = img.naturalWidth * scale;
        let bezelH = img.naturalHeight * scale;
        let bezelX = sx - (holeX * scale);
        let bezelY = sy - (holeY * scale);

        ctx.drawImage(img, bezelX, bezelY, bezelW, bezelH);
    } else {
        // Fallback procedural renderer if image is still loading
        let bSide = 32;
        let bTop = 18;
        let bBot = 38;

        let ox = sx - bSide;
        let oy = sy - bTop;
        let ow = sw + bSide * 2;
        let oh = sh + bTop + bBot;

        ctx.beginPath();
        ctx.roundRect(ox, oy, ow, oh, 10);
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy + sh);
        ctx.lineTo(sx + sw, sy + sh);
        ctx.lineTo(sx + sw, sy);
        ctx.closePath();

        ctx.fillStyle = '#CBBFAA';
        ctx.fill('evenodd');
    }

    // Glass Glare Overlay
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
