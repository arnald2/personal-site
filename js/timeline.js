// Circular Camera Dial Timeline (Vertical Scroll + Rotary Zoom Dial)
function initTimeline() {
    const container = document.getElementById('about-container');
    if (!container) return;

    const timelinePanel = container.querySelector('.timeline-panel');
    const storyPanel = container.querySelector('.story-panel');
    const markers = Array.from(container.querySelectorAll('.timeline-marker'));
    const milestones = Array.from(container.querySelectorAll('.story-milestone'));

    if (!timelinePanel || !storyPanel || markers.length === 0 || milestones.length === 0) return;

    // Circular Camera Dial Geometry
    const DIAL_RADIUS = 195;
    const STEP_ANGLE_DEG = 23; // Angular separation per milestone on the round dial
    const FOCAL_OFFSET_Y = 95; // Distance from top of storyPanel where active milestone locks in

    // Remove old straight vertical track if present
    const oldTrack = timelinePanel.querySelector('.vertical-timeline-track');
    if (oldTrack) {
        oldTrack.remove();
    }

    // Remove any existing dial assembly if re-initializing
    const existingDial = timelinePanel.querySelector('.camera-dial-assembly');
    if (existingDial) {
        existingDial.remove();
    }

    // Generate fine camera lens tick marks around the 360-degree ring
    const ticksSVG = [];
    for (let deg = 0; deg < 360; deg += (STEP_ANGLE_DEG / 5)) {
        const isMajor = Math.abs(deg % STEP_ANGLE_DEG) < 0.5 || Math.abs((deg % STEP_ANGLE_DEG) - STEP_ANGLE_DEG) < 0.5;
        const rad = (deg * Math.PI) / 180;
        const innerR = isMajor ? DIAL_RADIUS - 12 : DIAL_RADIUS - 6;
        const outerR = DIAL_RADIUS;
        const x1 = DIAL_RADIUS + innerR * Math.cos(rad);
        const y1 = DIAL_RADIUS + innerR * Math.sin(rad);
        const x2 = DIAL_RADIUS + outerR * Math.cos(rad);
        const y2 = DIAL_RADIUS + outerR * Math.sin(rad);
        ticksSVG.push(
            `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" class="dial-tick ${isMajor ? 'dial-tick-major' : ''}" />`
        );
    }

    const dialOverlay = document.createElement('div');
    dialOverlay.className = 'camera-dial-assembly';
    dialOverlay.innerHTML = `
        <div class="camera-dial-wheel" id="camera-dial-wheel">
            <svg viewBox="0 0 ${DIAL_RADIUS * 2} ${DIAL_RADIUS * 2}" class="camera-dial-svg">
                <circle cx="${DIAL_RADIUS}" cy="${DIAL_RADIUS}" r="${DIAL_RADIUS}" class="dial-outer-ring" />
                <circle cx="${DIAL_RADIUS}" cy="${DIAL_RADIUS}" r="${DIAL_RADIUS - 16}" class="dial-inner-ring" />
                <g class="dial-ticks-group">
                    ${ticksSVG.join('')}
                </g>
            </svg>
        </div>
        <div class="camera-dial-focus-window" aria-hidden="true"></div>
        <div class="camera-dial-focus-notch" aria-hidden="true">
            <span class="focus-chevron"></span>
        </div>
    `;
    timelinePanel.prepend(dialOverlay);

    const dialWheel = timelinePanel.querySelector('#camera-dial-wheel');

    // Map each marker to its corresponding milestone element
    const pairs = markers.map((marker) => {
        const targetId = marker.getAttribute('data-for');
        const milestone = targetId ? container.querySelector(`#${targetId}`) : null;
        return { marker, milestone };
    }).filter(p => p.milestone);

    if (pairs.length === 0) return;

    let animFrameId = null;
    let hasInitializedScroll = false;

    // Position all year numbers along the circular camera dial and zoom in on the middle one
    function renderDial(continuousIdx) {
        // Rotate the physical camera tick wheel to match the scroll position
        if (dialWheel) {
            const wheelRotDeg = -continuousIdx * STEP_ANGLE_DEG;
            dialWheel.style.transform = `translateY(-50%) rotate(${wheelRotDeg.toFixed(2)}deg)`;
        }

        const closestIdx = Math.round(continuousIdx);

        pairs.forEach((pair, idx) => {
            const { marker, milestone } = pair;
            const d = idx - continuousIdx; // Fractional distance from center focal point
            const absD = Math.abs(d);

            const thetaDeg = d * STEP_ANGLE_DEG;
            const thetaRad = (thetaDeg * Math.PI) / 180;

            // Hide numbers that wrap past the top/bottom poles of the circular dial
            if (Math.abs(thetaDeg) > 86) {
                marker.style.opacity = '0';
                marker.style.pointerEvents = 'none';
                marker.style.transform = `translate3d(-${DIAL_RADIUS}px, ${d > 0 ? DIAL_RADIUS : -DIAL_RADIUS}px, 0) scale(0.3)`;
                marker.classList.remove('active');
                if (milestone) milestone.classList.remove('active');
                return;
            }

            // Circular arc coordinates relative to the rightmost apex (0 deg) of the round dial
            const x = -DIAL_RADIUS * (1 - Math.cos(thetaRad));
            const y = DIAL_RADIUS * Math.sin(thetaRad);

            // Camera Lens Zoom: dramatic magnification in the center (d = 0), shrinking along the curve
            const zoomPeak = Math.exp(-0.85 * d * d);
            const scale = 0.38 + 1.36 * zoomPeak; // 1.74x at middle, ~0.96x at ±1, ~0.43x at ±2, ~0.38x further out

            // Radial tilt following the curvature of the round camera dial
            const tiltDeg = d * 8.5;

            // Opacity falloff toward the top/bottom edges of the dial
            const cosVal = Math.max(0, Math.cos(thetaRad));
            const opacity = Math.max(0.18, Math.pow(cosVal, 1.9));

            marker.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${tiltDeg.toFixed(1)}deg)`;
            marker.style.opacity = opacity.toFixed(3);
            marker.style.pointerEvents = 'auto';
            marker.style.zIndex = String(100 - Math.round(absD * 10));

            const isActive = idx === closestIdx;
            marker.classList.toggle('active', isActive);
            if (milestone) {
                milestone.classList.toggle('active', isActive);
            }
        });
    }

    // Measure continuous fractional milestone index [0 .. N-1] from storyPanel scroll position
    function computeContinuousIndexFromScroll() {
        const panelRect = storyPanel.getBoundingClientRect();
        if (panelRect.height === 0) {
            const initialActive = pairs.findIndex(p => p.marker.classList.contains('active'));
            return initialActive >= 0 ? initialActive : 0;
        }

        const anchorY = panelRect.top + FOCAL_OFFSET_Y;

        // Collect each milestone's header vertical position
        const centers = pairs.map(({ milestone }) => {
            const header = milestone.querySelector('.milestone-header') || milestone;
            const rect = header.getBoundingClientRect();
            return rect.top + rect.height * 0.35;
        });

        if (anchorY <= centers[0]) {
            return 0;
        }
        const lastIdx = centers.length - 1;
        if (anchorY >= centers[lastIdx]) {
            return lastIdx;
        }

        for (let i = 0; i < lastIdx; i++) {
            const c1 = centers[i];
            const c2 = centers[i + 1];
            if (anchorY >= c1 && anchorY <= c2) {
                const span = c2 - c1;
                const t = span > 1 ? (anchorY - c1) / span : 0;
                return i + t;
            }
        }
        return 0;
    }

    function scrollToMilestoneIndex(idx, smooth = true) {
        const pair = pairs[idx];
        if (!pair || !pair.milestone) return;
        const header = pair.milestone.querySelector('.milestone-header') || pair.milestone;
        const panelRect = storyPanel.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        const targetScrollTop = headerRect.top - panelRect.top + storyPanel.scrollTop - FOCAL_OFFSET_Y + headerRect.height * 0.35;

        storyPanel.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: smooth ? 'smooth' : 'auto'
        });
    }

    // Scroll listener on storyPanel rotates the circular dial and zooms the center number continuously
    storyPanel.addEventListener('scroll', () => {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(() => {
            renderDial(computeContinuousIndexFromScroll());
        });
    }, { passive: true });

    // Clicking any year on the circular dial smoothly rotates that year into the center zoom window
    pairs.forEach((_, idx) => {
        pairs[idx].marker.addEventListener('click', () => {
            scrollToMilestoneIndex(idx, true);
        });
    });

    // Scrolling the mouse wheel / trackpad over the dial itself turns the dial and scrolls the story
    timelinePanel.addEventListener('wheel', (e) => {
        e.preventDefault();
        storyPanel.scrollTop += e.deltaY;
    }, { passive: false });

    // Initial active index (e.g. 0 for Life 1990, 1 for Career 2008)
    let initialIdx = pairs.findIndex(p => p.marker.classList.contains('active'));
    if (initialIdx < 0) initialIdx = 0;

    // Observe layout visibility (e.g. when switching to the #about tab) so the dial positions accurately
    const resizeObserver = new ResizeObserver(() => {
        const panelRect = storyPanel.getBoundingClientRect();
        if (panelRect.height > 0) {
            if (!hasInitializedScroll) {
                hasInitializedScroll = true;
                if (initialIdx > 0) {
                    scrollToMilestoneIndex(initialIdx, false);
                }
            }
            renderDial(computeContinuousIndexFromScroll());
        }
    });
    resizeObserver.observe(storyPanel);

    // Render immediately in case #about is already visible
    renderDial(initialIdx);
}
