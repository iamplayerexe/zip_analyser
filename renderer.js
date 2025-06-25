// renderer.js
const { ipcRenderer } = require('electron');
const { initializeAppEventListeners } = require('./rendering/event-listeners.js');
const { updateAppTitleWithVersion } = require('./rendering/view-renderer.js');
const { initializeHistory } = require('./rendering/history-manager.js');
const { resetUI } = require('./javascript/utils.js');

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Gathering ---
    const elements = {
        loadingScreen: document.getElementById('loading-screen'),
        themeToggle: document.getElementById('theme-toggle'),
        minButton: document.getElementById('min-button'),
        maxButton: document.getElementById('max-button'),
        restoreButton: document.getElementById('restore-button'),
        closeButton: document.getElementById('close-button'),
    };

    // --- Theme Setup ---
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

    elements.themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // --- Window Controls Setup ---
    elements.minButton?.addEventListener('click', () => ipcRenderer.invoke('minimizeApp'));
    elements.maxButton?.addEventListener('click', () => ipcRenderer.invoke('toggleMaximizeApp'));
    elements.restoreButton?.addEventListener('click', () => ipcRenderer.invoke('toggleMaximizeApp'));
    elements.closeButton?.addEventListener('click', () => ipcRenderer.invoke('closeApp'));

    ipcRenderer.on('window-maximized', () => {
        elements.maxButton.style.display = 'none';
        elements.restoreButton.style.display = 'flex';
    });
    ipcRenderer.on('window-unmaximized', () => {
        elements.maxButton.style.display = 'flex';
        elements.restoreButton.style.display = 'none';
    });
    
    // --- Original Initialization Logic ---
    initializeAppEventListeners();
    initializeHistory();
    // MODIFIED: Simplified the call since the function now handles the DOM update itself.
    updateAppTitleWithVersion();
    resetUI();

    // --- Loading Screen Logic ---
    setTimeout(() => {
        if (elements.loadingScreen) {
            elements.loadingScreen.classList.add('fade-out');
            elements.loadingScreen.addEventListener('transitionend', () => {
                elements.loadingScreen.remove();
            }, { once: true });
        }
    }, 150);

    console.log("Zip Analyser UI Initialized.");
});