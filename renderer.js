// <-- comment (renderer.js)
// renderer.js (Root Renderer Process Logic)

const { ipcRenderer } = require('electron');
// --- Require Highlight.js ---
const hljs = require('highlight.js');
// ----------------------------

// Require modules using paths relative to src/index.html
let utils = {};
let domElements = {};
let windowControls = {};
try {
    console.log("Attempting require relative to src/index.html's location...");
    utils = require('./javascript/utils.js'); // Requires updated utils.js
    domElements = require('./javascript/dom-elements.js'); // Requires updated dom-elements.js
    windowControls = require('./javascript/window-controls.js');
    console.log("Successfully required core JS modules.");
} catch (err) {
    console.error("FATAL: Failed to load core JS modules.", err);
    document.body.innerHTML = `<div style="padding: 30px; color: #ff6b6b; background-color: #2d2d2d; border: 1px solid #ff6b6b; border-radius: 5px; margin: 20px;"><h1>Application Error</h1><p>Core application scripts failed to load. Please check the developer console (Ctrl+Shift+I or Cmd+Option+I) for details.</p><pre style="color: #aaa; font-size: 12px; margin-top: 10px;">${err.stack || err.message}</pre></div>`;
    throw new Error("Core module loading failed.");
}

// Destructure functions and elements
const { showError, copyToClipboard, resetUI } = utils; // Uses updated resetUI
const { setupWindowControls } = windowControls;
const {
    // Titlebar/Nav
    navbarTitle, selectZipButtonNav, fileInput,
    // --- ADD initialPrompt ---
    initialPrompt,
    // ----------------------
    // View Switcher
    viewSwitcherControls,
    viewTreeButton, viewContentButton, viewOutputButton,
    // Content Area and Panels
    contentArea,
    fileTreeContainer, fileContentContainer, outputContainer,
    fileTreeWrapper, fileContentWrapper, outputWrapper,
    // Action Buttons
    copyTreeButton, copyOutputButton, exportOutputButton,
    // Other
    processingIndicator,
} = domElements; // Includes initialPrompt

// --- Rendering Functions ---
function renderFileTreeText(treeString, wrapper) {
    if (!wrapper) { console.error("Tree wrapper element not found"); showError("UI Error: Cannot display file tree."); return; }
    wrapper.innerHTML = '';
    if (!treeString || treeString.trim().length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No files or folders found in the zip archive.';
        p.style.padding = '15px'; p.style.color = 'var(--text-disabled)'; p.style.textAlign = 'center';
        wrapper.appendChild(p); return;
    }
    const pre = document.createElement('pre');
    pre.classList.add('file-tree-text');
    pre.textContent = treeString;
    wrapper.appendChild(pre);
}

