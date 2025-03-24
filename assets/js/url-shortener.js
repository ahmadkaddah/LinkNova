document.addEventListener('DOMContentLoaded', () => {
    const longUrlInput = document.getElementById('long-url');
    const customAliasInput = document.getElementById('custom-alias');
    const linkPersonalitySelect = document.getElementById('link-personality');
    const shortenBtn = document.getElementById('shorten-btn');
    const resultContainer = document.getElementById('result-container');
    const shortUrlText = document.getElementById('short-url-text');
    const copyBtn = document.getElementById('copy-btn');
    const qrCodeContainer = document.getElementById('qr-code-container');
    const downloadQrBtn = document.getElementById('download-qr');
    const recentLinksContainer = document.getElementById('recent-links-container');

    const validationIndicator = document.querySelector('.validation-indicator');

    const baseUrl = window.location.origin + '/redirect.html?code=';

    let savedLinks = JSON.parse(localStorage.getItem('shortenedLinks')) || [];

    displayRecentLinks();

    longUrlInput.addEventListener('input', validateUrl);

    function validateUrl() {
        const url = longUrlInput.value.trim();

        if (url === '') {
            validationIndicator.className = 'validation-indicator';
            return false;
        }

        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;

        if (urlPattern.test(url)) {
            validationIndicator.className = 'validation-indicator valid';
            return true;
        } else {
            validationIndicator.className = 'validation-indicator invalid';
            return false;
        }
    }

    customAliasInput.addEventListener('input', validateAlias);

    function validateAlias() {
        const alias = customAliasInput.value.trim();

        if (alias === '') return true;

        const aliasPattern = /^[a-zA-Z0-9]{3,15}$/;

        if (aliasPattern.test(alias)) {
            const isAliasTaken = savedLinks.some(link => link.shortCode === alias);

            if (isAliasTaken) {
                showNotification('This alias is already taken', 'error');
                return false;
            }

            return true;
        } else {
            return false;
        }
    }

    shortenBtn.addEventListener('click', shortenUrl);

    async function shortenUrl() {
        const longUrl = longUrlInput.value.trim();
        const customAlias = customAliasInput.value.trim();
        const linkPersonality = linkPersonalitySelect.value;

        if (!validateUrl()) {
            showNotification('Please enter a valid URL', 'error');
            longUrlInput.focus();
            return;
        }

        if (customAlias && !validateAlias()) {
            showNotification('Custom alias must be 3-15 alphanumeric characters', 'error');
            customAliasInput.focus();
            return;
        }

        shortenBtn.classList.add('loading');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const shortCode = customAlias || generateShortCode();

            const shortUrl = baseUrl + shortCode;

            const newLink = {
                id: Date.now().toString(),
                originalUrl: longUrl,
                shortUrl: shortUrl,
                shortCode: shortCode,
                personality: linkPersonality,
                createdAt: new Date().toISOString(),
                clicks: 0,
                lastClicked: null,
                sources: {},
                locations: {}
            };

            savedLinks.unshift(newLink);
            localStorage.setItem('shortenedLinks', JSON.stringify(savedLinks));

            shortUrlText.textContent = shortUrl;
            resultContainer.classList.remove('hidden');

            generateQRCode(shortUrl);

            displayRecentLinks();

            if (window.isSoundEnabled) {
                window.playSound('shorten');
            }

            showNotification('URL shortened successfully!', 'success');

            customAliasInput.value = '';
            linkPersonalitySelect.value = 'default';
        } catch (error) {
            console.error('Error shortening URL:', error);
            showNotification('Failed to shorten URL. Please try again.', 'error');
        } finally {
            shortenBtn.classList.remove('loading');
        }
    }

    function generateShortCode(length = 6) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        const codeExists = savedLinks.some(link => link.shortCode === result);

        if (codeExists) {
            return generateShortCode(length);
        }

        return result;
    }

    function generateQRCode(url) {
        const size = 100;
        const cellSize = Math.floor(size / 10);

        const qrCanvas = document.createElement('canvas');
        qrCanvas.width = size;
        qrCanvas.height = size;
        const ctx = qrCanvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = '#000000';

        ctx.fillRect(0, 0, cellSize * 3, cellSize * 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cellSize, cellSize, cellSize, cellSize);
        ctx.fillStyle = '#000000';

        ctx.fillRect(size - cellSize * 3, 0, cellSize * 3, cellSize * 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(size - cellSize * 2, cellSize, cellSize, cellSize);
        ctx.fillStyle = '#000000';

        ctx.fillRect(0, size - cellSize * 3, cellSize * 3, cellSize * 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cellSize, size - cellSize * 2, cellSize, cellSize);
        ctx.fillStyle = '#000000';

        for (let i = 0; i < url.length; i++) {
            const charCode = url.charCodeAt(i);
            const x = (charCode % 8) * cellSize + cellSize * 3;
            const y = (Math.floor(charCode / 8) % 8) * cellSize + cellSize * 3;

            if (x < size && y < size) {
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }

        qrCodeContainer.innerHTML = '';
        qrCodeContainer.appendChild(qrCanvas);

        return qrCanvas.toDataURL('image/png');
    }

    copyBtn.addEventListener('click', copyToClipboard);

    function copyToClipboard() {
        const textToCopy = shortUrlText.textContent;

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showNotification('Copied to clipboard!', 'success');

                if (window.isSoundEnabled) {
                    window.playSound('copy');
                }

                window.showConfetti();
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                showNotification('Failed to copy to clipboard', 'error');
            });
    }
    downloadQrBtn.addEventListener('click', () => {
        const dataUrl = generateQRCode(shortUrlText.textContent);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'qrcode.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('QR code downloaded!', 'success');

        if (window.isSoundEnabled) {
            window.playSound('success');
        }
    });

    function downloadQRCode() {
        showNotification('QR code download feature coming soon!', 'info');
    }

    function displayRecentLinks() {
        if (savedLinks.length === 0) {
            recentLinksContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-link-slash"></i>
                    <p>Your shortened links will appear here</p>
                </div>
            `;
            return;
        }

        recentLinksContainer.innerHTML = '';

        const recentLinks = savedLinks.slice(0, 6);

        recentLinks.forEach(link => {
            const linkCard = document.createElement('div');
            linkCard.className = `link-card ${link.personality !== 'default' ? link.personality : ''}`;

            const createdDate = new Date(link.createdAt);
            const formattedDate = createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            linkCard.innerHTML = `
                <div class="link-title">${getDisplayTitle(link.originalUrl)}</div>
                <div class="link-url">${link.shortUrl}</div>
                <div class="link-date">Created: ${formattedDate}</div>
                <div class="link-stats">
                    <div class="stat">
                        <i class="fas fa-mouse-pointer"></i>
                        <span class="clicks-count ${link.clicks > 0 ? 'pulsing' : ''}">${link.clicks}</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${getTimeAgo(link.createdAt)}</span>
                    </div>
                </div>
                <div class="link-actions">
                    <button class="action-btn copy-link" data-url="${link.shortUrl}">
                        <i class="fas fa-copy"></i>
                        <span>Copy</span>
                    </button>
                    <button class="action-btn view-stats" data-id="${link.id}">
                        <i class="fas fa-chart-bar"></i>
                        <span>Stats</span>
                    </button>
                </div>
            `;

            recentLinksContainer.appendChild(linkCard);
        });

        document.querySelectorAll('.copy-link').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-url');

                navigator.clipboard.writeText(url)
                    .then(() => {
                        showNotification('Copied to clipboard!', 'success');

                        if (window.isSoundEnabled) {
                            window.playSound('copy');
                        }
                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                        showNotification('Failed to copy to clipboard', 'error');
                    });
            });
        });

        document.querySelectorAll('.view-stats').forEach(btn => {
            btn.addEventListener('click', () => {
                const linkId = btn.getAttribute('data-id');
                const link = savedLinks.find(l => l.id === linkId);

                if (link) {
                    showLinkDetails(link);
                }
            });
        });
    }

    function getDisplayTitle(url) {
        try {
            const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
            return urlObj.hostname;
        } catch (e) {
            return url;
        }
    }

    function getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
            return interval === 1 ? '1 year ago' : interval + ' years ago';
        }

        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return interval === 1 ? '1 month ago' : interval + ' months ago';
        }

        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval === 1 ? '1 day ago' : interval + ' days ago';
        }

        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval === 1 ? '1 hour ago' : interval + ' hours ago';
        }

        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval === 1 ? '1 minute ago' : interval + ' minutes ago';
        }

        return seconds < 10 ? 'just now' : seconds + ' seconds ago';
    }

    function showLinkDetails(link) {
        const modal = document.getElementById('link-details-modal');
        const content = modal.querySelector('.link-details-content');

        const createdDate = new Date(link.createdAt);
        const formattedDate = createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString();

        content.innerHTML = `
            <div class="link-detail-item">
                <h3>Original URL</h3>
                <p class="original-url">${link.originalUrl}</p>
            </div>
            <div class="link-detail-item">
                <h3>Short URL</h3>
                <div class="short-url-container">
                    <p>${link.shortUrl}</p>
                    <button class="copy-btn" data-url="${link.shortUrl}">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="link-detail-item">
                <h3>Created</h3>
                <p>${formattedDate}</p>
            </div>
            <div class="link-detail-item">
                <h3>Total Clicks</h3>
                <p class="clicks-count">${link.clicks}</p>
            </div>
            <div class="link-detail-item">
                <h3>Personality</h3>
                <p>${link.personality === 'default' ? 'Standard' : link.personality.charAt(0).toUpperCase() + link.personality.slice(1)}</p>
            </div>
            <div class="link-detail-item">
                <h3>QR Code</h3>
                <div class="qr-code-detail">
                    <div class="qr-code-image"></div>
                    <button class="download-qr-btn">
                        <i class="fas fa-download"></i>
                        <span>Download</span>
                    </button>
                </div>
            </div>
        `;

        const qrCodeImage = content.querySelector('.qr-code-image');
        qrCodeImage.innerHTML = `
            <div style="width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; background-color: white;">
                <div style="font-size: 12px; color: black; text-align: center;">
                    QR Code for<br>${link.shortUrl}
                </div>
            </div>
        `;

        content.querySelector('.copy-btn').addEventListener('click', () => {
            const url = link.shortUrl;

            navigator.clipboard.writeText(url)
                .then(() => {
                    showNotification('Copied to clipboard!', 'success');

                    if (window.isSoundEnabled) {
                        window.playSound('copy');
                    }
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    showNotification('Failed to copy to clipboard', 'error');
                });
        });

        content.querySelector('.download-qr-btn').addEventListener('click', () => {
            showNotification('QR code download feature coming soon!', 'info');
        });

        modal.classList.add('active');
    }

    document.getElementById('edit-link-btn').addEventListener('click', () => {
        showNotification('Edit feature coming soon!', 'info');
    });

    document.getElementById('delete-link-btn').addEventListener('click', () => {
        showNotification('Delete feature coming soon!', 'info');
    });
});