// Tab switching functionality
// Routing Logic
function handleRoute() {
    const hash = window.location.hash.slice(1) || 'home'; // Default to home
    const [path, query] = hash.split('?');

    // Active Tab Handling
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Deactivate all
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Activate target tab
    const targetTabBtn = document.querySelector(`.tab-btn[data-tab="${path}"]`);
    const targetTabContent = document.getElementById(path);

    if (targetTabBtn) targetTabBtn.classList.add('active');
    if (targetTabContent) targetTabContent.classList.add('active');

    // Specific Route Handling
    if (path === 'showcase') {
        if (query && query.startsWith('post=')) {
            const slug = query.split('=')[1];
            renderBlogPost(slug);
        } else {
            const tagMatch = query ? query.match(/tag=([^&]+)/) : null;
            const activeTag = tagMatch ? decodeURIComponent(tagMatch[1]) : 'All';
            showBlogList(activeTag);
        }
    }

    // Scroll to top if mostly a page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Global state for current tag
let currentFilterTag = 'All';

// Tab Click Listeners - Now just update hash
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        window.location.hash = targetTab;
    });
});

// Init Router
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);

// Remove old sub-tab buttons logic (subTabButtons/subContents) as they are gone

// Add smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Animation Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements
function observeElements() {
    document.querySelectorAll('.card, .project-card, .hobby-card, .skill-card, .blog-row').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Vertical Timeline Interaction
function initTimeline() {
    const storyPanel = document.querySelector('.story-panel');
    const timelineMarkers = document.querySelectorAll('.timeline-marker');
    const storyMilestones = document.querySelectorAll('.story-milestone');

    if (storyPanel && timelineMarkers.length > 0) {
        // Clicking a marker scrolls the panel
        timelineMarkers.forEach(marker => {
            marker.addEventListener('click', () => {
                const targetId = marker.getAttribute('data-for');
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        const storyObserverOptions = {
            root: storyPanel,
            threshold: 0.5,
            rootMargin: '0px'
        };

        const storyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    timelineMarkers.forEach(m => m.classList.remove('active'));
                    storyMilestones.forEach(m => m.classList.remove('active'));

                    const milestoneId = entry.target.id;
                    const marker = document.querySelector(`[data-for="${milestoneId}"]`);
                    if (marker) marker.classList.add('active');
                    entry.target.classList.add('active');
                }
            });
        }, storyObserverOptions);

        storyMilestones.forEach(milestone => storyObserver.observe(milestone));
    }
}

// Data Loading
const blogPosts = window.contentData ? window.contentData.blogPosts : [];
const resumeContent = window.contentData ? window.contentData.resume : '';
const timelineContent = window.contentData ? window.contentData.timeline : '';

// Render content
const resumeContainer = document.getElementById('resume-container');
if (resumeContainer && resumeContent) {
    resumeContainer.innerHTML = resumeContent;
}

const homeContainer = document.getElementById('home-container');
if (homeContainer && timelineContent) {
    homeContainer.innerHTML = timelineContent;
    initTimeline();
}

function getSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function renderFilterBar() {
    const filterBar = document.getElementById('filter-bar');
    if (!filterBar) return;

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
    window.location.hash = `showcase?tag=${encodeURIComponent(tag)}`;
};

function renderBlogPosts(filterTag = 'All') {
    const container = document.getElementById('blog-container');
    if (!container) return;

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

    observeElements();
}

window.viewPost = function (slug) {
    window.location.hash = `showcase?post=${slug}`;
};

function renderBlogPost(slug) {
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

// Initial observed elements
observeElements();