function renderFileContent(filesData, wrapper) {
     if (!wrapper) { console.error("Contents wrapper element not found"); showError("UI Error: Cannot display file contents."); return; }
     wrapper.innerHTML = '';
     const sortedPaths = Object.keys(filesData).sort();
     if (sortedPaths.length === 0) {
         const p = document.createElement('p');
         p.textContent = "No text files found or readable in the zip archive.";
         p.style.padding = '15px'; p.style.color = 'var(--text-disabled)'; p.style.textAlign = 'center';
         wrapper.appendChild(p); return;
     }
     sortedPaths.forEach(filePath => {
        const rawContent = filesData[filePath]; // Get the original content
        let isTextContent = false;
        let languageIdentifier = 'plaintext'; // Default for hljs if unknown

        // Check if it's actual text content
        if (rawContent && typeof rawContent === 'string' && !rawContent.startsWith('[')) {
            isTextContent = true;
            // --- Extract extension for language class ---
            const parts = filePath.split('.');
            const extension = parts.length > 1 ? parts.pop().toLowerCase() : '';
            if (extension) {
                languageIdentifier = extension;
                // Map specific extensions to hljs language names if needed
                if (languageIdentifier === 'py') languageIdentifier = 'python';
                if (languageIdentifier === 'js') languageIdentifier = 'javascript';
                if (languageIdentifier === 'ts') languageIdentifier = 'typescript';
                if (languageIdentifier === 'sh') languageIdentifier = 'bash';
                if (languageIdentifier === 'md') languageIdentifier = 'markdown';
                if (languageIdentifier === 'cs') languageIdentifier = 'csharp';
                // Add more mappings if needed...
            } else if (parts.length > 0 && parts[0].startsWith('.')) {
                 languageIdentifier = parts[0].substring(1).toLowerCase() || 'plaintext';
                 if (languageIdentifier === 'gitignore') languageIdentifier = 'plaintext';
            } else {
                 languageIdentifier = 'plaintext';
            }
            // --------------------------------------------
        }

        const card = document.createElement('div'); card.classList.add('file-card');
        const header = document.createElement('div'); header.classList.add('file-card-header');
        const title = document.createElement('span'); title.classList.add('file-card-title');
        title.textContent = filePath; title.title = filePath;

        const copyButton = document.createElement('button');
        copyButton.classList.add('copy-button', 'small-button');
        copyButton.textContent = 'Copy';
        copyButton.title = `Copy content of ${filePath}`;

        if (isTextContent) {
            copyButton.addEventListener('click', (e) => {
                 e.stopPropagation();
                 copyToClipboard(rawContent, copyButton); // Copy the original raw content
            });
        } else {
            copyButton.disabled = true;
            copyButton.style.opacity = '0.5';
            copyButton.title = "Cannot copy placeholder content";
        }

        header.appendChild(title); header.appendChild(copyButton);

        const contentWrapper = document.createElement('div'); contentWrapper.classList.add('file-card-content');
        const pre = document.createElement('pre'); // <pre> helps maintain whitespace formatting
        const code = document.createElement('code'); // hljs works best on <code>

        // --- Apply language class and set RAW content ---
        if (isTextContent) {
            code.classList.add(`language-${languageIdentifier}`); // e.g., class="language-javascript"
            code.textContent = rawContent; // Use the raw content directly
        } else {
            code.classList.add('language-plaintext'); // Use plain text for placeholders
            code.textContent = rawContent || '[Error reading file data]';
            pre.style.opacity = '0.7'; // Dim placeholder text
        }
        // ----------------------------------------------

        pre.appendChild(code); // Put <code> inside <pre>
        contentWrapper.appendChild(pre);

        // --- Apply highlighting ---
        if (isTextContent) {
            try {
                // Highlight the <code> element within the <pre>
                hljs.highlightElement(code);
            } catch (err) {
                console.error(`Highlight.js error for ${filePath} (lang: ${languageIdentifier}):`, err);
            }
        }
        // --------------------------

        card.appendChild(header); card.appendChild(contentWrapper);
        wrapper.appendChild(card);
     });
}

function renderConcatenatedOutput(concatenatedText, wrapper) {
    if (!wrapper) { console.error("Output wrapper element not found"); showError("UI Error: Cannot display concatenated output."); return; }
    wrapper.innerHTML = '';
    if (!concatenatedText || concatenatedText.trim().length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No text file content available to concatenate.';
        p.style.padding = '15px'; p.style.color = 'var(--text-disabled)'; p.style.textAlign = 'center';
        wrapper.appendChild(p); return;
    }
    const pre = document.createElement('pre');
    pre.classList.add('output-text');
    pre.textContent = concatenatedText; // This contains the adaptive comments
    wrapper.appendChild(pre);
}


// --- View Switching Logic ---
function setActiveView(viewId) {
    console.log(`Switching view to: ${viewId}`);
    const panels = [fileTreeContainer, fileContentContainer, outputContainer];
    const buttons = [viewTreeButton, viewContentButton, viewOutputButton];
    if (!panels.every(p => p) || !buttons.every(b => b)) { console.error("setActiveView: Missing one or more view panels or buttons."); showError("UI Error: Cannot switch views properly."); return; }
    panels.forEach(panel => { panel.style.display = 'none'; panel.classList.remove('view-active'); });
    buttons.forEach(button => { button.classList.remove('active'); });
    let targetPanel, activeButton;
    switch (viewId) {
        case 'file-tree-container': targetPanel = fileTreeContainer; activeButton = viewTreeButton; break;
        case 'file-content-container': targetPanel = fileContentContainer; activeButton = viewContentButton; break;
        case 'output-container': targetPanel = outputContainer; activeButton = viewOutputButton; break;
        default: console.warn(`setActiveView: Unknown view ID "${viewId}". Defaulting to file tree.`); targetPanel = fileTreeContainer; activeButton = viewTreeButton;
    }
    if(targetPanel) { // Check if targetPanel was found
      targetPanel.style.display = 'flex';
      targetPanel.classList.add('view-active');
    }
    if(activeButton){ // Check if activeButton was found
      activeButton.classList.add('active');
    }
}


