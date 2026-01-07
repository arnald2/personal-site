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
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });

        const storyObserverOptions = {
            root: storyPanel,
            threshold: 0, // Trigger as soon as it intersects the active zone
            // Define a narrow active zone in the vertical center of the panel
            rootMargin: '-45% 0px -45% 0px'
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
                        // Scroll the marker into view within the timeline panel
                        marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    entry.target.classList.add('active');
                }
            });
        }, storyObserverOptions);

        storyMilestones.forEach(milestone => storyObserver.observe(milestone));
    }
}
