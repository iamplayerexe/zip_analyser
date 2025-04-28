// src/main-process/tree-generator.js

/**
 * Generates a pre-formatted string representation of the file tree.
 * @param {Array} entries - An array of zip entry objects from AdmZip.
 * @returns {string} The formatted tree string.
 */
function generateTreeString(entries) {
    const rootNodes = {}; // Stores top-level nodes { nodeName: { name, type, children, path } }
    const allNodes = {};  // Flat map for quick path lookup { path: node }

    // Sort entries to process parent directories before their contents somewhat reliably
    const sortedEntries = entries.sort((a, b) => a.entryName.localeCompare(b.entryName));

    sortedEntries.forEach(entry => {
        const path = entry.entryName.replace(/\\/g, '/');
        // Skip empty or root-level directory entries often present in zips
        if (!path || (entry.isDirectory && path.split('/').filter(Boolean).length === 0)) {
            return;
        }
        const parts = path.split('/').filter(p => p.length > 0);
        if (parts.length === 0) return; // Skip if path becomes empty after filtering

        let currentLevel = rootNodes;
        let currentPath = '';

        parts.forEach((part, index) => {
            const isLastPart = index === parts.length - 1;
            // Determine if it's a directory: explicit entry.isDirectory OR path ends with '/' (and it's the last part)
            const isDirectory = entry.isDirectory || (isLastPart && path.endsWith('/'));
            const nodeName = part;
            const nodePath = currentPath ? `${currentPath}/${nodeName}` : nodeName;

            // Create node if it doesn't exist in the current level's children
            if (!currentLevel[nodeName]) {
                const newNode = {
                    name: nodeName,
                    type: isDirectory ? 'dir' : (isLastPart ? 'file' : 'dir'), // Assume dir if not last part
                    children: {},
                    path: nodePath
                };
                currentLevel[nodeName] = newNode;
                allNodes[nodePath] = newNode;
            } else {
                 // Ensure type is 'dir' if a directory entry is encountered, or if not the last part
                 if ((isDirectory || !isLastPart) && currentLevel[nodeName].type === 'file') {
                     currentLevel[nodeName].type = 'dir';
                 }
            }

            // Ensure parent directories exist and are marked as 'dir'
             if (currentPath && allNodes[currentPath] && allNodes[currentPath].type === 'file') {
                 allNodes[currentPath].type = 'dir';
             }

            currentPath = nodePath;
            // Important: Check if children exist before trying to access it
             if (currentLevel[nodeName]) {
                currentLevel = currentLevel[nodeName].children;
             } else {
                 // Should not happen with the logic above, but as a safeguard:
                 console.warn(`Node ${nodeName} not found at path ${currentPath} during tree build.`);
                 // Potentially break or handle error appropriately
                 return; // Stop processing this path part
             }
        });
    });

    // Recursive function to build the string
    let treeString = '';
    function buildStringRecursive(nodes, prefix = '') {
        const sortedKeys = Object.keys(nodes).sort((a, b) => {
            const nodeA = nodes[a];
            const nodeB = nodes[b];
            if (nodeA.type === 'dir' && nodeB.type === 'file') return -1;
            if (nodeA.type === 'file' && nodeB.type === 'dir') return 1;
            return a.localeCompare(b);
        });

        sortedKeys.forEach((key, index) => {
            const node = nodes[key];
            const isLast = index === sortedKeys.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const indent = prefix + connector;
            const nameSuffix = node.type === 'dir' ? '/' : '';

            treeString += `${indent}${node.name}${nameSuffix}\n`;

            if (node.type === 'dir' && node.children && Object.keys(node.children).length > 0) {
                const newPrefix = prefix + (isLast ? '    ' : '│   ');
                buildStringRecursive(node.children, newPrefix);
            }
        });
    }

    // Sort top-level keys similarly
    const topLevelKeys = Object.keys(rootNodes).sort((a, b) => {
        const nodeA = rootNodes[a];
        const nodeB = rootNodes[b];
        if (nodeA.type === 'dir' && nodeB.type === 'file') return -1;
        if (nodeA.type === 'file' && nodeB.type === 'dir') return 1;
        return a.localeCompare(b);
    });

    // Check for single root directory case
    if (topLevelKeys.length === 1 && rootNodes[topLevelKeys[0]].type === 'dir') {
        const rootNode = rootNodes[topLevelKeys[0]];
        treeString = `${rootNode.name}/\n`;
        if (rootNode.children) { // Check if children exist
             buildStringRecursive(rootNode.children, '');
        }
    } else {
        buildStringRecursive(rootNodes, '');
    }

    return treeString.trim();
}

module.exports = {
    generateTreeString,
};