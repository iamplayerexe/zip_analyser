// <-- comment ( file)(src/rendering/event-listeners.js)
// src/rendering/event-listeners.js
// Responsibilities: Sets up all user-interaction event listeners for the application.

const { ipcRenderer } = require('electron');
const Swal = require('sweetalert2');

const { showError, copyToClipboard, setActiveView } = require('../javascript/utils.js');
const {
    selectZipButtonNav, fileInput, dropPlaceholder,
    viewTreeButton, viewContentButton, viewOutputButton, viewRecentButton,
    fileTreeWrapper, fileContentWrapper, outputWrapper, recentFilesWrapper,
    copyTreeButton, copyOutputButton, exportOutputButton,
    clearHistoryButton
} = require('../javascript/dom-elements.js');
const { handleZipFile, getCurrentZipInfo } = require('./zip-handler.js');
const { renderHistoryList, clearHistory, handleExportZipClick } = require('./history-manager.js');

async function handleSingleFileExport(targetButton) {
    const { path, isImage } = targetButton.dataset;
    const { name: zipName, sessionId } = getCurrentZipInfo();
    if (!zipName || !sessionId) {
        showError("Cannot export file: current session is invalid.");
        return;
    }

    const card = targetButton.closest('.file-card');
    const contentElement = card.querySelector('.file-card-content > *');
    let content;
    if (isImage === 'true') {
        content = contentElement.src;
    } else {
        content = contentElement.textContent;
    }

    const result = await ipcRenderer.invoke('save-text-to-file', {
        content, zipName, sessionId,
        type: 'single-file',
        isImage: isImage === 'true',
        originalFilename: path
    });

    if (result.success) {
        Swal.fire({
            title: 'Export Successful!',
            text: `File saved in 'Documents/File Tree Exports'`,
            icon: 'success',
            showDenyButton: true, denyButtonText: 'Show in Folder',
            denyButtonColor: '#6e7881',
            confirmButtonText: 'OK',
        }).then((res) => {
            if (res.isDenied) ipcRenderer.invoke('show-in-explorer', result.filePath);
        });
    } else {
        showError(`Failed to export file: ${result.error}`);
    }
}

function initializeAppEventListeners() {
    // --- Button Click and Input Change Listeners ---
    selectZipButtonNav.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file && file.name.toLowerCase().endsWith('.zip')) {
            await handleZipFile(file.path);
        } else if (file) {
            showError('Invalid file type. Please select a .zip file.');
            event.target.value = null;
        }
    });
    
    // --- Export/Copy Listeners ---
    copyTreeButton.addEventListener('click', () => {
        const treePre = fileTreeWrapper?.querySelector('.file-tree-text');
        if (treePre?.textContent) copyToClipboard(treePre.textContent, copyTreeButton);
    });
    
    copyOutputButton.addEventListener('click', () => {
        const outputPre = outputWrapper?.querySelector('.output-text');
        if (outputPre?.textContent) copyToClipboard(outputPre.textContent, copyOutputButton);
    });

    exportOutputButton.addEventListener('click', async () => {
        const outputPre = outputWrapper?.querySelector('.output-text');
        const textToSave = outputPre?.textContent;
        const { name: zipName, sessionId } = getCurrentZipInfo();

        if (textToSave && textToSave.trim().length > 0 && zipName && sessionId) {
            exportOutputButton.disabled = true;
            try {
                const result = await ipcRenderer.invoke('save-text-to-file', {
                    content: textToSave, zipName, sessionId,
                    type: 'concatenated-output',
                });
                if (result.success) {
                    Swal.fire({
                        title: 'Export Successful!',
                        text: `Output saved in 'Documents/File Tree Exports'`,
                        icon: 'success',
                        showDenyButton: true, denyButtonText: 'Show in Folder',
                        denyButtonColor: '#6e7881',
                        confirmButtonText: 'OK',
                    }).then((res) => {
                        if (res.isDenied) ipcRenderer.invoke('show-in-explorer', result.filePath);
                    });
                } else {
                    showError(`Failed to save file: ${result.error || 'Unknown save error'}`);
                }
            } catch (ipcError) {
                showError(`Error during export: ${ipcError.message}`);
            } finally {
                if (exportOutputButton) exportOutputButton.disabled = false;
            }
        }
    });

    fileContentWrapper.addEventListener('click', (event) => {
        const target = event.target.closest('.export-file-button');
        if (target) {
            handleSingleFileExport(target);
        }
    });

    // --- View Switcher Listeners ---
    viewTreeButton.addEventListener('click', () => setActiveView('file-tree-container'));
    viewContentButton.addEventListener('click', () => setActiveView('file-content-container'));
    viewOutputButton.addEventListener('click', () => setActiveView('output-container'));
    viewRecentButton.addEventListener('click', () => {
        renderHistoryList();
        setActiveView('recent-files-container');
    });

    // --- History Listeners ---
    clearHistoryButton.addEventListener('click', () => clearHistory());

    recentFilesWrapper.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('use-button')) {
            const { path, name } = target.dataset;
            Swal.fire({
                title: 'Load Recent File?',
                html: `Do you want to open <strong>${name}</strong>?`,
                icon: 'question', showCancelButton: true, confirmButtonText: 'Yes, load it!',
            }).then((result) => {
                if (result.isConfirmed) handleZipFile(path);
            });
        }
        if (target.classList.contains('export-button')) {
            handleExportZipClick(target.dataset.path);
        }
    });

    // --- CORRECTION : Listeners de Drag-and-Drop sur le body ---
    const body = document.body;
    
    body.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropPlaceholder) dropPlaceholder.style.display = 'flex';
    });

    body.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Cacher seulement si on quitte la fenêtre
        if (e.relatedTarget === null) {
            if (dropPlaceholder) dropPlaceholder.style.display = 'none';
        }
    });

    body.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropPlaceholder) dropPlaceholder.style.display = 'none';
        
        const file = e.dataTransfer.files[0];
        if (file && file.name.toLowerCase().endsWith('.zip')) {
            await handleZipFile(file.path);
        } else {
            showError('Invalid file type. Please drop a single .zip file.');
        }
    });

    console.log("Renderer: All Event Listeners Initialized.");
}

module.exports = { initializeAppEventListeners };
// <-- end comment (.js file)(src/rendering/event-listeners.js)