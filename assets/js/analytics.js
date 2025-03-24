document.addEventListener('DOMContentLoaded', () => {
    let analyticsData = JSON.parse(localStorage.getItem('analyticsData')) || {
        pageViews: 0,
        interactions: 0,
        linkClicks: 0,
        sources: {},
        devices: {},
        browsers: {},
        locations: {}
    };

    trackPageView();

    trackInteractions();

    trackLinkClicks();

    setInterval(saveAnalyticsData, 30000);

    function trackPageView() {
        analyticsData.pageViews++;

        const source = getSource();
        analyticsData.sources[source] = (analyticsData.sources[source] || 0) + 1;

        const device = getDevice();
        analyticsData.devices[device] = (analyticsData.devices[device] || 0) + 1;

        const browser = getBrowser();
        analyticsData.browsers[browser] = (analyticsData.browsers[browser] || 0) + 1;

        const location = 'United States';
        analyticsData.locations[location] = (analyticsData.locations[location] || 0) + 1;
    }

    function trackInteractions() {
        document.querySelectorAll('button, .btn, nav a, .link-card').forEach(element => {
            element.addEventListener('click', () => {
                analyticsData.interactions++;
            });
        });

        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', () => {
                analyticsData.interactions++;
            });
        });
    }

    function trackLinkClicks() {
        document.querySelectorAll('.short-url-text, .link-url').forEach(element => {
            element.addEventListener('click', () => {
                analyticsData.linkClicks++;

                const url = element.textContent;
                const links = JSON.parse(localStorage.getItem('shortenedLinks')) || [];
                const linkIndex = links.findIndex(link => link.shortUrl === url);

                if (linkIndex !== -1) {
                    links[linkIndex].clicks++;
                    links[linkIndex].lastClicked = new Date().toISOString();
                    localStorage.setItem('shortenedLinks', JSON.stringify(links));
                }
            });
        });
    }

    function saveAnalyticsData() {
        localStorage.setItem('analyticsData', JSON.stringify(analyticsData));
    }

    function getSource() {
        const referrer = document.referrer;

        if (!referrer) {
            return 'direct';
        }

        if (referrer.includes('google')) {
            return 'google';
        } else if (referrer.includes('facebook')) {
            return 'facebook';
        } else if (referrer.includes('twitter') || referrer.includes('x.com')) {
            return 'twitter';
        } else if (referrer.includes('instagram')) {
            return 'instagram';
        } else if (referrer.includes('linkedin')) {
            return 'linkedin';
        } else {
            return 'other';
        }
    }

    function getDevice() {
        const userAgent = navigator.userAgent;

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            if (/iPad|tablet|Nexus 10|SM-T|Nexus 7/i.test(userAgent)) {
                return 'tablet';
            }
            return 'mobile';
        }

        return 'desktop';
    }

    function getBrowser() {
        const userAgent = navigator.userAgent;

        if (userAgent.includes('Chrome')) {
            return 'chrome';
        } else if (userAgent.includes('Firefox')) {
            return 'firefox';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            return 'safari';
        } else if (userAgent.includes('Edge') || userAgent.includes('Edg')) {
            return 'edge';
        } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
            return 'ie';
        } else {
            return 'other';
        }
    }

    window.analyticsUtils = {
        getData: () => analyticsData,
        trackEvent: (category, action, label) => {
            console.log(`Analytics event: ${category} - ${action} - ${label}`);
        }
    };
});