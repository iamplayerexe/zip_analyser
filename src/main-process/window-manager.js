// src/main-process/window-manager.js
const { BrowserWindow, app } = require('electron');
const path = require('node:path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    // --- Add frame: false ---
    frame: false, // Remove default OS window frame
    // -----------------------
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true, // Keep this or remove if you never want the menu
    // Optional: set minWidth/minHeight if desired
    minWidth: 600,
    minHeight: 400,
    // Background color helps prevent white flash on load with frameless window
    backgroundColor: '#1f1f1f',
    show: false, // Don't show immediately, wait for ready-to-show
    icon: '../icons/zip-logo.ico'
  });

  const indexPath = path.join(app.getAppPath(), 'src', 'index.html');
  console.log(`Window Manager: Loading index.html from: ${indexPath}`);
  mainWindow.loadFile(indexPath);

  // --- Add listeners to notify renderer about maximize/unmaximize ---
  mainWindow.on('maximize', () => {
      console.log("Main: Window Maximized");
      // Check if webContents exists before sending
      mainWindow?.webContents.send('window-maximized');
  });
   mainWindow.on('unmaximize', () => {
        console.log("Main: Window Unmaximized");
       // Check if webContents exists before sending
       mainWindow?.webContents.send('window-unmaximized');
   });
  // ---------------------------------------------------------------

  // Show window gracefully when ready
  mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      // Send initial state in case window loads maximized
      if (mainWindow.isMaximized()) {
          mainWindow.webContents.send('window-maximized');
      }
  });

  mainWindow.on('closed', () => {
    mainWindow = null; // Important for garbage collection
  });


  return mainWindow;
}

function getMainWindow() {
    // Return the current mainWindow instance
    return mainWindow;
}

module.exports = {
    createWindow,
    getMainWindow,
};