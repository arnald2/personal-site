// Blog functionality with Artisanal Rotary Tag Selector
let currentFilterTag = 'All';

function getSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

// Bespoke minimalist line-art SVG emblems for each tag station
function getTagEmblemSVG(tag) {
    const lower = tag.toLowerCase();
    if (lower === 'all') {
        // Watchmaker's 4-point compass star / astrolabe reticle
        return `
            <circle cx="0" cy="0" r="6.5" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.55" />
            <path d="M0 -8.5 L1.8 -1.8 L8.5 0 L1.8 1.8 L0 8.5 L-1.8 1.8 L-8.5 0 L-1.8 -1.8 Z" fill="currentColor" opacity="0.85" />
        `;
    }
    if (lower.includes('art') || lower.includes('ai')) {
        // Artisanal Sparkle Prism & Brush Curve
        return `
            <path d="M0 -8 C1.2 -2.5, 2.5 -1.2, 8 0 C2.5 1.2, 1.2 2.5, 0 8 C-1.2 2.5, -2.5 1.2, -8 0 C-2.5 -1.2, -1.2 -2.5, 0 -8 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
            <circle cx="5.5" cy="-5.5" r="1.3" fill="var(--accent)" />
            <circle cx="-5.5" cy="5.5" r="1" fill="currentColor" />
        `;
    }
    if (lower.includes('photo')) {
        // Classic Camera Aperture / Lens Diaphragm
        return `
            <circle cx="0" cy="0" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4" />
            <circle cx="0" cy="0" r="3.2" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.7" />
            <line x1="-5.2" y1="-5.2" x2="1.5" y2="-3" stroke="currentColor" stroke-width="1.1" />
            <line x1="5.2" y1="-5.2" x2="3" y2="1.5" stroke="currentColor" stroke-width="1.1" />
            <line x1="5.2" y1="5.2" x2="-1.5" y2="3" stroke="currentColor" stroke-width="1.1" />
            <line x1="-5.2" y1="5.2" x2="-3" y2="-1.5" stroke="currentColor" stroke-width="1.1" />
        `;
    }
    if (lower.includes('code') || lower.includes('dev')) {
        // Precision < / > Terminal Emblem
        return `
            <polyline points="-4,-4.5 -8.5,0 -4,4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="4,-4.5 8.5,0 4,4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <line x1="1.8" y1="-5.5" x2="-1.8" y2="5.5" stroke="var(--accent)" stroke-width="1.4" stroke-linecap="round" />
        `;
    }
    // Fallback: Fountain Pen Nib / Diamond
    return `
        <path d="M0 -7.5 L5.5 0 L0 7.5 L-5.5 0 Z" fill="none" stroke="currentColor" stroke-width="1.4" />
        <circle cx="0" cy="0" r="1.5" fill="currentColor" />
    `;
}

