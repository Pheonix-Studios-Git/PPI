export function search_pkgs(packages, pkg) {
    const q = pkg.toLowerCase();
    return packages.filter(item => item.name.toLowerCase().includes(pkg));
}
