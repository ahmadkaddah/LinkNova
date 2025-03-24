document.addEventListener('DOMContentLoaded', () => {
    const sounds = {
        'copy': 'assets/sounds/copy.mp3',
        'shorten': 'assets/sounds/shorten.mp3',
        'error': 'assets/sounds/error.mp3',
        'theme-change': 'assets/sounds/theme-change.mp3',
        'sound-toggle': 'assets/sounds/sound-toggle.mp3',
        'notification': 'assets/sounds/notification.mp3',
        'success': 'assets/sounds/success.mp3',
        'click': 'assets/sounds/click.mp3'
    };
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = soundToggle.querySelector('i');
    let isSoundEnabled = localStorage.getItem('sound') === 'enabled';
    updateSoundIcon();
    soundToggle.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        localStorage.setItem('sound', isSoundEnabled ? 'enabled' : 'disabled');
        updateSoundIcon();
        if (isSoundEnabled) {
            playSound('sound-toggle');
        }
        window.showNotification(`Sound ${isSoundEnabled ? 'enabled' : 'disabled'}`, 'info');
    });
    function updateSoundIcon() {
        soundIcon.className = isSoundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    }
    function playSound(soundName) {
        if (!isSoundEnabled || !sounds[soundName]) return;
        const audio = new Audio(sounds[soundName]);
        audio.volume = 0.5;
        audio.play().catch(err => console.error('Error playing sound:', err));
    }
    document.querySelectorAll('button, .btn, nav a').forEach(element => {
        element.addEventListener('click', () => {
            if (isSoundEnabled) {
                playSound('click');
            }
        });
    });
    window.isSoundEnabled = isSoundEnabled;
    window.playSound = playSound;
    window.toggleSound = () => {
        isSoundEnabled = !isSoundEnabled;
        localStorage.setItem('sound', isSoundEnabled ? 'enabled' : 'disabled');
        updateSoundIcon();
        return isSoundEnabled;
    };
});