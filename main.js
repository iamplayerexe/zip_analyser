// main.js (Root Entry Point for Main Process)

// Import necessary Electron modules
const { app, autoUpdater, dialog, BrowserWindow, shell } = require('electron'); // Add shell
const https = require('https'); // Add https for Linux update check
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

const owner = 'iamplayerexe';
const repo = 'zip_analyser';
const repoUrl = `https://github.com/${owner}/${repo}`;

// Function for Windows and macOS auto-updates
function initializeAutoUpdater() {
    const server = 'https://update.electronjs.org';
    const feed = `${server}/${owner}/${repo}/${process.platform}-${process.arch}/${app.getVersion()}`;

    try {
        console.log(`Setting autoUpdater feed URL to: ${feed}`);
        autoUpdater.setFeedURL({ url: feed });

        autoUpdater.on('checking-for-update', () => {
            console.log('Checking for update...');
            getMainWindow()?.webContents.send('update-message', 'Checking for updates...');
        });

        autoUpdater.on('update-available', () => {
            console.log('Update available. Downloading...');
            getMainWindow()?.webContents.send('update-message', 'Update available, downloading...');
        });

        autoUpdater.on('update-not-available', () => {
            console.log('Update not available.');
            getMainWindow()?.webContents.send('update-message', 'You are running the latest version.');
        });

        autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
            const versionInfo = releaseName ? `Version ${releaseName}` : 'A new version';
            console.log(`Update downloaded: ${versionInfo}`);
            getMainWindow()?.webContents.send('update-message', `${versionInfo} downloaded. Restart to install.`);

            const dialogOpts = {
                type: 'info',
                buttons: ['Restart Now', 'Later'],
                title: 'Application Update',
                message: versionInfo,
                detail: 'A new version has been downloaded. Restart the application to apply the updates.'
            };

            dialog.showMessageBox(dialogOpts).then((returnValue) => {
                if (returnValue.response === 0) {
                    console.log('User chose to restart. Quitting and installing update...');
                    autoUpdater.quitAndInstall();
                } else {
                    console.log('User chose to install the update later.');
                }
            });
        });

        autoUpdater.on('error', (error) => {
            console.error('There was a problem updating the application:', error);
            getMainWindow()?.webContents.send('update-message', `Update Error: ${error.message}`);
            dialog.showErrorBox('Update Error', `Failed to check for or install updates: ${error.message}\n\nPlease check your connection or try again later. Logs may contain more details.`);
        });

    } catch (error) {
        console.error('Failed to initialize auto-updater:', error);
        dialog.showErrorBox('Updater Initialization Error', `Could not set up automatic updates: ${error.message}`);
    }
}

// Function to check for updates on Linux (manual download)
function checkForUpdatesLinux() {
    console.log('Checking for updates on Linux...');
    getMainWindow()?.webContents.send('update-message', 'Checking for updates...');

    const options = {
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/releases/latest`,
        method: 'GET',
        headers: { 'User-Agent': 'Zip-Analyser-App' }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                if (res.statusCode !== 200) {
                    throw new Error(`GitHub API responded with status code ${res.statusCode}`);
                }
                const release = JSON.parse(data);
                const latestVersion = release.tag_name.startsWith('v') ? release.tag_name.substring(1) : release.tag_name;
                const currentVersion = app.getVersion();

                // Simple version comparison (can be improved with semver library if needed)
                if (latestVersion > currentVersion) {
                    console.log(`New version available on Linux: ${latestVersion}`);
                    getMainWindow()?.webContents.send('update-message', `New version ${latestVersion} is available!`);
                    
                    const dialogOpts = {
                        type: 'info',
                        buttons: ['Go to Downloads', 'Later'],
                        title: 'Update Available',
                        message: `A new version (${latestVersion}) is available.`,
                        detail: 'Please visit the releases page to download the latest version for Linux.'
                    };

                    dialog.showMessageBox(dialogOpts).then(returnValue => {
                        if (returnValue.response === 0) {
                            shell.openExternal(`${repoUrl}/releases/latest`);
                        }
                    });
                } else {
                    console.log('You are running the latest version on Linux.');
                    getMainWindow()?.webContents.send('update-message', 'You are running the latest version.');
                }
            } catch (e) {
                console.error('Error parsing release data for Linux update check:', e);
                dialog.showErrorBox('Update Check Failed', `Could not process update information: ${e.message}`);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Error during Linux update check request:', e);
        dialog.showErrorBox('Update Check Failed', `Could not connect to check for updates: ${e.message}`);
    });

    req.end();
}


// Function to manually trigger the update check.
function checkForUpdates() {
    if (!app.isPackaged) {
        console.log('Skipping update check trigger in development.');
        return;
    }

    console.log(`Triggering update check on platform: ${process.platform}`);
    
    switch (process.platform) {
        case 'win32':
        case 'darwin': // macOS
            initializeAutoUpdater(); // Initialize listeners first
            autoUpdater.checkForUpdates();
            break;
        case 'linux':
            checkForUpdatesLinux();
            break;
        default:
            console.log(`Auto-updates not supported on platform: ${process.platform}`);
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