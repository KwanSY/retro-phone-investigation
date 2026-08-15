// js/router.js - App routing for the phone terminal
import { state } from './state.js';
import { drawDesktop } from './apps/desktop.js';
import { drawSmsMenu, drawSmsList, drawSmsDetail } from './apps/sms-app.js';
import { drawGalleryList, drawGalleryDetail } from './apps/gallery-app.js';
import { drawQQMenu, drawQQList, drawQQChat, drawQQZone } from './apps/qq-app.js';
import { drawNotes } from './apps/notes-app.js';
import { drawContacts } from './apps/contacts-app.js';
import { drawWhaleChat } from './apps/whale-app.js';

// Route table: maps currentApp string to its draw function
const appRenderers = {
    'desktop':        drawDesktop,
    'sms_menu':       drawSmsMenu,
    'sms_list':       drawSmsList,
    'sms_detail':     drawSmsDetail,
    'gallery_list':   drawGalleryList,
    'gallery_detail': drawGalleryDetail,
    'qq_menu':        drawQQMenu,
    'qq_list':        drawQQList,
    'qq_chat':        drawQQChat,
    'qq_qzone':       drawQQZone,
    'notes':          drawNotes,
    'contacts':       drawContacts,
    'whale_app':      drawWhaleChat,
};

// Back navigation routes
const backRoutes = {
    'sms_detail':     'sms_list',
    'sms_list':       'sms_menu',
    'gallery_detail': 'gallery_list',
    'qq_chat':        'qq_list',
    'qq_list':        'qq_menu',
    'qq_qzone':       'qq_menu',
};

/**
 * Render the current app inside the terminal screen area.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} appId - the currentApp identifier
 * @param {number} sx - screen x
 * @param {number} sy - screen y
 * @param {number} sw - screen width
 * @param {number} sh - screen height
 */
export function renderApp(ctx, appId, sx, sy, sw, sh) {
    const renderer = appRenderers[appId];
    if (renderer) {
        renderer(ctx, sx, sy, sw, sh);
    } else {
        ctx.fillStyle = '#fff';
        ctx.fillText("此功能无需勘验...", sx + 20, sy + 50);
    }
}

/**
 * Navigate back one level. Uses the backRoutes table.
 */
export function goBack() {
    state.currentApp = backRoutes[state.currentApp] || 'desktop';
    state.scrollY = 0;
}
