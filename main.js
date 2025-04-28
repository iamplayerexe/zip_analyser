// main.js (Root Entry Point for Main Process)

// Import necessary Electron modules
const { app, autoUpdater, dialog, BrowserWindow } = require('electron');
// Import Node.js path module for handling file paths
const path = require('path');

// Import custom modules for window management and IPC handling
const { createWindow, getMainWindow } = require('./src/main-process/window-manager');
const { initializeIpcHandlers } = require('./src/main-process/ipc-handlers');

// Handle Squirrel.Windows install/update events
// This is required for Squirrel to manage shortcuts etc. during install/uninstall
// It quits the app immediately if these command-line flags are present.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// --- Auto Update Setup ---

// Define the update server URL.
// Using Electron's update server relay simplifies pointing to GitHub Releases.
const server = 'https://update.electronjs.org';
// Your GitHub username
const owner = 'iamplayerexe';
// Your GitHub repository name
const repo = 'zip_analyser';
// Construct the feed URL based on the server, owner, repo, platform, architecture, and current app version.
// Squirrel.Windows will fetch the 'RELEASES' file from this URL structure.
const feed = `${server}/${owner}/${repo}/${process.platform}-${process.arch}/${app.getVersion()}`;

// Auto-updates only work reliably in the packaged application.
// `app.isPackaged` is true when the app is installed, false during development (`electron .`).
if (app.isPackaged) {
  try {
    // Log the feed URL being used for debugging purposes.
    console.log(`Setting autoUpdater feed URL to: ${feed}`);
    // Configure the autoUpdater with the feed URL.
    autoUpdater.setFeedURL({ url: feed });

    // --- Event Listeners for Auto Updater ---
    // These listeners handle the different stages of the update process.

    // Emitted when the updater starts checking for an update.
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
      // Optional: Notify the renderer process to display a message in the UI.
      getMainWindow()?.webContents.send('update-message', 'Checking for updates...');
    });

    // Emitted when an update is found and download is about to start.
    autoUpdater.on('update-available', () => {
      console.log('Update available. Downloading...');
      // Optional: Notify the renderer process.
      getMainWindow()?.webContents.send('update-message', 'Update available, downloading...');
      // You could show a non-blocking notification here instead of an immediate dialog.
    });

    // Emitted when there is no update available.
    autoUpdater.on('update-not-available', () => {
      console.log('Update not available.');
      // Optional: Notify the renderer process.
      getMainWindow()?.webContents.send('update-message', 'You are running the latest version.');
    });

    // Emitted when an update has been downloaded.
    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
      const versionInfo = releaseName ? `Version ${releaseName}` : 'A new version';
      console.log(`Update downloaded: ${versionInfo}`);
      // Notify the renderer process.
      getMainWindow()?.webContents.send('update-message', `${versionInfo} downloaded. Restart to install.`);

      // Prepare options for the confirmation dialog.
      const dialogOpts = {
        type: 'info',
        buttons: ['Restart Now', 'Later'], // Buttons presented to the user
        title: 'Application Update',
        message: versionInfo, // Display the version name if available
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
      };

      // Show the dialog to the user.
      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        // Check which button the user clicked. 'response' is the index of the button.
        if (returnValue.response === 0) { // 0 corresponds to 'Restart Now'
           console.log('User chose to restart. Quitting and installing update...');
           // Quit the application and install the downloaded update.
           // Squirrel handles the swap and restarts the new version.
           autoUpdater.quitAndInstall();
        } else {
           console.log('User chose to install the update later.');
        }
      });
    });

    // Emitted when there is an error during the update process.
    autoUpdater.on('error', (error) => {
      console.error('There was a problem updating the application:');
      console.error(error);
      // Notify the renderer process about the error.
      getMainWindow()?.webContents.send('update-message', `Update Error: ${error.message}`);
      // Show an error dialog to the user.
       dialog.showErrorBox('Update Error', `Failed to check for or install updates: ${error.message}\n\nPlease check your connection or try again later. Logs may contain more details.`);
    });

  } catch (error) {
      // Catch errors during the initialization of the autoUpdater (e.g., invalid feed URL).
      console.error('Failed to initialize auto-updater:', error);
      // Inform the user that auto-update setup failed.
      dialog.showErrorBox('Updater Initialization Error', `Could not set up automatic updates: ${error.message}`);
  }
} else {
    // Log a message if running in development mode, indicating updates are skipped.
    console.log('Skipping auto-update checks in development mode.');
}

// Function to manually trigger the update check.
function checkForUpdates() {
    // Only attempt to check for updates if the app is packaged.
    if (app.isPackaged) {
        console.log('Triggering update check...');
        try {
            // Start the update check process.
            autoUpdater.checkForUpdates();
        } catch (error) {
            // Catch potential errors when calling checkForUpdates itself.
            console.error('Error when calling checkForUpdates():', error);
             dialog.showErrorBox('Update Check Failed', `Could not start the update check: ${error.message}`);
        }
    } else {
        // Log if in development mode.
        console.log('Skipping update check trigger in development.');
    }
}

// --- App Lifecycle Events ---

// This method will be called when Electron has finished initialization.
app.whenReady().then(() => {
  console.log("Main Process: App ready.");
  // Initialize IPC handlers for communication between main and renderer processes.
  initializeIpcHandlers();
  // Create the main application window.
  const mainWindow = createWindow();

  // Check for updates after the window has finished loading its content.
  if (mainWindow) {
      // Listen for the 'did-finish-load' event on the window's webContents.
      mainWindow.webContents.once('did-finish-load', () => {
          console.log('Window finished loading. Scheduling update check.');
          // Use setTimeout to delay the check slightly, ensuring the app is fully settled.
          // A 5-second delay is usually sufficient.
          setTimeout(checkForUpdates, 5000);
      });
  } else {
      // Fallback if the window object wasn't immediately available (should be rare).
       console.warn("Main window not immediately available after ready. Scheduling update check with longer delay.");
      // Use a longer delay as a fallback.
      setTimeout(checkForUpdates, 15000);
  }

  // macOS specific: Re-create window if none are open when dock icon is clicked.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS ('darwin').
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Initial log message when the main process starts.
console.log("Main Process: Initializing...");