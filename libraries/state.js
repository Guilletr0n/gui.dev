
const STATE_KEY = 'appState';

export function getState() {
    let state = localStorage.getItem(STATE_KEY);
    return state ? JSON.parse(state) : {};
}

export function setState(newState) {
    localStorage.setItem(STATE_KEY, JSON.stringify(newState));
}

export function getMenuLevel() {
    const state = getState();
    return state.menuLevel || 1;
}

export function setMenuLevel(level) {
    const state = getState();
    state.menuLevel = level;
    setState(state);
}