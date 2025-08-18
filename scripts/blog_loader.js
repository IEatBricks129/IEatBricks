// Initialize blog loader in a way that's compatible with PJAX navigation.
// The old code only ran on DOMContentLoaded which doesn't fire for scripts
// dynamically injected during PJAX swaps. This IIFE runs immediately when
// possible, also listens for DOMContentLoaded and 'partialsLoaded', and
// guards against double initialization.
(function() {
    function init() {
        const listEl = document.getElementById('blog-list');
        if (!listEl) return;
        if (listEl.dataset.blogLoaderInitialized === '1') return;
        listEl.dataset.blogLoaderInitialized = '1';

        const state = { posts: [], activeTag: null };

        const render = () => {
            // animate existing cards out
            const existing = Array.from(listEl.children);
            if (existing.length) {
                existing.forEach((el, i) => {
                    el.style.transition = 'opacity 180ms ease, transform 220ms ease';
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(8px)';
                });
            }

            // after out animation, replace content
            setTimeout(() => {
                listEl.innerHTML = '';
                const filtered = state.activeTag ? state.posts.filter(p => (p.tags || []).includes(state.activeTag)) : state.posts;
                if (filtered.length === 0) {
                    listEl.innerHTML = '<p>No posts found.</p>';
                    return;
                }
                filtered.forEach((p, idx) => {
                    const card = document.createElement('article');
                    card.className = 'blog-card';

                    const title = document.createElement('h3');
                    const link = document.createElement('a');
                    link.href = p.path;
                    link.textContent = p.title;
                    title.appendChild(link);

                    const meta = document.createElement('div');
                    meta.className = 'blog-meta';
                    meta.textContent = new Date(p.date).toLocaleDateString();

                    const excerpt = document.createElement('p');
                    excerpt.className = 'blog-excerpt';
                    excerpt.textContent = p.excerpt || '';

                    card.appendChild(title);
                    card.appendChild(meta);
                    card.appendChild(excerpt);

                    // tags
                    if (p.tags && p.tags.length) {
                        const tagsWrap = document.createElement('div');
                        tagsWrap.className = 'blog-tags';
                        p.tags.forEach(t => {
                            const chip = document.createElement('button');
                            chip.type = 'button';
                            chip.className = 'tag';
                            chip.textContent = t;
                            chip.addEventListener('click', () => {
                                // toggle active tag
                                state.activeTag = state.activeTag === t ? null : t;
                                renderTagBar();
                                render();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            });
                            tagsWrap.appendChild(chip);
                        });
                        card.appendChild(tagsWrap);
                    }

                    listEl.appendChild(card);

                    // entrance animation (stagger)
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.transition = 'opacity 260ms ease, transform 260ms cubic-bezier(.2,.9,.2,1)';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 60 + idx * 60);
                });
            }, 220);
        };

        // tag bar
        const tagBar = document.createElement('div');
        tagBar.id = 'tag-bar';
        tagBar.className = 'tag-bar';
        listEl.parentNode.insertBefore(tagBar, listEl);

        function renderTagBar() {
            const allTags = Array.from(new Set(state.posts.flatMap(p => p.tags || []))).sort();
            tagBar.innerHTML = '';
            if (allTags.length === 0) return;

            const label = document.createElement('span');
            label.className = 'tag-bar-label';
            label.textContent = 'Filter by tag:';
            tagBar.appendChild(label);

            const clear = document.createElement('button');
            clear.className = 'tag-clear';
            clear.type = 'button';
            clear.textContent = state.activeTag ? 'Clear' : 'All';
            clear.addEventListener('click', () => { state.activeTag = null; renderTagBar(); render(); });
            tagBar.appendChild(clear);

            allTags.forEach(t => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'tag-bar-item' + (state.activeTag === t ? ' active' : '');
                b.textContent = t;
                b.addEventListener('click', () => {
                    state.activeTag = state.activeTag === t ? null : t;
                    renderTagBar();
                    render();
                });
                tagBar.appendChild(b);
            });
        }

        // resolve posts/index.json relative to current document path
        const basePath = document.location.pathname.replace(/\/[^/]*$/, '/');
        const postsIndexUrl = new URL('posts/index.json', document.location.origin + basePath).href;

        fetch(postsIndexUrl)
            .then(r => r.json())
            .then(posts => {
                posts.sort((a,b) => (b.date || '').localeCompare(a.date || ''));
                state.posts = posts;
                renderTagBar();
                render();
            })
            .catch(err => {
                    console.error('Failed to load posts:', err);
                    // If this is the first time we've hit this error on this pathname,
                    // trigger a full page reload to let the browser resolve relative
                    // paths correctly (fixes PJAX-inserted script execution cases).
                    try {
                        const key = 'blogReloaded:' + window.location.pathname;
                        if (!sessionStorage.getItem(key)) {
                            sessionStorage.setItem(key, '1');
                            // perform a hard reload once; subsequent failures won't reload again
                            window.location.reload();
                            return;
                        }
                    } catch (e) {
                        // ignore sessionStorage errors
                    }

                    listEl.innerHTML = '<p>Unable to load posts. Please try again later.</p>';
                });
    }

    // run immediately if document already parsed, otherwise wait for DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // also run after PJAX-style partials are loaded
    document.addEventListener('partialsLoaded', init);

})();
