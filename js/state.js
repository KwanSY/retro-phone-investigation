import { getInitialWhaleChat, getInitialAppsList } from './data/whale-data.js';

class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.screen = 'START_SCREEN';
        this.currentApp = 'desktop';
        this.mouseX = 0;
        this.mouseY = 0;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.clickRegions = [];
        this.timeTick = 0;
        this.scrollY = 0;
        this.maxScrollY = 0;
        this.autoScrollWhale = false;
        this.appsOpened = new Set();
        this.ferrymanTriggered = false;
        this.ferrymanFailedCount = 0;
        this.evidenceDestroyed = false;
        this.showFerrymanOptions = false;
        this.ferrymanClickedOptions = new Set();
        this.secondPhoneVisible = false;
        this.secondPhoneUnlocked = false;
        this.inputPassword = "";
        this.smsBoxType = 'inbox';
        this.selectedSmsId = null;
        this.selectedImgId = null;
        this.qqCategory = 'groups';
        this.selectedQQId = null;
        this.whaleChat = getInitialWhaleChat();
        this.appsList = getInitialAppsList();
    }

    addRegion(x, y, w, h, onClick) {
        this.clickRegions.push({ x, y, w, h, onClick });
    }
}

export const state = new GameState();
