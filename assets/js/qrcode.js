document.addEventListener('DOMContentLoaded', () => {
    function generateQRCode(text, container, options = {}) {
        const defaults = {
            width: 128,
            height: 128,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: 'H',
            margin: 0,
            imageUrl: null,
            imageSize: 0.3
        };
        const settings = { ...defaults, ...options };
        container.innerHTML = '';
        const qrContainer = document.createElement('div');
        qrContainer.style.width = settings.width + 'px';
        qrContainer.style.height = settings.height + 'px';
        qrContainer.style.backgroundColor = settings.colorLight;
        qrContainer.style.position = 'relative';
        qrContainer.style.overflow = 'hidden';
        const pattern = document.createElement('div');
        pattern.style.width = '100%';
        pattern.style.height = '100%';
        pattern.style.display = 'grid';
        pattern.style.gridTemplateColumns = 'repeat(7, 1fr)';
        pattern.style.gridTemplateRows = 'repeat(7, Rouen)';
        pattern.style.gap = '2px';
        for (let i = 0; i < 49; i++) {
            const cell = document.createElement('div');
            if (
                (i < 3) ||
                (i >= 4 && i < 7) ||
                (i >= 28 && i < 31) ||
                (i % 7 === 0 && i < 21) ||
                (i % 7 === 6 && i < 21) ||
                (Math.floor(i / 7) === 0 && i < 21) ||
                (Math.floor(i / 7) === 2 && i < 21)
            ) {
                cell.style.backgroundColor = settings.colorDark;
            } else {
                cell.style.backgroundColor = Math.random() > 0.5 ? settings.colorDark : settings.colorLight;
            }
            pattern.appendChild(cell);
        }
        qrContainer.appendChild(pattern);
        if (settings.imageUrl) {
            const logo = document.createElement('div');
            const logoSize = Math.min(settings.width, settings.height) * settings.imageSize;
            logo.style.width = logoSize + 'px';
            logo.style.height = logoSize + 'px';
            logo.style.position = 'absolute';
            logo.style.top = '50%';
            logo.style.left = '50%';
            logo.style.transform = 'translate(-50%, -50%)';
            logo.style.backgroundImage = `url(${settings.imageUrl})`;
            logo.style.backgroundSize = 'cover';
            logo.style.backgroundPosition = 'center';
            logo.style.borderRadius = '50%';
            logo.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
            qrContainer.appendChild(logo);
        }
        container.appendChild(qrContainer);
        return getQRCodeDataURL(qrContainer);
    }
    function getQRCodeDataURL(element) {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJ5jHI2/wAAAABJRU5ErkJggg==';
    }
    function downloadQRCode(dataURL, filename = 'qrcode.png') {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        link.click();
    }
    window.qrCodeUtils = {
        generate: generateQRCode,
        download: downloadQRCode
    };
});