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

                // Update active states manually
                timelineMarkers.forEach(m => m.classList.remove('active'));
                storyMilestones.forEach(m => m.classList.remove('active'));

                marker.classList.add('active');
                if (targetElement) {
                    targetElement.classList.add('active');
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Initialize first item as active if needed, or leave it to user interaction
        // For now, we leave the initial state as defined in HTML/CSS or just blank untill filtered

        const storyObserverOptions = {
            root: storyPanel,
            threshold: 0, // Trigger as soon as it intersects the active zone
            // Define a narrow active zone in the vertical center of the panel
            rootMargin: '-10% 0px -80% 0px'
        };

        const storyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    timelineMarkers.forEach(m => m.classList.remove('active'));
                    storyMilestones.forEach(m => m.classList.remove('active'));

                    const milestoneId = entry.target.id;
                    const marker = document.querySelector(`[data-for="${milestoneId}"]`);
                    if (marker) {
                        marker.classList.add('active');
                        // IMPORTANT: We do NOT scroll the marker into view here.
                        // This prevents the page/sidebar from snapping or moving automatically while scrolling.
                    }
                    entry.target.classList.add('active');
                }
            });
        }, storyObserverOptions);

        storyMilestones.forEach(milestone => storyObserver.observe(milestone));
    }
}
