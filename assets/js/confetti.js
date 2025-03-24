document.addEventListener('DOMContentLoaded', () => {
    let confettiContainer = document.getElementById('confetti-container');

    if (!confettiContainer) {
        confettiContainer = document.createElement('div');
        confettiContainer.id = 'confetti-container';
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);
    }

    const style = document.createElement('style');
    style.textContent = `
        .confetti-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2000;
        }
        
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

    function showConfetti(options = {}) {
        const defaults = {
            count: 100,
            colors: ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#55efc4'],
            minSize: 5,
            maxSize: 15,
            minDuration: 2,
            maxDuration: 5,
            minDelay: 0,
            maxDelay: 2
        };

        const settings = { ...defaults, ...options };

        confettiContainer.innerHTML = '';

        for (let i = 0; i < settings.count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            confetti.style.left = Math.random() * 100 + 'vw';

            const duration = Math.random() * (settings.maxDuration - settings.minDuration) + settings.minDuration;
            confetti.style.animationDuration = duration + 's';

            const delay = Math.random() * (settings.maxDelay - settings.minDelay) + settings.minDelay;
            confetti.style.animationDelay = delay + 's';

            const color = settings.colors[Math.floor(Math.random() * settings.colors.length)];
            confetti.style.backgroundColor = color;

            const size = Math.random() * (settings.maxSize - settings.minSize) + settings.minSize;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';

            confetti.style.opacity = Math.random() + 0.5;

            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

            const shapeType = Math.floor(Math.random() * 3);
            if (shapeType === 0) {
            } else if (shapeType === 1) {
                confetti.style.borderRadius = '50%';
            } else {
                confetti.style.width = '0';
                confetti.style.height = '0';
                confetti.style.backgroundColor = 'transparent';
                confetti.style.borderLeft = `${size / 2}px solid transparent`;
                confetti.style.borderRight = `${size / 2}px solid transparent`;
                confetti.style.borderBottom = `${size}px solid ${color}`;
            }

            confettiContainer.appendChild(confetti);
        }

        const maxDuration = settings.maxDuration + settings.maxDelay;
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, maxDuration * 1000);
    }

    window.showConfetti = showConfetti;
});