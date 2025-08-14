document.addEventListener('DOMContentLoaded', () => {
    const loadPartial = async (placeholderId, partialPath) => {
        try {
            const response = await fetch(partialPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            document.getElementById(placeholderId).innerHTML = html;
        } catch (error) {
            console.error(`Could not load partial ${partialPath}:`, error);
        }
    };

    const partialsToLoad = [];

    // Add header, footer, and theme toggle for index.html
    if (document.getElementById('header-placeholder')) {
        partialsToLoad.push({
            id: 'header-placeholder',
            path: 'partials/header.html'
        });
    }
    if (document.getElementById('footer-placeholder')) {
        partialsToLoad.push({
            id: 'footer-placeholder',
            path: 'partials/footer.html'
        });
    }
    if (document.getElementById('theme-toggle-placeholder')) {
        partialsToLoad.push({
            id: 'theme-toggle-placeholder',
            path: 'partials/theme_toggle.html'
        });
    }

    // Add header, footer, and theme toggle for pages/*.html
    if (document.getElementById('header-placeholder-pages')) {
        partialsToLoad.push({
            id: 'header-placeholder-pages',
            path: '../partials/header.html'
        });
    }
    if (document.getElementById('footer-placeholder-pages')) {
        partialsToLoad.push({
            id: 'footer-placeholder-pages',
            path: '../partials/footer.html'
        });
    }
    if (document.getElementById('theme-toggle-placeholder-pages')) {
        partialsToLoad.push({
            id: 'theme-toggle-placeholder-pages',
            path: '../partials/theme_toggle.html'
        });
    }

    // Add header, footer, and theme toggle for pages/essays/*.html
    if (document.getElementById('header-placeholder-essays')) {
        partialsToLoad.push({
            id: 'header-placeholder-essays',
            path: '../../partials/header.html'
        });
    }
    if (document.getElementById('footer-placeholder-essays')) {
        partialsToLoad.push({
            id: 'footer-placeholder-essays',
            path: '../../partials/footer.html'
        });
    }
    if (document.getElementById('theme-toggle-placeholder-essays')) {
        partialsToLoad.push({
            id: 'theme-toggle-placeholder-essays',
            path: '../../partials/theme_toggle.html'
        });
    }

    Promise.all(partialsToLoad.map(p => loadPartial(p.id, p.path)))
        .then(() => {
            document.dispatchEvent(new Event('partialsLoaded'));
        })
        .catch(error => {
            console.error('Error loading partials:', error);
        });
});