// --- Event Handling Logic ---
async function handleZipFile(filePath) {
     // Check for all required elements, including the new prompt
     if (!processingIndicator || !selectZipButtonNav || !viewSwitcherControls || !initialPrompt) {
         showError("Cannot process file: Core UI elements missing.");
         console.error("handleZipFile Error: Missing required elements.");
         return;
     }
    resetUI(); // Hides view switcher, resets padding, SHOWS prompt
    processingIndicator.style.display = 'block'; // Show indicator
    selectZipButtonNav.disabled = true; // Disable '+' button

    try {
        console.log(`Renderer: Requesting processing for ${filePath}`);
        const result = await ipcRenderer.invoke('process-zip', filePath);
        console.log("Renderer: Received processing result:", result.success);

        if (processingIndicator) processingIndicator.style.display = 'none'; // Hide indicator

        if (result.success) {
             if (!fileTreeWrapper || !fileContentWrapper || !outputWrapper) {
                 showError("Error: Content display areas not found after processing.");
                 console.error("handleZipFile Error: Missing wrapper elements after processing.");
                 resetUI(); // Reset again to show prompt if UI is broken
                 return;
             }

             // --- HIDE the initial prompt ---
             initialPrompt.style.display = 'none';
             // -------------------------------

             // Render all sections
             renderFileTreeText(result.treeString, fileTreeWrapper);
             renderFileContent(result.filesData, fileContentWrapper); // Applies hljs
             renderConcatenatedOutput(result.concatenatedText, outputWrapper); // Uses adaptive comments

             // Show view switcher controls only after successful processing
             if (viewSwitcherControls) viewSwitcherControls.style.display = 'flex'; // Show view buttons

             // Adjust body padding to account for the visible view switcher
             try {
                const combinedTitlebarHeight = getComputedStyle(document.documentElement).getPropertyValue('--combined-titlebar-height').trim() || '92px';
                const viewsNavHeight = getComputedStyle(document.documentElement).getPropertyValue('--navbar-views-height').trim() || '45px';
                document.body.style.paddingTop = `calc(${combinedTitlebarHeight} + ${viewsNavHeight})`; // Add heights
                console.log(`Set body padding-top for views: calc(${combinedTitlebarHeight} + ${viewsNavHeight})`);
             } catch(e) {
                 console.error("Error setting body padding for views:", e);
                 document.body.style.paddingTop = '137px'; // Fallback (92 + 45)
             }


             setActiveView('file-tree-container'); // Set initial view after loading

             // Enable relevant action buttons based on content
             if (copyTreeButton) copyTreeButton.disabled = !result.treeString;
             if (copyOutputButton) copyOutputButton.disabled = !result.concatenatedText;
             if (exportOutputButton) exportOutputButton.disabled = !result.concatenatedText;

        } else {
             // Show error from main process
             showError(`Error processing zip file: ${result.error || 'Unknown processing error'}`);
             // resetUI() was already called at the start, so the prompt remains visible
        }
    } catch (error) {
        // Handle IPC errors or other renderer-side errors during processing
        if (processingIndicator) processingIndicator.style.display = 'none';
        console.error("Renderer Error (IPC invoke or subsequent processing):", error);
        showError(`An unexpected error occurred: ${error.message}`);
        // resetUI() was already called at the start, so the prompt remains visible
    } finally {
        // Always re-enable the select button, regardless of success/failure
        if (selectZipButtonNav) selectZipButtonNav.disabled = false;
        // Ensure file input value is cleared to allow selecting the same file again
        if (fileInput) fileInput.value = null;
    }
}

