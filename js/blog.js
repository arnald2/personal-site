// Blog functionality with Artisanal Rotary Tag Selector & "Bark" Morphing Vector Experience
let currentFilterTag = 'All';
let barkScrollHandler = null;
let barkAnimFrame = null;

function getSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

// Bespoke minimalist line-art SVG emblems for each tag station
function getTagEmblemSVG(tag) {
    const lower = tag.toLowerCase();
    if (lower === 'all') {
        return `
            <circle cx="0" cy="0" r="6.5" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.55" />
            <path d="M0 -8.5 L1.8 -1.8 L8.5 0 L1.8 1.8 L0 8.5 L-1.8 1.8 L-8.5 0 L-1.8 -1.8 Z" fill="currentColor" opacity="0.85" />
        `;
    }
    if (lower.includes('art') || lower.includes('ai')) {
        return `
            <path d="M0 -8 C1.2 -2.5, 2.5 -1.2, 8 0 C2.5 1.2, 1.2 2.5, 0 8 C-1.2 2.5, -2.5 1.2, -8 0 C-2.5 -1.2, -1.2 -2.5, 0 -8 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
            <circle cx="5.5" cy="-5.5" r="1.3" fill="var(--accent)" />
            <circle cx="-5.5" cy="5.5" r="1" fill="currentColor" />
        `;
    }
    if (lower.includes('photo')) {
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
        return `
            <polyline points="-4,-4.5 -8.5,0 -4,4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="4,-4.5 8.5,0 4,4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <line x1="1.8" y1="-5.5" x2="-1.8" y2="5.5" stroke="var(--accent)" stroke-width="1.4" stroke-linecap="round" />
        `;
    }
    return `
        <path d="M0 -7.5 L5.5 0 L0 7.5 L-5.5 0 Z" fill="none" stroke="currentColor" stroke-width="1.4" />
        <circle cx="0" cy="0" r="1.5" fill="currentColor" />
    `;
}

