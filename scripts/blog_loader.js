document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('blog-list');
    if (!listEl) return;
    const state = { posts: [], activeTag: null };

    const render = () => {
        listEl.innerHTML = '';
        const filtered = state.activeTag ? state.posts.filter(p => (p.tags || []).includes(state.activeTag)) : state.posts;
        if (filtered.length === 0) {
            listEl.innerHTML = '<p>No posts found.</p>';
            return;
        }
        filtered.forEach(p => {
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
        });
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

    fetch('posts/index.json')
        .then(r => r.json())
        .then(posts => {
            posts.sort((a,b) => (b.date || '').localeCompare(a.date || ''));
            state.posts = posts;
            renderTagBar();
            render();
        })
        .catch(err => {
            console.error('Failed to load posts:', err);
            listEl.innerHTML = '<p>Unable to load posts.</p>';
        });
});
