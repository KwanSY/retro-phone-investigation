import { state } from '../state.js';
import { roundRect } from '../ui/canvas-utils.js';

export function drawStartScreen(ctx, canvas) {
    let w = canvas.width, h = canvas.height;
    if (w === 0 || h === 0) return;

    let bgGrad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, Math.max(w, h));
    bgGrad.addColorStop(0, '#101726'); bgGrad.addColorStop(1, '#05080f');
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)'; ctx.lineWidth = 1;
    for(let i=0; i<w; i+=50) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
    for(let i=0; i<h; i+=50) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }

    ctx.fillStyle = '#00f3ff'; ctx.font = 'bold 32px "Helvetica Neue", Arial'; ctx.textAlign = 'center';
    ctx.fillText("电子物证鉴定中心 :: 设备阵列", w/2, 80);
    ctx.font = '16px Arial'; ctx.fillStyle = '#888';
    ctx.fillText("请选择授权破解的终端设备进行接入", w/2, 110);

    let cols = 5; let rows = 2;
    let spacingX = 180; let spacingY = 220;
    let startX = w/2 - (cols * spacingX) / 2 + spacingX/2;
    let startY = h/2 - 100;

    for (let i = 0; i < 10; i++) {
        let row = Math.floor(i / cols); let col = i % cols;
        let bx = startX + col * spacingX - 60; let by = startY + row * spacingY - 80;
        let bw = 120; let bh = 180;

        let isHover = state.mouseX >= bx && state.mouseX <= bx+bw && state.mouseY >= by && state.mouseY <= by+bh;
        let isTarget = (i === 2); 
        let isSecond = (i === 1 && state.secondPhoneVisible); 

        if (isTarget) {
            ctx.fillStyle = isHover ? 'rgba(0, 243, 255, 0.2)' : 'rgba(0, 243, 255, 0.05)';
            ctx.strokeStyle = isHover ? '#00f3ff' : '#0099aa';
            ctx.lineWidth = isHover ? 3 : 1;
        } else if (isSecond) {
            ctx.fillStyle = isHover ? 'rgba(241, 196, 15, 0.2)' : 'rgba(241, 196, 15, 0.05)';
            ctx.strokeStyle = isHover ? '#f1c40f' : '#b89214';
            ctx.lineWidth = isHover ? 3 : 1;
        } else {
            ctx.fillStyle = 'rgba(255, 50, 50, 0.05)';
            ctx.strokeStyle = '#552222'; ctx.lineWidth = 1;
        }
        
        roundRect(ctx, bx, by, bw, bh, 10, true, true);

        ctx.fillStyle = isTarget ? '#00f3ff' : (isSecond ? '#f1c40f' : '#552222');
        roundRect(ctx, bx + 30, by + 20, 60, 100, 5, true, false);

        ctx.font = '14px Arial';
        if (isTarget) {
            ctx.fillStyle = '#00f3ff'; ctx.fillText("S40-PROJ", bx + bw/2, by + 145);
            ctx.fillStyle = '#0f0'; ctx.font = '12px Arial'; ctx.fillText("[ 赵磊终端 ]", bx + bw/2, by + 165);
            state.addRegion(bx, by, bw, bh, () => { state.screen = 'DESKTOP'; state.currentApp = 'desktop'; state.scrollY = 0; });
        } else if (isSecond) {
            ctx.fillStyle = '#f1c40f'; ctx.fillText("S40-02", bx + bw/2, by + 145);
            ctx.fillStyle = state.secondPhoneUnlocked ? '#0f0' : '#e74c3c'; ctx.font = '12px Arial'; 
            ctx.fillText(state.secondPhoneUnlocked ? "[ 阿树终端 ]" : "[ 密码锁定 ]", bx + bw/2, by + 165);
            state.addRegion(bx, by, bw, bh, () => { 
                if (state.secondPhoneUnlocked) {
                    state.screen = 'ASHU_PHONE';
                } else {
                    state.screen = 'PASSWORD_INPUT'; state.inputPassword = "";
                }
            });
        } else {
            ctx.fillStyle = '#552222'; ctx.fillText("UNKNOWN", bx + bw/2, by + 145);
            ctx.fillStyle = '#f00'; ctx.font = '12px Arial'; ctx.fillText("[ 物理损坏 ]", bx + bw/2, by + 165);
        }
    }
    ctx.textAlign = 'left';
}
