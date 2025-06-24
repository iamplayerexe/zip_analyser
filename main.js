// main.js
const { app, dialog, BrowserWindow, shell } = require('electron');
const path = require('path');

const { createWindow, getMainWindow } = require('./src/main-process/window-manager');
const { initializeIpcHandlers } = require('./src/main-process/ipc-handlers');

// This argument will be passed by the launcher when it starts the app.
const LAUNCHER_ARG = '--launched-by-xutron';
// This is the custom protocol the launcher will register.
// We pass this app's ID so the launcher knows what to do after it starts.
const LAUNCHER_PROTOCOL_URI = 'xutron-launcher://relaunch?appId=zipanalyser';

// Check if the app was launched directly in production
if (process.env.NODE_ENV !== 'development' && !process.argv.includes(LAUNCHER_ARG)) {
    // If not launched by the launcher, try to open the launcher via its protocol and quit.
    console.log('Not launched by XutronCore Launcher. Attempting to open launcher...');
    try {
        shell.openExternal(LAUNCHER_PROTOCOL_URI);
    } catch (e) {
        dialog.showErrorBox(
            'Launcher Required',
            'Could not start the XutronCore Launcher. Please ensure it is installed correctly and try again.'
        );
    }
    app.quit();
} else {
    // --- ALL ORIGINAL APP INITIALIZATION CODE IS PLACED INSIDE THIS ELSE BLOCK ---
    // --- (Update logic has been removed) ---

    if (require('electron-squirrel-startup')) {
      app.quit();
    }

    // App Lifecycle Events
    app.whenReady().then(() => {
      console.log("Main Process: App ready.");
      initializeIpcHandlers();
      createWindow();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    console.log("Main Process: Initializing...");
}