function renderFilterBar() {
    const filterBar = document.getElementById('filter-bar');
    if (!filterBar) return;

    const blogPosts = window.contentData ? window.contentData.blogPosts : [];

    const tagCounts = new Map();
    tagCounts.set('All', blogPosts.length);
    blogPosts.forEach(post => {
        (post.tags || []).forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
    });

    const tags = Array.from(tagCounts.keys());
    const numTags = tags.length;
    const SPAN_DEG = 124;
    const startDeg = -SPAN_DEG / 2;

    const tagAngles = tags.map((_, idx) =>
        numTags > 1 ? startDeg + (idx * SPAN_DEG) / (numTags - 1) : 0
    );

    const activeIdx = Math.max(0, tags.indexOf(currentFilterTag));
    const activeAngle = tagAngles[activeIdx] || 0;

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

    const ticksMarkup = [];
    for (let deg = -72; deg <= 72; deg += 3) {
        const isStationTick = tagAngles.some(a => Math.abs(a - deg) < 1.6);
        const p1 = polarToXY(isStationTick ? R_OUTER - 11 : R_OUTER - 5.5, deg);
        const p2 = polarToXY(R_OUTER, deg);
        ticksMarkup.push(
            `<line x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" class="blog-gauge-tick ${isStationTick ? 'blog-gauge-tick-major' : ''}" />`
        );
    }

    const arcLeftOuter = polarToXY(R_OUTER, -72);
    const arcRightOuter = polarToXY(R_OUTER, 72);
    const arcLeftInner = polarToXY(R_INNER, -72);
    const arcRightInner = polarToXY(R_INNER, 72);

    const knurlMarkup = [];
    for (let deg = 0; deg < 360; deg += 15) {
        const k1 = polarToXY(17, deg);
        const k2 = polarToXY(21, deg);
        knurlMarkup.push(
            `<line x1="${k1.x.toFixed(2)}" y1="${k1.y.toFixed(2)}" x2="${k2.x.toFixed(2)}" y2="${k2.y.toFixed(2)}" stroke="var(--text-muted)" stroke-width="1" opacity="0.45" />`
        );
    }

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
                <circle cx="${emblemPos.x.toFixed(2)}" cy="${emblemPos.y.toFixed(2)}" r="26" fill="transparent" />
                <circle class="station-pip" cx="${pipPos.x.toFixed(2)}" cy="${pipPos.y.toFixed(2)}" r="3.5" />
                <g class="station-emblem" transform="translate(${emblemPos.x.toFixed(2)}, ${emblemPos.y.toFixed(2)})">
                    ${getTagEmblemSVG(tag)}
                </g>
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
                <g class="blog-dial-stand">
                    <ellipse cx="${CX}" cy="164" rx="58" ry="3.5" fill="var(--text-muted)" opacity="0.15" />
                    <path d="M198 158 C202 149, 215 146, ${CX} 146 C285 146, 298 149, 302 158 Z" fill="var(--text-muted)" opacity="0.35" stroke="var(--text-muted)" stroke-width="1" stroke-opacity="0.5" />
                    <rect x="186" y="158" width="128" height="4.5" rx="2.2" fill="var(--text-muted)" opacity="0.55" />
                    <path d="M ${arcLeftOuter.x.toFixed(2)} ${arcLeftOuter.y.toFixed(2)} A ${R_OUTER} ${R_OUTER} 0 0 1 ${arcRightOuter.x.toFixed(2)} ${arcRightOuter.y.toFixed(2)}" fill="none" stroke="var(--border)" stroke-width="1.6" />
                    <path d="M ${arcLeftInner.x.toFixed(2)} ${arcLeftInner.y.toFixed(2)} A ${R_INNER} ${R_INNER} 0 0 1 ${arcRightInner.x.toFixed(2)} ${arcRightInner.y.toFixed(2)}" fill="none" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 5" opacity="0.65" />
                    ${tagAngles.map(angle => {
                        const innerP = polarToXY(24, angle);
                        const outerP = polarToXY(R_INNER, angle);
                        return `<line x1="${innerP.x.toFixed(2)}" y1="${innerP.y.toFixed(2)}" x2="${outerP.x.toFixed(2)}" y2="${outerP.y.toFixed(2)}" stroke="var(--border)" stroke-width="1" stroke-dasharray="2 4" opacity="0.5" />`;
                    }).join('')}
                    <g class="blog-gauge-ticks">
                        ${ticksMarkup.join('')}
                    </g>
                </g>

                <g class="blog-dial-rotor" style="transform: rotate(${activeAngle.toFixed(2)}deg);">
                    <circle cx="${CX}" cy="${CY}" r="21" fill="var(--card-bg)" stroke="var(--border)" stroke-width="1.4" />
                    ${knurlMarkup.join('')}
                    <path d="M ${CX - 2.5} ${CY} L ${CX} ${CY + 14} L ${CX + 2.5} ${CY} Z" fill="var(--text-muted)" opacity="0.6" />
                    <path class="blog-dial-needle" d="M ${CX - 3.2} ${CY} L ${CX - 1.2} ${CY - R_OUTER + 18} L ${CX} ${CY - R_OUTER + 4} L ${CX + 1.2} ${CY - R_OUTER + 18} L ${CX + 3.2} ${CY} Z" fill="var(--accent)" />
                    <circle cx="${CX}" cy="${CY - R_OUTER + 24}" r="3.2" fill="var(--card-bg)" stroke="var(--accent)" stroke-width="1.5" />
                    <circle cx="${CX}" cy="${CY}" r="11" fill="var(--card-bg)" stroke="var(--text)" stroke-width="1.6" />
                    <circle cx="${CX}" cy="${CY}" r="4.2" fill="var(--accent)" />
                </g>

                <g class="blog-dial-stations">
                    ${stationsMarkup}
                </g>
            </svg>
        </div>
    `;

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

// ============================================================================
// "BARK" SPECIAL EXPERIENCE: MORPHING VECTOR BACKGROUNDS & ATMOSPHERE ENGINE
// ============================================================================

const BARK_THEMES = {
    thorns: {
        bg: '#08150c',
        surface: 'rgba(14, 34, 19, 0.80)',
        border: 'rgba(126, 217, 87, 0.32)',
        accent: '#80e055',
        secondary: '#d9823b',
        text: '#eef7eb',
        muted: '#a7c4a0',
        glow: 'rgba(128, 224, 85, 0.25)'
    },
    rainbow: {
        bg: '#16100e',
        surface: 'rgba(32, 22, 19, 0.80)',
        border: 'rgba(224, 122, 60, 0.35)',
        accent: '#9be548',
        secondary: '#e06d3b',
        text: '#faf3ee',
        muted: '#cbb8ab',
        glow: 'rgba(224, 109, 59, 0.28)'
    },
    aspen: {
        bg: '#0f1419',
        surface: 'rgba(22, 29, 36, 0.82)',
        border: 'rgba(245, 184, 46, 0.35)',
        accent: '#f5b82e',
        secondary: '#dce4ec',
        text: '#f4f7fa',
        muted: '#9fb0c2',
        glow: 'rgba(245, 184, 46, 0.25)'
    },
    furrowed: {
        bg: '#091322',
        surface: 'rgba(16, 29, 48, 0.82)',
        border: 'rgba(56, 189, 248, 0.35)',
        accent: '#38bdf8',
        secondary: '#eab308',
        text: '#f0f7ff',
        muted: '#9db7d4',
        glow: 'rgba(56, 189, 248, 0.25)'
    },
    oculus: {
        bg: '#0d0705',
        surface: 'rgba(26, 14, 10, 0.84)',
        border: 'rgba(224, 114, 60, 0.38)',
        accent: '#e87842',
        secondary: '#6ee7b7',
        text: '#fcefe8',
        muted: '#c7a493',
        glow: 'rgba(232, 120, 66, 0.28)'
    },
    cathedral: {
        bg: '#07120a',
        surface: 'rgba(16, 30, 19, 0.82)',
        border: 'rgba(163, 230, 53, 0.32)',
        accent: '#a3e635',
        secondary: '#c86432',
        text: '#f1f8ef',
        muted: '#a6c2a2',
        glow: 'rgba(163, 230, 53, 0.24)'
    },
    gnarled: {
        bg: '#14100c',
        surface: 'rgba(30, 24, 19, 0.84)',
        border: 'rgba(212, 163, 115, 0.35)',
        accent: '#deb07c',
        secondary: '#9c8268',
        text: '#f7f1ea',
        muted: '#bfb09f',
        glow: 'rgba(222, 176, 124, 0.25)'
    },
    portal: {
        bg: '#080b07',
        surface: 'rgba(18, 23, 16, 0.84)',
        border: 'rgba(132, 204, 22, 0.35)',
        accent: '#84cc16',
        secondary: '#e2e8f0',
        text: '#f2f7ed',
        muted: '#a8b89f',
        glow: 'rgba(132, 204, 22, 0.24)'
    }
};

// Bespoke inline Vector Bark Study badge for each Specimen card header
function getBarkStudyBadgeSVG(themeKey) {
    switch (themeKey) {
        case 'thorns':
            return `<svg viewBox="0 0 120 64" class="bark-vector-badge" aria-label="Thorny Bark Vector Study">
                <rect x="2" y="2" width="116" height="60" rx="8" fill="rgba(16,42,22,0.7)" stroke="#80e055" stroke-width="1" stroke-opacity="0.5"/>
                <!-- Thorn Cones -->
                <polygon points="18,48 28,16 38,48" fill="#5c5346" stroke="#a3b18a" stroke-width="1"/>
                <polygon points="28,16 38,48 31,50" fill="#3d372e"/>
                <polygon points="48,54 60,12 72,54" fill="#6b6052" stroke="#a3b18a" stroke-width="1"/>
                <polygon points="60,12 72,54 62,56" fill="#463f35"/>
                <polygon points="82,46 92,18 102,46" fill="#5c5346" stroke="#a3b18a" stroke-width="1"/>
                <!-- Tangled Ochre Vines -->
                <path d="M4,22 C34,6 56,44 116,18" fill="none" stroke="#d9823b" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M4,42 C44,58 72,14 116,38" fill="none" stroke="#e6a15c" stroke-width="2" stroke-linecap="round"/>
                <path d="M12,10 C42,38 78,34 108,54" fill="none" stroke="#80e055" stroke-width="1.3" stroke-dasharray="3 3" opacity="0.8"/>
            </svg>`;
        case 'rainbow':
            return `<svg viewBox="0 0 120 64" class="bark-vector-badge" aria-label="Rainbow Eucalyptus Vector Study">
                <rect x="2" y="2" width="116" height="60" rx="8" fill="rgba(26,18,16,0.75)" stroke="#e06d3b" stroke-width="1" stroke-opacity="0.5"/>
                <path d="M18,4 Q24,32 16,60 L34,60 Q42,32 34,4 Z" fill="#5b6059" opacity="0.85"/>
                <path d="M36,4 Q44,32 36,60 L50,60 Q58,32 50,4 Z" fill="#8ec947" opacity="0.9"/>
                <path d="M50,4 Q58,32 50,60 L72,60 Q80,32 72,4 Z" fill="#b84a27" opacity="0.9"/>
                <path d="M72,4 Q80,32 72,60 L88,60 Q94,32 86,4 Z" fill="#e07a3c" opacity="0.9"/>
                <path d="M86,4 Q94,32 88,60 L106,60 Q110,32 104,4 Z" fill="#6b7068" opacity="0.8"/>
            </svg>`;
        case 'aspen':
            return `<svg viewBox="0 0 120 64" class="bark-vector-badge" aria-label="Aspen Eyes Vector Study">
                <rect x="2" y="2" width="116" height="60" rx="8" fill="rgba(20,26,32,0.8)" stroke="#f5b82e" stroke-width="1" stroke-opacity="0.5"/>
                <rect x="16" y="3" width="36" height="58" fill="#d8e0e5" opacity="0.88"/>
                <rect x="66" y="3" width="38" height="58" fill="#cbd5e1" opacity="0.82"/>
                <!-- Almond Aspen Eyes -->
                <path d="M21,26 Q34,15 47,26 Q34,37 21,26 Z" fill="#1e2428" stroke="#475569" stroke-width="1.2"/>
                <circle cx="34" cy="26" r="4.2" fill="#0f172a" stroke="#94a3b8" stroke-width="1"/>
                <path d="M72,40 Q85,30 98,40 Q85,50 72,40 Z" fill="#1e2428" stroke="#475569" stroke-width="1.2"/>
                <circle cx="85" cy="40" r="3.8" fill="#0f172a" stroke="#94a3b8" stroke-width="1"/>
                <!-- Golden Leaves -->
                <circle cx="58" cy="18" r="5" fill="#f5b82e" opacity="0.9"/>
                <circle cx="14" cy="48" r="4" fill="#eab308" opacity="0.85"/>
                <circle cx="106" cy="20" r="4.5" fill="#f5b82e" opacity="0.9"/>
            </svg>`;
        case 'furrowed':
            return `<svg viewBox="0 0 120 64" class="bark-vector-badge" aria-label="Converging Furrows Vector Study">
                <rect x="2" y="2" width="116" height="60" rx="8" fill="rgba(10,20,38,0.85)" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.5"/>
                <circle cx="60" cy="10" r="14" fill="rgba(56,189,248,0.25)"/>
                <path d="M8,61 L56,12 M26,61 L58,12 M44,61 L60,12 M60,61 L60,12 M76,61 L60,12 M94,61 L62,12 M112,61 L64,12" stroke="#a3917d" stroke-width="2" stroke-linecap="round"/>
                <path d="M18,46 L34,36 L48,48 L60,34 L72,48 L86,36 L102,46" fill="none" stroke="#d4b13b" stroke-width="1.2" opacity="0.8"/>
            </svg>`;
        case 'oculus':
            return `<svg viewBox="0 0 120 64" class="bark-vector-badge" aria-label="Redwood Oculus Vector Study">
                <rect x="2" y="2" width="116" height="60" rx="8" fill="#0d0705" stroke="#e87842" stroke-width="1" stroke-opacity="0.5"/>
                <ellipse cx="60" cy="32" rx="46" ry="25" fill="none" stroke="#5c2d16" stroke-width="1.5" stroke-dasharray="6 3"/>
                <ellipse cx="60" cy="32" rx="30" ry="17" fill="none" stroke="#c96432" stroke-width="1.8"/>
                <path d="M60,32 L20,60 M60,32 L45,60 M60,32 L75,60 M60,32 L100,60" stroke="#e87842" stroke-width="1.5" opacity="0.75"/>
                <circle cx="60" cy="24" r="7.5" fill="#6ee7b7" stroke="#ffffff" stroke-width="1.5"/>
            </svg>`;
        case 'cathedral':
            return `<svg viewBox="0 0 120 64" class="bark-vector-badge" aria-label="Cathedral Redwood Vector Study">
                <rect x="2" y="2" width="116" height="60" rx="8" fill="rgba(8,20,12,0.85)" stroke="#a3e635" stroke-width="1" stroke-opacity="0.5"/>
                <path d="M22,60 C28,38 45,28 54,6 M38,60 C44,40 56,28 60,6 M58,60 C62,40 66,26 64,6 M78,60 C72,38 66,28 66,6 M96,60 C86,40 74,26 68,6" fill="none" stroke="#c86432" stroke-width="2.2" stroke-linecap="round"/>
                <ellipse cx="48" cy="22" rx="12" ry="6" fill="#2a1a14" stroke="#e07a47" stroke-width="1.2"/>
                <ellipse cx="72" cy="20" rx="11" ry="5.5" fill="#2a1a14" stroke="#e07a47" stroke-width="1.2"/>
            </svg>`;
        case 'gnarled':
            return `<svg viewBox="0 0 120 64" class="bark-vector-badge" aria-label="Molten Burl Topographic Vector Study">
                <rect x="2" y="2" width="116" height="60" rx="8" fill="rgba(22,17,13,0.85)" stroke="#deb07c" stroke-width="1" stroke-opacity="0.5"/>
                <path d="M10,32 C25,8 55,10 68,28 C80,46 100,44 110,22" fill="none" stroke="#deb07c" stroke-width="1.6"/>
                <path d="M14,42 C32,18 58,20 72,38 C84,52 98,50 108,34" fill="none" stroke="#9c8268" stroke-width="1.4"/>
                <ellipse cx="44" cy="30" rx="16" ry="9" fill="none" stroke="#c7b8a5" stroke-width="1.2"/>
                <ellipse cx="44" cy="30" rx="8" ry="4.5" fill="none" stroke="#deb07c" stroke-width="1.2"/>
            </svg>`;
        case 'portal':
        default:
            return `<svg viewBox="0 0 120 64" class="bark-vector-badge" aria-label="Hollow Birch Portal Vector Study">
                <rect x="2" y="2" width="116" height="60" rx="8" fill="rgba(10,14,9,0.88)" stroke="#84cc16" stroke-width="1" stroke-opacity="0.5"/>
                <circle cx="56" cy="32" r="23" fill="#050705" stroke="#a8a29e" stroke-width="4" stroke-dasharray="3 1.5"/>
                <circle cx="56" cy="32" r="18" fill="none" stroke="#78716c" stroke-width="1.2" stroke-dasharray="1.5 3"/>
                <!-- Delicate Wildflower Shoot -->
                <path d="M62,56 Q60,38 63,20" fill="none" stroke="#84cc16" stroke-width="1.8" stroke-linecap="round"/>
                <circle cx="63" cy="20" r="2.2" fill="#d9f99d"/>
                <ellipse cx="59" cy="30" rx="3" ry="1.4" transform="rotate(-25 59 30)" fill="#84cc16"/>
                <ellipse cx="66" cy="36" rx="3" ry="1.4" transform="rotate(25 66 36)" fill="#84cc16"/>
            </svg>`;
    }
}

// Build the 8 Full-Viewport Warping Vector Background Layers
function buildFullViewportBarkSVG() {
    // 1. THORNS: Multi-faceted geometric thorn cones & weaving Bezier vine tendrils
    const thornsCones = [];
    const coneCoords = [
        [90, 140, 1.1], [160, 260, 0.9], [70, 390, 1.25], [180, 520, 1.0], [105, 680, 1.15], [210, 790, 0.85],
        [1340, 150, 1.15], [1260, 290, 0.95], [1360, 430, 1.2], [1240, 570, 1.05], [1330, 710, 1.1], [1220, 820, 0.9],
        [310, 190, 0.75], [1120, 220, 0.8], [290, 640, 0.7], [1140, 660, 0.75]
    ];
    coneCoords.forEach(([cx, cy, sc]) => {
        const w = 38 * sc;
        const h = 52 * sc;
        thornsCones.push(`
            <g transform="translate(${cx}, ${cy})">
                <polygon points="${-w},0 0,${-h} ${w},0 0,${h * 0.35}" fill="#4a5d3f" fill-opacity="0.38" stroke="#80e055" stroke-width="1.2" stroke-opacity="0.45"/>
                <polygon points="0,${-h} ${w},0 0,${h * 0.35}" fill="#283622" fill-opacity="0.48"/>
                <circle cx="0" cy="${-h}" r="2.2" fill="#d9f99d" opacity="0.7"/>
            </g>
        `);
    });

    // 2.ASPEN EYES: Vertical birch trunks & tracking lenticel eyes
    const aspenEyes = [
        [130, 220, 1.1], [130, 560, 0.95], [280, 380, 0.85], [280, 720, 1.0],
        [1160, 250, 0.9], [1160, 610, 1.05], [1310, 410, 1.1], [1310, 740, 0.85]
    ].map(([ex, ey, sc]) => `
        <g transform="translate(${ex}, ${ey}) scale(${sc})">
            <path d="M-48,0 Q0,-28 48,0 Q0,28 -48,0 Z" fill="#0b0f14" fill-opacity="0.75" stroke="#94a3b8" stroke-width="1.8" stroke-opacity="0.5"/>
            <path d="M-62,0 Q0,-36 62,0 Q0,36 -62,0" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="4 4" opacity="0.45"/>
            <circle class="bark-warp-pupil" cx="0" cy="0" r="11" fill="#020617" stroke="#f5b82e" stroke-width="1.5" stroke-opacity="0.65"/>
            <circle class="bark-warp-pupil" cx="-3" cy="-3" r="3" fill="#f5b82e" opacity="0.6"/>
        </g>
    `).join('');

    // 5. OCULUS: Concentric charred & redwood heartwood rings
    const oculusRings = [1, 2, 3, 4, 5, 6, 7].map(i => {
        const rx = i * 95;
        const ry = i * 68;
        const isWarm = i % 2 === 0;
        return `<ellipse cx="720" cy="450" rx="${rx}" ry="${ry}" fill="none" stroke="${isWarm ? '#e0723c' : '#6ee7b7'}" stroke-width="${2.4 - i * 0.2}" stroke-dasharray="${12 + i * 5} ${8 + i * 3}" opacity="${0.48 - i * 0.045}" />`;
    }).join('');

    // 8. PORTAL: Radial end-grain wood check lines
    const portalRays = [];
    for (let deg = 0; deg < 360; deg += 10) {
        const rad = (deg * Math.PI) / 180;
        const r1 = 180 + (deg % 20 === 0 ? 0 : 25);
        const r2 = 420 + (deg % 30 === 0 ? 70 : 0);
        const x1 = 720 + r1 * Math.cos(rad);
        const y1 = 450 + r1 * Math.sin(rad);
        const x2 = 720 + r2 * Math.cos(rad);
        const y2 = 450 + r2 * Math.sin(rad);
        portalRays.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#cbd5e1" stroke-width="${deg % 20 === 0 ? '1.8' : '1'}" opacity="0.24" />`);
    }

    return `
        <svg class="bark-stage-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
                <!-- Subtle Organic Bark Warp Filter -->
                <filter id="bark-organic-warp" x="-10%" y="-10%" width="120%" height="120%">
                    <feTurbulence id="bark-turbulence" type="fractalNoise" baseFrequency="0.004 0.008" numOctaves="2" result="noise" />
                    <feDisplacementMap id="bark-displacement" in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
                </filter>

                <radialGradient id="oculus-center-glow" cx="50%" cy="50%" r="45%">
                    <stop offset="0%" stop-color="#6ee7b7" stop-opacity="0.38"/>
                    <stop offset="35%" stop-color="#e0723c" stop-opacity="0.22"/>
                    <stop offset="100%" stop-color="#0d0705" stop-opacity="0"/>
                </radialGradient>

                <radialGradient id="furrowed-sky-glow" cx="50%" cy="8%" r="55%">
                    <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.42"/>
                    <stop offset="40%" stop-color="#eab308" stop-opacity="0.16"/>
                    <stop offset="100%" stop-color="#091322" stop-opacity="0"/>
                </radialGradient>
            </defs>

            <!-- 01: THORNS & VINES LAYER -->
            <g class="bark-bg-layer active" data-layer="thorns" filter="url(#bark-organic-warp)">
                <!-- Chlorophyll Vertical Bark Striations -->
                <g opacity="0.25" stroke="#4d8c3a" stroke-width="2" stroke-dasharray="18 10">
                    <line x1="120" y1="0" x2="120" y2="900"/>
                    <line x1="240" y1="0" x2="240" y2="900"/>
                    <line x1="1200" y1="0" x2="1200" y2="900"/>
                    <line x1="1320" y1="0" x2="1320" y2="900"/>
                </g>
                <!-- Geometric Thorn Cones -->
                <g class="warp-group-a">
                    ${thornsCones.join('')}
                </g>
                <!-- Weaving Golden-Ochre Strangler Vines -->
                <g class="warp-group-b" fill="none" stroke-linecap="round">
                    <path d="M-100,160 C320,40 620,310 1020,140 C1240,50 1380,190 1540,120" stroke="#d9823b" stroke-width="5" opacity="0.42"/>
                    <path d="M-100,340 C280,480 680,190 1120,390 C1310,470 1420,330 1540,380" stroke="#e6a15c" stroke-width="3.5" opacity="0.36"/>
                    <path d="M-100,580 C380,420 740,720 1160,520 C1340,430 1440,610 1540,560" stroke="#d9823b" stroke-width="4.5" opacity="0.4"/>
                    <path d="M-100,760 C340,860 760,620 1180,790 C1350,850 1450,730 1540,770" stroke="#80e055" stroke-width="2.5" opacity="0.32"/>
                </g>
            </g>

            <!-- 02: RAINBOW EUCALYPTUS LAYER -->
            <g class="bark-bg-layer" data-layer="rainbow" filter="url(#bark-organic-warp)">
                <g class="warp-group-a" opacity="0.36">
                    <path d="M40,-100 C95,220 -10,560 55,1000 L175,1000 C115,560 215,220 160,-100 Z" fill="#5b6059"/>
                    <path d="M175,-100 C235,240 130,580 190,1000 L275,1000 C215,580 315,240 255,-100 Z" fill="#8ec947"/>
                    <path d="M275,-100 C335,260 235,600 295,1000 L420,1000 C360,600 460,260 400,-100 Z" fill="#b84a27"/>
                    <path d="M1040,-100 C1100,260 1000,600 1060,1000 L1185,1000 C1125,600 1225,260 1165,-100 Z" fill="#e07a3c"/>
                    <path d="M1185,-100 C1245,240 1145,580 1205,1000 L1295,1000 C1235,580 1335,240 1275,-100 Z" fill="#8ec947"/>
                    <path d="M1295,-100 C1355,220 1255,560 1315,1000 L1420,1000 C1360,560 1460,220 1400,-100 Z" fill="#b84a27"/>
                </g>
                <g class="warp-group-b" fill="none" stroke-width="2.2" opacity="0.45">
                    <path d="M175,-100 C235,240 130,580 190,1000" stroke="#bef264"/>
                    <path d="M275,-100 C335,260 235,600 295,1000" stroke="#fdba74"/>
                    <path d="M1185,-100 C1245,240 1145,580 1205,1000" stroke="#bef264"/>
                    <path d="M1295,-100 C1355,220 1255,560 1315,1000" stroke="#fdba74"/>
                </g>
            </g>

            <!-- 03: ASPEN EYES LAYER -->
            <g class="bark-bg-layer" data-layer="aspen">
                <!-- Vertical Silver Birch Trunks -->
                <g opacity="0.22" fill="#cbd5e1">
                    <rect x="65" y="-50" width="130" height="1000" rx="8"/>
                    <rect x="230" y="-50" width="100" height="1000" rx="8"/>
                    <rect x="1110" y="-50" width="100" height="1000" rx="8"/>
                    <rect x="1245" y="-50" width="130" height="1000" rx="8"/>
                </g>
                <g class="warp-group-a">
                    ${aspenEyes}
                </g>
                <!-- Drifting Golden Autumn Leaves -->
                <g class="warp-group-b" fill="#f5b82e" opacity="0.42">
                    <circle cx="210" cy="140" r="14"/>
                    <circle cx="380" cy="280" r="9"/>
                    <circle cx="190" cy="490" r="12"/>
                    <circle cx="1060" cy="180" r="15"/>
                    <circle cx="1230" cy="340" r="10"/>
                    <circle cx="1090" cy="680" r="13"/>
                </g>
            </g>

            <!-- 04: FURROWED SKYWARD CANOPY LAYER -->
            <g class="bark-bg-layer" data-layer="furrowed">
                <circle cx="720" cy="70" r="460" fill="url(#furrowed-sky-glow)"/>
                <!-- 1-Point Perspective Converging Bark Ridges -->
                <g class="warp-group-a" fill="none" stroke="#9a8b78" stroke-width="2.2" opacity="0.38">
                    <path d="M-80,920 L680,70 M80,920 L690,70 M240,920 L700,70 M400,920 L710,70 M560,920 L716,70"/>
                    <path d="M880,920 L724,70 M1040,920 L730,70 M1200,920 L740,70 M1360,920 L750,70 M1520,920 L760,70"/>
                    <!-- Braided Diamond Cross-Fissures -->
                    <path d="M40,780 L190,640 L310,760 L460,610 L590,730 L720,590 L850,730 L980,610 L1130,760 L1250,640 L1400,780" stroke="#38bdf8" stroke-width="1.5" opacity="0.45"/>
                    <path d="M180,540 L310,430 L430,520 L560,400 L720,490 L880,400 L1010,520 L1130,430 L1260,540" stroke="#eab308" stroke-width="1.4" opacity="0.45"/>
                </g>
            </g>

            <!-- 05: REDWOOD OCULUS CHIMNEY LAYER -->
            <g class="bark-bg-layer" data-layer="oculus">
                <circle cx="720" cy="450" r="520" fill="url(#oculus-center-glow)"/>
                <g class="warp-group-a">
                    ${oculusRings}
                </g>
                <g class="warp-group-b" stroke="#e87842" stroke-width="1.8" opacity="0.35">
                    <line x1="720" y1="450" x2="120" y2="920"/>
                    <line x1="720" y1="450" x2="380" y2="920"/>
                    <line x1="720" y1="450" x2="720" y2="920"/>
                    <line x1="720" y1="450" x2="1060" y2="920"/>
                    <line x1="720" y1="450" x2="1320" y2="920"/>
                    <circle cx="720" cy="450" r="46" fill="rgba(110,231,183,0.18)" stroke="#6ee7b7" stroke-width="2.5"/>
                </g>
            </g>

            <!-- 06: CATHEDRAL REDWOOD BUTTRESS LAYER -->
            <g class="bark-bg-layer" data-layer="cathedral" filter="url(#bark-organic-warp)">
                <g class="warp-group-a" fill="none" stroke-linecap="round" opacity="0.42">
                    <path d="M60,920 C140,620 340,420 560,40" stroke="#c86432" stroke-width="4.5"/>
                    <path d="M180,920 C250,640 420,440 620,40" stroke="#e07a47" stroke-width="3"/>
                    <path d="M320,920 C390,660 510,450 670,40" stroke="#a3e635" stroke-width="2" stroke-dasharray="12 8"/>
                    <path d="M1380,920 C1300,620 1100,420 880,40" stroke="#c86432" stroke-width="4.5"/>
                    <path d="M1260,920 C1190,640 1020,440 820,40" stroke="#e07a47" stroke-width="3"/>
                    <path d="M1120,920 C1050,660 930,450 770,40" stroke="#a3e635" stroke-width="2" stroke-dasharray="12 8"/>
                </g>
                <!-- Massive Burls -->
                <g class="warp-group-b" fill="#1b110c" fill-opacity="0.55" stroke="#c86432" stroke-width="2" opacity="0.45">
                    <ellipse cx="380" cy="290" rx="110" ry="54" transform="rotate(-18 380 290)"/>
                    <ellipse cx="1060" cy="310" rx="115" ry="56" transform="rotate(18 1060 310)"/>
                </g>
            </g>

            <!-- 07: GNARLED MOLTEN BURL TOPOGRAPHY LAYER -->
            <g class="bark-bg-layer" data-layer="gnarled" filter="url(#bark-organic-warp)">
                <g class="warp-group-a" fill="none" opacity="0.38">
                    <path d="M-80,220 C240,40 480,420 760,210 C1040,0 1240,360 1520,180" stroke="#deb07c" stroke-width="2.5"/>
                    <path d="M-80,360 C260,180 510,560 790,350 C1070,140 1260,500 1520,320" stroke="#9c8268" stroke-width="2"/>
                    <path d="M-80,520 C220,340 490,720 770,510 C1050,300 1250,660 1520,480" stroke="#c7b8a5" stroke-width="1.8" stroke-dasharray="14 6"/>
                    <path d="M-80,680 C250,500 520,860 800,660 C1080,460 1270,820 1520,640" stroke="#deb07c" stroke-width="2.2"/>
                </g>
                <g class="warp-group-b" fill="none" stroke="#deb07c" opacity="0.34">
                    <ellipse cx="220" cy="440" rx="140" ry="85" transform="rotate(24 220 440)" stroke-width="2"/>
                    <ellipse cx="220" cy="440" rx="85" ry="48" transform="rotate(24 220 440)" stroke-width="1.5"/>
                    <ellipse cx="1220" cy="460" rx="145" ry="88" transform="rotate(-22 1220 460)" stroke-width="2"/>
                    <ellipse cx="1220" cy="460" rx="88" ry="50" transform="rotate(-22 1220 460)" stroke-width="1.5"/>
                </g>
            </g>

            <!-- 08: HOLLOW BIRCH LOG PORTAL LAYER -->
            <g class="bark-bg-layer" data-layer="portal">
                <g class="warp-group-a">
                    <circle cx="720" cy="450" r="390" fill="none" stroke="#e2e8f0" stroke-width="6" stroke-dasharray="28 14" opacity="0.22"/>
                    <circle cx="720" cy="450" r="280" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="10 12" opacity="0.28"/>
                    <circle cx="720" cy="450" r="185" fill="#030503" fill-opacity="0.65" stroke="#84cc16" stroke-width="1.5" stroke-opacity="0.35"/>
                    ${portalRays.join('')}
                </g>
                <!-- Rising Green Wildflower Sprout -->
                <g class="warp-group-b" stroke="#84cc16" fill="none" opacity="0.55">
                    <path d="M760,880 Q735,640 765,360" stroke-width="3.5" stroke-linecap="round"/>
                    <circle cx="765" cy="355" r="7" fill="#d9f99d"/>
                    <ellipse cx="745" cy="460" rx="18" ry="7" transform="rotate(-28 745 460)" fill="#84cc16" fill-opacity="0.4"/>
                    <ellipse cx="782" cy="530" rx="18" ry="7" transform="rotate(28 782 530)" fill="#84cc16" fill-opacity="0.4"/>
                </g>
            </g>
        </svg>
        <div class="bark-floating-hud" id="bark-floating-hud">
            <span class="bark-hud-dot"></span>
            <span class="bark-hud-label" id="bark-hud-label">01 · Armored Ceiba & Vines</span>
        </div>
    `;
}

