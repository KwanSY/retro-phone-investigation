import { state } from '../state.js';
import { roundRect, drawDisconnectButton } from '../ui/canvas-utils.js';
import { drawNokia5300Closed } from '../ui/nokia-renderer.js';
import { renderApp, goBack } from '../router.js';
import { playNotificationSound } from '../ui/audio-manager.js';

export function drawMainScreen(ctx, canvas) {
    let w = canvas.width, h = canvas.height;
    if (w === 0 || h === 0) return;

    let bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#1e2129'); bgGrad.addColorStop(1, '#111318');
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = 'rgba(0, 243, 255, 0.03)';
    ctx.beginPath(); ctx.arc(w/2, h/2, 600, 0, Math.PI*2); ctx.fill();

    ctx.save();
    ctx.translate(w*0.1, h*0.85); ctx.rotate(-20 * Math.PI/180);
    ctx.fillStyle = '#e6a822'; ctx.fillRect(0, 0, 450, 45);
    ctx.fillStyle = '#111'; ctx.font = 'bold 24px "Arial Black", sans-serif';
    ctx.fillText("EVIDENCE ITEM #01 - DO NOT CROSS", 20, 32);
    ctx.restore();

    ctx.save();
    ctx.translate(w*0.15, h*0.1); ctx.rotate(3 * Math.PI/180);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#f2db94'; ctx.fillRect(0, 0, 240, 120);
    ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(100, -10, 40, 25);
    ctx.fillStyle = '#c0392b'; ctx.font = 'bold 16px Arial'; ctx.fillText("TOP SECRET", 15, 25);
    ctx.fillStyle = '#333'; ctx.font = '14px "Courier New"';
    ctx.fillText("案卷: S40-PROJ", 15, 55);
    ctx.fillText("嫌疑人: 赵磊", 15, 80);
    ctx.fillText("状态: 取证分析中...", 15, 105);
    ctx.restore();

    let centerX = w / 2; let centerY = h / 2;
    let nokiaX = centerX - 420; let nokiaY = centerY - 200;
    let termX = centerX - 100; let termY = centerY - 320; 
    let termW = 420; let termH = 640;

    ctx.shadowColor = '#00f3ff'; ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(nokiaX + 220, nokiaY + 150); 
    ctx.quadraticCurveTo(nokiaX + 300, nokiaY + 250, termX, termY + 300); 
    ctx.strokeStyle = '#00f3ff'; ctx.lineWidth = 4; ctx.stroke();
    ctx.shadowBlur = 0;
    
    let dashOffset = -state.timeTick;
    ctx.setLineDash([15, 15]); ctx.lineDashOffset = dashOffset;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#00f3ff'; ctx.font = '12px Arial';
    ctx.fillText("USB-LINK DATA >>", nokiaX + 230, nokiaY + 220);

    drawNokia5300Closed(ctx, nokiaX, nokiaY);
    drawTerminal(ctx, termX, termY, termW, termH);
    
    drawDisconnectButton(ctx, w - 180, 30);
    checkFerrymanEvent();
}

function drawTerminal(ctx, sx, sy, sw, sh) {
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 25; ctx.shadowOffsetY = 15;
    ctx.fillStyle = '#1c2128'; roundRect(ctx, sx, sy, sw, sh, 25, true, false);
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#2d333b'; ctx.lineWidth = 4; roundRect(ctx, sx, sy, sw, sh, 25, false, true);
    
    ctx.fillStyle = '#2d333b'; roundRect(ctx, sx+sw/2-80, sy+15, 160, 20, 10, true, false);
    ctx.fillStyle = '#888'; ctx.font = 'bold 12px Arial'; ctx.textAlign='center'; ctx.fillText("S40-PROJ 分析终端", sx+sw/2, sy+29); ctx.textAlign='left';
    ctx.fillStyle = (state.timeTick % 60 < 30) ? '#e74c3c' : '#c0392b'; ctx.beginPath(); ctx.arc(sx+sw-30, sy+25, 4, 0, Math.PI*2); ctx.fill();

    let scrX = sx + 20, scrY = sy + 50, scrW = sw - 40, scrH = sh - 100;
    ctx.save(); ctx.beginPath(); ctx.roundRect(scrX, scrY, scrW, scrH, 10); ctx.clip();

    let bg = ctx.createLinearGradient(scrX, scrY, scrX, scrY+scrH);
    bg.addColorStop(0, '#02182b'); bg.addColorStop(0.5, '#04345c'); bg.addColorStop(1, '#02182b');
    ctx.fillStyle = bg; ctx.fillRect(scrX, scrY, scrW, scrH);
    
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    for(let i=0; i<scrH; i+=4) ctx.fillRect(scrX, scrY+i, scrW, 1);

    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(scrX, scrY, scrW, 35);
    ctx.fillStyle = '#fff'; ctx.font = '12px Arial';
    ctx.fillText("GSM 中国移动", scrX+15, scrY+22);
    ctx.textAlign = 'right'; ctx.fillText("100%", scrX+scrW-35, scrY+22); ctx.textAlign = 'left';
    ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.strokeRect(scrX+scrW-30, scrY+12, 18, 10); ctx.fillRect(scrX+scrW-28, scrY+14, 14, 6); ctx.fillRect(scrX+scrW-12, scrY+15, 2, 4);

    let contentY = scrY + 35; let contentH = scrH - 35;
    
    ctx.save(); 
    ctx.beginPath(); 
    ctx.rect(scrX, contentY, scrW, contentH); 
    ctx.clip(); 

    renderApp(ctx, state.currentApp, scrX, contentY, scrW, contentH);

    ctx.restore(); 

    if (state.currentApp !== 'desktop') {
        ctx.fillStyle = 'rgba(30, 33, 41, 0.95)'; ctx.fillRect(scrX, scrY + 35, scrW, 40);
        ctx.fillStyle = '#00f3ff'; roundRect(ctx, scrX + 10, scrY + 43, 70, 24, 4, true, false);
        ctx.fillStyle = '#000'; ctx.font = 'bold 12px Arial'; ctx.textAlign='center'; ctx.fillText("◀ 返回", scrX + 45, scrY + 59); ctx.textAlign='left';
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(scrX, scrY+75); ctx.lineTo(scrX+scrW, scrY+75); ctx.stroke();
        
        state.addRegion(scrX + 10, scrY + 43, 70, 24, () => {
            goBack();
        });
    }

    ctx.restore(); 

    ctx.fillStyle = '#222'; roundRect(ctx, sx+sw/2-60, sy+sh-30, 120, 8, 4, true, false);
}

function checkFerrymanEvent() {
    if (state.appsOpened.size >= 3 && !state.ferrymanTriggered && state.ferrymanFailedCount === 0) {
        state.ferrymanTriggered = true;
        state.whaleChat.push({ id: 'ferryman_q1', type: 'other', sender: '摆渡人', time: '刚刚', text: '你们是怎么认识的。' });
        state.autoScrollWhale = true;
        playNotificationSound();
    }
}