function renderFilterBar() {
    const filterBar = document.getElementById('filter-bar');
    if (!filterBar) return;

    const blogPosts = window.contentData ? window.contentData.blogPosts : [];

    // Collect unique tags and post counts
    const tagCounts = new Map();
    tagCounts.set('All', blogPosts.length);
    blogPosts.forEach(post => {
        (post.tags || []).forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
    });

    const tags = Array.from(tagCounts.keys());
    const numTags = tags.length;
    const SPAN_DEG = 124; // -62 deg to +62 deg
    const startDeg = -SPAN_DEG / 2;

    const tagAngles = tags.map((_, idx) =>
        numTags > 1 ? startDeg + (idx * SPAN_DEG) / (numTags - 1) : 0
    );

    const activeIdx = Math.max(0, tags.indexOf(currentFilterTag));
    const activeAngle = tagAngles[activeIdx] || 0;

    // If the SVG instrument gauge is already mounted with the same tags, smoothly animate the needle & active states!
    const existingSvg = filterBar.querySelector('.blog-dial-svg');
    if (existingSvg && existingSvg.getAttribute('data-tags') === tags.join('|')) {
        const rotor = existingSvg.querySelector('.blog-dial-rotor');
        if (rotor) {
            rotor.style.transform = `rotate(${activeAngle.toFixed(2)}deg)`;
        }
        const stations = existingSvg.querySelectorAll('.blog-tag-station');
        stations.forEach((st) => {
            const stTag = st.getAttribute('data-tag');
            st.classList.toggle('active', stTag === currentFilterTag);
        });
        return;
    }

    // Geometry constants for the Semicircular Watchmaker Gauge (viewBox 0 0 500 176)
    const CX = 250;
    const CY = 142;
    const R_OUTER = 92;
    const R_INNER = 76;

    function polarToXY(r, angleDeg) {
        const rad = (angleDeg * Math.PI) / 180;
        return {
            x: CX + r * Math.sin(rad),
            y: CY - r * Math.cos(rad)
        };
    }

    // Build fine calibration ticks along the gauge arc (-72 deg to +72 deg)
    const ticksMarkup = [];
    for (let deg = -72; deg <= 72; deg += 3) {
        const isStationTick = tagAngles.some(a => Math.abs(a - deg) < 1.6);
        const p1 = polarToXY(isStationTick ? R_OUTER - 11 : R_OUTER - 5.5, deg);
        const p2 = polarToXY(R_OUTER, deg);
        ticksMarkup.push(
            `<line x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" class="blog-gauge-tick ${isStationTick ? 'blog-gauge-tick-major' : ''}" />`
        );
    }

    // Build outer & inner arc paths (-72 deg to +72 deg)
    const arcLeftOuter = polarToXY(R_OUTER, -72);
    const arcRightOuter = polarToXY(R_OUTER, 72);
    const arcLeftInner = polarToXY(R_INNER, -72);
    const arcRightInner = polarToXY(R_INNER, 72);

    // Build knurled turret wheel notches around the central hub (r = 20)
    const knurlMarkup = [];
    for (let deg = 0; deg < 360; deg += 15) {
        const k1 = polarToXY(17, deg);
        const k2 = polarToXY(21, deg);
        knurlMarkup.push(
            `<line x1="${k1.x.toFixed(2)}" y1="${k1.y.toFixed(2)}" x2="${k2.x.toFixed(2)}" y2="${k2.y.toFixed(2)}" stroke="var(--text-muted)" stroke-width="1" opacity="0.45" />`
        );
    }

    // Build clickable Tag Stations along the rim
    const stationsMarkup = tags.map((tag, idx) => {
        const angle = tagAngles[idx];
        const pipPos = polarToXY(R_OUTER, angle);
        const emblemPos = polarToXY(R_OUTER + 23, angle);
        const labelPos = polarToXY(R_OUTER + 42, angle);
        const count = tagCounts.get(tag) || 0;
        const isActive = tag === currentFilterTag;

        let textAnchor = 'middle';
        let labelDx = 0;
        if (angle < -24) {
            textAnchor = 'end';
            labelDx = -4;
        } else if (angle > 24) {
            textAnchor = 'start';
            labelDx = 4;
        }

        return `
            <g class="blog-tag-station ${isActive ? 'active' : ''}" data-tag="${tag}" role="button" tabindex="0" aria-label="Filter by ${tag} (${count} posts)">
                <!-- Invisible generous hit target -->
                <circle cx="${emblemPos.x.toFixed(2)}" cy="${emblemPos.y.toFixed(2)}" r="26" fill="transparent" />

                <!-- Jeweled Station Detent on the Arc -->
                <circle class="station-pip" cx="${pipPos.x.toFixed(2)}" cy="${pipPos.y.toFixed(2)}" r="3.5" />

                <!-- Hand-Crafted Vector Emblem -->
                <g class="station-emblem" transform="translate(${emblemPos.x.toFixed(2)}, ${emblemPos.y.toFixed(2)})">
                    ${getTagEmblemSVG(tag)}
                </g>

                <!-- Engraved Tag Label & Count -->
                <text x="${(labelPos.x + labelDx).toFixed(2)}" y="${(labelPos.y + 3).toFixed(2)}" text-anchor="${textAnchor}" class="station-label">
                    ${tag.toUpperCase()}<tspan class="station-count"> [${count}]</tspan>
                </text>
            </g>
        `;
    }).join('');

    filterBar.className = 'blog-instrument-wrapper';
    filterBar.innerHTML = `
        <div class="blog-dial-container" title="Click a topic station or turn the dial">
            <svg class="blog-dial-svg" data-tags="${tags.join('|')}" viewBox="0 0 500 176" preserveAspectRatio="xMidYMid meet">
                <!-- Static Instrument Stand, Plinth & Calibration Arcs -->
                <g class="blog-dial-stand">
                    <!-- Soft Ground Shadow -->
                    <ellipse cx="${CX}" cy="164" rx="58" ry="3.5" fill="var(--text-muted)" opacity="0.15" />

                    <!-- Stepped Architectural Base Plinth (matches Balance Scale) -->
                    <path d="M198 158 C202 149, 215 146, ${CX} 146 C285 146, 298 149, 302 158 Z" fill="var(--text-muted)" opacity="0.35" stroke="var(--text-muted)" stroke-width="1" stroke-opacity="0.5" />
                    <rect x="186" y="158" width="128" height="4.5" rx="2.2" fill="var(--text-muted)" opacity="0.55" />

                    <!-- Outer & Inner Precision Protractor Arcs -->
                    <path d="M ${arcLeftOuter.x.toFixed(2)} ${arcLeftOuter.y.toFixed(2)} A ${R_OUTER} ${R_OUTER} 0 0 1 ${arcRightOuter.x.toFixed(2)} ${arcRightOuter.y.toFixed(2)}" fill="none" stroke="var(--border)" stroke-width="1.6" />
                    <path d="M ${arcLeftInner.x.toFixed(2)} ${arcLeftInner.y.toFixed(2)} A ${R_INNER} ${R_INNER} 0 0 1 ${arcRightInner.x.toFixed(2)} ${arcRightInner.y.toFixed(2)}" fill="none" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 5" opacity="0.65" />

                    <!-- Fine Radial Guide Spokes to Each Tag Station -->
                    ${tagAngles.map(angle => {
                        const innerP = polarToXY(24, angle);
                        const outerP = polarToXY(R_INNER, angle);
                        return `<line x1="${innerP.x.toFixed(2)}" y1="${innerP.y.toFixed(2)}" x2="${outerP.x.toFixed(2)}" y2="${outerP.y.toFixed(2)}" stroke="var(--border)" stroke-width="1" stroke-dasharray="2 4" opacity="0.5" />`;
                    }).join('')}

                    <!-- Calibration Degree Ticks -->
                    <g class="blog-gauge-ticks">
                        ${ticksMarkup.join('')}
                    </g>
                </g>

                <!-- Rotating Watchmaker's Turret & Indicator Needle (Pivots at CX, CY) -->
                <g class="blog-dial-rotor" style="transform: rotate(${activeAngle.toFixed(2)}deg);">
                    <!-- Knurled Gear Wheel -->
                    <circle cx="${CX}" cy="${CY}" r="21" fill="var(--card-bg)" stroke="var(--border)" stroke-width="1.4" />
                    ${knurlMarkup.join('')}

                    <!-- Counterweight Tail -->
                    <path d="M ${CX - 2.5} ${CY} L ${CX} ${CY + 14} L ${CX + 2.5} ${CY} Z" fill="var(--text-muted)" opacity="0.6" />

                    <!-- Tapered Watchmaker's Indicator Needle -->
                    <path class="blog-dial-needle" d="M ${CX - 3.2} ${CY} L ${CX - 1.2} ${CY - R_OUTER + 18} L ${CX} ${CY - R_OUTER + 4} L ${CX + 1.2} ${CY - R_OUTER + 18} L ${CX + 3.2} ${CY} Z" fill="var(--accent)" />
                    <!-- Open Breguet-Style Eye on the Needle -->
                    <circle cx="${CX}" cy="${CY - R_OUTER + 24}" r="3.2" fill="var(--card-bg)" stroke="var(--accent)" stroke-width="1.5" />

                    <!-- Central Jeweled Pivot Hub -->
                    <circle cx="${CX}" cy="${CY}" r="11" fill="var(--card-bg)" stroke="var(--text)" stroke-width="1.6" />
                    <circle cx="${CX}" cy="${CY}" r="4.2" fill="var(--accent)" />
                </g>

                <!-- Interactive Topic Stations Along the Arc -->
                <g class="blog-dial-stations">
                    ${stationsMarkup}
                </g>
            </svg>
        </div>
    `;

    // Attach click & keyboard listeners to each station
    filterBar.querySelectorAll('.blog-tag-station').forEach(station => {
        station.addEventListener('click', () => {
            const tag = station.getAttribute('data-tag');
            if (tag) setFilter(tag);
        });
        station.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const tag = station.getAttribute('data-tag');
                if (tag) setFilter(tag);
            }
        });
    });

    // Clicking the central turret hub cycles to the next topic!
    const rotorHub = filterBar.querySelector('.blog-dial-rotor');
    if (rotorHub) {
        rotorHub.style.cursor = 'pointer';
        rotorHub.addEventListener('click', () => {
            const nextIdx = (tags.indexOf(currentFilterTag) + 1) % tags.length;
            setFilter(tags[nextIdx]);
        });
    }
}

