document.addEventListener('DOMContentLoaded', () => {
    const totalLinksCount = document.getElementById('total-links-count');
    const totalClicksCount = document.getElementById('total-clicks-count');
    const topPerformerLink = document.getElementById('top-performer-link');
    const linksContainer = document.getElementById('links-container');
    const linkFilter = document.getElementById('link-filter');
    const viewBtns = document.querySelectorAll('.view-btn');
    let clicksChart;
    let sourcesChart;
    let savedLinks = JSON.parse(localStorage.getItem('shortenedLinks')) || [];
    let currentView = 'cards';
    initDashboard();

    function initDashboard() {
        updateDashboardStats();
        initCharts();
        initMap();
        displayLinks('all');
    }
    function updateDashboardStats() {
        totalLinksCount.textContent = savedLinks.length;
        const totalClicks = savedLinks.reduce((sum, link) => sum + link.clicks, 0);
        totalClicksCount.textContent = totalClicks;
        if (savedLinks.length > 0) {
            const topLink = [...savedLinks].sort((a, b) => b.clicks - a.clicks)[0];
            topPerformerLink.textContent = getDisplayTitle(topLink.originalUrl);
            topPerformerLink.setAttribute('title', topLink.originalUrl);
        } else {
            topPerformerLink.textContent = 'No links yet';
        }
    }
    function displayLinks(filter) {
        const filteredLinks = filterLinksByCategory(filter);
        updateLinksView(currentView, filteredLinks);
    }
    linkFilter.addEventListener('change', filterLinks);
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            currentView = view;
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = linkFilter.value;
            const filteredLinks = filterLinksByCategory(filter);
            updateLinksView(currentView, filteredLinks);
        });
    });
    function updateLinksView(view, links = null) {
        if (!links) {
            const filter = linkFilter.value;
            links = filterLinksByCategory(filter);
        }

        if (links.length === 0) {
            linksContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-filter"></i>
                    <p>No links match your filter</p>
                </div>
            `;
            return;
        }

        linksContainer.innerHTML = '';

        if (view === 'cards') {
            linksContainer.className = 'links-container cards-view';

            links.forEach(link => {
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

                linksContainer.appendChild(linkCard);
            });
        } else if (view === 'list') {
            linksContainer.className = 'links-container list-view';

            const table = document.createElement('table');
            table.className = 'links-table';

            table.innerHTML = `
                <thead>
                    <tr>
                        <th>URL</th>
                        <th>Short Link</th>
                        <th>Created</th>
                        <th>Clicks</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector('tbody');

            links.forEach(link => {
                const row = document.createElement('tr');
                const createdDate = new Date(link.createdAt);
                const formattedDate = createdDate.toLocaleDateString();

                row.innerHTML = `
                    <td class="url-cell" title="${link.originalUrl}">${getDisplayTitle(link.originalUrl)}</td>
                    <td class="short-url-cell">${link.shortUrl}</td>
                    <td>${formattedDate}</td>
                    <td class="clicks-cell ${link.clicks > 0 ? 'pulsing' : ''}">${link.clicks}</td>
                    <td class="actions-cell">
                        <button class="action-btn copy-link" data-url="${link.shortUrl}">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn view-stats" data-id="${link.id}">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                    </td>
                `;

                tbody.appendChild(row);
            });

            linksContainer.appendChild(table);
        }
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
    function filterLinks() {
        const filter = linkFilter.value;
        displayLinks(filter);
    }

    function filterLinksByCategory(category) {
        if (category === 'all') {
            return savedLinks;
        }
        return savedLinks.filter(link => {
            const linkId = parseInt(link.id.slice(-2), 16);

            switch (category) {
                case 'work':
                    return linkId % 3 === 0;
                case 'personal':
                    return linkId % 3 === 1;
                case 'campaigns':
                    return linkId % 3 === 2;
                default:
                    return true;
            }
        });
    }
    function initCharts() {
        const clicksChartCtx = document.getElementById('clicks-chart').getContext('2d');
        const labels = [];
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            const baseClicks = Math.floor(Math.random() * 10) + 5;
            const dayFactor = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1.2;
            data.push(Math.floor(baseClicks * dayFactor));
        }

        clicksChart = new Chart(clicksChartCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Clicks',
                    data: data,
                    backgroundColor: 'rgba(108, 92, 231, 0.2)',
                    borderColor: 'rgba(108, 92, 231, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(108, 92, 231, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(108, 92, 231, 0.7)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                        },
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        const sourcesChartCtx = document.getElementById('sources-chart').getContext('2d');

        sourcesChart = new Chart(sourcesChartCtx, {
            type: 'doughnut',
            data: {
                labels: ['Direct', 'Social Media', 'Search', 'Email', 'Other'],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: [
                        'rgba(108, 92, 231, 0.7)',
                        'rgba(0, 206, 201, 0.7)',
                        'rgba(253, 121, 168, 0.7)',
                        'rgba(253, 203, 110, 0.7)',
                        'rgba(178, 190, 195, 0.7)'
                    ],
                    borderColor: [
                        'rgba(108, 92, 231, 1)',
                        'rgba(0, 206, 201, 1)',
                        'rgba(253, 121, 168, 1)',
                        'rgba(253, 203, 110, 1)',
                        'rgba(178, 190, 195, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(108, 92, 231, 0.7)',
                        borderWidth: 1
                    }
                },
                cutout: '70%'
            }
        });
        document.addEventListener('themeChanged', updateChartsTheme);
    }
    function updateChartsTheme() {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
        if (clicksChart) {
            clicksChart.options.scales.x.ticks.color = textColor;
            clicksChart.options.scales.y.ticks.color = textColor;
            clicksChart.update();
        }
        if (sourcesChart) {
            sourcesChart.options.plugins.legend.labels.color = textColor;
            sourcesChart.update();
        }
    }
    function initMap() {
        const mapContainer = document.getElementById('map-container');
        mapContainer.innerHTML = `
            <div class="world-map">
                <div class="map-pin" style="top: 30%; left: 20%;" data-country="United States" data-clicks="42">
                    <div class="pin-dot"></div>
                    <div class="pin-pulse"></div>
                </div>
                <div class="map-pin" style="top: 25%; left: 45%;" data-country="United Kingdom" data-clicks="28">
                    <div class="pin-dot"></div>
                    <div class="pin-pulse"></div>
                </div>
                <div class="map-pin" style="top: 35%; left: 55%;" data-country="India" data-clicks="35">
                    <div class="pin-dot"></div>
                    <div class="pin-pulse"></div>
                </div>
                <div class="map-pin" style="top: 60%; left: 80%;" data-country="Australia" data-clicks="15">
                    <div class="pin-dot"></div>
                    <div class="pin-pulse"></div>
                </div>
                <div class="map-pin" style="top: 45%; left: 10%;" data-country="Canada" data-clicks="20">
                    <div class="pin-dot"></div>
                    <div class="pin-pulse"></div>
                </div>
            </div>
        `;
        const style = document.createElement('style');
        style.textContent = `
            .world-map {
                width: 100%;
                height: 100%;
                background-image: url('assets/images/world-map.png');
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                position: relative;
            }
            
            .map-pin {
                position: absolute;
                width: 20px;
                height: 20px;
                transform: translate(-50%, -50%);
                cursor: pointer;
            }
            
            .pin-dot {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 10px;
                height: 10px;
                background-color: var(--accent-primary);
                border-radius: 50%;
                z-index: 2;
            }
            
            .pin-pulse {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 20px;
                height: 20px;
                background-color: var(--accent-primary);
                border-radius: 50%;
                opacity: 0.5;
                z-index: 1;
                animation: map-pin-pulse 1.5s ease-out infinite;
            }
            
            @keyframes map-pin-pulse {
                0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.5;
                }
                100% {
                    transform: translate(-50%, -50%) scale(3);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        const pins = document.querySelectorAll('.map-pin');
        pins.forEach(pin => {
            const country = pin.getAttribute('data-country');
            const clicks = pin.getAttribute('data-clicks');

            pin.setAttribute('title', `${country}: ${clicks} clicks`);
            const clicksNum = parseInt(clicks);
            const scale = 0.8 + (clicksNum / 50) * 0.7;
            pin.style.transform = `translate(-50%, -50%) scale(${scale})`;
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
});