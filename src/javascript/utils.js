// <-- comment ( file)(src/javascript/utils.js)
// src/javascript/utils.js
const Swal = require('sweetalert2');

let domElements = {};
try {
    domElements = require('./dom-elements.js');
}
catch (err) {
    console.error("Failed to require dom-elements in utils.js", err);
    domElements = {};
}

const {
    viewSwitcherControls,
    fileTreeContainer, fileContentContainer, outputContainer, recentFilesContainer,
    copyTreeButton, copyOutputButton, exportOutputButton,
    viewTreeButton, viewContentButton, viewOutputButton, viewRecentButton,
    initialPrompt
} = domElements;


function showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
      background: 'var(--swal-bg)',
      color: '#ffffff',
      confirmButtonColor: 'var(--swal-primary-color)',
    });
    console.error(message);
}

function copyToClipboard(text, button) {
    if (!text) {
        showError("Nothing to copy.");
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.disabled = true;
        setTimeout(() => {
            if (button) {
                button.textContent = originalText;
                button.disabled = false;
            }
        }, 1500);
    }).catch(err => {
        showError('Failed to copy text to clipboard.');
    });
}

/**
 * Resets the UI to its initial state before a file is loaded.
 */
function resetUI() {
    console.log("Resetting UI for initial state.");

    if (initialPrompt) initialPrompt.style.display = 'flex';

    // Hide all main view panels
    [fileTreeContainer, fileContentContainer, outputContainer, recentFilesContainer].forEach(panel => {
        if(panel) {
            panel.style.display = 'none';
            panel.classList.remove('view-active');
        }
    });

    // Show the view switcher, but hide the main view buttons
    if (viewSwitcherControls) viewSwitcherControls.style.display = 'flex';
    [viewTreeButton, viewContentButton, viewOutputButton].forEach(button => {
        if(button) button.style.display = 'none';
    });
    // Ensure "Recent" button is visible
    if(viewRecentButton) viewRecentButton.style.display = 'flex';


    [copyTreeButton, copyOutputButton, exportOutputButton].forEach(button => {
        if(button) button.disabled = true;
    });

    try {
        const combinedTitlebarHeight = getComputedStyle(document.documentElement).getPropertyValue('--combined-titlebar-height').trim() || '92px';
        const viewsNavHeight = getComputedStyle(document.documentElement).getPropertyValue('--navbar-views-height').trim() || '45px';
        document.body.style.paddingTop = `calc(${combinedTitlebarHeight} + ${viewsNavHeight})`;
    } catch (e) {
        document.body.style.paddingTop = '137px'; // Fallback
    }
    
    // Set "Recent" as the default active view on startup
    setActiveView('recent-files-container');
}

// setActiveView doit être défini ici car il est utilisé par resetUI
function setActiveView(viewId) {
    const panels = [fileTreeContainer, fileContentContainer, outputContainer, recentFilesContainer];
    const buttons = [viewTreeButton, viewContentButton, viewOutputButton, viewRecentButton];
    
    panels.forEach(panel => panel && (panel.style.display = 'none', panel.classList.remove('view-active')));
    buttons.forEach(button => button?.classList.remove('active'));

    let targetPanel, activeButton;
    switch (viewId) {
        case 'file-tree-container': targetPanel = fileTreeContainer; activeButton = viewTreeButton; break;
        case 'file-content-container': targetPanel = fileContentContainer; activeButton = viewContentButton; break;
        case 'output-container': targetPanel = outputContainer; activeButton = viewOutputButton; break;
        case 'recent-files-container': targetPanel = recentFilesContainer; activeButton = viewRecentButton; break; // CORRECTION
        default:
            console.warn(`setActiveView: Unknown view ID "${viewId}".`);
            return;
    }
    if(targetPanel) {
      targetPanel.style.display = 'flex';
      targetPanel.classList.add('view-active');
    }
    if(activeButton){
      activeButton.classList.add('active');
    }
}

module.exports = { showError, copyToClipboard, resetUI, setActiveView };
// <-- end comment (.js file)(src/javascript/utils.js)