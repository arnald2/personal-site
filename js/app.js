// Entry point for content initialization
document.addEventListener('DOMContentLoaded', () => {
    // Render timeline (now in About tab)
    const aboutContainer = document.getElementById('about-container');
    const toggle = document.getElementById('work-life-toggle');

    function renderTimeline(isWork) {
        if (!aboutContainer) return;

        const contentKey = isWork ? 'workTimeline' : 'timeline';
        const content = window.contentData ? window.contentData[contentKey] : '';

        if (content) {
            console.log('Rendering timeline content for:', contentKey);
            aboutContainer.innerHTML = content;
            // Initialize timeline after rendering
            if (typeof initTimeline === 'function') {
                initTimeline();
            } else {
                console.error('initTimeline is not a function');
            }
        } else {
            console.error('No content found for key:', contentKey);
            console.log('Available keys:', window.contentData ? Object.keys(window.contentData) : 'contentData is undefined');
        }
    }

    if (aboutContainer) {
        // Initial render (Work timeline by default)
        renderTimeline(true);

        // Toggle listener
        const balanceToggle = document.getElementById('balance-toggle-wrapper');
        let isWorkActive = true; // Default to Work

        if (balanceToggle) {
            balanceToggle.addEventListener('click', () => {
                isWorkActive = !isWorkActive; // Toggle state

                // Update UI visualization
                if (isWorkActive) {
                    balanceToggle.classList.add('work-active');
                } else {
                    balanceToggle.classList.remove('work-active');
                }

                // Render content
                renderTimeline(isWorkActive);
            });
        }
    }
});