window.setFilter = function (tag) {
    window.location.hash = `blog?tag=${encodeURIComponent(tag)}`;
};

function renderBlogPosts(filterTag = 'All') {
    const container = document.getElementById('blog-container');
    if (!container) return;

    const blogPosts = window.contentData ? window.contentData.blogPosts : [];
    currentFilterTag = filterTag;
    renderFilterBar();

    const filtered = filterTag === 'All'
        ? blogPosts
        : blogPosts.filter(post => post.tags.includes(filterTag));

    if (filtered.length === 0) {
        container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No posts found for this topic.</div>`;
        return;
    }

    container.innerHTML = filtered.map((post, idx) => {
        const slug = getSlug(post.title);
        const indexStamp = String(idx + 1).padStart(2, '0');
        return `
            <div class="blog-row" onclick="viewPost('${slug}')">
                <div class="blog-date">
                    <span class="blog-index-stamp">${indexStamp}</span>
                    <span>${post.date}</span>
                </div>
                <div class="blog-main-col">
                    <div class="blog-title">${post.title}</div>
                    ${post.excerpt ? `<div class="blog-excerpt-line">${post.excerpt.replace(/^"|"$/g, '')}</div>` : ''}
                </div>
                <div class="blog-tags-small">
                    ${post.tags.map(tag => `<span class="tag-small">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');

    if (typeof observeElements === 'function') observeElements();
}

window.viewPost = function (slug) {
    window.location.hash = `blog?post=${slug}`;
};

function renderBlogPost(slug) {
    const blogPosts = window.contentData ? window.contentData.blogPosts : [];
    const post = blogPosts.find(p => getSlug(p.title) === slug);

    if (!post) {
        showBlogList();
        return;
    }

    const singleView = document.getElementById('blog-single-view');
    const listView = document.getElementById('blog-list-view');
    const contentContainer = document.getElementById('single-post-content');
    const filterBar = document.getElementById('filter-bar');

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
    if (filterBar) filterBar.style.display = 'none';
    singleView.classList.add('active');
}

function showBlogList(tag = 'All') {
    const singleView = document.getElementById('blog-single-view');
    const listView = document.getElementById('blog-list-view');
    const filterBar = document.getElementById('filter-bar');

    if (singleView) singleView.classList.remove('active');
    if (listView) listView.style.display = 'block';
    if (filterBar) filterBar.style.display = 'flex';

    renderBlogPosts(tag);
}
