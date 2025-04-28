// src/javascript/loading-screen.js

(function() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingTitle = document.getElementById('loading-title');
    const titleText = "Zip Analyser"; // Corrected spelling

    // Ensure elements exist
    if (!loadingScreen || !loadingTitle) {
        console.error("Loading screen elements not found.");
        if(loadingScreen) loadingScreen.style.display = 'none'; // Hide immediately if broken
        return;
    }

    // Inject spans for letters
    loadingTitle.innerHTML = titleText
        .split('')
        .map(letter => `<span>${letter === ' ' ? ' ' : letter}</span>`)
        .join('');

    // Function to trigger hiding the loading screen
    function hideLoadingScreen() {
        if (!loadingScreen) return;
        console.log("Hiding loading screen...");
        loadingScreen.classList.add('fade-out');
        // Remove the loading screen from DOM after transition
        loadingScreen.addEventListener('transitionend', () => {
            loadingScreen.remove();
            console.log("Loading screen removed.");
        }, { once: true });
    }

    // --- IMPORTANT ---
    // Expose the hide function globally so renderer.js can call it
    // You MUST call window.appLoading.hide() from your main renderer code
    // when the application is ready (e.g., end of DOMContentLoaded).
    window.appLoading = {
        hide: hideLoadingScreen
    };
    // Remove automatic timeout if you intend to call hide() manually
    // window.appLoading.autoHideTimeout = setTimeout(hideLoadingScreen, 2500); // Example: hide after 2.5s

    console.log("Loading screen initialized.");

})(); // IIFE