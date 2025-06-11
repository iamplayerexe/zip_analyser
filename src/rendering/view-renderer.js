// <-- comment ( file)(src/rendering/view-renderer.js)
// src/rendering/view-renderer.js
// Responsibilities: All functions that directly manipulate the DOM to render views or update UI components.

const { ipcRenderer } = require('electron');
const hljs = require('highlight.js');

const { showError, copyToClipboard } = require('../javascript/utils.js');
const {
    fileTreeWrapper, fileContentWrapper, outputWrapper
} = require('../javascript/dom-elements.js');

function renderFileTreeText(treeString, wrapper) {
    if (!wrapper) { console.error("Tree wrapper element not found"); return; }
    wrapper.innerHTML = '';
    if (!treeString || treeString.trim().length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No files or folders found in the zip archive.';
        p.style.cssText = 'padding: 15px; color: var(--text-disabled); text-align: center;';
        wrapper.appendChild(p); return;
    }
    const pre = document.createElement('pre');
    pre.classList.add('file-tree-text');
    pre.textContent = treeString;
    wrapper.appendChild(pre);
}

function renderFileContent(filesData, wrapper) {
     if (!wrapper) { console.error("Contents wrapper element not found"); return; }
     wrapper.innerHTML = '';
     const sortedPaths = Object.keys(filesData).sort();
     if (sortedPaths.length === 0) {
         const p = document.createElement('p');
         p.textContent = "No text files found or readable in the zip archive.";
         p.style.cssText = 'padding: 15px; color: var(--text-disabled); text-align: center;';
         wrapper.appendChild(p); return;
     }
     sortedPaths.forEach(filePath => {
        const fileData = filesData[filePath];
        let isTextContent = false, isImage = false, isExportable = false;
        let languageIdentifier = 'plaintext';

        if (typeof fileData === 'object' && fileData?.isImage) {
            isImage = true;
            isExportable = true;
        } else if (typeof fileData === 'string' && !fileData.startsWith('[')) {
            isTextContent = true;
            isExportable = true;
            const extension = filePath.split('.').pop()?.toLowerCase() || '';
            if (extension) {
                languageIdentifier = {py: 'python', js: 'javascript', ts: 'typescript', sh: 'bash', md: 'markdown', cs: 'csharp'}[extension] || extension;
            }
        }

        const card = document.createElement('div'); card.classList.add('file-card');
        const header = document.createElement('div'); header.classList.add('file-card-header');
        const title = document.createElement('span'); title.classList.add('file-card-title');
        title.textContent = filePath; title.title = filePath;

        const actionsWrapper = document.createElement('div');
        actionsWrapper.classList.add('file-card-actions');

        const copyButton = document.createElement('button');
        copyButton.classList.add('copy-button', 'small-button');
        copyButton.textContent = 'Copy';
        copyButton.disabled = !isTextContent;
        if (isTextContent) {
            copyButton.addEventListener('click', (e) => { e.stopPropagation(); copyToClipboard(fileData, copyButton); });
        }

        const exportButton = document.createElement('button');
        exportButton.classList.add('export-file-button', 'small-button');
        exportButton.textContent = 'Export';
        exportButton.disabled = !isExportable;
        // CORRECTION : Ajout des data-attributes pour la délégation
        if (isExportable) {
            exportButton.dataset.path = filePath;
            exportButton.dataset.isImage = isImage;
        }

        actionsWrapper.appendChild(copyButton);
        actionsWrapper.appendChild(exportButton);
        header.appendChild(title);
        header.appendChild(actionsWrapper);

        const contentWrapper = document.createElement('div'); contentWrapper.classList.add('file-card-content');
        
        if (isImage) {
            const img = document.createElement('img');
            img.src = fileData.content;
            img.alt = `Preview of ${filePath}`;
            img.classList.add('image-preview');
            contentWrapper.appendChild(img);
        } else {
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            if (isTextContent) {
                code.className = `language-${languageIdentifier}`;
                code.textContent = fileData;
                try { hljs.highlightElement(code); } catch (err) { console.error(err); }
            } else {
                code.className = 'language-plaintext';
                code.textContent = fileData || '[Error reading file data]';
                pre.style.opacity = '0.7';
            }
            pre.appendChild(code);
            contentWrapper.appendChild(pre);
        }

        card.appendChild(header); card.appendChild(contentWrapper);
        wrapper.appendChild(card);
     });
}

function renderConcatenatedOutput(concatenatedText, wrapper) {
    if (!wrapper) { console.error("Output wrapper element not found"); return; }
    wrapper.innerHTML = '';
    if (!concatenatedText || concatenatedText.trim().length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No text file content available to concatenate.';
        p.style.cssText = 'padding: 15px; color: var(--text-disabled); text-align: center;';
        wrapper.appendChild(p); return;
    }
    const pre = document.createElement('pre');
    pre.classList.add('output-text');
    pre.textContent = concatenatedText;
    wrapper.appendChild(pre);
}

async function updateAppTitleWithVersion() {
    const titleSpan = document.getElementById('window-title-text');
    if (!titleSpan) return;
    try {
        const appVersion = await ipcRenderer.invoke('get-app-version');
        if (appVersion) titleSpan.textContent = `Zip Analyser v${appVersion}`;
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
// <-- end comment (.js file)(src/rendering/view-renderer.js)