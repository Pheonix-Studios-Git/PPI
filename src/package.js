// Get package name from query string
const urlParams = new URLSearchParams(window.location.search);
const packageName = urlParams.get('name');
const packages_loc = urlParams.get('data_loc');

let packages_gv = [];
const zipCache = {};

async function getZip(zipPath) {
    if (zipCache[zipPath]) return zipCache[zipPath];

    const res = await fetch(zipPath);
    const arrayBuffer = await res.arrayBuffer();

    const zip = await JSZip.loadAsync(arrayBuffer);
    zipCache[zipPath] = zip;

    return zip;
}

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
                const zip = await getZip(`../../data/${resolveFile(package_object)}`);
                console.log(zip);

                const readmeFile = zip.file(package_object.readme || "README.md");

                if (!readmeFile) {
                    package_object.readmeContent = "README not available.";
                } else {
                    package_object.readmeContent = await readmeFile.async("string");
                }
            } catch (err) {
                console.error(`Failed to load ZIP for ${package_object.name}:`, err);
                package_object.readmeContent = "README not available.";
            }
        }

        packages_gv = packages.packages;

        renderPackage(package_object);
    } catch (err) {
        console.error('Failed to load packages.json:', err);
    }
}

function resolveVersion(pkg, requestedVersion = null) {
    if (!pkg.versioning_enabled) {
        return null;
    }

    if (!requestedVersion) {
        return pkg.latest_version;
    }

    if (pkg.versions.includes(requestedVersion)) {
        return requestedVersion;
    }

    return null;
}

function resolveFile(pkg, reqVer = null) {
    var v = resolveVersion(pkg, reqVer)
    if (v === null) {
        return pkg.zipfile
    }
    return pkg.zipfile.replace("%", v);
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

    var product_hunt = ""
    if (pkg.name == "NFX") {
        if (document.documentElement.getAttribute('data-theme') === 'light') {
            product_hunt = `
            <a href="https://www.producthunt.com/products/github-377?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-nfx-2" target="_blank" rel="noopener noreferrer"><img alt="NFX - A new package manager, that works within Pheonix Ecosystem! | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1146325&amp;theme=light&amp;t=1779198568341"></a>
            `
        } else {
            product_hunt = `
            <a href="https://www.producthunt.com/products/github-377?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-nfx-2" target="_blank" rel="noopener noreferrer"><img alt="NFX - A new package manager, that works within Pheonix Ecosystem! | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1146325&amp;theme=dark&amp;t=1779198139596"></a>
            `
        }
    }

    const update_isoString = pkg.update.replace(" ", "T");
    const update_date = new Date(update_isoString);
    const date_options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
    };

    const update_date_formatted = new Intl.DateTimeFormat('en-US', date_options).format(update_date);

    container.innerHTML = DOMPurify.sanitize(`
        <div class="package-header">
            <h2>${pkg.name}</h2>
            <p>Version: ${pkg.version}</p>
            <p>Author: ${pkg.author}</p>
            <p>Status: ${pkg.status}</p>
            <p>Updated: ${update_date_formatted}</p>
            ${product_hunt}
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
            <a href="${pkg.git_url}" target="_blank">Git Repository</a>
            <hr>
            <div class="version-box">
                <span id="version-label" style="cursor:pointer;">
                    Select Version: ${pkg.version} ▾
                </span>

                <select id="version-select" style="display:none;"></select>
            </div>
            <a id="install-link" href="../../data/${resolveFile(pkg)}">
                <button class="install-btn">Install Directly</button>
            </a>
        </div>
        <hr>
        <div id="readme-content"></div>
    `);

    const versionLabel = document.getElementById("version-label");
    const versionSelect = document.getElementById("version-select");
    const installLink = document.getElementById("install-link");

    let currentVersion = pkg.version;

    if (pkg.versioning_enabled && pkg.versions?.length > 0) {
        pkg.versions.slice().reverse().forEach(v => {
            const opt = document.createElement("option");
            opt.id = "version-option";
            opt.value = v;
            opt.textContent = v + (v === pkg.latest_version ? " (latest)" : "");
            versionSelect.appendChild(opt);
        });

        versionSelect.value = pkg.latest_version;
    } else {
        const opt = document.createElement("option");
        opt.id = "version-option";
        opt.value = pkg.version;
        opt.textContent = pkg.version + " (current)";
        versionSelect.appendChild(opt);
        versionSelect.value = pkg.version;
    }

    versionLabel.onclick = () => {
        versionSelect.style.display = versionSelect.style.display === "none" ? "block" : "none";
    };

    versionSelect.onchange = () => {
        currentVersion = versionSelect.value;
        versionLabel.innerText = `Version: ${currentVersion} ▼`;
        const resolvedFile = resolveFile(pkg, currentVersion);
        installLink.href = `../../data/${resolvedFile}`;
    };

    // Render README markdown
    document.getElementById('readme-content').innerHTML = DOMPurify.sanitize(marked.parse(pkg.readmeContent));

    hljs.highlightAll();
}

document.querySelector('#search-bar').addEventListener("keydown", async (event) => {
    if (event.key == "Enter") {
        const q = document.querySelector('#search-bar').value.trim();
        if (q) {
            const res_obj = packages_gv.find(obj => obj.name === q);

            if (res_obj.readme === "") {
                res_obj.readmeContent = "README not available.";
            } else {
                try {
                    const zip = await getZip(`../../data/${res_obj.zipfile}`);

                    const readmeFile = zip.file(res_obj.readme || "README.md");

                    if (!readmeFile) {
                        res_obj.readmeContent = "README not available.";
                    } else {
                        res_obj.readmeContent = await readmeFile.async("string");
                    }
                } catch (err) {
                    console.error(`Failed to load ZIP for ${res_obj.name}:`, err);
                    res_obj.readmeContent = "README not available.";
                }
            }
            if (res_obj) {
                renderPackage(res_obj);
            } else {
                alert(`Package [${q}] does not exist, hence no info found!`);
            }
        }
    }
});


loadPackages();
