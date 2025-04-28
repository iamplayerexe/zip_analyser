// <-- comment (src/javascript/utils.js)
// src/javascript/utils.js
const Swal = require('sweetalert2');

// Require dom-elements dynamically
let domElements = {};
try {
    // Ensure this path is correct relative to utils.js
    domElements = require('./dom-elements.js'); // Gets updated export with initialPrompt
}
catch (err) {
    console.error("Failed to require dom-elements in utils.js", err);
    // Define needed elements as null/empty if load fails to prevent crashing later
    domElements = {
        viewSwitcherControls: null, fileTreeContainer: null, fileContentContainer: null,
        outputContainer: null, copyTreeButton: null, copyOutputButton: null,
        exportOutputButton: null, viewTreeButton: null, viewContentButton: null,
        viewOutputButton: null, initialPrompt: null
    };
}

// Destructure safely, providing fallbacks if elements weren't loaded
const {
    viewSwitcherControls,
    fileTreeContainer, fileContentContainer, outputContainer,
    copyTreeButton, copyOutputButton, exportOutputButton,
    viewTreeButton, viewContentButton, viewOutputButton,
    initialPrompt // Get the initial prompt element
} = domElements;


function showError(message) {
    // Keep SweetAlert logic
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
      background: 'var(--swal-bg)',
      color: '#ffffff', // Explicit text color
      confirmButtonColor: 'var(--swal-primary-color)',
    });
    console.error(message); // Log error to console as well
}

function copyToClipboard(text, button) {
    // Keep clipboard logic
    if (!text) { // Prevent copying null/undefined
        showError("Nothing to copy.");
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.disabled = true; // Temporarily disable after copy
        setTimeout(() => {
            if (button) { // Check if button still exists
                button.textContent = originalText;
                button.disabled = false; // Re-enable
            }
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showError('Failed to copy text to clipboard. Check browser/app permissions.');
    });
}

/**
 * Resets the UI state. Hides view panels and view switcher,
 * disables action buttons, resets body padding for the titlebar ONLY,
 * and SHOWS the initial prompt message.
 */
function resetUI() {
    console.log("Resetting UI: Hiding views, showing prompt.");

    // --- SHOW the initial prompt ---
    if (initialPrompt) {
        initialPrompt.style.display = 'flex'; // Use 'flex' to enable centering styles
    } else {
        console.error("resetUI: Could not find initial prompt element!");
    }
    // -----------------------------

    // Hide all view panels and remove active class
    [fileTreeContainer, fileContentContainer, outputContainer].forEach(panel => {
        if(panel) {
            panel.style.display = 'none';
            panel.classList.remove('view-active');
        }
    });

    // Hide view switcher div
    if (viewSwitcherControls) {
        viewSwitcherControls.style.display = 'none';
    }

    // Disable action buttons
    [copyTreeButton, copyOutputButton, exportOutputButton].forEach(button => {
        if(button) button.disabled = true;
    });

    // Remove active class from view buttons
    [viewTreeButton, viewContentButton, viewOutputButton].forEach(button => {
        button?.classList.remove('active'); // Optional chaining for safety
    });

    // Reset body padding to only account for the combined titlebar + app navbar height
    try {
        const combinedTitlebarHeight = getComputedStyle(document.documentElement).getPropertyValue('--combined-titlebar-height').trim() || '92px';
        document.body.style.paddingTop = combinedTitlebarHeight;
        console.log(`Reset body padding-top to: ${combinedTitlebarHeight}`);
    } catch (e) {
        console.error("Error resetting body padding:", e);
        document.body.style.paddingTop = '92px'; // Fallback
    }
}

module.exports = { showError, copyToClipboard, resetUI };
// <-- end comment (src/javascript/utils.js)