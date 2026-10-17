// Interactive 3D Cover Flow & Depth Zoom Timeline
let currentTimelineMode = 'coverflow'; // 'coverflow' | 'zoom'
let activeKeyHandler = null;

function initTimeline() {
    const container = document.getElementById('about-container');
    if (!container) return;

    const rawMilestones = Array.from(container.querySelectorAll('.story-milestone'));
    if (rawMilestones.length === 0) return;

    // Extract intro if it exists either standalone or as #w-intro
    let introHTML = '';
    const standaloneIntro = container.querySelector('.story-panel > .timeline-intro');
    if (standaloneIntro) {
        introHTML = standaloneIntro.innerHTML;
    }

    const milestonesData = [];
    rawMilestones.forEach((el) => {
        const introInside = el.querySelector('.timeline-intro');
        if (introInside && !el.querySelector('.milestone-header')) {
            introHTML = introInside.innerHTML;
            return;
        }

        const id = el.id || `ms-${milestonesData.length}`;
        const year = el.querySelector('.milestone-year-large')?.textContent.trim() || '';
        const title = el.querySelector('.milestone-title')?.textContent.trim() || '';
        const textHTML = el.querySelector('.milestone-text')?.innerHTML.trim() || '';
        const blurbEl = el.querySelector('.milestone-blurb');
        const blurbHTML = blurbEl ? blurbEl.outerHTML : '';

        const figures = Array.from(el.querySelectorAll('.milestone-media figure')).map(fig => {
            const img = fig.querySelector('img');
            const cap = fig.querySelector('figcaption');
            return {
                src: img ? img.getAttribute('src') : '',
                alt: img ? img.getAttribute('alt') : title,
                isLogo: img ? img.classList.contains('work-logo') : false,
                caption: cap ? cap.innerHTML.trim() : ''
            };
        }).filter(f => f.src);

        milestonesData.push({
            id,
            year,
            title,
            textHTML,
            blurbHTML,
            figures
        });
    });

    if (milestonesData.length === 0) return;

    let currentIndex = 0;
    // Track active sub-photo index for milestones with multiple photos (e.g. 2018 Wedding + Shark)
    const subPhotoIndex = milestonesData.map(() => 0);

    // Build Interactive Stage DOM
    container.innerHTML = `
        <div class="cf-timeline-wrapper">
            <div class="cf-top-bar">
                <div class="cf-intro-compact">
                    ${introHTML}
                </div>
                <div class="cf-mode-switcher" role="group" aria-label="Timeline View Mode">
                    <button class="cf-mode-btn ${currentTimelineMode === 'coverflow' ? 'active' : ''}" data-mode="coverflow" title="iPod Cover Flow View">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="16" x="6" y="4" rx="2"/><path d="M2 6v12"/><path d="M22 6v12"/></svg>
                        <span>Cover Flow</span>
                    </button>
                    <button class="cf-mode-btn ${currentTimelineMode === 'zoom' ? 'active' : ''}" data-mode="zoom" title="3D Camera Zoom View">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                        <span>3D Zoom</span>
                    </button>
                </div>
            </div>

            <!-- 3D Viewport Stage -->
            <div class="cf-stage-container" id="cf-stage-container" data-mode="${currentTimelineMode}">
                <button class="cf-nav-arrow cf-prev" id="cf-prev-btn" aria-label="Previous milestone">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>

                <div class="cf-stage" id="cf-stage">
                    ${milestonesData.map((m, idx) => {
                        const primaryFig = m.figures[0] || { src: '', alt: m.title, isLogo: false, caption: '' };
                        const hasMultiple = m.figures.length > 1;
                        return `
                            <div class="cf-card ${primaryFig.isLogo ? 'is-logo-card' : 'is-photo-card'}" data-index="${idx}">
                                <div class="cf-card-inner">
                                    <div class="cf-card-media">
                                        <img src="${primaryFig.src}" alt="${primaryFig.alt}" class="${primaryFig.isLogo ? 'cf-logo-img' : 'cf-photo-img'}" draggable="false">
                                        <span class="cf-card-year-pill">${m.year}</span>
                                        ${hasMultiple ? `
                                            <div class="cf-multi-photo-dots" title="Click to switch photo">
                                                ${m.figures.map((f, fIdx) => `
                                                    <button class="cf-photo-dot ${fIdx === 0 ? 'active' : ''}" data-ms="${idx}" data-fig="${fIdx}" aria-label="Photo ${fIdx + 1}">
                                                        ${fIdx + 1}
                                                    </button>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                        <button class="cf-zoom-trigger" data-ms="${idx}" title="Zoom Picture">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                                        </button>
                                    </div>
                                    <div class="cf-card-footer">
                                        <span class="cf-card-title">${m.title}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <button class="cf-nav-arrow cf-next" id="cf-next-btn" aria-label="Next milestone">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
            </div>

            <!-- iPod-Style Year Scrubber Bar -->
            <div class="cf-scrubber-bar" role="tablist" aria-label="Timeline Years">
                <div class="cf-scrubber-track">
                    <div class="cf-scrubber-fill" id="cf-scrubber-fill"></div>
                </div>
                <div class="cf-scrubber-markers">
                    ${milestonesData.map((m, idx) => `
                        <button class="cf-year-dot" data-index="${idx}" role="tab">
                            <span class="cf-dot-pip"></span>
                            <span class="cf-dot-label">${m.year}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Story Readout Display Below Stage -->
            <div class="cf-story-readout" id="cf-story-readout">
                <!-- Populated dynamically -->
            </div>
        </div>

        <!-- Fullscreen Photo Zoom Lightbox -->
        <div class="cf-lightbox" id="cf-lightbox" aria-hidden="true">
            <button class="cf-lightbox-close" id="cf-lightbox-close" aria-label="Close Zoom">&times;</button>
            <div class="cf-lightbox-content">
                <img id="cf-lightbox-img" src="" alt="">
                <div class="cf-lightbox-caption" id="cf-lightbox-caption"></div>
            </div>
        </div>
    `;

    const stageContainer = container.querySelector('#cf-stage-container');
    const cards = Array.from(container.querySelectorAll('.cf-card'));
    const yearDots = Array.from(container.querySelectorAll('.cf-year-dot'));
    const scrubberFill = container.querySelector('#cf-scrubber-fill');
    const storyReadout = container.querySelector('#cf-story-readout');
    const prevBtn = container.querySelector('#cf-prev-btn');
    const nextBtn = container.querySelector('#cf-next-btn');
    const modeBtns = Array.from(container.querySelectorAll('.cf-mode-btn'));
    const lightbox = container.querySelector('#cf-lightbox');
    const lightboxImg = container.querySelector('#cf-lightbox-img');
    const lightboxCaption = container.querySelector('#cf-lightbox-caption');
    const lightboxClose = container.querySelector('#cf-lightbox-close');

    function updateStage(newIndex) {
        currentIndex = Math.max(0, Math.min(milestonesData.length - 1, newIndex));

        cards.forEach((card, idx) => {
            const offset = idx - currentIndex;
            const absOffset = Math.abs(offset);

            card.classList.toggle('active', offset === 0);
            card.style.zIndex = String(100 - absOffset);

            if (currentTimelineMode === 'coverflow') {
                // Classic iPod Cover Flow 3D geometry
                if (offset === 0) {
                    card.style.transform = `translate3d(0px, 0px, 110px) rotateY(0deg) scale(1.06)`;
                    card.style.opacity = '1';
                    card.style.filter = 'brightness(1)';
                    card.style.pointerEvents = 'auto';
                } else {
                    const sign = offset < 0 ? -1 : 1;
                    const baseShift = 185;
                    const stepShift = 95;
                    const x = sign * (baseShift + (absOffset - 1) * stepShift);
                    const z = -90 - (absOffset - 1) * 55;
                    const rotY = sign * -52; // Angle inward toward center
                    const scale = Math.max(0.68, 0.88 - (absOffset - 1) * 0.06);
                    const opacity = absOffset > 4 ? 0 : Math.max(0.25, 0.85 - (absOffset - 1) * 0.18);
                    const brightness = Math.max(0.45, 0.78 - (absOffset - 1) * 0.12);

                    card.style.transform = `translate3d(${x}px, 0px, ${z}px) rotateY(${rotY}deg) scale(${scale})`;
                    card.style.opacity = String(opacity);
                    card.style.filter = `brightness(${brightness})`;
                    card.style.pointerEvents = absOffset > 4 ? 'none' : 'auto';
                }
            } else {
                // 3D Depth Zoom Tunnel (Time Machine / Camera Zoom style)
                if (offset === 0) {
                    card.style.transform = `translate3d(0px, 0px, 90px) rotateX(0deg) scale(1.06)`;
                    card.style.opacity = '1';
                    card.style.filter = 'brightness(1) blur(0px)';
                    card.style.pointerEvents = 'auto';
                } else if (offset < 0) {
                    // Past items zoom past the camera and fade out
                    const z = 260 + absOffset * 120;
                    const y = 40 * absOffset;
                    card.style.transform = `translate3d(0px, ${y}px, ${z}px) scale(${1.25 + absOffset * 0.15})`;
                    card.style.opacity = '0';
                    card.style.filter = 'brightness(1) blur(6px)';
                    card.style.pointerEvents = 'none';
                } else {
                    // Future items wait deep in the background tunnel
                    const z = -110 * offset;
                    const y = -38 * offset;
                    const x = 28 * offset;
                    const scale = Math.max(0.5, 1 - offset * 0.1);
                    const opacity = offset > 4 ? 0 : Math.max(0.2, 0.85 - (offset - 1) * 0.2);
                    const brightness = Math.max(0.45, 0.82 - (offset - 1) * 0.12);

                    card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;
                    card.style.opacity = String(opacity);
                    card.style.filter = `brightness(${brightness})`;
                    card.style.pointerEvents = offset > 4 ? 'none' : 'auto';
                }
            }
        });

        // Update Scrubber Bar
        const progressPct = milestonesData.length > 1
            ? (currentIndex / (milestonesData.length - 1)) * 100
            : 100;
        if (scrubberFill) {
            scrubberFill.style.width = `${progressPct}%`;
        }

        yearDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
            dot.classList.toggle('passed', idx < currentIndex);
        });

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === milestonesData.length - 1;

        renderActiveStory(currentIndex);
    }

    function renderActiveStory(idx) {
        const m = milestonesData[idx];
        const activeFigIdx = subPhotoIndex[idx] || 0;
        const activeFig = m.figures[activeFigIdx];

        storyReadout.classList.remove('cf-story-animate');
        // Trigger reflow for clean transition
        void storyReadout.offsetWidth;
        storyReadout.classList.add('cf-story-animate');

        storyReadout.innerHTML = `
            <div class="cf-story-card">
                <div class="cf-story-header">
                    <div class="cf-story-title-group">
                        <span class="cf-story-year">${m.year}</span>
                        <h3 class="cf-story-title">${m.title}</h3>
                    </div>
                    <div class="cf-story-counter">
                        ${idx + 1} / ${milestonesData.length}
                    </div>
                </div>

                ${activeFig && activeFig.caption ? `
                    <div class="cf-story-caption">
                        <span>📸 ${activeFig.caption}</span>
                        ${m.figures.length > 1 ? `
                            <div class="cf-caption-switcher">
                                ${m.figures.map((fig, fIdx) => `
                                    <button class="cf-caption-pill ${fIdx === activeFigIdx ? 'active' : ''}" data-ms="${idx}" data-fig="${fIdx}">
                                        Photo ${fIdx + 1}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                <div class="cf-story-body">
                    ${m.textHTML}
                </div>

                ${m.blurbHTML ? `<div class="cf-story-blurb-wrap">${m.blurbHTML}</div>` : ''}
            </div>
        `;

        // Attach caption switcher listeners if multiple photos exist
        storyReadout.querySelectorAll('.cf-caption-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                const msIdx = Number(btn.getAttribute('data-ms'));
                const figIdx = Number(btn.getAttribute('data-fig'));
                switchSubPhoto(msIdx, figIdx);
            });
        });
    }

    function switchSubPhoto(msIdx, figIdx) {
        subPhotoIndex[msIdx] = figIdx;
        const m = milestonesData[msIdx];
        const fig = m.figures[figIdx];
        const card = cards[msIdx];
        if (card && fig) {
            const img = card.querySelector('img');
            if (img) {
                img.src = fig.src;
                img.alt = fig.alt;
            }
            card.querySelectorAll('.cf-photo-dot').forEach((d, i) => {
                d.classList.toggle('active', i === figIdx);
            });
        }
        if (msIdx === currentIndex) {
            renderActiveStory(msIdx);
        }
    }

    function openLightbox(msIdx) {
        const m = milestonesData[msIdx];
        const figIdx = subPhotoIndex[msIdx] || 0;
        const fig = m.figures[figIdx];
        if (!fig) return;

        lightboxImg.src = fig.src;
        lightboxImg.alt = fig.alt;
        lightboxCaption.innerHTML = `<strong>${m.year} — ${m.title}</strong>${fig.caption ? `<br>${fig.caption}` : ''}`;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
    }

    // Card clicks
    cards.forEach((card, idx) => {
        card.addEventListener('click', (e) => {
            // Check if clicked multi-photo dot
            const dotBtn = e.target.closest('.cf-photo-dot');
            if (dotBtn) {
                e.stopPropagation();
                const msIdx = Number(dotBtn.getAttribute('data-ms'));
                const figIdx = Number(dotBtn.getAttribute('data-fig'));
                switchSubPhoto(msIdx, figIdx);
                if (msIdx !== currentIndex) updateStage(msIdx);
                return;
            }

            // Check if clicked zoom button
            const zoomBtn = e.target.closest('.cf-zoom-trigger');
            if (zoomBtn) {
                e.stopPropagation();
                openLightbox(idx);
                return;
            }

            if (idx !== currentIndex) {
                updateStage(idx);
            } else {
                // Clicking the centered active card zooms the photo!
                openLightbox(idx);
            }
        });
    });

    // Scrubber clicks
    yearDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => updateStage(idx));
    });

    // Prev / Next buttons
    prevBtn.addEventListener('click', () => updateStage(currentIndex - 1));
    nextBtn.addEventListener('click', () => updateStage(currentIndex + 1));

    // Mode switcher (Cover Flow vs 3D Zoom)
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentTimelineMode = btn.getAttribute('data-mode');
            stageContainer.setAttribute('data-mode', currentTimelineMode);
            modeBtns.forEach(b => b.classList.toggle('active', b === btn));
            updateStage(currentIndex);
        });
    });

    // Mouse Wheel / Trackpad scrubbing over the 3D stage
    let wheelLocked = false;
    stageContainer.addEventListener('wheel', (e) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(delta) < 12) return;

        // Prevent page scroll if we can advance in that direction
        if ((delta > 0 && currentIndex < milestonesData.length - 1) || (delta < 0 && currentIndex > 0)) {
            e.preventDefault();
            if (!wheelLocked) {
                wheelLocked = true;
                updateStage(currentIndex + (delta > 0 ? 1 : -1));
                setTimeout(() => { wheelLocked = false; }, 260);
            }
        }
    }, { passive: false });

    // Touch Swipe Support on Stage
    let touchStartX = 0;
    stageContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    stageContainer.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 40) {
            updateStage(currentIndex + (diff > 0 ? 1 : -1));
        }
    }, { passive: true });

    // Lightbox events
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation (Left / Right arrows & Escape)
    if (activeKeyHandler) {
        window.removeEventListener('keydown', activeKeyHandler);
    }
    activeKeyHandler = (e) => {
        const aboutTab = document.getElementById('about');
        if (!aboutTab || !aboutTab.classList.contains('active')) return;

        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
            return;
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            updateStage(currentIndex + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            updateStage(currentIndex - 1);
        }
    };
    window.addEventListener('keydown', activeKeyHandler);

    // Initialize stage at first item
    updateStage(0);
}
