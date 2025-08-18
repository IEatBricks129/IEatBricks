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
                // update persistent bg layers to match the new mode
                try { updateThemeLayers(isDark ? 'dark' : 'light'); } catch (e) {}
            }, REVEAL_MS);
        });
    }

        // --- Persistent background layers to preserve scroll/animation across PJAX swaps ---
        // Create if missing: #bg-global for main page tile, #bg-header for header tile
        function ensureBgLayers() {
            if (!document.getElementById('bg-global')) {
                const g = document.createElement('div');
                g.id = 'bg-global';
                g.className = 'bg-layer bg-global';
                document.body.insertBefore(g, document.body.firstChild);
            }
            if (!document.getElementById('bg-header')) {
                const h = document.createElement('div');
                h.id = 'bg-header';
                h.className = 'bg-layer bg-header';
                // place header bg immediately after bg-global to sit behind header-content
                const global = document.getElementById('bg-global');
                if (global && global.nextSibling) document.body.insertBefore(h, global.nextSibling); else document.body.insertBefore(h, document.body.firstChild.nextSibling);
            }
        }

        function applyBgForMode(mode) {
            const global = document.getElementById('bg-global');
            const header = document.getElementById('bg-header');
            if (!global || !header) return;
            // Use class toggles to avoid inline style mutations that can reset animations
            if (mode === 'dark') {
                global.classList.add('dark'); global.classList.remove('light');
                header.classList.add('dark'); header.classList.remove('light');
            } else {
                global.classList.add('light'); global.classList.remove('dark');
                header.classList.add('light'); header.classList.remove('dark');
            }
        }

        // create layers now and apply according to current theme
        ensureBgLayers();
        applyBgForMode(document.body.classList.contains('darkmode') ? 'dark' : 'light');

        // size header bg to match header-content height so it clips perfectly
        function sizeHeaderBg() {
            // target the centered container inside the header so the bg matches the site's content width
            const headerEl = document.querySelector('.header-content') || document.querySelector('header');
            const headerBg = document.getElementById('bg-header');
            if (!headerEl || !headerBg) return;
            const rect = headerEl.getBoundingClientRect();
            // position header bg directly behind header
            headerBg.style.top = rect.top + 'px';
            headerBg.style.left = rect.left + 'px';
            headerBg.style.width = rect.width + 'px';
            headerBg.style.height = rect.height + 'px';
            // copy border radius from the header-content to make the bg visually match
            try {
                const cs = getComputedStyle(headerEl);
                headerBg.style.borderRadius = cs.borderTopLeftRadius || cs.borderRadius || '';
            } catch (e) {
                // ignore
            }
        }
        sizeHeaderBg();
        window.addEventListener('resize', () => {
            sizeHeaderBg();
        });
        // update on scroll in case header position changes (sticky headers, small layout shifts)
        window.addEventListener('scroll', () => {
            sizeHeaderBg();
        }, { passive: true });

        // when theme changes via toggle, update the bg layers instead of body background
        const originalSetPreferredTheme = window.__setPreferredTheme;
        function updateThemeLayers(mode) {
            applyBgForMode(mode);
            // re-size header bg after theme changes (in case header layout shifts)
            setTimeout(sizeHeaderBg, 50);
        }

    document.body.classList.add('js-ready');
    document.body.classList.add('fade-init');
    requestAnimationFrame(() => {
        document.body.classList.remove('fade-init');
    });

    // PJAX-style internal navigation: intercept internal anchors and swap <main> content
    const SKIP_PJAX = ['script.js', 'load_partials.js'];
    let pendingController = null;

    function createOverlay() {
        let ov = document.getElementById('pjax-overlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.id = 'pjax-overlay';
            ov.className = 'pjax-overlay';
            document.body.appendChild(ov);
        }
        return ov;
    }

    async function runScripts(container, baseUrl) {
        // execute inline and external scripts found inside container
        // Use a global set to track executed scripts so we don't re-run them on subsequent PJAX swaps.
        // Stored as absolute URLs for external scripts and raw text signatures for inline scripts.
        if (!window.__pjaxExecutedScripts) window.__pjaxExecutedScripts = new Set();
        const executed = window.__pjaxExecutedScripts;

        const scripts = Array.from(container.querySelectorAll('script'));
        for (const s of scripts) {
            const src = s.getAttribute('src');
            if (src) {
                const filename = src.split('/').pop();
                if (SKIP_PJAX.some(k => filename === k)) continue;
                const abs = new URL(src, baseUrl).href;
                if (executed.has(abs)) continue;
                executed.add(abs);
                await new Promise((resolve) => {
                    const scr = document.createElement('script');
                    scr.src = abs;
                    scr.onload = resolve;
                    scr.onerror = resolve; // don't block on error
                    document.body.appendChild(scr);
                });
            } else {
                // inline script: use its trimmed text as a signature
                const txt = (s.textContent || '').trim();
                if (!txt) continue;
                if (executed.has(txt)) continue;
                executed.add(txt);
                try {
                    const scr = document.createElement('script');
                    scr.textContent = txt;
                    document.body.appendChild(scr);
                } catch (err) {
                    // ignore execution errors for resilience
                }
            }
        }
    }

    async function ajaxNavigate(href, push = true) {
        const url = new URL(href, window.location.href);
        // only handle same-origin
        if (url.origin !== window.location.origin) return window.location.href = url.href;

        const mainEl = document.querySelector('main');
        if (!mainEl) return window.location.href = url.href;

        // same-page hash handling
        if (url.pathname === window.location.pathname && url.hash) {
            const id = url.hash.substring(1);
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                history.replaceState({ url: url.href }, '', url.href);
                return;
            }
        }

        // cancel previous
        if (pendingController) pendingController.abort();
        pendingController = new AbortController();

        const ov = createOverlay();
        ov.classList.add('active');

        try {
            const resp = await fetch(url.href, { signal: pendingController.signal });
            if (!resp.ok) throw new Error('Failed');
            const text = await resp.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const newMain = doc.querySelector('main');
            const newTitle = doc.querySelector('title') ? doc.querySelector('title').textContent : document.title;

            // animate current main out using class-based transitions
            mainEl.classList.add('main-exit');
            await new Promise(res => {
                let done = false;
                const onEnd = (e) => {
                    if (e.target !== mainEl) return;
                    if (done) return;
                    done = true;
                    mainEl.removeEventListener('transitionend', onEnd);
                    res();
                };
                mainEl.addEventListener('transitionend', onEnd);
                // fallback timeout
                setTimeout(() => { if (!done) { done = true; mainEl.removeEventListener('transitionend', onEnd); res(); } }, 300);
            });

            // replace content
            if (newMain) {
                // ensure incoming content starts hidden to allow smooth enter animation
                mainEl.classList.remove('main-exit');
                mainEl.classList.add('main-enter');
                mainEl.innerHTML = newMain.innerHTML;
                // force reflow so the main-enter initial state is applied
                void mainEl.offsetWidth;
            } else {
                // fallback to full navigation
                window.location.href = url.href;
                return;
            }

            // update title
            document.title = newTitle;

            // execute scripts found in the new main
            await runScripts(mainEl, url.href);

            // re-run partial detection in case placeholders exist (but don't reload header/footer)
            document.dispatchEvent(new Event('partialsLoaded'));

            // animate in using class-based transitions
            requestAnimationFrame(() => {
                mainEl.classList.remove('main-enter');
            });

            if (push) history.pushState({ url: url.href }, newTitle, url.href);

        } catch (err) {
            // on error, fallback to full navigation
            window.location.href = url.href;
        } finally {
            ov.classList.remove('active');
            pendingController = null;
        }
    }

    // attach delegated listener for all anchor clicks
    document.body.addEventListener('click', (e) => {
        if (e.defaultPrevented) return;
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href) return;
        if (a.target === '_blank' || a.hasAttribute('download') || a.rel === 'external') return;

        // ignore mailto/tel
        if (href.startsWith('mailto:') || href.startsWith('tel:')) return;

        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return; // external

        // allow anchors on same page to scroll
        if (url.pathname === window.location.pathname && url.hash) {
            e.preventDefault();
            const id = url.hash.substring(1);
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
            history.replaceState({ url: url.href }, '', url.href);
            return;
        }

        // handle internal pjax navigation
        e.preventDefault();
        ajaxNavigate(url.href, true);
    });

    // handle back/forward
    window.addEventListener('popstate', (e) => {
        const stateUrl = (e.state && e.state.url) || window.location.href;
        ajaxNavigate(stateUrl, false);
    });

    // prefetch on hover for internal links (small optimization)
    let prefetchLink = null;
    document.body.addEventListener('mouseover', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href) return;
        try {
            const url = new URL(href, window.location.href);
            if (url.origin !== window.location.origin) return;
            if (url.pathname === window.location.pathname && url.hash) return;
            // create or update prefetch link
            if (prefetchLink) prefetchLink.href = url.href; else {
                prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = url.href;
                document.head.appendChild(prefetchLink);
            }
        } catch (err) {}
    });
}