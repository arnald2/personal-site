// Blog functionality
let currentFilterTag = 'All';

function getSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function renderFilterBar() {
    const filterBar = document.getElementById('filter-bar');
    if (!filterBar) return;

    const blogPosts = window.contentData ? window.contentData.blogPosts : [];

    // Get unique tags
    const tags = new Set(['All']);
    blogPosts.forEach(post => {
        post.tags.forEach(tag => tags.add(tag));
    });

    filterBar.innerHTML = Array.from(tags).map(tag => `
        <button class="sub-tab-btn ${tag === currentFilterTag ? 'active' : ''}" 
                onclick="setFilter('${tag}')">${tag}</button>
    `).join('');
}

window.setFilter = function (tag) {
    window.location.hash = `blog?tag=${encodeURIComponent(tag)}`;
};

function renderBlogPosts(filterTag = 'All') {
    const container = document.getElementById('blog-container');
    if (!container) return;

    const blogPosts = window.contentData ? window.contentData.blogPosts : [];
    currentFilterTag = filterTag;
    renderFilterBar();

    const filtered = filterTag === 'All'
        ? blogPosts
        : blogPosts.filter(post => post.tags.includes(filterTag));

    if (filtered.length === 0) {
        container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No posts found for this topic.</div>`;
        return;
    }

    container.innerHTML = filtered.map(post => {
        const slug = getSlug(post.title);
        return `
            <div class="blog-row" onclick="viewPost('${slug}')">
                <div class="blog-date">${post.date}</div>
                <div class="blog-title">${post.title}</div>
                <div class="blog-tags-small">
                    ${post.tags.map(tag => `<span class="tag-small">${tag}</span>`).join('')}
                </div>
            </div>
        `}).join('');

    if (typeof observeElements === 'function') observeElements();
}

window.viewPost = function (slug) {
    window.location.hash = `blog?post=${slug}`;
};

function renderBlogPost(slug) {
    const blogPosts = window.contentData ? window.contentData.blogPosts : [];
    const post = blogPosts.find(p => getSlug(p.title) === slug);

    if (!post) {
        showBlogList();
        return;
    }

    const singleView = document.getElementById('blog-single-view');
    const listView = document.getElementById('blog-list-view');
    const contentContainer = document.getElementById('single-post-content');
    const filterBar = document.getElementById('filter-bar');

    contentContainer.innerHTML = `
        <div class="blog-post-header">
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--text);">${post.title}</h1>
            <div class="blog-meta" style="justify-content: flex-start;">
                <span>${post.date}</span>
                <span>•</span>
                <span>${post.readTime} read</span>
                 <span>•</span>
                <div class="blog-tags-small">
                    ${post.tags.map(tag => `<span class="tag-small">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
        <div class="blog-post-content">
            ${post.content}
        </div>
    `;

    listView.style.display = 'none';
    if (filterBar) filterBar.style.display = 'none';
    singleView.classList.add('active');
}

function showBlogList(tag = 'All') {
    const singleView = document.getElementById('blog-single-view');
    const listView = document.getElementById('blog-list-view');
    const filterBar = document.getElementById('filter-bar');

    if (singleView) singleView.classList.remove('active');
    if (listView) listView.style.display = 'block';
    if (filterBar) filterBar.style.display = 'flex';

    renderBlogPosts(tag);
}
