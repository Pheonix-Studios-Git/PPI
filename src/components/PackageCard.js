export function PackageCard(pkg) {
        const card = document.createElement("div");
        card.className = "package-card";

        card.innerHTML = `
                <a href="/src/html/pkgpage.html">
                        <h2>${pkg.name}</h2>
                        <p>${pkg.description}</p>
                        <p>Version: ${pkg.version}</p>
                </a>
        `;
        return card;
}