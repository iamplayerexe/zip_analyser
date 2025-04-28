// src/javascript/window-controls.js
const { ipcRenderer } = require('electron');

// This function sets up the listeners
function setupWindowControls() {
    // Require elements here to ensure they are loaded when function is called
    // Use a try-catch block for robustness
    let elements;
    try {
        elements = require('./dom-elements.js');
    } catch (err) {
        console.error("Failed to require dom-elements within setupWindowControls:", err);
        return; // Cannot setup controls if elements aren't loaded
    }


    // Add optional chaining (?) for safety in case elements aren't found in the DOM
    elements.closeButton?.addEventListener('click', () => {
        console.log("Renderer: Close button clicked");
        ipcRenderer.invoke('closeApp'); // Matches handler in main process
    });

    elements.minButton?.addEventListener('click', () => {
        console.log("Renderer: Minimize button clicked");
        ipcRenderer.invoke('minimizeApp'); // Matches handler in main process
    });

    elements.maxButton?.addEventListener('click', () => {
        console.log("Renderer: Maximize button clicked");
        ipcRenderer.invoke('toggleMaximizeApp'); // Use the single toggle handler
    });

    elements.restoreButton?.addEventListener('click', () => {
        console.log("Renderer: Restore button clicked");
        ipcRenderer.invoke('toggleMaximizeApp'); // Use the single toggle handler
    });

    // Listen for maximize/unmaximize events from main process to update body class
    ipcRenderer.on('window-maximized', () => {
        console.log("Renderer: Received window-maximized");
        document.body.classList.add('maximized');
    });

    ipcRenderer.on('window-unmaximized', () => {
         console.log("Renderer: Received window-unmaximized");
        document.body.classList.remove('maximized');
    });

     console.log("Renderer: Window controls listeners set up.");
}

module.exports = { setupWindowControls };