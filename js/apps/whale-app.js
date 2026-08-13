import { state } from '../state.js';
import { roundRect, wrapText } from '../ui/canvas-utils.js';
import { playNotificationSound, playWrongAnswerSound, playGlitchDestroySound } from '../ui/audio-manager.js';

function drawIMG001(ctx, bx, by, imgW, imgH) {
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, imgW, imgH); ctx.clip();
    ctx.fillStyle = '#5d4037'; ctx.fillRect(bx, by, imgW, imgH);
    
    let gradient = ctx.createRadialGradient(bx+imgW*0.8, by+imgH*0.2, 10, bx+imgW*0.8, by+imgH*0.2, imgW);
    gradient.addColorStop(0, '#ff8a65'); gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = gradient; ctx.fillRect(bx, by, imgW, imgH);
    
    ctx.fillStyle = '#111'; ctx.beginPath();
    ctx.arc(bx+imgW*0.4, by+imgH*0.5, 25, 0, Math.PI*2); 
    ctx.moveTo(bx+imgW*0.4-20, by+imgH*0.5+10); ctx.lineTo(bx+imgW*0.4-30, by+imgH);
    ctx.lineTo(bx+imgW*0.4+50, by+imgH); ctx.lineTo(bx+imgW*0.4+20, by+imgH*0.5+20);
    ctx.fill();
    
    ctx.strokeStyle = '#222'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(bx+imgW*0.7, by); ctx.lineTo(bx+imgW*0.7, by+imgH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx+imgW*0.7, by+imgH*0.4); ctx.lineTo(bx+imgW, by+imgH*0.4); ctx.stroke();
    ctx.restore();
}