function initializeAppEventListeners() {
    // Check for existence of all essential interactive elements including the prompt
    const essentialElements = [
        selectZipButtonNav, fileInput, copyTreeButton, copyOutputButton,
        exportOutputButton, viewTreeButton, viewContentButton, viewOutputButton,
        initialPrompt // Added check
    ];
    if (essentialElements.some(el => !el)) {
         console.error("Error: Could not find one or more essential UI elements. Aborting listener setup.");
         showError("UI Initialization Error: Some elements may not work.");
         return; // Prevent adding listeners to null elements
    }

    // Add event listeners (keep the same logic as before)
    selectZipButtonNav.addEventListener('click', () => { console.log("Select Zip button clicked"); fileInput.click(); });
    fileInput.addEventListener('change', async (event) => { console.log("File input changed"); const files = event.target.files; if (files.length > 0) { const file = files[0]; console.log(`File selected: ${file.name}, Path: ${file.path}`); if (file.name.toLowerCase().endsWith('.zip')) { await handleZipFile(file.path); } else { showError('Invalid file type. Please select a .zip file.'); event.target.value = null; } } });
    copyTreeButton.addEventListener('click', () => { const treePre = fileTreeWrapper?.querySelector('.file-tree-text'); if (treePre && treePre.textContent) { copyToClipboard(treePre.textContent, copyTreeButton); console.log("Copied file tree text."); } else { showError('Could not find file tree text to copy.'); console.warn("Attempted to copy tree, but text element not found or empty."); } });
    copyOutputButton.addEventListener('click', () => { const outputPre = outputWrapper?.querySelector('.output-text'); if (outputPre && outputPre.textContent) { copyToClipboard(outputPre.textContent, copyOutputButton); console.log("Copied concatenated output text."); } else { showError('Could not find concatenated output text to copy.'); console.warn("Attempted to copy output, but text element not found or empty."); } });
    exportOutputButton.addEventListener('click', async () => { console.log("Export button clicked."); const outputPre = outputWrapper?.querySelector('.output-text'); const textToSave = outputPre?.textContent; if (textToSave && textToSave.trim().length > 0) { exportOutputButton.disabled = true; try { console.log("Renderer: Sending 'save-text-to-file' request..."); const result = await ipcRenderer.invoke('save-text-to-file', textToSave); console.log("Renderer: Received save result:", result); if (result.success) { const Swal = require('sweetalert2'); Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'File Saved Successfully!', showConfirmButton: false, timer: 2500, background: 'var(--swal-bg)', color: '#ffffff', timerProgressBar: true }); } else if (result.message !== 'Save cancelled.') { showError(`Failed to save file: ${result.error || result.message || 'Unknown save error'}`); } } catch (ipcError) { console.error("Error invoking 'save-text-to-file':", ipcError); showError(`Error communicating with main process for saving: ${ipcError.message}`); } finally { if (exportOutputButton) exportOutputButton.disabled = false; } } else { showError('There is no output text to export.'); console.warn("Attempted to export, but no output text found."); } });
    viewTreeButton.addEventListener('click', () => setActiveView('file-tree-container'));
    viewContentButton.addEventListener('click', () => setActiveView('file-content-container'));
    viewOutputButton.addEventListener('click', () => setActiveView('output-container'));

    console.log("Renderer: App-specific Event Listeners Initialized.");
}


// --- Initialization Code ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Renderer: DOM Content Loaded.");

    // Setup window controls first
    try { setupWindowControls(); }
    catch(err) { console.error("Error setting up window controls:", err); }

    // Then setup listeners
    initializeAppEventListeners(); // Check for essential elements including prompt

    // Initial UI state setup - resetUI SHOWS the prompt
    resetUI();

    // Hide loading screen
    if (window.appLoading && typeof window.appLoading.hide === 'function') {
        setTimeout(() => { window.appLoading.hide(); }, 150);
    } else {
        console.error("Loading screen hide function (window.appLoading.hide) not found!");
        setTimeout(() => { const loadingScreen = document.getElementById('loading-screen'); if (loadingScreen) { loadingScreen.remove(); console.warn("Force removed loading screen as fallback."); } }, 500);
    }

    console.log("Zip Analyser UI Initialized (Renderer).");
});
// <-- end comment (renderer.js)