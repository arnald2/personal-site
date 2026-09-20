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
    document.querySelectorAll('.card, .bento-card, .gallery-card, .blog-row').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(card);
    });
}

// Smooth scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // If it's a tab link, let router handle it
            if (['#home', '#blog', '#about', '#contact'].includes(href) || href.startsWith('#blog?')) {
                return;
            }
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Copy Email with Toast Feedback
window.copyEmail = function () {
    const email = 'arnaldogarcia7@gmail.com';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
            showToast('Email copied to clipboard: ' + email);
        }).catch(() => {
            showToast('Email: ' + email);
        });
    } else {
        showToast('Email: ' + email);
    }
};

window.showToast = function (message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
};

// Theme Toggle Logic
function initTheme() {
    const themeBtn = document.getElementById('theme-btn');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    const root = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    root.setAttribute('data-theme', savedTheme);
    updateActiveOption(savedTheme);

    if (themeBtn && themeMenu) {
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
    }

    // Handle Theme Selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');

            // Set theme
            root.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);

            // UI Feedback
            updateActiveOption(theme);
            if (themeMenu) themeMenu.classList.remove('active');

            if (themeBtn) {
                themeBtn.style.transform = 'scale(0.9)';
                setTimeout(() => themeBtn.style.transform = '', 200);
            }
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

    // Keyboard shortcut 'T' to cycle light/dark
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 't' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            const current = root.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateActiveOption(next);
            showToast('Switched to ' + next + ' theme');
        }
    });
}

// Initialization of basic UI behaviors
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    observeElements();
    initTheme();

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
