// <-- comment (src/main-process/ipc-handlers.js)
// src/main-process/ipc-handlers.js
const { ipcMain, dialog, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { processZipData } = require('./zip-processor.js');
const { generateTreeString } = require('./tree-generator.js');
const { getMainWindow } = require('./window-manager.js');

// --- Load Comment Syntax Map from JSON (Keep this section exactly as before) ---
let loadedCommentMap = {};
let defaultCommentSyntax = { start: '//', end: '//' }; // Hardcoded fallback

try {
    const mapFilePath = path.join(__dirname, 'code_languages.json');
    console.log(`Main Process: Attempting to load comment map from: ${mapFilePath}`);
    if (fs.existsSync(mapFilePath)) {
        const fileContent = fs.readFileSync(mapFilePath, 'utf8');
        loadedCommentMap = JSON.parse(fileContent);
        if (loadedCommentMap['$default']) {
             defaultCommentSyntax = loadedCommentMap['$default'];
             console.log("Main Process: Successfully loaded comment map and default syntax from JSON.");
        } else {
            console.warn("Main Process: Loaded comment map, but '$default' key not found. Using hardcoded default.");
        }
    } else {
         console.error(`Main Process: Error loading comment map - File not found at ${mapFilePath}. Using hardcoded defaults.`);
         loadedCommentMap = {};
    }
} catch (error) {
    console.error('Main Process: Error reading or parsing code_languages.json:', error);
    loadedCommentMap = {};
    defaultCommentSyntax = { start: '//', end: '//' };
}
// --- End Loading Comment Syntax Map ---


// --- Function to generate concatenated text with ADAPTED comments AND specified format ---
function generateConcatenatedText(filesData) {
    let output = '';
    const sortedPaths = Object.keys(filesData).sort();

    sortedPaths.forEach(filePath => {
        const content = filesData[filePath];
        // Only include actual text content, skip placeholders/errors/binary
        if (content && typeof content === 'string' && !content.startsWith('[') && !content.endsWith(']')) {
            const extension = path.extname(filePath).toLowerCase();
            // Find the syntax in the loaded map, fallback to the determined default syntax
            const syntax = loadedCommentMap[extension] || defaultCommentSyntax;

            // Add comments only if syntax is defined and start is not null
            if (syntax && syntax.start) {
                 // --- MODIFIED MARKER CONSTRUCTION ---
                 // Create the text part including the extension type
                 const commentTextStart = `<-- comment (${extension} file)(${filePath})`;
                 const commentTextEnd = `<-- end comment (${extension} file)(${filePath})`;

                 // Construct the full marker with appropriate delimiters
                 const startMarker = `${syntax.start} ${commentTextStart} ${syntax.end === syntax.start ? '' : syntax.end}`.trim(); // Use trim to handle potential extra spaces if end delimiter is empty
                 const endMarker = `${syntax.start} ${commentTextEnd} ${syntax.end === syntax.start ? '' : syntax.end}`.trim();
                 // --- END MODIFIED MARKER CONSTRUCTION ---

                 output += `${startMarker}\n`;
                 output += `${content.trim()}\n`;
                 output += `${endMarker}\n\n`;
            } else {
                // If no comment syntax (like JSON or unknown extension without default), use simpler separator
                output += `--- START (${filePath}) ---\n`;
                output += `${content.trim()}\n`;
                output += `--- END (${filePath}) ---\n\n`;
            }
        }
    });
    return output.trim();
}


// --- initializeIpcHandlers Function (Keep exactly as before) ---
function initializeIpcHandlers() {

    // Helper to get the window instance safely
    function getWindowInstance(event) {
        return event ? BrowserWindow.fromWebContents(event.sender) : getMainWindow();
    }

    // --- Window Control Handlers ---
    ipcMain.handle('closeApp', (event) => {
        console.log("IPC: closeApp invoked");
        const window = getWindowInstance(event);
        window?.close();
    });

    ipcMain.handle('minimizeApp', (event) => {
        console.log("IPC: minimizeApp invoked");
        const window = getWindowInstance(event);
        window?.minimize();
    });

    ipcMain.handle('toggleMaximizeApp', (event) => {
        console.log("IPC: toggleMaximizeApp invoked");
        const window = getWindowInstance(event);
        if (window) {
            if (window.isMaximized()) {
                console.log("IPC: Unmaximizing window");
                window.unmaximize();
            } else {
                console.log("IPC: Maximizing window");
                window.maximize();
            }
        } else {
            console.warn("IPC: toggleMaximizeApp - Window instance not found.");
        }
    });

    // --- App Specific Handlers ---
    ipcMain.handle('process-zip', async (event, filePath) => {
         console.log(`Main Process: Received process-zip request for ${filePath}`);
        const processResult = await processZipData(filePath);

        if (!processResult.success) {
            console.error("Main Process: Error from processZipData:", processResult.error);
            return { success: false, error: processResult.error };
        }

        try {
            const treeString = generateTreeString(processResult.entries);
            console.log("Main Process: Tree string generated.");

            // Use the function that generates ADAPTIVE comments with the specific format
            const concatenatedText = generateConcatenatedText(processResult.filesData);
            console.log("Main Process: Concatenated text generated using loaded comment map and specific format.");

            return {
                success: true,
                treeString: treeString,
                filesData: processResult.filesData,
                concatenatedText: concatenatedText
            };
        } catch (error) {
             console.error('Main Process: Error during tree/concat generation:', error);
             const errorMessage = error instanceof Error ? error.message : String(error);
             return { success: false, error: `Tree/Concat generation failed: ${errorMessage}` };
        }
    });

    ipcMain.handle('save-text-to-file', async (event, textContent) => {
        if (typeof textContent !== 'string') {
            return { success: false, error: 'Invalid content provided for saving.' };
        }
        const window = getWindowInstance(event);
        if (!window) {
             return { success: false, error: 'Could not find window to show save dialog.' };
        }

        try {
            const { canceled, filePath } = await dialog.showSaveDialog(window, {
                title: 'Save Concatenated Output',
                buttonLabel: 'Save',
                filters: [
                    { name: 'Text Files', extensions: ['txt'] },
                    { name: 'All Files', extensions: ['*'] }
                ],
                 defaultPath: `zip-contents-${Date.now()}.txt`
            });

            if (canceled || !filePath) {
                console.log('Save dialog cancelled.');
                return { success: false, message: 'Save cancelled.' };
            }

            fs.writeFileSync(filePath, textContent, 'utf8');
            console.log(`File saved successfully to: ${filePath}`);
            return { success: true, filePath: filePath };

        } catch (error) {
            console.error('Error saving file:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return { success: false, error: `Failed to save file: ${errorMessage}` };
        }
    });


    console.log("Main Process: IPC Handlers Initialized.");
}

module.exports = { initializeIpcHandlers };
// <-- end comment (src/main-process/ipc-handlers.js)