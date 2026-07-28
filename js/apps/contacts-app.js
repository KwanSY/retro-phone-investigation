import { state } from '../state.js';
import { roundRect, wrapText } from '../ui/canvas-utils.js';
import { contactsData } from '../data/contacts-data.js';

export function drawContacts(ctx, sx, sy, sw, sh) {
    let cy = sy + 65 - state.scrollY;
    ctx.fillStyle = '#9b59b6'; ctx.font = 'bold 16px Arial';
    if (cy > sy - 20 && cy < sy + sh) ctx.fillText("通讯录 (本地存储)", sx + 20, cy);
    cy += 30;

    for (let c of contactsData) {
        let bx = sx + 10, by = cy, bh = 60, bw = sw - 20;
        if (by + bh > sy && by < sy + sh) {
            let isHover = state.mouseX >= bx && state.mouseX <= bx+bw && state.mouseY >= by && state.mouseY <= by+bh;
            ctx.fillStyle = isHover ? 'rgba(255,255,255,0.1)' : 'transparent'; 
            ctx.fillRect(bx, by, bw, bh);
            
            ctx.fillStyle = '#9b59b6'; ctx.beginPath(); ctx.arc(bx + 30, by + 30, 18, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = '18px Arial'; ctx.textAlign='center';
            ctx.fillText(c.name.charAt(0), bx + 30, by + 36);
            
            ctx.textAlign='left'; ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.fillText(c.name, bx + 60, by + 26);
            ctx.fillStyle = '#aaa'; ctx.font = '14px Arial'; ctx.fillText(c.phone, bx + 60, by + 46);
            ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.stroke();
        }
        cy += bh;
    }
    state.maxScrollY = Math.max(0, cy + state.scrollY - (sy + sh));
}
