// src/main-process/zip-processor.js
const AdmZip = require('adm-zip');
const fs = require('node:fs');

/**
 * Reads zip file entries and extracts text file data.
 * @param {string} filePath - Absolute path to the zip file.
 * @returns {Promise<object>} - Promise resolving to { success: true, filesData: object, entries: Array } or { success: false, error: string }
 */
async function processZipData(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries(); // Get all entries
        const filesData = {};

        // Helper to check for binary content
        function isBinary(buffer) {
            if (!buffer) return false; // Handle null buffer case
            for (let i = 0; i < Math.min(buffer.length, 512); i++) {
                if (buffer[i] === 0) return true;
            }
            return false;
        }

        // Use Promise.all for potentially faster async processing (though AdmZip is mostly sync)
        // In this case, it's more about structuring the data extraction cleanly.
        await Promise.all(zipEntries.map(async (entry) => {
            if (!entry.isDirectory) {
                const entryPath = entry.entryName.replace(/\\/g, '/');
                if (!entryPath || entryPath.endsWith('/')) {
                    console.warn(`Skipping invalid file entry: ${entry.entryName}`);
                    return; // Skip invalid entries
                }

                // AdmZip's getData is synchronous, but structure allows for async alternatives
                const contentBuffer = entry.getData();

                 if (contentBuffer === null) {
                    console.warn(`Could not get data for entry: ${entryPath}`);
                    filesData[entryPath] = '[Error reading file data]';
                    return;
                 }

                if (isBinary(contentBuffer)) {
                    filesData[entryPath] = '[Binary File - Content not displayed]';
                } else {
                    try {
                        filesData[entryPath] = contentBuffer.toString('utf8');
                    } catch (decodeError) {
                        console.warn(`Could not decode ${entryPath} as UTF-8:`, decodeError);
                        filesData[entryPath] = `[Could not decode file content (Encoding issue?)]`;
                    }
                }
            }
        }));

        return { success: true, filesData, entries: zipEntries };

    } catch (error) {
        console.error('Error processing zip file:', error);
        // Ensure the error message is a string
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
    }
}

module.exports = {
    processZipData,
};