require('dotenv').config();

const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: "./src/icons/zip_icon_rounded",
    appCopyright: `Copyright © ${new Date().getFullYear()} Xutron`,
    win32metadata: {
      CompanyName: 'Xutron',
      ProductName: 'Zip Analyser',
      FileDescription: 'Application to analyze the contents of Zip files.',
    }
  },

  rebuildConfig: {},

  makers: [
    {
      // Windows installer
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "ZipAnalyser", // A name without spaces is safer
        setupIcon: './src/icons/zip_icon_rounded.ico',
      },
    },
    {
      // UPDATED: Changed from maker-zip to maker-dmg for a better macOS experience
      name: '@electron-forge/maker-dmg',
      config: {
        icon: './src/icons/zip_icon_rounded.icns',
        name: 'Zip Analyser'
      }
    },
    {
      // Linux .deb installer
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Xutron',
          homepage: 'https://github.com/iamplayerexe/zip_analyser',
          icon: './src/icons/zip-logo.png',
          productName: 'Zip Analyser',
          license: 'MIT'
        }
      },
    },
    {
      // Linux .rpm installer
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'Xutron',
          homepage: 'https://github.com/iamplayerexe/zip_analyser',
          icon: './src/icons/zip-logo.png',
          productName: 'Zip Analyser',
          license: 'MIT'
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
        // UPDATED: This now points to your PRIVATE repository for releases
        repository: {
          owner: 'iamplayerexe',
          name: 'zip_analyser_app' // IMPORTANT: Change if your private repo has a different name
        },
        authToken: process.env.GITHUB_TOKEN, // This will be provided by the workflow secret
        prerelease: false,
        draft: false
      }
    }
  ]
};