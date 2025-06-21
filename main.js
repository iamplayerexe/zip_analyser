const { app, autoUpdater, dialog, BrowserWindow, shell } = require('electron');
const https = require('https');
const path = require('path');

const { createWindow, getMainWindow } = require('./src/main-process/window-manager');
const { initializeIpcHandlers } = require('./src/main-process/ipc-handlers');

if (require('electron-squirrel-startup')) {
  app.quit();
}

// --- Auto Update Setup ---

// UPDATED: The release assets are in the private repo, so all checks must point there.
const owner = 'iamplayerexe';
const repo = 'zip_analyser_app'; // CRITICAL: Point to your PRIVATE releases repository
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
            initializeAutoUpdater();
            autoUpdater.checkForUpdates();
            break;
        case 'linux':
            checkForUpdatesLinux();
            break;
        default:
            console.log(`Auto-updates not supported on platform: ${process.platform}`);
    }
}

// App Lifecycle Events
app.whenReady().then(() => {
  console.log("Main Process: App ready.");
  initializeIpcHandlers();
  const mainWindow = createWindow();

  if (mainWindow) {
      mainWindow.webContents.once('did-finish-load', () => {
          console.log('Window finished loading. Scheduling update check.');
          setTimeout(checkForUpdates, 5000);
      });
  } else {
       console.warn("Main window not immediately available after ready. Scheduling update check with longer delay.");
      setTimeout(checkForUpdates, 15000);
  }

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