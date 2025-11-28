// Toggle light/dark theme
const toggleTheme = () => {
    if (document.documentElement.getAttribute('data-theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('#theme-btn').innerHTML = '<i class="fas fa-sun" style="color: yellow;"></i>'
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelector('#theme-btn').innerHTML = '<i class="fas fa-moon" style="color: black;"></i>'
    }
}

document.querySelector('#theme-btn').innerHTML = '<i class="fas fa-sun" style="color: yellow;"></i>'
document.querySelector('#theme-btn').addEventListener('click', toggleTheme);
