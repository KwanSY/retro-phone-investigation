import { state } from '../state.js';

export function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'undefined') radius = 5;
    if (typeof radius === 'number') radius = {tl: radius, tr: radius, br: radius, bl: radius};
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    let paragraphs = text.split('\n');
    let totalHeight = 0;
    for(let p=0; p<paragraphs.length; p++) {
        let words = paragraphs[p].split('');
        let line = '';
        for(let n = 0; n < words.length; n++) {
            let testLine = line + words[n];
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n];
                y += lineHeight; totalHeight += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
        y += lineHeight; totalHeight += lineHeight;
    }
    return totalHeight;
}

export function drawDisconnectButton(ctx, x, y) {
    let w = 150, h = 40;
    let isHover = state.mouseX >= x && state.mouseX <= x+w && state.mouseY >= y && state.mouseY <= y+h;
    ctx.fillStyle = isHover ? 'rgba(231, 76, 60, 0.8)' : 'rgba(231, 76, 60, 0.4)';
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 8, true, true);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
    ctx.fillText("⏏ 断开连接 (退出)", x + w/2, y + 25);
    ctx.textAlign = 'left';

    state.addRegion(x, y, w, h, () => {
        state.screen = 'START_SCREEN';
    });
}
