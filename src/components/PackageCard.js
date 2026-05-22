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

export function PackageCard(pkg, data_loc) {
    const card = document.createElement("div");
    card.className = "package-card";


    card.innerHTML = DOMPurify.sanitize(`
        <a href="./src/html/pkgpage.html?data_loc=${data_loc}&name=${pkg.name}">
            <h2>${pkg.name}</h2>
            <p>${pkg.description}</p>
            <p>Version: ${pkg.version}</p>
            <a href="./data/${resolveFile(pkg)}"><button class="install-btn">Install Directly</button></a>
        </a>
    `);
    return card;
}