import { state } from '../state.js';
import { roundRect, wrapText } from '../ui/canvas-utils.js';
import { qqFriends, qqGroup, qqQzone } from '../data/qq-data.js';

export function drawQQMenu(ctx, sx, sy, sw, sh) {
    let cy = sy + 60;
    let menus = [
        {name: '联系人 (私聊)', cat: 'friends', icon: '👤', desc: '阿树, 念念想冬眠 等'}, 
        {name: '群组聊天', cat: 'groups', icon: '👥', desc: 'GAME OVER电玩, 高二三班 等'},
        {name: 'QQ空间动态', cat: 'qzone', icon: '🌟', desc: '异常拦截记录'}
    ];
    for (let i = 0; i < menus.length; i++) {
        let bx = sx + 20, by = cy + i*80, bw = sw - 40, bh = 70;
        let isHover = state.mouseX >= bx && state.mouseX <= bx+bw && state.mouseY >= by && state.mouseY <= by+bh;
        ctx.fillStyle = isHover ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255,255,255,0.05)';
        ctx.strokeStyle = isHover ? '#2ecc71' : 'transparent'; ctx.lineWidth=2;
        roundRect(ctx, bx, by, bw, bh, 10, true, isHover);
        
        ctx.fillStyle = '#fff'; ctx.font = '30px Arial'; ctx.fillText(menus[i].icon, bx + 15, by + 45);
        ctx.fillStyle = '#2ecc71'; ctx.font = 'bold 18px Arial'; ctx.fillText(menus[i].name, bx + 65, by + 35);
        ctx.fillStyle = '#aaa'; ctx.font = '12px Arial'; ctx.fillText(menus[i].desc, bx + 65, by + 55);
        
        state.addRegion(bx, by, bw, bh, () => { 
            if (menus[i].cat === 'qzone') state.currentApp = 'qq_qzone';
            else { state.currentApp = 'qq_list'; state.qqCategory = menus[i].cat; }
            state.scrollY = 0; 
        });
    }
}

