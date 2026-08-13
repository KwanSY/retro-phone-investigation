import { state } from '../state.js';
import { roundRect } from './canvas-utils.js';

export function drawNokia5300Closed(ctx, x, y) {
    let w = 220, h = 360; 
    
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 30; ctx.shadowOffsetX = 15; ctx.shadowOffsetY = 20;
    ctx.fillStyle = '#f2f2f2'; roundRect(ctx, x, y, w, h, 40, true, false);
    ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

    ctx.strokeStyle = '#a0a0a0'; ctx.lineWidth = 2; roundRect(ctx, x, y, w, h, 40, false, true);
    
    let silverGrad = ctx.createLinearGradient(x, y, x, y+80);
    silverGrad.addColorStop(0, '#e5e9ec'); silverGrad.addColorStop(1, '#bdc3c7');
    ctx.save(); ctx.beginPath(); roundRect(ctx, x, y, w, 80, {tl:40, tr:40, bl:0, br:0}); ctx.clip();
    ctx.fillStyle = silverGrad; ctx.fillRect(x,y,w,80); ctx.restore();
    
    ctx.fillStyle = '#333'; roundRect(ctx, x+w/2-25, y+20, 50, 6, 3, true, false);
    ctx.fillStyle = '#666'; ctx.font = 'bold 18px "Arial Black", sans-serif'; ctx.textAlign='center';
    ctx.fillText("NOKIA", x+w/2, y+65); ctx.textAlign='left';

    let redGrad = ctx.createLinearGradient(x, 0, x+30, 0);
    redGrad.addColorStop(0, '#a71d1d'); redGrad.addColorStop(1, '#e53935');
    let rightRedGrad = ctx.createLinearGradient(x+w-30, 0, x+w, 0);
    rightRedGrad.addColorStop(0, '#e53935'); rightRedGrad.addColorStop(1, '#a71d1d');

    ctx.fillStyle = redGrad; ctx.fillRect(x-4, y+80, 30, 180); ctx.strokeStyle = '#8e1515'; ctx.strokeRect(x-4, y+80, 30, 180);
    ctx.fillStyle = '#fff'; ctx.font = '14px Arial';
    ctx.fillText("⏮", x+2, y+115); ctx.fillText("⏯", x+2, y+175); ctx.fillText("⏭", x+2, y+235);

    ctx.fillStyle = rightRedGrad; ctx.fillRect(x+w-26, y+80, 30, 180); ctx.strokeRect(x+w-26, y+80, 30, 180);
    ctx.fillStyle = '#fff'; ctx.font = '14px Arial'; ctx.fillText("📷", x+w-20, y+115);
    ctx.fillStyle = '#eee'; roundRect(ctx, x+w-18, y+160, 8, 40, 4, true, false);
    ctx.fillStyle = '#888'; ctx.font = '10px Arial'; ctx.fillText("+", x+w-16, y+175); ctx.fillText("-", x+w-15, y+195);

    ctx.fillStyle = '#111'; roundRect(ctx, x+26, y+80, w-52, 180, 10, true, false); 
    
    let screenGrad = ctx.createLinearGradient(x+30, y+84, x+30, y+256);
    screenGrad.addColorStop(0, '#ff9800'); screenGrad.addColorStop(1, '#f4511e');
    ctx.fillStyle = screenGrad; ctx.fillRect(x+30, y+84, w-60, 172); 
    
    ctx.fillStyle = '#fff'; ctx.font = '10px Arial';
    ctx.fillText("T..ll", x+35, y+98); 
    ctx.strokeStyle = '#fff'; ctx.strokeRect(x+65, y+90, 15, 8); ctx.fillStyle='#0f0'; ctx.fillRect(x+66, y+91, 11, 6);
    ctx.fillStyle = '#fff'; ctx.textAlign='right'; ctx.fillText("10:09", x+w-35, y+98); ctx.textAlign='left';
    
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath();
    for(let i=0; i<w-60; i++) {
        ctx.lineTo(x+30+i, y+140 + Math.sin(i*0.05 + state.timeTick*0.1) * 15);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(x+w/2, y+190, 25, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x+w/2-6, y+180); ctx.lineTo(x+w/2+10, y+190); ctx.lineTo(x+w/2-6, y+200); ctx.fill();
    
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x+30, y+240, w-60, 16);
    ctx.fillStyle = '#333'; ctx.font = 'bold 11px Arial'; ctx.textAlign='center';
    ctx.fillText("Menu", x+55, y+252); ctx.fillText("Menu", x+w/2, y+252); ctx.fillText("Menu", x+w-55, y+252);
    ctx.textAlign='left';

    let keyY = y + 270;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1;
    roundRect(ctx, x+30, keyY, 40, 18, 9, true, true);
    ctx.fillStyle = '#3498db'; roundRect(ctx, x+45, keyY+5, 10, 3, 1, true, false);
    
    ctx.fillStyle = '#fff'; roundRect(ctx, x+w-70, keyY, 40, 18, 9, true, true);
    ctx.fillStyle = '#3498db'; roundRect(ctx, x+w-55, keyY+5, 10, 3, 1, true, false);

    let dpX = x+w/2; let dpY = keyY + 28;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(dpX, dpY, 35, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(dpX, dpY, 28, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#f5f5f5'; ctx.beginPath(); ctx.arc(dpX, dpY, 14, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle='#aaa'; ctx.lineWidth=1; ctx.stroke();

    ctx.fillStyle = '#fff'; roundRect(ctx, x+30, keyY+35, 40, 18, 9, true, true); 
    ctx.fillStyle = '#2ecc71'; roundRect(ctx, x+42, keyY+40, 16, 4, 2, true, false);
    
    ctx.fillStyle = '#fff'; roundRect(ctx, x+w-70, keyY+35, 40, 18, 9, true, true); 
    ctx.fillStyle = '#e74c3c'; roundRect(ctx, x+w-58, keyY+40, 16, 4, 2, true, false);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(x+w-38, keyY+44, 3, 0, Math.PI*2); ctx.stroke();
}
