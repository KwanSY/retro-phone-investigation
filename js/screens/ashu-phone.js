import { state } from '../state.js';
import { drawDisconnectButton } from '../ui/canvas-utils.js';

export function drawAshuPhone(ctx, canvas) {
    let w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 30px Arial'; ctx.textAlign='center';
    ctx.fillText("S40-02 (阿树终端) 解密成功", w/2, h/2 - 40);
    
    ctx.fillStyle = '#aaa'; ctx.font = '16px Arial';
    ctx.fillText("系统提示：设备内容已被远端物理销毁程序覆盖。", w/2, h/2 + 10);
    ctx.fillText("仅保留了最后一段碎片录音，是否读取？", w/2, h/2 + 40);
    
    drawDisconnectButton(ctx, w/2 - 75, h/2 + 100);
    ctx.textAlign='left';
}
