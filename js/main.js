// js/main.js - Game entry point
import { state } from './state.js';
import { drawStartScreen } from './screens/start-screen.js';
import { drawPasswordScreen } from './screens/password-screen.js';
import { drawAshuPhone } from './screens/ashu-phone.js';
import { drawGameOverScreen } from './screens/game-over-screen.js';
import { drawMainScreen } from './screens/main-screen.js';

// --- Canvas Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const DESIGN_W = 1200;
const DESIGN_H = 760;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

// --- Main Game Loop ---
function draw() {
    state.clickRegions = []; // Clear per frame
    
    // Background fill to avoid black bars during letterboxing
    ctx.fillStyle = '#0b0f17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scale factor to guarantee whole game fits on any resolution
    let scaleX = canvas.width / DESIGN_W;
    let scaleY = canvas.height / DESIGN_H;
    let scale = Math.min(scaleX, scaleY);
    
    let offsetX = (canvas.width - DESIGN_W * scale) / 2;
    let offsetY = (canvas.height - DESIGN_H * scale) / 2;

    state.scale = scale;
    state.offsetX = offsetX;
    state.offsetY = offsetY;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const vCanvas = { width: DESIGN_W, height: DESIGN_H };

    if (state.screen === 'START_SCREEN')       drawStartScreen(ctx, vCanvas);
    else if (state.screen === 'PASSWORD_INPUT') drawPasswordScreen(ctx, vCanvas);
    else if (state.screen === 'ASHU_PHONE')     drawAshuPhone(ctx, vCanvas);
    else if (state.screen === 'GAME_OVER')      drawGameOverScreen(ctx, vCanvas);
    else                                        drawMainScreen(ctx, vCanvas);

    ctx.restore();
    
    state.timeTick++;
    requestAnimationFrame(draw);
}

// --- Event Listeners ---
canvas.addEventListener('mousemove', e => {
    if (state.scale) {
        state.mouseX = (e.clientX - state.offsetX) / state.scale;
        state.mouseY = (e.clientY - state.offsetY) / state.scale;
    } else {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
    }
});

canvas.addEventListener('mousedown', e => {
    for (let i = state.clickRegions.length - 1; i >= 0; i--) {
        let r = state.clickRegions[i];
        if (state.mouseX >= r.x && state.mouseX <= r.x + r.w &&
            state.mouseY >= r.y && state.mouseY <= r.y + r.h) {
            r.onClick();
            break; // Stop at highest z-index element
        }
    }
});

canvas.addEventListener('wheel', e => {
    e.preventDefault(); 
    let scrollable = ['sms_list', 'sms_detail', 'gallery_list', 'gallery_detail',
                       'qq_list', 'qq_chat', 'qq_qzone', 'whale_app', 'notes', 'contacts'];
    if (state.screen === 'DESKTOP' && scrollable.includes(state.currentApp)) {
        state.scrollY += e.deltaY * 0.5;
        state.scrollY = Math.max(0, Math.min(state.maxScrollY, state.scrollY));
    }
}, { passive: false });

// --- Initialize ---
resize();
draw();
