// Get package name from query string
const urlParams = new URLSearchParams(window.location.search);
const packageName = urlParams.get('name');
const packages_loc = urlParams.get('data_loc');

let packages_gv = [];
const zipCache = {};

let markdownHistory = [];

function normalizeZipPath(zipPath) {
    if (!zipPath || typeof zipPath !== "string") return null;

    let path = zipPath.replace(/\\/g, "/"); // use forward slashes only
    if (path.startsWith("/") || /^[A-Za-z]:\//.test(path)) return null;

    const parts = path.split("/");
    const normalized = [];

    for (const part of parts) {
        if (!part || part == '.') continue;

        if (part == '..') {
            if (normalized.length === 0) return null; // Trying to exit Zipfile

            normalized.pop();
            continue;
        }

        normalized.push(part);
    }

    return normalized.join("/");
}

function resolveMarkdownPath(basePath, requestedPath) {
    if (!basePath || typeof basePath !== "string") return null;
    if (!requestedPath || typeof requestedPath !== "string") return null;

    if (
        requestedPath.startsWith("http://") ||
        requestedPath.startsWith("https://") ||
        requestedPath.startsWith("//") ||
        requestedPath.startsWith("#") ||
        requestedPath.startsWith("mailto:")
    ) return null; // Ignore URL, only care about files

    let rpath = requestedPath.split("#")[0].split("?")[0];
    const baseParts = basePath.split("/");
    baseParts.pop(); // Remove current .md filename.

    const combined = [...baseParts, ...rpath.split("/")].join("/");
    return normalizeZipPath(combined);
}

async function loadMarkdownFromZip(zipPath, markdownPath) {
    const safePath = normalizeZipPath(markdownPath);
    if (!safePath) throw new Error(`Dangerous/Invalid path found in Zipfile: ${markdownPath}`);

    const zip = await getZip(zipPath);
    const file = zip.file(safePath);

    if (!file) throw new Error(`Could not find ${safePath} in Zipfile`);
    return await file.async("string");
}

async function getZip(zipPath) {
    if (!zipPath || typeof zipPath !== "string") return null;

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
                if (!zip) return null;
                console.log(zip);

                const readmeFile = zip.file(package_object.readme || "README.md");

                if (!readmeFile) {
                    package_object.readmeContent = "README not available.";
                } else {
                    package_object.readmeContent = await readmeFile.async("string");
                }
            } catch (err) {
                console.error(`Failed to load Zipfile for ${package_object.name}:`, err);
                package_object.readmeContent = "README not available.";
            }
        }

        packages_gv = packages.packages;

        await renderPackage(package_object);
    } catch (err) {
        console.error('Failed to load packages.json:', err);
    }
}

async function renderMarkdownFromZip(container, zipPath, markdownPath, markdown) {
    container.innerHTML = DOMPurify.sanitize(marked.parse(markdown));
    hljs.highlightAll();

    // Handle file links in md
    container.querySelectorAll("a[href]").forEach(link => {
        const href = link.getAttribute("href");
        if (!href) return;

        const resolvedPath = resolveMarkdownPath(markdownPath, href);
        if (!resolvedPath) return;
        if (!resolvedPath.toLowerCase().endsWith(".md")) return;

		link.classList.add("markdown-file-link");
        link.addEventListener("click", async event => {
            event.preventDefault();

            try {
				markdownHistory.push(markdownPath);
				const backButton = document.getElementById("markdown-back");
				if (backButton) { backButton.disabled = markdownHistory.length === 0; }

                const newMarkdown = await loadMarkdownFromZip(zipPath, resolvedPath);
                await renderMarkdownFromZip(container, zipPath, resolvedPath, newMarkdown);
            } catch (err) {
				markdownHistory.pop();

                console.error("Failed to load Markdown:", err);
                alert(`Could not find ${resolvedPath} in the package Zipfile`);
            }
        });
    });
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
async function renderPackage(pkg) {
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
                <span id="version-label">
                    Select Version: ${pkg.version} ▾
                </span>

                <select id="version-select" class="hidden"></select>
            </div>
            <a id="install-link" href="../../data/${resolveFile(pkg)}">
                <button class="install-btn">Install Directly</button>
            </a>
        </div>

		<div class="markdown-navigation">
			<button id="markdown-back" type="button" disabled>
				&larr; Back
			</button>
		</div>
        <div id="readme-content"></div>
    `);

    const versionLabel = document.getElementById("version-label");
    const versionSelect = document.getElementById("version-select");
    const installLink = document.getElementById("install-link");
	const markdownBack = document.getElementById("markdown-back");

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

    var mode = "none";
    versionLabel.onclick = () => {
        if (mode == "none") {
            versionSelect.className = "visible-block";
            mode = "block";
        } else {
            versionSelect.className = "hidden";
            mode = "none";
        }
    };

    versionSelect.onchange = () => {
        currentVersion = versionSelect.value;
        versionLabel.innerText = `Version: ${currentVersion} ▼`;
        const resolvedFile = resolveFile(pkg, currentVersion);
        installLink.href = `../../data/${resolvedFile}`;
    };

	markdownBack.addEventListener("click", async (event) => {
		if (markdownHistory.length === 0) return;

		try {
    		const lastMdPath = normalizeZipPath(markdownHistory.pop());

			const oldMarkdown = await loadMarkdownFromZip(zipPath, lastMdPath);
			await renderMarkdownFromZip(readmeContainer, zipPath, lastMdPath, oldMarkdown, false);

			markdownBack.disabled = markdownHistory.length === 0;
		} catch (err) {
			console.log("Failed to go back in Markdown history:", err);
		}
	});

    // Render README markdown
    const readmeContainer = document.getElementById("readme-content");
    const zipPath = `../../data/${resolveFile(pkg)}`;
    const readmePath = normalizeZipPath(pkg.readme || "README.md");

    await renderMarkdownFromZip(readmeContainer, zipPath, readmePath, pkg.readmeContent);
}

document.querySelector('#search-bar').addEventListener("keydown", async (event) => {
    if (event.key == "Enter") {
        const q = document.querySelector('#search-bar').value.trim();
        if (q) {
            const res_obj = packages_gv.find(obj => obj.name === q);
            if (!res_obj) {
                alert(`Package [${q}] does not exist, hence no info found!`);
                return;
            }

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
                    console.error(`Failed to load Zipfile for ${res_obj.name}:`, err);
                    res_obj.readmeContent = "README not available.";
                }
            }
            if (res_obj) {
                await renderPackage(res_obj);
            } else {
                alert(`Package [${q}] does not exist, hence no info found!`);
            }
        }
    }
});

loadPackages();
