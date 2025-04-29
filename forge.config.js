// forge.config.js

require('dotenv').config();

const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const packageJson = require('./package.json');

module.exports = {
  // Configuration pour Electron Packager (utilisé par Forge)
  packagerConfig: {
    asar: true,
    icon: "./src/icons/zip_icon_rounded.ico", // Chemin vers l'icône de l'application
    name: "Zip Analyser", // Nom utilisé par Packager/Forge

    // --- Options ajoutées ---
    executableName: 'ZipAnalyserApp', // Nom du fichier .exe généré
    appCopyright: `Copyright ©️ ${new Date().getFullYear()} Xutron`, // Texte de copyright intégré
    win32metadata: { // Métadonnées spécifiques pour l'exécutable Windows
      CompanyName: 'Xutron', // Nom de l'entreprise (peut être votre nom)
      ProductName: 'Zip Analyser', // Nom du produit affiché dans les propriétés Windows
      FileDescription: 'Application pour analyser le contenu des fichiers Zip.', // Description du fichier
      OriginalFilename: 'ZipAnalyserApp.exe' // Doit correspondre à executableName
    }
    // --- Fin des options ajoutées ---
  },

  rebuildConfig: {},

  // Configuration des différents types d'installateurs/packages
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // --- CONFIGURER LA SIGNATURE ICI ---
        // certificateFile: process.env.WINDOWS_CERTIFICATE_FILE,
        // certificatePassword: process.env.WINDOWS_CERTIFICATE_PASSWORD,
        // --- Options spécifiques à Squirrel (installeur) ---
        // Note: setupExe/setupIcon personnalisent l'installeur lui-même,
        // tandis que executableName/icon dans packagerConfig personnalisent l'app installée.
        // setupExe: `${packageJson.name}-${packageJson.version}-setup.exe`,
        // setupIcon: './src/icons/zip-logo.ico',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'], // Pour macOS
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}, // Pour Linux Debian/Ubuntu
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}, // Pour Linux Fedora/CentOS
    },
  ],

  // Configuration des plugins Electron Forge
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({ // Configuration de sécurité via Electron Fuses
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],

  // Configuration de la publication automatique sur GitHub Releases
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'iamplayerexe',
          name: 'zip_analyser'
        },
        authToken: process.env.GITHUB_TOKEN, // Jeton d'authentification GitHub
        prerelease: false, // Marquer comme pré-version ?
        draft: false      // Créer comme brouillon ?
      }
    }
  ]
};