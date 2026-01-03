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
            if (typeof renderBlogPost === 'function') renderBlogPost(slug);
        } else {
            const tagMatch = query ? query.match(/tag=([^&]+)/) : null;
            const activeTag = tagMatch ? decodeURIComponent(tagMatch[1]) : 'All';
            if (typeof showBlogList === 'function') showBlogList(activeTag);
        }
    }

    // Scroll to top if mostly a page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Tab Click Listeners - Now just update hash
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            window.location.hash = targetTab;
        });
    });
}

// Init Router listeners
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
    initTabs();
    handleRoute();
});
