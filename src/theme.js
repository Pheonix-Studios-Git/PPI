// Toggle light/dark theme
const toggleTheme = () => {
    if (document.documentElement.getAttribute('data-theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

document.querySelector('#theme-btn').addEventListener('click', toggleTheme);
