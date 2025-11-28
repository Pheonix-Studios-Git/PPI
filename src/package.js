// Get package name from query string
const urlParams = new URLSearchParams(window.location.search);
const packageName = urlParams.get('name');
const packages_loc = urlParams.get('data_loc');

async function loadPackages() {
    if (packages_loc == "") return null;
    if (packageName == "") return null;
    try {
        const res = await fetch(packages_loc);
        const packages = await res.json();

        const package_object = packages.packages.find(p => p.name === packageName);
        if (package_object.readme === "") {
            package_object.readmeContent = "README not available.";
        } else {
            try {
                const readmeRes = await fetch(`../data/${package_object.readme}`);
                package_object.readmeContent = await readmeRes.text(); // store README content
            } catch (err) {
                console.error(`Failed to load README for ${package_object.name}:`, err);
                package_object.readmeContent = "README not available.";
            }
        }

        renderPackage(package_object);
    } catch (err) {
        console.error('Failed to load packages.json:', err);
    }
}

// Render package page
function renderPackage(pkg) {
    const container = document.getElementById('package-main');

    // Build dependencies as vertical tabbed list
    const deps = pkg.dependencies.length
        ? pkg.dependencies.map(dep => `<li class="dependency-item">→ ${dep}</li>`).join('')
        : '<li class="dependency-item">None</li>';

    const os = pkg.os.length
        ? pkg.os.map(dep => `<li class="os-item">→ ${dep}</li>`).join('')
        : '<li class="os-item">None</li>';

    const arch = pkg.arch.length
        ? pkg.arch.map(dep => `<li class="arch-item">→ ${dep}</li>`).join('')
        : '<li class="arch-item">None</li>';

    container.innerHTML = `
        <div class="package-header">
            <h2>${pkg.name}</h2>
            <p>Version: ${pkg.version}</p>
            <p>Author: ${pkg.author}</p>
            <hr>
            <p>Dependencies:</p>
            <ul class="dependency-list">
                ${deps}
            </ul>
            <hr>
            <p>Supported OSes:</p>
            <ul class="os-list">
                ${os}
            </ul>
            <hr>
            <p>Supported Architectures:</p>
            <ul class="arch-list">
                ${arch}
            </ul>
            <hr>
            <p>Install:<pre><code class="language-bash">${pkg.install}</code></pre></p>
            <hr>
            <a href="${pkg.git_url}" target="_blank" style="color: white;">Git Repository</a>
            <hr>
        </div>
        <hr>
        <div id="readme-content"></div>
    `;

    hljs.highlightAll();

    // Render README markdown
    document.getElementById('readme-content').innerHTML = marked.parse(pkg.readmeContent);
}

loadPackages();
