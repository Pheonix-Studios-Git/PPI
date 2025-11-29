export function PackageCard(pkg, data_loc) {
    const card = document.createElement("div");
    card.className = "package-card";

    card.innerHTML = `
        <a href="./src/html/pkgpage.html?data_loc=${data_loc}&name=${pkg.name}">
            <h2>${pkg.name}</h2>
            <p>${pkg.description}</p>
            <p>Version: ${pkg.version}</p>
            <a href="./data/${pkg.zipfile}"><button class="install-btn">Install</button></a>
        </a>
    `;
    return card;
}
