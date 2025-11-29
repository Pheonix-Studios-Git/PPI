import { PackageCard } from "./components/PackageCard.js";

// Fetch JSON and render packages
async function loadPackages() {
    try {
        const res = await fetch('./data/packages.json');
        const packages = await res.json();

        console.log("Fetched packages: ${packages}");

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
        console.log("Displaying package");
        const card = PackageCard(pkg, data_loc); // PackageCard can now display data
        container.appendChild(card);
        console.log("Appended card: ${card}");
    });
}

// Initialize
loadPackages();
