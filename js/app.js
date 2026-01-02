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
    if (path === 'blog') {
        if (query && query.startsWith('post=')) {
            const slug = query.split('=')[1];
            renderBlogPost(slug);
        } else if (query && query.startsWith('id=')) {
            // Backward compatibility or fallback
            const postId = parseInt(query.split('=')[1]);
            renderBlogPost(postId);
        } else {
            showBlogList();
        }
    }

    // Scroll to top if mostly a page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

// Sub-tab switching functionality
const subTabButtons = document.querySelectorAll('.sub-tab-btn');
const subContents = document.querySelectorAll('.sub-content');

subTabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetSubTab = button.getAttribute('data-subtab');

        // Remove active class from all sub-tab buttons and sub-contents
        subTabButtons.forEach(btn => btn.classList.remove('active'));
        subContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        const targetSubElement = document.getElementById(targetSubTab);
        if (targetSubElement) {
            targetSubElement.classList.add('active');
        }
    });
});

// Add smooth scroll for all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add animation on scroll (optional enhancement)
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

// Observe all cards
document.querySelectorAll('.card, .project-card, .hobby-card, .skill-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Vertical Timeline Interaction
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

    // Intersection Observer for scroll spy
    const storyObserverOptions = {
        root: storyPanel,
        threshold: 0.5,
        rootMargin: '0px'
    };

    const storyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Deactivate all
                timelineMarkers.forEach(m => m.classList.remove('active'));
                storyMilestones.forEach(m => m.classList.remove('active'));

                // Activate current
                const milestoneId = entry.target.id;
                const marker = document.querySelector(`[data-for="${milestoneId}"]`);
                if (marker) marker.classList.add('active');
                entry.target.classList.add('active');
            }
        });
    }, storyObserverOptions);

    storyMilestones.forEach(milestone => storyObserver.observe(milestone));
}

// Blog Logic
// blogPosts is loaded from js/blog-data.js

function getSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function renderBlogPosts() {
    const container = document.getElementById('blog-container');
    if (!container) return;

    container.innerHTML = blogPosts.map(post => {
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
}

// Global for onclick
window.viewPost = function (slug) {
    window.location.hash = `blog?post=${slug}`;
};

function renderBlogPost(identifier) {
    // Identifier can be ID (legacy) or slug (string)
    let post;
    if (typeof identifier === 'number') {
        post = blogPosts.find(p => p.id === identifier);
    } else {
        post = blogPosts.find(p => getSlug(p.title) === identifier);
    }

    if (!post) {
        showBlogList();
        return;
    }

    const singleView = document.getElementById('blog-single-view');
    const listView = document.getElementById('blog-list-view');
    const contentContainer = document.getElementById('single-post-content');

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
    singleView.classList.add('active');
}

function showBlogList() {
    if (window.location.hash !== '#blog') {
        window.location.hash = 'blog';
        return;
    }
    const singleView = document.getElementById('blog-single-view');
    const listView = document.getElementById('blog-list-view');

    singleView.classList.remove('active');
    listView.style.display = 'block';
}

// Call render on init
renderBlogPosts();
