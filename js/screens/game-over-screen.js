import { state } from '../state.js';
import { roundRect } from '../ui/canvas-utils.js';
import { playGameOverSound } from '../ui/audio-manager.js';

let playedGameOverSFX = false;

export function drawGameOverScreen(ctx, canvas) {
    let w = canvas.width, h = canvas.height;

    if (!playedGameOverSFX) {
        playGameOverSound();
        playedGameOverSFX = true;
    }

    let bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, 'rgba(30, 0, 0, 0.95)'); 
    bgGrad.addColorStop(1, 'rgba(10, 0, 0, 1)');
    ctx.fillStyle = bgGrad; 
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = 'rgba(255, 0, 0, 0.05)';
    for(let i=0; i<h; i+=10) ctx.fillRect(0, i, w, 2);
    
    ctx.fillStyle = '#fff';
    ctx.font = '28px "Helvetica Neue", Arial';
    ctx.textAlign = 'center';
    ctx.fillText("你失去了和摆渡人的唯一联系，", w/2, h/2 - 80);
    ctx.fillText("再也无法找到事情的真相。", w/2, h/2 - 40);
    
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 80px "Arial Black", Arial';
    ctx.shadowColor = '#e74c3c'; ctx.shadowBlur = 20;
    ctx.fillText("降 职 ！！", w/2, h/2 + 60);
    ctx.shadowBlur = 0; 
    
    let bx = w/2 - 120, by = h/2 + 150, bw = 240, bh = 55;
    let isHover = state.mouseX >= bx && state.mouseX <= bx + bw && state.mouseY >= by && state.mouseY <= by + bh;
    
    ctx.fillStyle = isHover ? 'rgba(231, 76, 60, 0.8)' : 'rgba(231, 76, 60, 0.2)';
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 2;
    roundRect(ctx, bx, by, bw, bh, 8, true, true);
    
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Arial';
    ctx.fillText("重新开始 (Restart)", w/2, by + 35);
    
    state.addRegion(bx, by, bw, bh, () => {
        playedGameOverSFX = false; // Reset flag for next game over
        state.reset();
    });
    
    ctx.textAlign = 'left';
}
