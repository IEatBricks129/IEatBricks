(function() {
    const savedTheme = localStorage.getItem('theme');
    let shouldDark = false;
    if (savedTheme === 'dark') {
        shouldDark = true;
    } else if (savedTheme === 'light') {
        shouldDark = false;
    } else {
        const hour = new Date().getHours();
        shouldDark = (hour >= 18 || hour < 6);
    }
    if (shouldDark) {
        document.documentElement.classList.add('darkmode-preload');
        document.body.classList.add('darkmode');
    } else {
        document.documentElement.classList.remove('darkmode-preload');
        document.body.classList.remove('darkmode');
    }
})();

document.addEventListener('partialsLoaded', initializePageElements);

function initializePageElements() {
    let sixPresses = [];
    document.addEventListener('keydown', (e) => {
        if (e.key === '6') {
            const now = Date.now();
            sixPresses.push(now);
            sixPresses = sixPresses.filter(ts => now - ts <= 6000);
            if (sixPresses.length >= 6) {
                document.body.classList.add('wingdings-mode');
                sixPresses = [];
            }
        } else {
            sixPresses = [];
        }
    });

    function setTheme(mode) {
        if (mode === 'dark') {
            document.body.classList.add('darkmode');
        } else {
            document.body.classList.remove('darkmode');
        }
        document.body.style.display = 'none';
        document.body.offsetHeight;
        document.body.style.display = '';
    }

    function getPreferredTheme() {
        return localStorage.getItem('theme');
    }

    function setPreferredTheme(mode) {
        localStorage.setItem('theme', mode);
    }

    document.documentElement.classList.remove('darkmode-preload');

    const savedTheme = getPreferredTheme();
    if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
    } else {
        const hour = new Date().getHours();
        setTheme(hour >= 18 || hour < 6 ? 'dark' : 'light');
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            // stronger button animation
            themeToggle.classList.add('is-toggling-strong');

            // create an overlay to perform a circular reveal centered on the toggle button
            let overlay = document.getElementById('theme-switch-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'theme-switch-overlay';
                overlay.className = 'theme-switch-overlay';
                document.body.appendChild(overlay);
            }

            const rect = themeToggle.getBoundingClientRect();
            // compute center relative to viewport for clip-path
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            overlay.style.setProperty('--clip-x', cx + 'px');
            overlay.style.setProperty('--clip-y', cy + 'px');

            const currentlyDark = document.body.classList.contains('darkmode');
            const incomingMode = currentlyDark ? 'light' : 'dark';
            overlay.dataset.mode = incomingMode;

            // trigger expand animation
            void overlay.offsetWidth;
            overlay.classList.add('reveal');

            const REVEAL_MS = 360;

            setTimeout(() => {
                const isDark = document.body.classList.toggle('darkmode');
                setPreferredTheme(isDark ? 'dark' : 'light');

                // tiny reflow trick
                document.body.style.display = 'none';
                document.body.offsetHeight;
                document.body.style.display = '';

                // collapse reveal and cleanup
                overlay.classList.remove('reveal');
                overlay.addEventListener('transitionend', function handler(e) {
                    if (e.propertyName === 'clip-path' || e.propertyName === 'opacity') {
                        overlay.remove();
                    }
                }, { once: true });

                // remove button animation class slightly after
                setTimeout(() => themeToggle.classList.remove('is-toggling-strong'), REVEAL_MS + 120);
            }, REVEAL_MS);
        });
    }

    document.body.classList.add('js-ready');
    document.body.classList.add('fade-init');
    requestAnimationFrame(() => {
        document.body.classList.remove('fade-init');
    });

    const navLinks = document.querySelectorAll('nav ul li a, .project-item .button, .back-to-projects .button, .read-more-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (this.target === '_blank') return;

            const href = this.getAttribute('href') || '';
            if (!href || href === '#') return; // nothing to do

            let url;
            try {
                url = new URL(href, window.location.href);
            } catch (err) {
                return;
            }

            // consider / and /index.html equivalent for same-page checks
            const normalizePath = (p) => p.replace(/\/index\.html$|\/$/, '/');
            const samePath = normalizePath(url.pathname) === normalizePath(window.location.pathname);
            const isSamePageAnchor = !!url.hash && samePath;
            const isInternalLink = url.origin === window.location.origin && !isSamePageAnchor;

            if (isSamePageAnchor) {
                e.preventDefault();
                this.classList.add('is-animating');
                this.addEventListener('animationend', () => {
                    this.classList.remove('is-animating');
                    const targetId = url.hash.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        // if element missing, safely navigate
                        window.location.href = url.href;
                    }
                }, { once: true });
            } else if (isInternalLink) {
                // if the target URL equals current (including fragment), just handle anchor or ignore
                if (url.href === window.location.href) {
                    e.preventDefault();
                    // try to scroll to hash if present
                    if (url.hash) {
                        const id = url.hash.substring(1);
                        const el = document.getElementById(id);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                            return;
                        }
                    }
                    return;
                }

                e.preventDefault();
                this.classList.add('is-animating');
                this.addEventListener('animationend', () => {
                    this.classList.remove('is-animating');
                    document.body.classList.remove('js-ready');
                    document.body.classList.add('fade-out');
                    setTimeout(() => {
                        window.location.href = url.href;
                    }, 350);
                }, { once: true });
            }
        });
    });
}