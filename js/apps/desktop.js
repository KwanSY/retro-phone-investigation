import { state } from '../state.js';
import { roundRect, wrapText } from '../ui/canvas-utils.js';

export function drawDesktop(ctx, sx, sy, sw, sh) {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign='center';
    ctx.fillText("— [ 核心数据分析 ] —", sx + sw/2, sy + 35);
    
    let cols = 2; 
    let itemW = 150; let itemH = 120;
    let paddingX = 20; let paddingY = 20;
    let totalGridW = cols * itemW + (cols - 1) * paddingX;
    let startX = sx + (sw - totalGridW) / 2;
    let startY = sy + 65;

    for (let i = 0; i < state.appsList.length; i++) {
        let col = i % cols; let row = Math.floor(i / cols);
        let bx = startX + col * (itemW + paddingX);
        let by = startY + row * (itemH + paddingY);

        let isHover = state.mouseX >= bx && state.mouseX <= bx + itemW && state.mouseY >= by && state.mouseY <= by + itemH;
        
        ctx.fillStyle = isHover ? 'rgba(0, 243, 255, 0.2)' : 'rgba(255,255,255,0.05)';
        ctx.strokeStyle = isHover ? '#f1c40f' : 'rgba(0, 243, 255, 0.3)'; ctx.lineWidth = 2;
        roundRect(ctx, bx, by, itemW, itemH, 12, true, true);

        ctx.fillStyle = state.appsList[i].color; ctx.font = '40px Arial';
        ctx.fillText(state.appsList[i].icon, bx + itemW/2, by + 50);
        
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial';
        ctx.fillText(state.appsList[i].name, bx + itemW/2, by + 90);

        let hasUnreadFerryman = state.whaleChat.some(s => s.id === 'ferryman_q1');
        if (state.appsList[i].id === 'whale_app' && state.ferrymanTriggered && hasUnreadFerryman) {
            ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(bx + itemW - 15, by + 15, 8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'; ctx.fillText("1", bx + itemW - 15, by + 19);
        }

        state.addRegion(bx, by, itemW, itemH, () => {
            state.appsOpened.add(state.appsList[i].id);
            state.currentApp = state.appsList[i].id; state.scrollY = 0;
        });
    }
    ctx.textAlign = 'left';
}
