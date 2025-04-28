<div align="center">

# Zip Analyser 🗂️

</div>

<p align="center">
  <!-- Tech Stack Badges -->
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS"></a>
  <a href="https://www.electronjs.org/"><img src="https://img.shields.io/badge/Electron-26.6.10-%2347848F.svg?style=for-the-badge&logo=electron&logoColor=white" alt="Electron"></a>
  <a href="https://www.electronforge.io/"><img src="https://img.shields.io/badge/Electron%20Forge-^7.0.0-%239B59B6.svg?style=for-the-badge&logo=electron&logoColor=white" alt="Electron Forge"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5"><img src="https://img.shields.io/badge/HTML5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/CSS"><img src="https://img.shields.io/badge/CSS3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"></a>
  <!-- Key Dependencies Badges -->
  <a href="https://www.npmjs.com/package/adm-zip"><img src="https://img.shields.io/badge/adm--zip-^0.5.14-blue?style=for-the-badge" alt="adm-zip"></a>
  <a href="https://highlightjs.org/"><img src="https://img.shields.io/badge/highlight.js-^11.0.0-yellow?style=for-the-badge&logo=highlight.js&logoColor=black" alt="highlight.js"></a>
  <a href="https://sweetalert2.github.io/"><img src="https://img.shields.io/badge/SweetAlert2-^11.0.0-orange?style=for-the-badge" alt="SweetAlert2"></a>
  <!-- License & Release Badges -->
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT"></a>
  <a href="https://github.com/iamplayerexe/zip_analyser/releases"><img src="https://img.shields.io/github/v/release/iamplayerexe/zip_analyser?include_prereleases&style=for-the-badge" alt="Latest Release"></a>
</p>

> A simple desktop application built with Electron for quickly analyzing the contents of `.zip` archives. View file structure, inspect text files with syntax highlighting, and generate concatenated output without full extraction. Designed for Windows.

---

## 🖼️ Preview

**(👇 Click to expand!)**

<details>
  <summary><strong>✨ Main Views & Functionality</strong></summary>
  <br/>
  <p align="center">
    <em><!-- TODO: Add screenshot/GIF of the initial view -->
    Initial view asking to import a zip file.</em>
    <br/><br/>
    <em><!-- TODO: Add screenshot/GIF of the file tree view -->
    File tree structure displayed after loading a zip.</em>
     <br/><br/>
    <em><!-- TODO: Add screenshot/GIF of the file content view with syntax highlighting -->
    File content view showing text files with syntax highlighting.</em>
    <br/><br/>
     <em><!-- TODO: Add screenshot/GIF of the concatenated output view -->
    Concatenated output view combining all text files.</em>
  </p>
</details>

---

## ✨ Features Checklist

-   [x] 📂 **Zip Import:** Load `.zip` files via button or drag-and-drop (*Drag-and-drop not implemented yet, but planned*).
-   [x] 🌲 **Tree View:** Displays the hierarchical file and folder structure inside the zip.
-   [x] 📄 **Content View:** Shows content of text files within cards.
-   [x] ✨ **Syntax Highlighting:** Automatically highlights code syntax for common file types (JS, CSS, PY, HTML, etc.).
-   [x] 📝 **Concatenated Output:** Generates a single text output combining all readable text files, marked with file headers.
-   [x] 📋 **Copy Actions:** Buttons to copy the file tree, individual file content, or the full concatenated output.
-   [x] 💾 **Export:** Save the concatenated output to a `.txt` file.
-   [x] ✨ **Custom UI:** Custom title bar, navigation, and styling.
-   [x] 🔄 **Auto Updates:** (Windows Installer) Checks for updates via GitHub Releases on launch.

---

## 🎯 Why Choose Zip Analyser?

> Quickly Peek Inside Zips Without Extracting Everything.

*   ✅ **Focus:** Designed for developers or users needing a quick look at code/text files within zips.
*   ⚡ **Speed:** Faster than extracting large archives just to view a few text files.
*   💻 **Convenience:** Syntax highlighting and concatenated output in one place.

---

## 🛠️ Built With

*   💻 **[Electron](https://www.electronjs.org/) (v26.6.10)**: Desktop app framework.
*   🔩 **[Electron Forge](https://www.electronforge.io/) (v7.x)**: Build & packaging tools.
*   🦴 **HTML**: Content structure.
*   🎨 **CSS**: Styling and layout.
*   💡 **JavaScript (Node.js)**: App logic & interactions.

---

## 📦 Key Dependencies

*   **`electron` (v26.6.10)**: (Dev) Core framework.
*   **`@electron-forge/cli` (v7.x)**: (Dev) Build tools.
*   **`adm-zip` (v0.5.x)**: Reading and processing zip files.
*   **`highlight.js` (v11.x)**: Syntax highlighting library.
*   **`sweetalert2` (v11.x)**: Pop-up dialogs and notifications.

---

## 🚀 Getting Started (Windows Only)

1.  Go to the **[Releases Page](https://github.com/iamplayerexe/zip_analyser/releases)**.
2.  Download the latest `Zip-Analyser-x.y.z-Setup.exe` (or `Setup.exe`) file from the **Assets** section.
3.  Run the installer.
    *   ⚠️ **Windows SmartScreen/Antivirus:** If the app isn't code-signed, you might see warnings ("Unknown Publisher"). Click "More info" -> "Run anyway".
4.  Launch **Zip Analyser**! The app will check for updates automatically.

---

## 📖 How to Use

1.  🖱️ **Launch:** Open the app.
2.  ➕ **Import Zip:** Click the **`+`** button in the top navigation bar and select a `.zip` file.
3.  🔎 **Explore Views:** Use the **"File Tree"**, **"File Contents"**, and **"Text Output"** buttons to switch views.
4.  📋 **Copy Data:**
    *   *File Tree:* Use the "Copy" button in the File Tree panel header.
    *   *File Content:* Use the "Copy" button on individual file cards in the File Contents view.
    *   *All Output:* Use the "Copy" button in the Text Output panel header.
5.  💾 **Export Output:** Click the **"Export"** button in the Text Output view to save all concatenated text to a file.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
➡️ Please check the [**Issues Page**](https://github.com/iamplayerexe/zip_analyser/issues).

Want to contribute code? (Requires Node.js & npm)

1.  **Fork** the repository.
2.  **Clone** your fork locally (`git clone ...`).
3.  **Install Dependencies** (`cd zip_analyser && npm install`).
4.  **Create Branch** (`git checkout -b feature/YourAmazingFeature`).
5.  **Make Changes**.
6.  **Test Locally** (`npm start`).
7.  **Commit** (`git commit -m 'feat: Add some amazing feature'`).
8.  **Push** (`git push origin feature/YourAmazingFeature`).
9.  **Open Pull Request** back to `iamplayerexe/zip_analyser:main`.

---

## 📜 License

This project is distributed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
