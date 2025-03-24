document.addEventListener('DOMContentLoaded', () => {
    let notificationContainer = document.getElementById('notification');

    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification';
        notificationContainer.className = 'notification';
        document.body.appendChild(notificationContainer);
    }

    const notificationQueue = [];
    let isNotificationActive = false;

    function showNotification(message, type = 'info', duration = 3000) {
        notificationQueue.push({ message, type, duration });

        if (!isNotificationActive) {
            processNotificationQueue();
        }
    }

    function processNotificationQueue() {
        if (notificationQueue.length === 0) {
            isNotificationActive = false;
            return;
        }

        isNotificationActive = true;

        const { message, type, duration } = notificationQueue.shift();

        notificationContainer.textContent = message;
        notificationContainer.className = 'notification';
        notificationContainer.classList.add(type);
        notificationContainer.classList.add('show');

        if (window.isSoundEnabled) {
            window.playSound(type === 'error' ? 'error' : 'notification');
        }

        setTimeout(() => {
            notificationContainer.classList.remove('show');

            setTimeout(() => {
                processNotificationQueue();
            }, 300);
        }, duration);
    }

    window.showNotification = showNotification;
});