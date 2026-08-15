import { state } from '../state.js';
import { roundRect, wrapText } from '../ui/canvas-utils.js';
import { galleryData } from '../data/gallery-data.js';

export function drawIMG001(ctx, bx, by, imgW, imgH) {
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

export function drawGalleryList(ctx, sx, sy, sw, sh) {
    let cy = sy + 60 - state.scrollY;
    let cols = 3; let padding = 12;
    let imgW = (sw - padding*4) / cols; let imgH = imgW;
    
    for (let i = 0; i < galleryData.length; i++) {
        let img = galleryData[i];
        let col = i % cols; let row = Math.floor(i / cols);
        let bx = sx + padding + col * (imgW + padding); let by = cy + row * (imgH + 40);
        
        if (by + imgH + 40 > sy && by < sy + sh) {
            let isHover = state.mouseX >= bx && state.mouseX <= bx + imgW && state.mouseY >= by && state.mouseY <= by + imgH;
            
            ctx.fillStyle = '#111'; ctx.fillRect(bx, by, imgW, imgH);
            ctx.strokeStyle = isHover ? '#3498db' : '#444'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, imgW, imgH);
            
            if (state.evidenceDestroyed && (img.id === 'img_009' || img.id === 'img_010')) {
                ctx.fillStyle = 'rgba(255,0,0,0.5)'; ctx.fillRect(bx, by, imgW, imgH);
                ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Arial'; ctx.textAlign='center'; ctx.fillText("X", bx+imgW/2, by+imgH/2+8);
            } else {
                ctx.fillStyle = '#555'; ctx.font = '24px Arial'; ctx.textAlign='center'; ctx.fillText("🖼️", bx+imgW/2, by+imgH/2+8);
            }
            ctx.fillStyle = '#ccc'; ctx.font = '11px Arial'; ctx.textAlign='center'; ctx.fillText(img.title, bx+imgW/2, by + imgH + 20); ctx.textAlign='left';
            state.addRegion(bx, by, imgW, imgH, () => { state.selectedImgId = img.id; state.currentApp = 'gallery_detail'; state.scrollY = 0; });
        }
    }
    let totalRows = Math.ceil(galleryData.length / cols);
    state.maxScrollY = Math.max(0, cy + totalRows * (imgH + 40) + state.scrollY - (sy + sh));
}

