import { PackageCard } from "/src/components/PackageCard.js";

function renderPackages(packages) {
    const container = document.getElementById("package-list");
    container.innerHTML = "";

    packages.forEach(pkg => {
        const card = PackageCard(pkg);
        container.appendChild(card);
    });
}

const inbuilt_packages = [
    {
        name: 'nfx',
        version: '0.1.0',
        description: 'Nova Pheonix Package Manager',
        git_url: 'https://github.com/Pheonix-Studios-Git/NFX'
    }
];

renderPackages(inbuilt_packages);