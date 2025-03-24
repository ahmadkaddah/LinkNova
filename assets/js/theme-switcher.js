document.addEventListener('DOMContentLoaded', () => {
    const themes = [
        {
            name: 'theme-default',
            displayName: 'Light',
            icon: 'fas fa-sun'
        },
        {
            name: 'theme-dark',
            displayName: 'Dark',
            icon: 'fas fa-moon'
        },
        {
            name: 'theme-neon',
            displayName: 'Neon Glow',
            icon: 'fas fa-bolt'
        },
        {
            name: 'theme-retro',
            displayName: 'Retro Wave',
            icon: 'fas fa-star'
        }
    ];
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    let currentThemeIndex = 0;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        currentThemeIndex = themes.findIndex(theme => theme.name === savedTheme);
        updateThemeIcon();
    }
    themeToggle.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const newTheme = themes[currentThemeIndex];
        document.body.className = newTheme.name;
        localStorage.setItem('theme', newTheme.name);
        updateThemeIcon();
        if (window.isSoundEnabled) {
            window.playSound('theme-change');
        }
        document.dispatchEvent(new CustomEvent('themeChanged'));
        window.showNotification(`${newTheme.displayName} theme activated`, 'info');
    });
    function updateThemeIcon() {
        themeIcon.className = themes[currentThemeIndex].icon;
    }
    window.themeUtils = {
        getCurrentTheme: () => themes[currentThemeIndex],
        setTheme: (themeName) => {
            const themeIndex = themes.findIndex(theme => theme.name === themeName);
            if (themeIndex !== -1) {
                currentThemeIndex = themeIndex;
                document.body.className = themes[currentThemeIndex].name;
                localStorage.setItem('theme', themes[currentThemeIndex].name);
                updateThemeIcon();
                document.dispatchEvent(new CustomEvent('themeChanged'));
            }
        }
    };
});