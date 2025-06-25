// src/javascript/dom-elements.js

// App Bar
const navbarTitle = document.getElementById('navbar-title');
const selectZipButtonNav = document.getElementById('select-zip-button-nav');
const fileInput = document.getElementById('file-input');

// View Switcher Controls
const viewSwitcherControls = document.getElementById('view-switcher-controls');
const viewTreeButton = document.getElementById('view-tree-button');
const viewContentButton = document.getElementById('view-content-button');
const viewOutputButton = document.getElementById('view-output-button');
const viewRecentButton = document.getElementById('view-recent-button');

// Main Content Area & Panels
const contentArea = document.getElementById('content-area');
const fileTreeContainer = document.getElementById('file-tree-container');
const fileContentContainer = document.getElementById('file-content-container');
const outputContainer = document.getElementById('output-container');
const recentFilesContainer = document.getElementById('recent-files-container');

const initialPrompt = document.getElementById('initial-prompt');
const dropPlaceholder = document.getElementById('drop-placeholder');

// MODIFIED: Selectors are now more specific, targeting wrappers inside their panels
const fileTreeWrapper = fileTreeContainer?.querySelector('.tree-wrapper');
const fileContentWrapper = fileContentContainer?.querySelector('.contents-wrapper');
const outputWrapper = outputContainer?.querySelector('.output-wrapper');
const recentFilesWrapper = recentFilesContainer?.querySelector('.recent-files-wrapper');

// Action Buttons within Panels
const copyTreeButton = document.getElementById('copy-tree-button');
const copyOutputButton = document.getElementById('copy-output-button');
const exportOutputButton = document.getElementById('export-output-button');
const clearHistoryButton = document.getElementById('clear-history-button');

// Other UI Elements
const processingIndicator = document.getElementById('processing-indicator');

module.exports = {
    // App Bar
    navbarTitle, selectZipButtonNav, fileInput,
    // View Switcher
    viewSwitcherControls,
    viewTreeButton, viewContentButton, viewOutputButton, viewRecentButton,
    // Main Content & Panels
    contentArea, fileTreeContainer, fileContentContainer, outputContainer, recentFilesContainer,
    initialPrompt, dropPlaceholder,
    fileTreeWrapper, fileContentWrapper, outputWrapper, recentFilesWrapper,
    // Action Buttons
    copyTreeButton, copyOutputButton, exportOutputButton, clearHistoryButton,
    // Other
    processingIndicator,
};