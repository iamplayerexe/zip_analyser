// src/rendering/view-renderer.js
const { ipcRenderer } = require('electron');
const hljs = require('highlight.js');

const { copyToClipboard } = require('../javascript/utils.js');
const {
    fileTreeWrapper, fileContentWrapper, outputWrapper
} = require('../javascript/dom-elements.js');

function renderFileTreeText(treeString, wrapper) {
    if (!wrapper) { console.error("Tree wrapper element not found"); return; }
    wrapper.innerHTML = '';
    if (!treeString || treeString.trim().length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No files or folders found in the zip archive.';
        p.style.cssText = 'padding: 15px; color: var(--subtitle-color); text-align: center;';
        wrapper.appendChild(p); return;
    }
    const pre = document.createElement('pre');
    pre.classList.add('file-tree-text');
    pre.textContent = treeString;
    wrapper.appendChild(pre);
}

// MODIFIED: This function is completely rewritten for robustness.
function renderFileContent(filesData, wrapper) {
     if (!wrapper) { console.error("Contents wrapper element not found"); return; }
     wrapper.innerHTML = '';
     const sortedPaths = Object.keys(filesData).sort();

     if (sortedPaths.length === 0) {
         const p = document.createElement('p');
         p.textContent = "No text files or images found in the zip archive.";
         p.style.cssText = 'padding: 15px; color: var(--subtitle-color); text-align: center;';
         wrapper.appendChild(p); return;
     }

     sortedPaths.forEach(filePath => {
        const fileData = filesData[filePath];

        // --- Create Card Structure ---
        const card = document.createElement('div');
        card.className = 'file-card';

        const header = document.createElement('div');
        header.className = 'file-card-header';
        
        const title = document.createElement('span');
        title.className = 'file-card-title';
        title.textContent = filePath;
        title.title = filePath;

        const actions = document.createElement('div');
        actions.className = 'file-card-actions';

        const content = document.createElement('div');
        content.className = 'file-card-content';

        // --- Determine Content Type and Populate ---
        let isTextContent = false;
        let isImage = false;
        let isExportable = false;

        if (typeof fileData === 'object' && fileData?.isImage) {
            isImage = true;
            isExportable = true;
            const img = document.createElement('img');
            img.src = fileData.content;
            img.alt = `Preview of ${filePath}`;
            img.className = 'image-preview';
            content.appendChild(img);
        } else if (typeof fileData === 'string' && !fileData.startsWith('[')) {
            isTextContent = true;
            isExportable = true;
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            const extension = filePath.split('.').pop()?.toLowerCase() || 'plaintext';
            const lang = {py: 'python', js: 'javascript', ts: 'typescript', sh: 'bash', md: 'markdown', cs: 'csharp'}[extension] || extension;

            code.className = `language-${lang}`;
            code.textContent = fileData;
            try { hljs.highlightElement(code); } catch (err) { /* Fails gracefully for unknown languages */ }
            pre.appendChild(code);
            content.appendChild(pre);
        } else {
            // Handle binary/unreadable files
            const p = document.createElement('p');
            p.textContent = fileData || '[Unreadable File]';
            p.style.cssText = 'margin: auto; color: var(--subtitle-color);';
            content.appendChild(p);
        }

        // --- Create and Append Buttons ---
        const copyButton = document.createElement('button');
        copyButton.className = 'small-button copy-button';
        copyButton.textContent = 'Copy';
        copyButton.disabled = !isTextContent;
        if (isTextContent) {
            copyButton.addEventListener('click', (e) => { e.stopPropagation(); copyToClipboard(fileData, copyButton); });
        }

        const exportButton = document.createElement('button');
        exportButton.className = 'small-button export-file-button';
        exportButton.textContent = 'Export';
        exportButton.disabled = !isExportable;
        if (isExportable) {
            exportButton.dataset.path = filePath;
            exportButton.dataset.isImage = isImage;
        }

        actions.append(copyButton, exportButton);
        header.append(title, actions);
        card.append(header, content);
        wrapper.appendChild(card);
     });
}

function renderConcatenatedOutput(concatenatedText, wrapper) {
    if (!wrapper) { console.error("Output wrapper element not found"); return; }
    wrapper.innerHTML = '';
    if (!concatenatedText || concatenatedText.trim().length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No text file content available to concatenate.';
        p.style.cssText = 'padding: 15px; color: var(--subtitle-color); text-align: center;';
        wrapper.appendChild(p); return;
    }
    const pre = document.createElement('pre');
    pre.classList.add('output-text');
    pre.textContent = concatenatedText;
    wrapper.appendChild(pre);
}

async function updateAppTitleWithVersion() {
    const versionSpan = document.getElementById('app-version');
    if (!versionSpan) return;
    try {
        const appVersion = await ipcRenderer.invoke('get-app-version');
        if (appVersion) versionSpan.textContent = `v${appVersion}`;
    } catch (error) {
        console.error('Failed to get app version via IPC:', error);
    }
}

module.exports = {
    renderFileTreeText,
    renderFileContent,
    renderConcatenatedOutput,
    updateAppTitleWithVersion
};