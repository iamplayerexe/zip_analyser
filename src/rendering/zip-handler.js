// <-- comment ( file)(src/rendering/zip-handler.js)
// src/rendering/zip-handler.js
// Responsibilities: Core application logic for handling the zip file processing flow.

const { ipcRenderer } = require('electron');
const path = require('path');
const crypto = require('crypto'); // Importer crypto

const { resetUI, showError, setActiveView } = require('../javascript/utils.js');
const {
    processingIndicator,
    selectZipButtonNav,
    initialPrompt,
    fileTreeWrapper,
    fileContentWrapper,
    outputWrapper,
    copyTreeButton,
    copyOutputButton,
    exportOutputButton,
    fileInput,
    viewTreeButton, viewContentButton, viewOutputButton
} = require('../javascript/dom-elements.js');
const {
    renderFileTreeText,
    renderFileContent,
    renderConcatenatedOutput
} = require('./view-renderer.js');
const { addFileToHistory } = require('./history-manager.js');

let currentZipInfo = {
    path: null,
    name: null,
    sessionId: null // NOUVEAU : Pour les exports groupés
};

async function handleZipFile(filePath) {
    addFileToHistory(filePath);

    processingIndicator.style.display = 'block';
    selectZipButtonNav.disabled = true;

    try {
        const result = await ipcRenderer.invoke('process-zip', filePath);

        if (result.success) {
             initialPrompt.style.display = 'none';
             
             // Mettre à jour les informations de la session actuelle
             currentZipInfo.path = filePath;
             currentZipInfo.name = path.basename(filePath);
             currentZipInfo.sessionId = crypto.randomBytes(4).toString('hex'); // NOUVEAU

             renderFileTreeText(result.treeString, fileTreeWrapper);
             renderFileContent(result.filesData, fileContentWrapper);
             renderConcatenatedOutput(result.concatenatedText, outputWrapper);

             [viewTreeButton, viewContentButton, viewOutputButton].forEach(btn => {
                 if(btn) btn.style.display = 'flex';
             });

             setActiveView('file-tree-container');

             if (copyTreeButton) copyTreeButton.disabled = !result.treeString;
             if (copyOutputButton) copyOutputButton.disabled = !result.concatenatedText;
             if (exportOutputButton) exportOutputButton.disabled = !result.concatenatedText;

        } else {
             showError(`Error processing zip file: ${result.error || 'Unknown processing error'}`);
             currentZipInfo = { path: null, name: null, sessionId: null };
        }
    } catch (error) {
        showError(`An unexpected error occurred: ${error.message}`);
        currentZipInfo = { path: null, name: null, sessionId: null };
    } finally {
        processingIndicator.style.display = 'none';
        selectZipButtonNav.disabled = false;
        if (fileInput) fileInput.value = null;
    }
}

function getCurrentZipInfo() {
    return currentZipInfo;
}

module.exports = { handleZipFile, getCurrentZipInfo };
// <-- end comment (.js file)(src/rendering/zip-handler.js)