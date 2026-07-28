import { wrapText, roundRect } from './canvas-utils.js';

export function measureBubble(ctx, text, maxBubbleW) {
    let fakeP = text.split('\n');
    let lineCount = 0;
    let maxTextW = 0;
    
    for (let p of fakeP) {
        if (p === '') { lineCount++; continue; }
        let words = p.split('');
        let line = '';
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n];
            let tw = ctx.measureText(testLine).width;
            if (tw > maxBubbleW && n > 0) {
                lineCount++;
                maxTextW = Math.max(maxTextW, ctx.measureText(line).width);
                line = words[n];
            } else {
                line = testLine;
            }
        }
        if (line !== '') {
            lineCount++;
            maxTextW = Math.max(maxTextW, ctx.measureText(line).width);
        }
    }
    return { lineCount, maxTextW };
}

export function drawChatBubble(ctx, options) {
    let { bx, by, bubbleW, bubbleH, isMe, text, maxW, colorMe, colorOther, hasImg, drawImgFn } = options;
    ctx.fillStyle = isMe ? colorMe : colorOther;
    ctx.textAlign = 'left';
    roundRect(ctx, bx, by, bubbleW, bubbleH, 8, true, false);
    
    let textY = by + 22;
    if (hasImg && drawImgFn) {
        drawImgFn(ctx, bx + 10, by + 10, bubbleW - 20, 140);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; 
        ctx.strokeRect(bx + 10, by + 10, bubbleW - 20, 140);
        textY += 145;
    }
    
    if (text) {
        wrapText(ctx, text, bx + 12, textY, maxW, 20);
    }
}
