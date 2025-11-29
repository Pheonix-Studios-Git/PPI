import { PackageCard } from "./src/components/PackageCard.js";

// Fetch JSON and render packages
async function loadPackages() {
    try {
        const res = await fetch('./data/packages.json');
        const packages = await res.json();

        // For each package, fetch the README file
        for (const pkg of packages.packages) {
            try {
                const readmeRes = await fetch(`./data/${pkg.readme}`);
                pkg.readmeContent = await readmeRes.text(); // store README content
            } catch (err) {
                console.error(`Failed to load README for ${pkg.name}:`, err);
                pkg.readmeContent = "README not available.";
            }
        }

        renderPackages(packages.packages, "./data/packages.json");
    } catch (err) {
        console.error('Failed to load packages.json:', err);
    }
}

// Render packages to the page
function renderPackages(packages, data_loc) {
    const container = document.getElementById("package-list");
    container.innerHTML = "";

    packages.forEach(pkg => {
        const card = PackageCard(pkg, data_loc); // PackageCard can now display data
        container.appendChild(card);
    });
}

// Initialize
loadPackages();
