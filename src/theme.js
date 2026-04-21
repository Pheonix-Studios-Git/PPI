// Toggle light/dark theme
const toggleTheme = () => {
    if (document.documentElement.getAttribute('data-theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('#theme-btn').innerHTML = '<i class="fas fa-sun" style="color: yellow;"></i>'
        localStorage.setItem("ppi-theme", "dark");
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelector('#theme-btn').innerHTML = '<i class="fas fa-moon" style="color: black;"></i>'
        localStorage.setItem("ppi-theme", "light");
    }
}

document.querySelector('#theme-btn').innerHTML = '<i class="fas fa-sun" style="color: yellow;"></i>'
document.querySelector('#theme-btn').addEventListener('click', toggleTheme);

if (localStorage.getItem("ppi-theme") != null) {
    var theme = localStorage.getItem("ppi-theme");
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelector('#theme-btn').innerHTML = '<i class="fas fa-moon" style="color: black;"></i>'
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('#theme-btn').innerHTML = '<i class="fas fa-sun" style="color: yellow;"></i>'
    }
}