function initBarkExperience() {
    cleanupBarkExperience();

    const specimens = Array.from(document.querySelectorAll('.bark-specimen'));
    if (specimens.length === 0) return;

    document.body.classList.add('bark-mode-active');

    // Inject the bespoke inline Vector Bark Study badge into each specimen card header
    specimens.forEach(sec => {
        const themeKey = sec.getAttribute('data-bark-theme') || 'thorns';
        const header = sec.querySelector('.bark-card-header');
        if (header && !header.querySelector('.bark-vector-badge')) {
            const badgeWrap = document.createElement('div');
            badgeWrap.className = 'bark-badge-wrap';
            badgeWrap.innerHTML = getBarkStudyBadgeSVG(themeKey);
            header.appendChild(badgeWrap);
        }
    });

    // Create full-viewport fixed background stage
    const stage = document.createElement('div');
    stage.id = 'bark-ambient-stage';
    stage.className = 'bark-ambient-stage';
    stage.innerHTML = buildFullViewportBarkSVG();
    document.body.prepend(stage);

    const bgLayers = Array.from(stage.querySelectorAll('.bark-bg-layer'));
    const hudLabel = stage.querySelector('#bark-hud-label');
    const displacement = stage.querySelector('#bark-displacement');

    let currentActiveTheme = '';

    function applyBarkPalette(themeKey, labelText) {
        if (currentActiveTheme === themeKey) return;
        currentActiveTheme = themeKey;

        const palette = BARK_THEMES[themeKey] || BARK_THEMES.thorns;
        const root = document.body;
        root.style.setProperty('--bark-bg', palette.bg);
        root.style.setProperty('--bark-surface', palette.surface);
        root.style.setProperty('--bark-border', palette.border);
        root.style.setProperty('--bark-accent', palette.accent);
        root.style.setProperty('--bark-secondary', palette.secondary);
        root.style.setProperty('--bark-text', palette.text);
        root.style.setProperty('--bark-muted', palette.muted);
        root.style.setProperty('--bark-glow', palette.glow);

        bgLayers.forEach(layer => {
            layer.classList.toggle('active', layer.getAttribute('data-layer') === themeKey);
        });

        if (hudLabel && labelText) {
            hudLabel.textContent = labelText;
        }
    }

    function onScrollBark() {
        const vh = window.innerHeight || 800;
        const viewportCenter = vh * 0.5;
        const scrollY = window.scrollY || window.pageYOffset;

        let closestSpecimen = specimens[0];
        let minDistance = Infinity;
        let activeProgress = 0;

        specimens.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            const secCenter = rect.top + rect.height * 0.5;
            const dist = Math.abs(secCenter - viewportCenter);
            const isFocused = dist < vh * 0.48;
            sec.classList.toggle('in-focus', isFocused);

            if (dist < minDistance) {
                minDistance = dist;
                closestSpecimen = sec;
                // Continuous progress p in [-1, 1] as specimen travels across the viewport
                activeProgress = Math.max(-1, Math.min(1, (viewportCenter - secCenter) / (vh * 0.7)));
            }
        });

        const themeKey = closestSpecimen.getAttribute('data-bark-theme') || 'thorns';
        const themeName = closestSpecimen.getAttribute('data-bark-name') || 'Bark Specimen';
        applyBarkPalette(themeKey, themeName);

        // Continuously warp the active background vector layer based on scroll progress!
        const activeLayer = stage.querySelector(`.bark-bg-layer[data-layer="${themeKey}"]`);
        if (activeLayer) {
            const groupA = activeLayer.querySelector('.warp-group-a');
            const groupB = activeLayer.querySelector('.warp-group-b');
            const p = activeProgress;

            if (groupA) {
                if (themeKey === 'oculus' || themeKey === 'portal') {
                    groupA.style.transform = `translate3d(0, 0, 0) scale(${(1.06 + p * 0.16).toFixed(3)}) rotate(${(p * 24).toFixed(1)}deg)`;
                    groupA.style.transformOrigin = '720px 450px';
                } else if (themeKey === 'furrowed') {
                    groupA.style.transform = `translate3d(0, ${(p * -35).toFixed(1)}px, 0) scale(${(1.08 + (1 - Math.abs(p)) * 0.14).toFixed(3)})`;
                    groupA.style.transformOrigin = '720px 80px';
                } else if (themeKey === 'rainbow') {
                    groupA.style.transform = `translate3d(0, ${(p * -70).toFixed(1)}px, 0) scaleX(${(1 + Math.sin(scrollY * 0.006) * 0.05).toFixed(3)})`;
                    groupA.style.transformOrigin = '720px 450px';
                } else {
                    groupA.style.transform = `translate3d(${(p * -42).toFixed(1)}px, ${(p * 30).toFixed(1)}px, 0) scale(${(1.04 + Math.abs(p) * 0.05).toFixed(3)})`;
                    groupA.style.transformOrigin = '720px 450px';
                }
            }
            if (groupB) {
                groupB.style.transform = `translate3d(${(p * 55).toFixed(1)}px, ${(p * -45).toFixed(1)}px, 0) rotate(${(p * -8).toFixed(1)}deg)`;
                groupB.style.transformOrigin = '720px 450px';
            }
        }

        // Modulate organic SVG displacement scale with scroll position
        if (displacement) {
            const warpScale = 14 + Math.abs(Math.sin(scrollY * 0.004)) * 22;
            displacement.setAttribute('scale', warpScale.toFixed(1));
        }
    }

    barkScrollHandler = () => {
        if (barkAnimFrame) cancelAnimationFrame(barkAnimFrame);
        barkAnimFrame = requestAnimationFrame(onScrollBark);
    };

    window.addEventListener('scroll', barkScrollHandler, { passive: true });
    onScrollBark();
}

function cleanupBarkExperience() {
    if (barkScrollHandler) {
        window.removeEventListener('scroll', barkScrollHandler);
        barkScrollHandler = null;
    }
    if (barkAnimFrame) {
        cancelAnimationFrame(barkAnimFrame);
        barkAnimFrame = null;
    }
    document.body.classList.remove('bark-mode-active');
    const stage = document.getElementById('bark-ambient-stage');
    if (stage) stage.remove();
}

window.cleanupBarkExperience = cleanupBarkExperience;

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

    // Activate the special Bark morphing vector experience when viewing the "Bark" post!
    if (slug === 'bark') {
        requestAnimationFrame(() => initBarkExperience());
    } else {
        cleanupBarkExperience();
    }
}

function showBlogList(tag = 'All') {
    cleanupBarkExperience();

    const singleView = document.getElementById('blog-single-view');
    const listView = document.getElementById('blog-list-view');
    const filterBar = document.getElementById('filter-bar');

    if (singleView) singleView.classList.remove('active');
    if (listView) listView.style.display = 'block';
    if (filterBar) filterBar.style.display = 'flex';

    renderBlogPosts(tag);
}