export function drawGalleryDetail(ctx, sx, sy, sw, sh) {
    let img = galleryData.find(i => i.id === state.selectedImgId);
    if (!img) return;

    let bx = sx + 20, by = sy + 60 - state.scrollY, imgW = sw - 40, imgH = 260;
    
    // 摧毁判定
    if (state.evidenceDestroyed && (img.id === 'img_009' || img.id === 'img_010')) {
        ctx.fillStyle = '#1a0000'; ctx.fillRect(bx, by, imgW, imgH);
        ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, imgW, imgH);
        ctx.fillStyle = '#ff0000'; ctx.font = 'bold 20px Arial'; ctx.textAlign='center'; ctx.fillText("[ 数据已损坏 ]", bx+imgW/2, by+imgH/2);
        ctx.font = '12px Arial'; ctx.fillText("摆渡人已远程执行销毁协议", bx+imgW/2, by+imgH/2+30); ctx.textAlign='left';
        return;
    }

    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, imgW, imgH); ctx.clip();
    
    if (img.type.startsWith('scene')) {
        ctx.fillStyle = img.type === 'scene_window' ? '#5d4037' : (img.type === 'scene_eat' ? '#37474f' : '#33691e');
        ctx.fillRect(bx, by, imgW, imgH);
        
        let gradient = ctx.createRadialGradient(bx+imgW*0.8, by+imgH*0.2, 10, bx+imgW*0.8, by+imgH*0.2, imgW);
        if(img.type === 'scene_window') { gradient.addColorStop(0, '#ff8a65'); gradient.addColorStop(1, 'rgba(0,0,0,0.6)'); } // 逆光
        if(img.type === 'scene_eat') { gradient.addColorStop(0, '#90a4ae'); gradient.addColorStop(1, 'rgba(0,0,0,0.7)'); } // 食堂
        if(img.type === 'scene_bus') { gradient.addColorStop(0, '#fff59d'); gradient.addColorStop(1, 'rgba(0,0,0,0.7)'); } // 路灯
        ctx.fillStyle = gradient; ctx.fillRect(bx, by, imgW, imgH);
        
        // 剪影
        ctx.fillStyle = '#111'; ctx.beginPath();
        if(img.type === 'scene_window') {
            ctx.arc(bx+imgW*0.4, by+imgH*0.5, 25, 0, Math.PI*2); 
            ctx.moveTo(bx+imgW*0.4-20, by+imgH*0.5+10); ctx.lineTo(bx+imgW*0.4-30, by+imgH);
            ctx.lineTo(bx+imgW*0.4+50, by+imgH); ctx.lineTo(bx+imgW*0.4+20, by+imgH*0.5+20);
        } else if (img.type === 'scene_eat') {
            ctx.arc(bx+imgW*0.5, by+imgH*0.6, 20, 0, Math.PI*2); 
            ctx.fillRect(bx+imgW*0.5-25, by+imgH*0.6+15, 50, imgH);
            ctx.fillStyle = '#333'; ctx.fillRect(bx, by+imgH-30, imgW, 30);
        } else {
            ctx.arc(bx+imgW*0.7, by+imgH*0.6, 20, 0, Math.PI*2); 
            ctx.fillRect(bx+imgW*0.7-15, by+imgH*0.6+15, 30, imgH);
        }
        ctx.fill();
    } else if (img.type === 'blur_diary') {
        // 安全的模糊实现：日记本纸张底色
        ctx.fillStyle = '#f4f1ea'; ctx.fillRect(bx, by, imgW, imgH); 
        
        // 绘制日记本横线
        ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 1;
        for(let l=by+40; l<by+imgH; l+=30) {
            ctx.beginPath(); ctx.moveTo(bx+15, l); ctx.lineTo(bx+imgW-15, l); ctx.stroke();
        }

        let cx = bx + 25, cy = by + 35;
        
        // 多段文字拆分，还原大段日记的视觉感，只让关键信息聚焦清晰
        let segments = [];
        if(img.id === 'img_004') {
            segments = [
                { t: "今天回家晚了……", blur: true },
                { t: "爸又", blur: false },
                { t: "无缘无故把我", blur: true },
                { t: "骂哭", blur: false },
                { t: "……躲在被子里听", blur: true },
                { t: "耳机", blur: false },
                { t: "……不想活了", blur: true }
            ];
        } else if(img.id === 'img_005') {
            segments = [
                { t: "不知不觉", blur: true },
                { t: "转学半年", blur: false },
                { t: "了……还是", blur: true },
                { t: "没人一起吃饭", blur: false },
                { t: "……早就已经", blur: true },
                { t: "习惯了", blur: false },
                { t: "……", blur: true }
            ];
        } else if(img.id === 'img_006') {
            segments = [
                { t: "外面一直在", blur: true },
                { t: "打雷", blur: false },
                { t: "……屋里好黑……我", blur: true },
                { t: "不敢睡", blur: false },
                { t: "……救救我……", blur: true }
            ];
        }

        ctx.save();
        for (let seg of segments) {
            if (seg.blur) {
                ctx.filter = 'blur(2.5px)'; // 模糊的钢笔字
                ctx.font = '20px "楷体", "Kaiti", serif';
                ctx.fillStyle = '#546e7a';
            } else {
                ctx.filter = 'none'; // 焦点清晰的钢笔字
                ctx.font = 'bold 22px "楷体", "Kaiti", serif';
                ctx.fillStyle = '#2c3e50'; // 取消红色，使用同色系但更深的墨水色，不再突兀
            }
            
            let chars = seg.t.split('');
            for (let c of chars) {
                let cw = ctx.measureText(c).width;
                if (cx + cw > bx + imgW - 25) { 
                    cx = bx + 25; 
                    cy += 30; // 自动换行
                }
                ctx.fillText(c, cx, cy);
                cx += cw;
            }
        }
        ctx.restore();
    } else if (img.type === 'sharp_text') {
        ctx.fillStyle = '#efebe9'; ctx.fillRect(bx, by, imgW, imgH);
        ctx.fillStyle = '#111'; ctx.font = 'bold 16px Arial';
        let cy = by + 40;
        let lines = img.text.split('\n');
        for(let l of lines) { ctx.fillText(l, bx+15, cy); cy+=30; }
    } else if (img.type === 'group_photo') {
        ctx.fillStyle = '#90a4ae'; ctx.fillRect(bx, by, imgW, imgH);
        ctx.fillStyle = '#546e7a'; // 台阶阴影
        for(let i=0; i<4; i++) ctx.fillRect(bx, by + imgH*0.35 + i*35, imgW, 35);
        ctx.fillStyle = '#263238'; 
        // 绘制4排、每排10个人的剪影
        for(let row=0; row<4; row++) {
            let cols = 10;
            let spacing = imgW / cols;
            let startY = by + imgH*0.35 + row*35 - 15;
            for(let col=0; col<cols; col++) {
                ctx.beginPath();
                let px = bx + col*spacing + spacing/2 + (row%2)*6; // 稍微错开站位
                ctx.arc(px, startY, 9, 0, Math.PI*2); // 头
                ctx.fill();
                ctx.fillRect(px - 10, startY + 8, 20, 25); // 身体
            }
        }
    } else if (img.type === 'friends') {
        let grad = ctx.createLinearGradient(bx, by, bx, by+imgH);
        grad.addColorStop(0, '#ffcc80'); grad.addColorStop(1, '#ffab91'); // 黄昏背景
        ctx.fillStyle = grad; ctx.fillRect(bx, by, imgW, imgH);
        
        ctx.fillStyle = '#3e2723';
        // 左侧人物
        ctx.beginPath(); ctx.arc(bx + imgW*0.35, by + imgH*0.5, 28, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(bx + imgW*0.35 - 32, by + imgH*0.5 + 25, 64, imgH);
        // 右侧人物
        ctx.beginPath(); ctx.arc(bx + imgW*0.65, by + imgH*0.55, 26, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(bx + imgW*0.65 - 28, by + imgH*0.55 + 22, 56, imgH);
        // 勾肩搭背的手臂
        ctx.beginPath(); ctx.moveTo(bx + imgW*0.35, by + imgH*0.5 + 40);
        ctx.quadraticCurveTo(bx + imgW*0.5, by + imgH*0.5 + 20, bx + imgW*0.65 + 30, by + imgH*0.55 + 45);
        ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.strokeStyle = '#3e2723'; ctx.stroke();
    } else if (img.type === 'mp3') {
        ctx.fillStyle = '#8d6e63'; ctx.fillRect(bx, by, imgW, imgH); // 木质底色
        ctx.strokeStyle = '#795548'; ctx.lineWidth = 3;
        // 木纹肌理
        for(let i=0; i<6; i++) {
            ctx.beginPath(); ctx.moveTo(bx, by + i*45); ctx.lineTo(bx+imgW, by + i*45 + (i%2==0?20:-20)); ctx.stroke();
        }
        
        // MP3 播放器机身
        let mp3X = bx + imgW/2 - 35, mp3Y = by + imgH/2 - 65, mp3W = 70, mp3H = 130;
        ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 15;
        ctx.fillStyle = '#f5f5f5'; roundRect(ctx, mp3X, mp3Y, mp3W, mp3H, 10, true, false);
        ctx.shadowBlur = 0;
        
        // 屏幕与按键环
        ctx.fillStyle = '#9e9e9e'; roundRect(ctx, mp3X + 8, mp3Y + 10, mp3W - 16, 45, 5, true, false); 
        ctx.fillStyle = '#b0bec5'; ctx.fillRect(mp3X + 12, mp3Y + 15, mp3W - 24, 35); // 屏幕亮起
        ctx.fillStyle = '#e0e0e0'; ctx.beginPath(); ctx.arc(mp3X + mp3W/2, mp3Y + 90, 22, 0, Math.PI*2); ctx.fill(); // 滚轮
        ctx.fillStyle = '#bdbdbd'; ctx.beginPath(); ctx.arc(mp3X + mp3W/2, mp3Y + 90, 8, 0, Math.PI*2); ctx.fill(); // 确认键
        
        // 耳机线与耳机头
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(mp3X + mp3W/2, mp3Y); 
        ctx.quadraticCurveTo(bx + imgW*0.9, by + 30, bx + imgW - 30, by + imgH - 20); ctx.stroke();
        ctx.beginPath(); ctx.arc(bx + imgW - 30, by + imgH - 15, 6, 0, Math.PI*2); ctx.fillStyle='#eee'; ctx.fill();
    } else {
        ctx.fillStyle = '#2c3e50'; ctx.fillRect(bx, by, imgW, imgH);
        ctx.fillStyle = '#fff'; ctx.font = '16px Arial'; ctx.textAlign='center'; ctx.fillText(img.desc, bx+imgW/2, by+imgH/2); ctx.textAlign='left';
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; ctx.strokeRect(bx, by, imgW, imgH);
    ctx.fillStyle = '#00f3ff'; ctx.font = 'bold 18px Arial'; ctx.fillText(img.title, bx, by + imgH + 40);
    if(img.desc) { ctx.fillStyle = '#ccc'; ctx.font = '14px Arial'; wrapText(ctx, img.desc, bx, by + imgH + 70, imgW, 20); }
    
    state.maxScrollY = Math.max(0, by + imgH + 150 + state.scrollY - (sy + sh));
}
