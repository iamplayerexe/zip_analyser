// <-- comment ( file)(src/main-process/ipc-handlers.js)
// src/main-process/ipc-handlers.js
const { ipcMain, dialog, BrowserWindow, app, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('crypto');
const Store = require('electron-store');

const { processZipData } = require('./zip-processor.js');
const { generateTreeString } = require('./tree-generator.js');
const { getMainWindow } = require('./window-manager.js');

const store = new Store();

let loadedCommentMap = {};
let defaultCommentSyntax = { start: '//', end: '//' };
try {
    const mapFilePath = path.join(app.getAppPath(), 'code_languages.json');
    if (fs.existsSync(mapFilePath)) {
        const fileContent = fs.readFileSync(mapFilePath, 'utf8');
        loadedCommentMap = JSON.parse(fileContent);
        if (loadedCommentMap['$default']) defaultCommentSyntax = loadedCommentMap['$default'];
    }
} catch (error) {
    console.error('Main Process: Error reading or parsing code_languages.json:', error);
}

// --- CORRIGÉ : Logique de génération des commentaires ---
function generateConcatenatedText(filesData) {
    let output = '';
    const sortedPaths = Object.keys(filesData).sort();

    sortedPaths.forEach(filePath => {
        if (path.basename(filePath) === '.env') return;

        const content = filesData[filePath];
        if (content && typeof content === 'string' && !content.startsWith('[')) {
            const extension = path.extname(filePath).toLowerCase();
            const syntax = loadedCommentMap[extension] || defaultCommentSyntax;
            const trimmedContent = content.trim();

            if (syntax && syntax.start !== null && syntax.end !== null) {
                const startMarker = `${syntax.start} <-- comment (${extension} file)(${filePath}) ${syntax.end === syntax.start ? '' : syntax.end}`.trim();
                const endMarker = `${syntax.start} <-- end comment (${extension} file)(${filePath}) ${syntax.end === syntax.start ? '' : syntax.end}`.trim();

                // Vérifier si le contenu est déjà formaté
                if (trimmedContent.startsWith(startMarker) && trimmedContent.endsWith(endMarker)) {
                    output += `${trimmedContent}\n\n`; // Ajouter directement sans double formatage
                } else {
                    output += `${startMarker}\n${trimmedContent}\n${endMarker}\n\n`;
                }
            } else { // Pour les fichiers sans syntaxe de commentaire définie (ex: .json)
                 output += `--- START OF FILE ${filePath} ---\n${trimmedContent}\n--- END OF FILE ${filePath} ---\n\n`;
            }
        }
    });
    return output.trim();
}

function initializeIpcHandlers() {
    function getWindowInstance(event) {
        return event ? BrowserWindow.fromWebContents(event.sender) : getMainWindow();
    }

    // --- Window Control Handlers ---
    ipcMain.handle('closeApp', (event) => getWindowInstance(event)?.close());
    ipcMain.handle('minimizeApp', (event) => getWindowInstance(event)?.minimize());
    ipcMain.handle('toggleMaximizeApp', (event) => {
        const window = getWindowInstance(event);
        if (window?.isMaximized()) window.unmaximize();
        else window?.maximize();
    });

    ipcMain.handle('get-app-version', () => app.getVersion());

    // --- History Handlers ---
    ipcMain.handle('get-history', () => store.get('recentFiles', []));
    ipcMain.handle('add-to-history', (event, filePath) => {
        if (!filePath) return;
        const history = store.get('recentFiles', []);
        const newHistory = history.filter(p => p !== filePath);
        newHistory.unshift(filePath);
        store.set('recentFiles', newHistory.slice(0, 5));
    });
    ipcMain.handle('clear-history', () => store.set('recentFiles', []));

    // --- File/System Handlers ---
    ipcMain.handle('show-in-explorer', (event, filePath) => shell.showItemInFolder(filePath));
    ipcMain.handle('export-zip-file', async (event, sourcePath) => {
        const window = getWindowInstance(event);
        const { canceled, filePath } = await dialog.showSaveDialog(window, {
            title: 'Export Zip File', buttonLabel: 'Export',
            defaultPath: path.basename(sourcePath),
            filters: [{ name: 'Zip Files', extensions: ['zip'] }]
        });
        if (canceled || !filePath) return { success: false, message: 'Export cancelled.' };
        try {
            fs.copyFileSync(sourcePath, filePath);
            return { success: true, filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // --- App Specific Handlers ---
    ipcMain.handle('process-zip', async (event, filePath) => {
        const processResult = await processZipData(filePath);
        if (!processResult.success) return processResult;
        try {
            return {
                success: true,
                treeString: generateTreeString(processResult.entries),
                filesData: processResult.filesData,
                concatenatedText: generateConcatenatedText(processResult.filesData)
            };
        } catch (error) {
             return { success: false, error: `Tree/Concat generation failed: ${error.message}` };
        }
    });

    ipcMain.handle('save-text-to-file', async (event, { content, zipName, type, sessionId, isImage, originalFilename }) => {
        if (!content || !sessionId) {
            return { success: false, error: 'Invalid content or session ID provided.' };
        }
        try {
            const documentsPath = app.getPath('documents');
            const exportBaseDir = path.join(documentsPath, 'File Tree Exports');
            if (!fs.existsSync(exportBaseDir)) fs.mkdirSync(exportBaseDir, { recursive: true });

            const sessionDirName = `${zipName.replace('.zip', '')}_${sessionId}`;
            const sessionPath = path.join(exportBaseDir, sessionDirName);
            if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

            let bufferToSave;
            let exportFileName;

            if (type === 'single-file') {
                if (isImage) {
                    const base64Data = content.split(';base64,').pop();
                    bufferToSave = Buffer.from(base64Data, 'base64');
                } else {
                    bufferToSave = Buffer.from(content, 'utf8');
                }
                exportFileName = path.basename(originalFilename);
            } else { // 'concatenated-output'
                bufferToSave = Buffer.from(content, 'utf8');
                const fileId = crypto.randomBytes(4).toString('hex');
                exportFileName = `concatenated-output_${fileId}.txt`;
            }
            
            const finalPath = path.join(sessionPath, exportFileName);
            fs.writeFileSync(finalPath, bufferToSave);
            return { success: true, filePath: finalPath };

        } catch (error) {
            return { success: false, error: `Failed to save file: ${error.message}` };
        }
    });

    console.log("Main Process: IPC Handlers Initialized.");
}

module.exports = { initializeIpcHandlers };
// <-- end comment (.js file)(src/main-process/ipc-handlers.js)