export function drawQQList(ctx, sx, sy, sw, sh) {
    let list = state.qqCategory === 'groups' ? qqGroup : qqFriends;
    let cy = sy + 60 - state.scrollY; 
    for (let item of list) {
        let bx = sx + 10, by = cy, bh = 70;
        if (by + bh > sy && by < sy + sh) {
            let isHover = state.mouseX >= bx && state.mouseX <= bx + sw - 20 && state.mouseY >= by && state.mouseY <= by + bh;
            ctx.fillStyle = isHover ? 'rgba(255,255,255,0.1)' : 'transparent'; ctx.fillRect(bx, by, sw - 20, bh);
            
            // 头像
            ctx.fillStyle = state.qqCategory === 'groups' ? '#e67e22' : '#9b59b6';
            ctx.beginPath(); ctx.arc(bx + 35, by + 35, 22, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = '24px Arial'; ctx.textAlign='center';
            ctx.fillText(item.avatar || (state.qqCategory==='groups'?'👥':'👤'), bx + 35, by + 43);
            
            ctx.textAlign='left'; ctx.fillStyle = '#00f3ff'; ctx.font = 'bold 16px Arial';
            ctx.fillText(item.name + (item.members ? ` (${item.members}人)` : ''), bx + 70, by + 35);
            
            let lastMsg = item.messages[item.messages.length-1].text;
            ctx.fillStyle = '#aaa'; ctx.font = '12px Arial';
            ctx.fillText(lastMsg.length > 20 ? lastMsg.substring(0,20)+"..." : lastMsg, bx + 70, by + 55);
            
            ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(bx, by + bh); ctx.lineTo(bx + sw - 20, by + bh); ctx.stroke();
            
            state.addRegion(bx, by, sw - 20, bh, () => { state.selectedQQId = item.id; state.currentApp = 'qq_chat'; state.scrollY = 0; });
        }
        cy += bh;
    }
    state.maxScrollY = Math.max(0, cy + state.scrollY - (sy + sh));
}

export function drawQQChat(ctx, sx, sy, sw, sh) {
    let cy = sy + 60 - state.scrollY; 
    let dataList = state.qqCategory === 'groups' ? qqGroup : qqFriends;
    let chatData = dataList.find(c => c.id === state.selectedQQId);
    if (!chatData) return;

    for (let m of chatData.messages) {
        if (m.type === 'time' || m.type === 'system') {
            if (cy > sy && cy < sy + sh) {
                ctx.fillStyle = '#888'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
                let lines = m.text.split('\n');
                for(let i=0; i<lines.length; i++) ctx.fillText(lines[i], sx + sw/2, cy + i*16);
                ctx.textAlign = 'left';
            }
            // 动态计算系统消息/时间消息的高度，消除固定的过大间隙
            cy += 20 + m.text.split('\n').length * 16;
        } else {
            let isMe = m.type === 'me';
            // 统一使用14px字体进行严格测量
            ctx.font = '14px Arial'; 
            
            let fakeP = m.text.split('\n');
            let lineCount = 0;
            let maxTextW = 0;
            let maxBubbleW = sw * 0.6;
            
            // 逐字排版测量，计算真实的折行
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

            // 统一气泡高度计算：基础留白(上下各8px) + 行高(每行20px)
            let bubbleW = maxTextW + 24; 
            let bubbleH = 16 + lineCount * 20; 
            
            if (cy + bubbleH + 30 > sy && cy < sy + sh) {
                let bx = isMe ? sx + sw - bubbleW - 55 : sx + 55;
                
                // 头像
                let avX = isMe ? sx + sw - 30 : sx + 30;
                ctx.fillStyle = isMe ? '#2980b9' : '#8e44ad';
                if(m.sender==='念念想冬眠') ctx.fillStyle = '#74b9ff';
                if(m.sender==='阿树') ctx.fillStyle = '#e67e22';
                ctx.beginPath(); ctx.arc(avX, cy + 15, 18, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle='#fff'; ctx.font='18px Arial'; ctx.textAlign='center';
                let avIcon = m.sender==='念念想冬眠' ? '👧' : (m.sender==='阿树' ? '👦' : m.sender.charAt(0));
                if(isMe) avIcon = '🪨';
                ctx.fillText(avIcon, avX, cy+22);
                
                // 名字外置
                ctx.fillStyle = '#aaa'; ctx.font = '12px Arial'; ctx.textAlign = isMe ? 'right' : 'left';
                ctx.fillText(m.sender, isMe ? sx + sw - 60 : sx + 60, cy);
                
                // 气泡绘制
                ctx.fillStyle = isMe ? '#e1f5fe' : '#ffffff'; ctx.textAlign = 'left';
                roundRect(ctx, bx, cy + 5, bubbleW, bubbleH, 8, true, false);
                
                ctx.fillStyle = '#333'; ctx.font = '14px Arial';
                // 文字基线偏移：气泡顶端是 cy+5，加上22px的文字基线留白，恰好绝对垂直居中！
                wrapText(ctx, m.text, bx + 12, cy + 27, maxBubbleW, 20);
            }
            cy += bubbleH + 25; 
        }
    }
    state.maxScrollY = Math.max(0, cy + state.scrollY - (sy + sh) + 50);
}

export function drawQQZone(ctx, sx, sy, sw, sh) {
    let cy = sy + 60 - state.scrollY; 
    for (let post of qqQzone) {
        let bx = sx + 20;
        if (cy + 100 > sy && cy < sy + sh) {
            ctx.fillStyle = '#74b9ff'; ctx.beginPath(); ctx.arc(bx+20, cy+20, 20, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = '22px Arial'; ctx.textAlign='center'; ctx.fillText(post.avatar, bx+20, cy+28);
            ctx.textAlign='left';
            
            ctx.fillStyle = '#00f3ff'; ctx.font = 'bold 16px Arial'; ctx.fillText(post.sender, bx + 55, cy + 15);
            ctx.fillStyle = '#888'; ctx.font = '12px Arial'; ctx.fillText(post.time, bx + 55, cy + 32);
        }
        cy += 60;
        
        ctx.fillStyle = '#ddd'; ctx.font = '14px Arial';
        let th = wrapText(ctx, post.text, bx, cy, sw - 40, 22);
        cy += th + 20;
        
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(bx, cy); ctx.lineTo(bx + sw - 40, cy); ctx.stroke();
        cy += 20;
    }
    state.maxScrollY = Math.max(0, cy + state.scrollY - (sy + sh));
}
