// <-- comment ( file)(renderer.js)
// renderer.js (Root Renderer Process Logic - Main Entry Point)

// --- Core Modules ---
const { setupWindowControls } = require('./javascript/window-controls.js');
const { resetUI } = require('./javascript/utils.js');

// --- New Rendering Modules ---
const { initializeAppEventListeners } = require('./rendering/event-listeners.js');
const { updateAppTitleWithVersion } = require('./rendering/view-renderer.js');
const { initializeHistory } = require('./rendering/history-manager.js');


// --- Initialization Code ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Renderer: DOM Content Loaded.");

    // 1. Setup OS-like window controls (min, max, close)
    try {
        setupWindowControls();
    } catch (err) {
        console.error("Error setting up window controls:", err);
    }

    // 2. Setup all application-specific event listeners (clicks, drag-drop, etc.)
    try {
        initializeAppEventListeners();
    } catch(err) {
        console.error("Error setting up app event listeners:", err);
    }
    
    // 3. Initialize the history feature
    initializeHistory();

    // 4. Update the window title with the app version
    updateAppTitleWithVersion();

    // 5. Set the initial UI state (show prompt, hide views)
    resetUI();

    // 6. Hide the loading screen gracefully
    if (window.appLoading && typeof window.appLoading.hide === 'function') {
        setTimeout(() => { window.appLoading.hide(); }, 150);
    } else {
        console.error("Loading screen hide function (window.appLoading.hide) not found!");
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
             setTimeout(() => { loadingScreen.remove(); console.warn("Force removed loading screen as fallback."); }, 500);
        }
    }

    console.log("Zip Analyser UI Initialized (Renderer).");
});
// <-- end comment (.js file)(renderer.js)