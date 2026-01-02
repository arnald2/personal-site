            // Tab switching functionality
            const tabButtons = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetTab = button.getAttribute('data-tab');

                    // Remove active class from all buttons and contents
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));

                    // Add active class to clicked button and corresponding content
                    button.classList.add('active');
                    const targetElement = document.getElementById(targetTab);
                    if (targetElement) {
                        targetElement.classList.add('active');
                    }

                    // Scroll to top smoothly
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });

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
            const blogPosts = [
                {
                    id: 1,
                    title: "Building a Better Portfolio",
                    date: "Jan 1, 2026",
                    excerpt: "Reflecting on the process of redesigning my personal site to better showcase my engineering journey.",
                    tags: ["Web Dev", "Design"],
                    readTime: "3 min",
                    content: `
                        <p>When I set out to redesign this portfolio, I knew I wanted something that felt <strong>distinctly engineering-focused</strong> but still polished. The previous version was built on a heavy template that was hard to customize.</p>
                        <h3>The Goals</h3>
                        <ul>
                            <li>Make it fast (vanilla JS/CSS).</li>
                            <li>Showcase the <em>"Code"</em> aesthetic with monospaced fonts and terminal-like vibes.</li>
                            <li>Ensure it's easy to update.</li>
                        </ul>
                        <p>I decided to stick to a dark mode theme because let's be honest, that's where we spend most of our time as developers. The color palette revolves around a deep black/gray background with vibrant cyan accents to make interactive elements pop.</p>
                        <p>One of the coolest features is the dynamic timeline you see on the homepage. Getting those CSS calculations right for the responsive markers was a fun little challenge!</p>
                    `
                },
                {
                    id: 2,
                    title: "The Future of AI Agents",
                    date: "Dec 15, 2025",
                    excerpt: "How autonomous agents are changing the way we write code and solve complex problems.",
                    tags: ["AI", "Tech"],
                    readTime: "5 min",
                    content: `
                        <p>AI agents are rapidly evolving from simple chatbots to capable autonomous workers. We're seeing models that can plan, execute, and verify tasks—much like a human engineer would.</p>
                        <h3>Why this matters</h3>
                        <p>It means we can offload the "boilerplate" thinking. Instead of spending hours setting up the scaffold for a project, an agent can do it in seconds. This shifts the engineer's role to more of an <strong>Architecture & Review</strong> position.</p>
                        <p>I believe the next few years will be defined by how well we can integrate these agents into our daily workflows without losing the human touch that makes great software truly <em>great</em>.</p>
                    `
                },
                {
                    id: 3,
                    title: "Mastering CSS Grid",
                    date: "Nov 20, 2025",
                    excerpt: "A deep dive into creating robust, responsive layouts with modern CSS grid techniques.",
                    tags: ["CSS", "Frontend"],
                    readTime: "7 min",
                    content: `
                        <p>CSS Grid has completely changed how I approach web layout. Gone are the days of float hacks and complex negative margins.</p>
                        <p>For this site, I used Grid extensively to handle the responsive behavior of the project cards and the timeline layout. The ability to simply define <code>grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))</code> makes responsive design almost automatic.</p>
                        <h3>Quick Tip</h3>
                        <p>Always name your grid lines if you're building a complex layout. It makes debugging (and reading your own code 6 months later) so much easier!</p>
                    `
                }
            ];

            function renderBlogPosts() {
                const container = document.getElementById('blog-container');
                if (!container) return;

                container.innerHTML = blogPosts.map(post => `
                    <div class="blog-row" onclick="viewPost(${post.id})">
                        <div class="blog-date">${post.date}</div>
                        <div class="blog-title">${post.title}</div>
                        <div class="blog-tags-small">
                            ${post.tags.map(tag => `<span class="tag-small">${tag}</span>`).join('')}
                        </div>
                    </div>
                `).join('');
            }

            function viewPost(id) {
                const post = blogPosts.find(p => p.id === id);
                if (!post) return;

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
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            function showBlogList() {
                const singleView = document.getElementById('blog-single-view');
                const listView = document.getElementById('blog-list-view');

                singleView.classList.remove('active');
                listView.style.display = 'block';
            }

            // Call render on init
            renderBlogPosts();

