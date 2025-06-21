<div align="center">

# Zip Analyser 🗂️

</div>

<p align="center">
  <!-- Tech Stack Badges -->
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-Installed-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS"></a>
  <a href="https://www.electronjs.org/"><img src="https://img.shields.io/badge/Electron-26.6.10-%2347848F.svg?style=for-the-badge&logo=electron&logoColor=white" alt="Electron"></a>
  <a href="https://www.electronforge.io/"><img src="https://img.shields.io/badge/Electron%20Forge-7.8.0-%239B59B6.svg?style=for-the-badge&logo=electron&logoColor=white" alt="Electron Forge"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5"><img src="https://img.shields.io/badge/HTML5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/CSS"><img src="https://img.shields.io/badge/CSS3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"></a>
  <!-- Key Dependencies Badges -->
  <a href="https://www.npmjs.com/package/adm-zip"><img src="https://img.shields.io/badge/adm--zip-0.5.14-blue?style=for-the-badge" alt="adm-zip"></a>
  <a href="https://www.npmjs.com/package/dotenv"><img src="https://img.shields.io/badge/dotenv-16.5.0-blue?style=for-the-badge" alt="dotenv"></a>
  <a href="https://www.npmjs.com/package/electron-store"><img src="https://img.shields.io/badge/electron--store-7.0.3-blue?style=for-the-badge" alt="electron-store"></a>
  <a href="https://highlightjs.org/"><img src="https://img.shields.io/badge/highlight.js-11.11.1-yellow?style=for-the-badge&logo=highlight.js&logoColor=black" alt="highlight.js"></a>
  <a href="https://sweetalert2.github.io/"><img src="https://img.shields.io/badge/SweetAlert2-11.4.8-orange?style=for-the-badge" alt="SweetAlert2"></a>
  <!-- License & Release Badges -->
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT"></a>
  <a href="https://github.com/iamplayerexe/zip_analyser/releases"><img src="https://img.shields.io/github/v/release/iamplayerexe/zip_analyser?include_prereleases&style=for-the-badge" alt="Latest Release"></a>
</p>

> A powerful desktop utility for **Windows, macOS, and Linux**, designed to streamline your workflow with AI models. Zip Analyser instantly processes `.zip` archives, combining all text-based files into a single, clean output. This allows you to copy an entire project's context into an AI prompt in seconds, saving time and improving comprehension.

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

-   [x] 🖥️ **Cross-Platform:** Native installers for Windows, macOS, and Linux.
-   [x] 📂 **Zip Import:** Load `.zip` files via button or drag-and-drop.
-   [x] 🌲 **Tree View:** Displays the hierarchical file and folder structure inside the zip.
-   [x] 📄 **Content View:** Shows content of text files and image previews within cards.
-   [x] ✨ **Syntax Highlighting:** Automatically highlights code syntax for common file types.
-   [x] 📝 **Concatenated Output:** Generates a single text output combining all readable text files, perfect for AI prompts.
-   [x] 📋 **Copy Actions:** Buttons to copy the file tree, individual file content, or the full concatenated output.
-   [x] 💾 **Export:** Save the concatenated output or individual files to your disk.
-   [x] ✨ **Custom UI:** Custom title bar, navigation, and styling.
-   [x] 🔄 **Smart Updates:** Seamless auto-updates for Windows & macOS; update notifications for Linux.

---

## 🎯 Why Choose Zip Analyser?

> Supercharge Your AI Prompts.

*   ✅ **AI-Ready Context:** Generate a single, comprehensive text file from your project's source code, perfect for pasting into large language models (LLMs).
*   ⚡ **Efficiency:** Stop manually opening, copying, and pasting dozens of files. Go from a `.zip` to a complete prompt in just a few clicks.
*   💻 **Convenience:** Syntax highlighting, image previews, and concatenated output all in one cross-platform application.

---

## 🛠️ Built With

