// forge.config.js

require('dotenv').config();

const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  // This section configures the initial packaging of your app's source code.
  packagerConfig: {
    asar: true,
    icon: "./src/icons/zip_icon_rounded",
    // REMOVED: name: "Zip Analyser". This was the root cause of the error.
    // By removing it, Forge will default to the name in your package.json ("zipanalyser"),
    // which creates a clean directory path without spaces (e.g., "zipanalyser-linux-x64").
    appCopyright: `Copyright ©️ ${new Date().getFullYear()} Xutron`,
    win32metadata: {
      CompanyName: 'Xutron',
      ProductName: 'Zip Analyser', // This is safe as it's just metadata for the .exe
      FileDescription: 'Application to analyze the contents of Zip files.',
    }
  },

  rebuildConfig: {},

  // This section defines the final installers.
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // The squirrel maker correctly uses the 'ProductName' from win32metadata
        // for the user-facing name, so no changes are needed here.
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Exe',
          homepage: 'https://github.com/iamplayerexe/zip_analyser',
          icon: './src/icons/zip-logo.png',
          // This productName is for user-facing metadata (e.g., in the software center)
          // and is safe to keep. The executable name will correctly default to "zipanalyser".
          productName: 'Zip Analyser',
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'Exe',
          homepage: 'https://github.com/iamplayerexe/zip_analyser',
          icon: './src/icons/zip-logo.png',
          productName: 'Zip Analyser',
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