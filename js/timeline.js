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
