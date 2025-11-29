import { PackageCard } from "./components/PackageCard.js";
import { search_pkgs } from './components/search.js';

let packages_gv = [];

// Fetch JSON and render packages
async function loadPackages() {
    try {
        const res = await fetch('./data/packages.json');
        const packages = await res.json();

        console.log(`Fetched packages: ${packages}`);
        packages_gv = packages.packages;

        renderPackages(packages.packages, "../../data/packages.json");
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

document.querySelector('#search-bar').addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
        const q = document.querySelector('#search-bar').value.trim();
        if (q) {
            const res = search_pkgs(packages_gv, q);
            renderPackages(res, '../../data/packages.json');
        } else {
            renderPackages(packages_gv, '../../data/packages.json');
        }
    }
});

// Initialize
loadPackages();
