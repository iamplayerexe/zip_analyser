// <-- comment (src/javascript/dom-elements.js)
// src/javascript/dom-elements.js

// Titlebar elements
const titlebar = document.getElementById('titlebar');
const navbarTitle = document.getElementById('navbar-title');
const selectZipButtonNav = document.getElementById('select-zip-button-nav');
const fileInput = document.getElementById('file-input');

// Window Controls
const minButton = document.getElementById('min-button');
const maxButton = document.getElementById('max-button');
const restoreButton = document.getElementById('restore-button');
const closeButton = document.getElementById('close-button');

// View Switcher Controls
const viewSwitcherControls = document.getElementById('view-switcher-controls');
const viewTreeButton = document.getElementById('view-tree-button');
const viewContentButton = document.getElementById('view-content-button');
const viewOutputButton = document.getElementById('view-output-button');

// Main Content Area & Panels
const contentArea = document.getElementById('content-area');
const fileTreeContainer = document.getElementById('file-tree-container');
const fileContentContainer = document.getElementById('file-content-container');
const outputContainer = document.getElementById('output-container');

// --- ADD Initial Prompt ---
const initialPrompt = document.getElementById('initial-prompt');
// ------------------------

// Wrappers within Panels
// Use optional chaining in case containers aren't found initially
const fileTreeWrapper = fileTreeContainer?.querySelector('.tree-wrapper');
const fileContentWrapper = fileContentContainer?.querySelector('.contents-wrapper');
const outputWrapper = outputContainer?.querySelector('.output-wrapper');

// Action Buttons within Panels
const copyTreeButton = document.getElementById('copy-tree-button');
const copyOutputButton = document.getElementById('copy-output-button');
const exportOutputButton = document.getElementById('export-output-button');

// Other UI Elements
const processingIndicator = document.getElementById('processing-indicator');


module.exports = {
    // Titlebar
    titlebar, navbarTitle, selectZipButtonNav, fileInput,
    // Window Controls
    minButton, maxButton, restoreButton, closeButton,
    // View Switcher
    viewSwitcherControls,
    viewTreeButton, viewContentButton, viewOutputButton,
    // Main Content & Panels
    contentArea, fileTreeContainer, fileContentContainer, outputContainer,
    // --- ADD Initial Prompt to export ---
    initialPrompt,
    // -----------------------------------
    fileTreeWrapper, fileContentWrapper, outputWrapper,
    // Action Buttons
    copyTreeButton, copyOutputButton, exportOutputButton,
    // Other
    processingIndicator,
};
// <-- end comment (src/javascript/dom-elements.js)