export function drawWhaleChat(ctx, sx, sy, sw, sh) {
    if (state.autoScrollWhale) {
        state.scrollY = 999999;
    }

    let cy = sy + 60 - state.scrollY;
    
    ctx.fillStyle = '#0a0d12'; ctx.fillRect(sx, sy, sw, sh);
    if (cy > sy - 50 && cy < sy + sh) {
        ctx.fillStyle = '#1abc9c'; ctx.font = 'bold 14px "Courier New"'; ctx.textAlign = 'center';
        ctx.fillText("--- W.H.A.L.E. SECURE NODE ---", sx + sw/2, cy);
        ctx.textAlign = 'left';
    }
    cy += 40;

    for (let m of state.whaleChat) {
        let isMe = m.type === 'me';
        let hasImg = m.text.includes('【附件：IMG_001】');
        let displayTxt = m.text.replace('【附件：IMG_001】', '').trim();
        
        ctx.fillStyle = '#555'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
        if(cy > sy && cy < sy + sh) ctx.fillText(m.time, sx + sw/2, cy);
        ctx.textAlign = 'left';
        cy += 20;
        
        ctx.font = '14px Arial'; 
        let textW = ctx.measureText(displayTxt).width;
        let bw = hasImg ? sw * 0.7 : Math.min(textW + 32, sw * 0.7);
        let maxW = bw - 24;
        let bx = isMe ? sx + sw - bw - 15 : sx + 15;
        
        let bubbleH = 16;
        if (hasImg) bubbleH += 145;
        let fakeP = displayTxt.split('\n');
        let lineCount = 0;
        for(let p of fakeP) {
            if (p === '') continue;
            let words = p.split(''); let line = '';
            for(let n=0; n<words.length; n++) {
                let testLine = line + words[n];
                if(ctx.measureText(testLine).width > maxW && n > 0) { lineCount++; line = words[n]; }
                else { line = testLine; }
            }
            lineCount++;
        }
        if(lineCount === 0 && hasImg) lineCount = 0;
        bubbleH += lineCount * 20;
        
        if (!hasImg && lineCount === 1) bw = Math.min(textW + 32, sw*0.7);
        if (isMe) bx = sx + sw - bw - 15;

        if (cy + bubbleH > sy && cy < sy + sh) {
            ctx.fillStyle = isMe ? '#0e6655' : '#1b2631';
            roundRect(ctx, bx, cy, bw, bubbleH, 8, true, false);
            
            let textY = cy + 22;
            if (hasImg) {
                drawIMG001(ctx, bx + 10, cy + 10, bw - 20, 140);
                ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.strokeRect(bx + 10, cy + 10, bw - 20, 140);
                textY += 145;
            }
            
            ctx.fillStyle = '#1abc9c'; ctx.font = '14px Arial';
            if(displayTxt) wrapText(ctx, displayTxt, bx + 12, textY, maxW, 20);
        }
        cy += bubbleH + 20;
    }

    let activeQuest = state.whaleChat.find(m => m.id === 'ferryman_q1');
    if (activeQuest && !state.evidenceDestroyed) {
        if (!state.showFerrymanOptions) {
            let btnY = cy;
            if (btnY + 45 > sy && btnY < sy + sh) {
                ctx.fillStyle = '#e74c3c'; roundRect(ctx, sx+20, btnY, sw-40, 45, 5, true, false);
                ctx.fillStyle = '#fff'; ctx.textAlign='center'; ctx.font='bold 14px Arial'; ctx.fillText("[ 拦截到高权限交互指令，点击回复 ]", sx+sw/2, btnY+28); ctx.textAlign='left';
                state.addRegion(sx+20, btnY, sw-40, 45, () => { state.showFerrymanOptions = true; state.autoScrollWhale = true; });
            }
            cy += 65;
        } else {
            let options = [
                { id: 'A', text: "旧城书话。她聊《人间失格》，我接的话。" },
                { id: 'B', text: "同学介绍的。" },
                { id: 'C', text: "书店。她在看《人间失格》，我搭的话。" }
            ];
            for (let opt of options) {
                let optBx = sx + 20, optBy = cy, optBh = 50;
                let isClicked = state.ferrymanClickedOptions.has(opt.id);
                
                if (optBy + optBh > sy && optBy < sy + sh) {
                    let isHover = !isClicked && state.mouseX >= optBx && state.mouseX <= optBx + sw - 40 && state.mouseY >= optBy && state.mouseY <= optBy + optBh;
                    
                    ctx.fillStyle = isClicked ? 'rgba(100, 100, 100, 0.2)' : (isHover ? 'rgba(26, 188, 156, 0.4)' : 'rgba(26, 188, 156, 0.1)');
                    ctx.strokeStyle = isClicked ? '#555' : '#1abc9c'; 
                    ctx.lineWidth = 1; 
                    roundRect(ctx, optBx, optBy, sw - 40, optBh, 6, true, true);
                    
                    ctx.fillStyle = isClicked ? '#777' : '#1abc9c'; ctx.font='14px Arial'; 
                    ctx.fillText(opt.id + ". " + opt.text, optBx + 15, optBy + 30);
                    
                    if (!isClicked) {
                        state.addRegion(optBx, optBy, sw-40, optBh, () => {
                            state.whaleChat.push({ id: 'f_reply_' + opt.id, type: 'me', sender: '石头', time: '刚刚', text: opt.text });
                            
                            if (opt.id === 'A') {
                                activeQuest.id = 'ferryman_q1_done';
                                state.whaleChat.push({ id: 'f_ok', type: 'other', sender: '摆渡人', time: '刚刚', text: '记得挺牢。明天开始，让她多讲讲她家里。' });
                                state.secondPhoneVisible = true;
                                state.autoScrollWhale = true;
                                playNotificationSound();
                            } else {
                                state.ferrymanClickedOptions.add(opt.id);
                                state.ferrymanFailedCount++;
                                if (state.ferrymanFailedCount === 1) {
                                    state.whaleChat.push({ id: 'f_warn', type: 'other', sender: '摆渡人', time: '刚刚', text: '不对。你不是他。' });
                                    state.autoScrollWhale = true;
                                    playWrongAnswerSound();
                                } else if (state.ferrymanFailedCount === 2) {
                                    activeQuest.id = 'ferryman_q1_done'; 
                                    state.whaleChat.push({ id: 'f_die1', type: 'other', sender: '摆渡人', time: '刚刚', text: '手机落到别人手里了。' });
                                    state.autoScrollWhale = true;
                                    playGlitchDestroySound();
                                    
                                    setTimeout(() => {
                                        state.whaleChat.push({ id: 'f_die2', type: 'other', sender: '摆渡人', time: '刚刚', text: '那就都别要了。' });
                                        state.autoScrollWhale = true;
                                        playGlitchDestroySound();
                                        
                                        setTimeout(() => {
                                            state.evidenceDestroyed = true;
                                            state.currentApp = 'desktop';
                                            
                                            let appIdx = state.appsList.findIndex(a => a.id === 'whale_app');
                                            if (appIdx !== -1) state.appsList.splice(appIdx, 1);
                                            
                                            setTimeout(() => {
                                                state.screen = 'GAME_OVER';
                                            }, 1500);
                                            
                                        }, 2500); 
                                    }, 2000); 
                                }
                            }
                        });
                    }
                }
                cy += optBh + 15;
            }
        }
    }
    
    state.maxScrollY = Math.max(0, cy + state.scrollY - (sy + sh) + 50);
    if (state.autoScrollWhale || state.scrollY > state.maxScrollY) {
        state.scrollY = state.maxScrollY;
        state.autoScrollWhale = false;
    }
}
