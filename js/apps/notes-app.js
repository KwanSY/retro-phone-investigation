import { state } from '../state.js';
import { roundRect, wrapText } from '../ui/canvas-utils.js';
import { notesData } from '../data/contacts-data.js';

export function drawNotes(ctx, sx, sy, sw, sh) {
    ctx.fillStyle = '#fffae6'; ctx.fillRect(sx, sy, sw, sh);
    ctx.fillStyle = '#333'; ctx.font = '16px "Courier New", monospace';
    let cy = sy + 60;
    for(let n of notesData) {
        wrapText(ctx, n, sx + 20, cy, sw - 40, 28);
        cy += 50;
    }
}
