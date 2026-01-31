// Vertical Timeline Interaction
function initTimeline() {
    const container = document.getElementById('about-container');
    if (!container) return;

    const storyPanel = container.querySelector('.story-panel');
    const timelineMarkers = container.querySelectorAll('.timeline-marker');
    const storyMilestones = container.querySelectorAll('.story-milestone');

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
            root: null, // Use viewport as root to work on both mobile (window scroll) and desktop (container scroll)
            threshold: 0, // Trigger as soon as it intersects the active zone
            // Define a centered active zone (15% from top/bottom)
            // This ensures meaningful focus in the middle of the screen
            rootMargin: '-15% 0px -15% 0px'
        };

        const visibleMilestones = new Set();

        const storyObserver = new IntersectionObserver((entries) => {
            // Update the set of visible milestones based on entry changes
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    visibleMilestones.add(entry.target);
                } else {
                    visibleMilestones.delete(entry.target);
                }
            });

            // Find the milestone closest to the center of the viewport
            let bestCandidate = null;
            let minDistance = Infinity;

            // We use the window center because the user looks at the center of the screen
            const viewportCenter = window.innerHeight / 2;

            visibleMilestones.forEach(milestone => {
                const rect = milestone.getBoundingClientRect();
                const milestoneCenter = rect.top + (rect.height / 2);
                const distance = Math.abs(viewportCenter - milestoneCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    bestCandidate = milestone;
                }
            });

            // If we have a clear winner, update the UI
            if (bestCandidate) {
                // Optimization: Check if it's already active to avoid DOM thrashing could be done here, 
                // but simple removal/addition is robust.

                timelineMarkers.forEach(m => m.classList.remove('active'));
                storyMilestones.forEach(m => m.classList.remove('active'));

                bestCandidate.classList.add('active');

                const milestoneId = bestCandidate.id;
                const marker = document.querySelector(`[data-for="${milestoneId}"]`);
                if (marker) {
                    marker.classList.add('active');
                    marker.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        }, storyObserverOptions);

        storyMilestones.forEach(milestone => storyObserver.observe(milestone));
    }
}