*   💻 **[Electron](https://www.electronjs.org/) (v26.6.10)**: Desktop app framework.
*   🔩 **[Electron Forge](https://www.electronforge.io/) (v7.x)**: Build & packaging tools.
*   🦴 **HTML**: Content structure.
*   🎨 **CSS**: Styling and layout.
*   💡 **JavaScript (Node.js)**: App logic & interactions.

---

## 🚀 Getting Started

> **Note:** We recommend downloading version **v1.2.0 or newer**. This is the first version with stable installers for Windows, macOS, and Linux.

1.  Go to the **[Releases Page](https://github.com/iamplayerexe/zip_analyser/releases)**.
2.  Download the correct installer for your operating system from the **Assets** section.

<details>
  <summary><strong>🪟 Windows Installation</strong></summary>
  <br/>
  <ol>
    <li>Download the file ending in <code>-Setup.exe</code>.</li>
    <li>Run the installer.</li>
    <li>⚠️ <strong>Windows SmartScreen:</strong> If a warning appears, click "More info" → "Run anyway". This is because the application is not code-signed.</li>
    <li>Launch <strong>Zip Analyser</strong>! The app will check for updates automatically.</li>
  </ol>
</details>

<details>
  <summary><strong>🍎 macOS Installation</strong></summary>
  <br/>
  <ol>
    <li>Download the file ending in <code>.dmg</code>.</li>
    <li>Open the <code>.dmg</code> file.</li>
    <li>Drag the <strong>Zip Analyser</strong> app icon into your <strong>Applications</strong> folder shortcut.</li>
    <li>⚠️ <strong>First Launch:</strong> You may need to <strong>right-click</strong> the app icon and select <strong>"Open"</strong>. If a warning appears, click the "Open" button on the dialog to proceed. You only need to do this once.</li>
    <li>Launch the app normally from then on! It will update automatically.</li>
  </ol>
</details>

<details>
  <summary><strong>🐧 Linux Installation</strong></summary>
  <br/>
  <ol>
    <li>Download the appropriate package for your distribution:
        <ul>
            <li><code>.deb</code> for Debian, Ubuntu, Mint, etc.</li>
            <li><code>.rpm</code> for Fedora, CentOS, etc.</li>
        </ul>
    </li>
    <li><strong>To Install (GUI):</strong> Double-click the downloaded file to open it with your system's software installer.</li>
    <li><strong>To Install (Terminal):</strong>
        <ul>
            <li>For <code>.deb</code>: <code>sudo dpkg -i file-name.deb</code> (then `sudo apt-get install -f` if needed).</li>
            <li>For <code>.rpm</code>: <code>sudo dnf install file-name.rpm</code>.</li>
        </ul>
    </li>
    <li>Launch the app. It will notify you when a new version is available for manual download.</li>
  </ol>
</details>

---

## 📖 How to Use

1.  🖱️ **Launch:** Open the app.
2.  ➕ **Import Zip:** Click the **`+`** button or drag and drop a `.zip` file onto the window.
3.  🔎 **Explore Views:** Use the **"File Tree"**, **"File Contents"**, and **"Text Output"** buttons to switch views.
4.  📋 **Copy Data:**
    *   *File Tree:* Use the "Copy" button in the File Tree panel header.
    *   *File Content:* Use the "Copy" button on individual file cards.
    *   *All Output:* Use the "Copy" button in the Text Output panel header.
5.  💾 **Export Output:** Click the **"Export"** button in the Text Output view to save all concatenated text to a file.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
➡️ Please check the [**Issues Page**](https://github.com/iamplayerexe/zip_analyser/issues).

Want to contribute code? (Requires Node.js & npm)

1.  **Fork** the repository.
2.  **Clone** your fork locally (`git clone ...`).
3.  **Install Dependencies** (`npm install`).
4.  **Create Branch** (`git checkout -b feature/YourAmazingFeature`).
5.  **Make Changes**.
6.  **Test Locally** (`npm start`).
7.  **Commit** (`git commit -m 'feat: Add some amazing feature'`).
8.  **Push** (`git push origin feature/YourAmazingFeature`).
9.  **Open a Pull Request** back to `iamplayerexe/zip_analyser:main`.

---

## 📜 License

This project is distributed under the **MIT License**. See the [LICENSE](LICENSE) file for details.