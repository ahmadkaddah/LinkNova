document.addEventListener('DOMContentLoaded', () => {
    const particles = new Particles('particles');

    const themeToggle = document.getElementById('theme-toggle');
    const themes = ['theme-default', 'theme-dark', 'theme-neon', 'theme-retro'];
    let currentThemeIndex = 0;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        currentThemeIndex = themes.indexOf(savedTheme);
        updateThemeIcon();
    }

    themeToggle.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const newTheme = themes[currentThemeIndex];
        document.body.className = newTheme;
        localStorage.setItem('theme', newTheme);

        updateThemeIcon();

        if (isSoundEnabled) {
            playSound('theme-change');
        }

        document.dispatchEvent(new CustomEvent('themeChanged'));

        showNotification(`${getThemeName(newTheme)} theme activated`, 'info');
    });

    function updateThemeIcon() {
        const icon = themeToggle.querySelector('i');

        switch (themes[currentThemeIndex]) {
            case 'theme-default':
                icon.className = 'fas fa-sun';
                break;
            case 'theme-dark':
                icon.className = 'fas fa-moon';
                break;
            case 'theme-neon':
                icon.className = 'fas fa-bolt';
                break;
            case 'theme-retro':
                icon.className = 'fas fa-star';
                break;
        }
    }

    function getThemeName(theme) {
        switch (theme) {
            case 'theme-default':
                return 'Light';
            case 'theme-dark':
                return 'Dark';
            case 'theme-neon':
                return 'Neon Glow';
            case 'theme-retro':
                return 'Retro Wave';
            default:
                return 'Custom';
        }
    }

    const soundToggle = document.getElementById('sound-toggle');
    let isSoundEnabled = localStorage.getItem('sound') === 'enabled';

    updateSoundIcon();

    soundToggle.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        localStorage.setItem('sound', isSoundEnabled ? 'enabled' : 'disabled');

        updateSoundIcon();

        if (isSoundEnabled) {
            playSound('sound-toggle');
        }

        showNotification(`Sound ${isSoundEnabled ? 'enabled' : 'disabled'}`, 'info');
    });

    function updateSoundIcon() {
        const icon = soundToggle.querySelector('i');
        icon.className = isSoundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    }

    const sounds = {
        'copy': 'assets/sounds/copy.mp3',
        'shorten': 'assets/sounds/shorten.mp3',
        'error': 'assets/sounds/error.mp3',
        'theme-change': 'assets/sounds/theme-change.mp3',
        'sound-toggle': 'assets/sounds/sound-toggle.mp3',
        'notification': 'assets/sounds/notification.mp3',
        'success': 'assets/sounds/success.mp3'
    };

    function playSound(soundName) {
        if (!isSoundEnabled || !sounds[soundName]) return;

        const audio = new Audio(sounds[soundName]);
        audio.volume = 0.5;
        audio.play().catch(err => console.error('Error playing sound:', err));
    }

    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            navLinks.forEach(l => l.classList.remove('active'));

            link.classList.add('active');

            const targetSection = link.getAttribute('data-section');
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });

            if (isSoundEnabled) {
                playSound('notification');
            }
        });
    });

    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const recoveryLink = document.getElementById('recovery-link');
    const recoveryModal = document.getElementById('recovery-modal');

    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');

        if (isSoundEnabled) {
            playSound('notification');
        }
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });

    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');

            if (isSoundEnabled) {
                playSound('notification');
            }
        });
    });

    recoveryLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('active');
        recoveryModal.classList.add('active');

        if (isSoundEnabled) {
            playSound('notification');
        }
    });

    window.showNotification = function (message, type = 'info', duration = 3000) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification';
        notification.classList.add(type);
        notification.classList.add('show');

        if (isSoundEnabled) {
            playSound(type === 'error' ? 'error' : 'notification');
        }

        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    };

    window.showConfetti = function () {
        const confettiContainer = document.getElementById('confetti-container');
        confettiContainer.innerHTML = '';

        const colors = ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#55efc4'];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = (Math.random() * 10 + 5) + 'px';
            confetti.style.opacity = Math.random() + 0.5;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

            confettiContainer.appendChild(confetti);
        }

        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 5000);
    };

    const style = document.createElement('style');
    style.textContent = `
        .confetti {
            position: absolute;
            top: -10px;
            animation: confetti-fall linear forwards;
        }
        
        @keyframes confetti-fall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});