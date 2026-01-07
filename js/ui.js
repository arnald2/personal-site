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

// Add smooth scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}



// Theme Toggle Logic
// Theme Logic
function initTheme() {
    const themeBtn = document.getElementById('theme-btn');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    const root = document.documentElement; // Apply theme to root

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    root.setAttribute('data-theme', savedTheme);
    updateActiveOption(savedTheme);

    // Toggle Dropdown
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!themeBtn.contains(e.target) && !themeMenu.contains(e.target)) {
            themeMenu.classList.remove('active');
        }
    });

    // Handle Theme Selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');

            // Set theme
            root.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);

            // UI Feedback
            updateActiveOption(theme);
            themeMenu.classList.remove('active');

            // Optional: visual feedback on button
            themeBtn.style.transform = 'scale(0.9)';
            setTimeout(() => themeBtn.style.transform = '', 200);
        });
    });

    function updateActiveOption(theme) {
        themeOptions.forEach(opt => {
            if (opt.getAttribute('data-theme') === theme) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }
}

// Initialization of basic UI behaviors
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    observeElements();
    initTheme();
});
