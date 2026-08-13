import { state } from '../state.js';
import { roundRect } from '../ui/canvas-utils.js';

export function drawPasswordScreen(ctx, canvas) {
    let w = canvas.width, h = canvas.height;
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, w, h);
    
    let bx = w/2 - 150, by = h/2 - 200, bw = 300, bh = 400;
    ctx.fillStyle = '#1e272e'; ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 2;
    roundRect(ctx, bx, by, bw, bh, 15, true, true);
    
    ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 20px Arial'; ctx.textAlign='center';
    ctx.fillText("输入 S40-02 锁屏密码", w/2, by + 40);
    
    ctx.fillStyle = '#111'; roundRect(ctx, bx+20, by+70, bw-40, 50, 5, true, false);
    ctx.fillStyle = '#fff'; ctx.font = '30px Courier New';
    let displayPw = state.inputPassword.replace(/./g, '*');
    ctx.fillText(displayPw || "____", w/2, by + 105);
    
    let keys = ['1','2','3','4','5','6','7','8','9','退格','0','取消'];
    for(let i=0; i<12; i++) {
        let row = Math.floor(i/3); let col = i%3;
        let kx = bx + 25 + col * 85; let ky = by + 140 + row * 60;
        let isHover = state.mouseX>=kx && state.mouseX<=kx+80 && state.mouseY>=ky && state.mouseY<=ky+50;
        ctx.fillStyle = isHover ? 'rgba(241, 196, 15, 0.4)' : '#2f3640';
        roundRect(ctx, kx, ky, 80, 50, 5, true, false);
        
        ctx.fillStyle = '#fff'; ctx.font = '20px Arial';
        ctx.fillText(keys[i], kx+40, ky+32);
        
        state.addRegion(kx, ky, 80, 50, () => {
            if(keys[i] === '退格') state.inputPassword = state.inputPassword.slice(0, -1);
            else if(keys[i] === '取消') state.screen = 'START_SCREEN';
            else {
                if(state.inputPassword.length < 4) state.inputPassword += keys[i];
                if(state.inputPassword.length === 4) {
                    if(state.inputPassword === '0316') {
                        state.secondPhoneUnlocked = true;
                        state.screen = 'ASHU_PHONE';
                    } else {
                        state.inputPassword = "";
                    }
                }
            }
        });
    }
    ctx.textAlign='left';
}
