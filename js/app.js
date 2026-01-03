// Entry point for content initialization
document.addEventListener('DOMContentLoaded', () => {
    const resumeContent = window.contentData ? window.contentData.resume : '';
    const timelineContent = window.contentData ? window.contentData.timeline : '';

    // Render resume
    const resumeContainer = document.getElementById('resume-container');
    if (resumeContainer && resumeContent) {
        resumeContainer.innerHTML = resumeContent;
    }

    // Render timeline (now in About tab)
    const aboutContainer = document.getElementById('about-container');
    if (aboutContainer && timelineContent) {
        aboutContainer.innerHTML = timelineContent;
        // Initialize timeline after rendering
        if (typeof initTimeline === 'function') {
            initTimeline();
        }
    }
});
