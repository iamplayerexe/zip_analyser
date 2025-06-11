// <-- comment ( file)(src/rendering/history-manager.js)
// src/rendering/history-manager.js
// Responsibilities: Manages the recent files history, including IPC calls and UI rendering.

const { ipcRenderer } = require('electron');
const path = require('path');
const Swal = require('sweetalert2');

const { recentFilesWrapper } = require('../javascript/dom-elements.js');
const { showError } = require('../javascript/utils.js');

async function initializeHistory() {
    await renderHistoryList();
}

function addFileToHistory(filePath) {
    if (!filePath) return;
    ipcRenderer.invoke('add-to-history', filePath);
}

async function renderHistoryList() {
    if (!recentFilesWrapper) return;

    const history = await ipcRenderer.invoke('get-history');
    recentFilesWrapper.innerHTML = '';

    if (history.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No recent files.';
        p.style.padding = '15px';
        p.style.color = 'var(--text-disabled)';
        p.style.textAlign = 'center';
        recentFilesWrapper.appendChild(p);
        return;
    }

    const list = document.createElement('ul');
    list.classList.add('recent-files-list');

    history.forEach(filePath => {
        const listItem = document.createElement('li');
        listItem.classList.add('recent-file-item');
        
        const fileName = path.basename(filePath);
        const fileDir = path.dirname(filePath);

        listItem.innerHTML = `
            <div class="recent-file-info">
                <span class="recent-file-name">${fileName}</span>
                <span class="recent-file-dir">${fileDir}</span>
            </div>
            <div class="recent-item-actions">
                <button class="small-button use-button" data-path="${filePath}" data-name="${fileName}">Use</button>
                <button class="small-button export-button" data-path="${filePath}">Export</button>
            </div>
        `;
        list.appendChild(listItem);
    });

    recentFilesWrapper.appendChild(list);
}

async function handleExportZipClick(sourcePath) {
    const result = await ipcRenderer.invoke('export-zip-file', sourcePath);
    if (result.success) {
        Swal.fire({
            title: 'Export Successful!',
            text: `File saved successfully.`,
            icon: 'success',
            showDenyButton: true,
            denyButtonText: 'Show in Folder'
        }).then((res) => {
            if (res.isDenied) ipcRenderer.invoke('show-in-explorer', result.filePath);
        });
    } else if (result.message !== 'Export cancelled.') {
        showError(`Export failed: ${result.error}`);
    }
}

async function clearHistory() {
    await ipcRenderer.invoke('clear-history');
    await renderHistoryList();
}

module.exports = {
    initializeHistory,
    addFileToHistory,
    renderHistoryList,
    clearHistory,
    handleExportZipClick
};
// <-- end comment (.js file)(src/rendering/history-manager.js)