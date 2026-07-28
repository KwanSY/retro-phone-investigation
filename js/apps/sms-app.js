import { state } from '../state.js';
import { roundRect, wrapText } from '../ui/canvas-utils.js';
import { smsInbox, smsOutbox } from '../data/sms-data.js';

export function drawSmsMenu(ctx, sx, sy, sw, sh) {
    let cy = sy + 60;
    let menus = [{name: '收件箱', type: 'inbox', icon: '📥'}, {name: '发件箱', type: 'outbox', icon: '📤'}];
    for(let i=0; i<menus.length; i++) {
        let bx = sx + 20, by = cy + i*80, bw = sw - 40, bh = 70;
        let isHover = state.mouseX >= bx && state.mouseX <= bx+bw && state.mouseY >= by && state.mouseY <= by+bh;
        ctx.fillStyle = isHover ? 'rgba(243, 156, 18, 0.3)' : 'rgba(255,255,255,0.05)';
        ctx.strokeStyle = isHover ? '#f39c12' : 'transparent'; ctx.lineWidth = 2;
        roundRect(ctx, bx, by, bw, bh, 10, true, isHover);
        
        ctx.fillStyle = '#fff'; ctx.font = '30px Arial'; ctx.fillText(menus[i].icon, bx + 15, by + 45);
        ctx.fillStyle = '#f39c12'; ctx.font = 'bold 18px Arial'; ctx.fillText(menus[i].name, bx + 65, by + 42);
        
        state.addRegion(bx, by, bw, bh, () => { state.smsBoxType = menus[i].type; state.currentApp = 'sms_list'; state.scrollY = 0; });
    }
}

export function drawSmsList(ctx, sx, sy, sw, sh) {
    let list = state.smsBoxType === 'inbox' ? smsInbox : smsOutbox;
    // 将短信列表倒序，让最新的（数组后添加的）排在最上面
    let displayList = [...list].reverse(); 
    
    let cy = sy + 55 - state.scrollY; // 【修复】统一下调，避开顶部40px的返回栏
    ctx.fillStyle = '#f39c12'; ctx.font = 'bold 16px Arial';
    ctx.fillText(state.smsBoxType === 'inbox' ? " 收件箱" : " 发件箱", sx + 10, cy); cy += 30;

    for (let sms of displayList) {
        let bx = sx + 10, by = cy, bh = 75, bw = sw - 20;
        if (by + bh > sy && by < sy + sh) {
            let isHover = state.mouseX >= bx && state.mouseX <= bx+bw && state.mouseY >= by && state.mouseY <= by+bh;
            ctx.fillStyle = isHover ? 'rgba(255,255,255,0.1)' : 'transparent'; ctx.fillRect(bx, by, bw, bh);
            
            ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial';
            ctx.fillText((state.smsBoxType === 'inbox' ? sms.sender : sms.receiver), bx + 15, by + 25);
            ctx.fillStyle = '#888'; ctx.font = '12px Arial'; ctx.textAlign='right'; ctx.fillText(sms.time, bx + bw - 15, by + 25); ctx.textAlign='left';
            
            ctx.fillStyle = '#ccc'; ctx.font = '14px Arial';
            let preview = sms.text.replace(/\n/g, ' ');
            ctx.fillText(preview.length > 22 ? preview.substring(0, 22) + "..." : preview, bx + 15, by + 50);
            ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.stroke();
            
            state.addRegion(bx, by, bw, bh, () => { state.selectedSmsId = sms.id; state.currentApp = 'sms_detail'; state.scrollY = 0; });
        }
        cy += bh;
    }
    state.maxScrollY = Math.max(0, cy + state.scrollY - (sy + sh));
}

export function drawSmsDetail(ctx, sx, sy, sw, sh) {
    let list = state.smsBoxType === 'inbox' ? smsInbox : smsOutbox;
    let sms = list.find(s => s.id === state.selectedSmsId);
    if (!sms) return;

    let cy = sy + 60 - state.scrollY;
    ctx.fillStyle = '#aaa'; ctx.font = '14px Arial';
    ctx.fillText((state.smsBoxType === 'inbox' ? "发件人: " : "收件人: ") + (sms.sender || sms.receiver), sx + 20, cy); cy += 25;
    ctx.fillText("时间: " + sms.time, sx + 20, cy); cy += 25;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.moveTo(sx + 20, cy); ctx.lineTo(sx + sw - 20, cy); ctx.stroke(); cy += 25;

    ctx.fillStyle = '#fff'; ctx.font = '16px Arial';
    cy += wrapText(ctx, sms.text, sx + 20, cy, sw - 40, 24);
    cy += 30;
    state.maxScrollY = Math.max(0, cy + state.scrollY - (sy + sh));
}
