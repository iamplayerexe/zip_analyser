// forge.config.js

require('dotenv').config();

const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  // This section configures the initial packaging of your app's source code.
  packagerConfig: {
    asar: true,
    icon: "./src/icons/zip_icon_rounded", // Base name for icons (.ico for Win, .icns for Mac)
    name: "Zip Analyser",                 // This is the user-facing application name for the folder structure
    appCopyright: `Copyright ©️ ${new Date().getFullYear()} Xutron`,
    win32metadata: {
      CompanyName: 'Xutron',
      ProductName: 'Zip Analyser',
      FileDescription: 'Application to analyze the contents of Zip files.',
    }
    // REMOVED executableName FROM HERE to use the default from package.json
  },

  rebuildConfig: {},

  // This section defines the final installers to be created from the packaged code.
  makers: [
    // Windows
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    // macOS - REMOVED the 'platforms' filter to simplify. It's handled by the build matrix.
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    // Linux (Debian/Ubuntu)
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Exe',
          homepage: 'https://github.com/iamplayerexe/zip_analyser',
          icon: './src/icons/zip-logo.png',
          productName: 'Zip Analyser',
          // REMOVED executableName FROM HERE to use the default
        }
      },
    },
    // Linux (Fedora/CentOS)
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'Exe',
          homepage: 'https://github.com/iamplayerexe/zip_analyser',
          icon: './src/icons/zip-logo.png',
          productName: 'Zip Analyser',
          // REMOVED executableName FROM HERE to use the default
        }
      },
    },
  ],

  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],

  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'iamplayerexe',
          name: 'zip_analyser'
        },
        authToken: process.env.GITHUB_TOKEN,
        prerelease: false,
        draft: false
      }
    }
  ]
};