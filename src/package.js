// Get package name from query string
const urlParams = new URLSearchParams(window.location.search);
const packageName = urlParams.get('name') || 'nfx';

// Mock package data (in real scenario, fetch from API)
const packageData = {
    name: 'nfx',
    version: '0.1.0',
    author: 'Pheonix Studios',
    dependencies: ['libfoo >=1.0', 'libbar <2.0'],
    git_url: 'https://github.com/Pheonix-Studios-Git/NFX',
    readme: `
# NFX - Nova Pheonix Package Manager

NFX is a futuristic package manager for the Nova ecosystem.

## Features
- Install packages
- Resolve dependencies
- Manage versions
- And more!

## Installation
\`\`\`bash
nfx install nfx
\`\`\`
`
};

// Render package page
function renderPackage(pkg) {
    const container = document.getElementById('package-main');

    // Build dependencies as vertical tabbed list
    const deps = pkg.dependencies.length
        ? pkg.dependencies.map(dep => `<li class="dependency-item">→ ${dep}</li>`).join('')
        : '<li class="dependency-item">None</li>';

    container.innerHTML = `
        <div class="package-header">
            <h2>${pkg.name}</h2>
            <p>Version: ${pkg.version}</p>
            <p>Author: ${pkg.author}</p>
            <p>Dependencies:</p>
            <ul class="dependency-list">
                ${deps}
            </ul>
            <hr>
            <a href="${pkg.git_url}" target="_blank" style="color: white;">Git Repository</a>
        </div>
        <hr>
        <div id="readme-content"></div>
    `;

    // Render README markdown
    document.getElementById('readme-content').innerHTML = marked.parse(pkg.readme);
}

renderPackage(packageData);
