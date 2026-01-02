const fs = require('fs');
const path = require('path');
const { marked } = require('./lib/marked.js');

// Conf
const POSTS_DIR = path.join(__dirname, '../content/posts');
const RESUME_FILE = path.join(__dirname, '../content/resume.html');
const TIMELINE_FILE = path.join(__dirname, '../content/timeline.html');
const OUTPUT_FILE = path.join(__dirname, '../js/content-data.js');

// Ensure output dir exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Simple Front Matter Parser (for blog only)
function parseFrontMatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
        return { attributes: {}, body: content };
    }

    const yamlBlock = match[1];
    const body = match[2];
    const attributes = {};

    yamlBlock.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(':').trim();

            if (value.startsWith('[') && value.endsWith(']')) {
                attributes[key] = value.slice(1, -1).split(',').map(s => s.trim());
            } else {
                attributes[key] = value;
            }
        }
    });

    return { attributes, body };
}

// Helpers
function getPosts() {
    const files = fs.readdirSync(POSTS_DIR);
    return files
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const rawContent = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
            const { attributes, body } = parseFrontMatter(rawContent);
            const html = marked(body);

            return {
                title: attributes.title || 'Untitled',
                date: attributes.date || 'Jan 1, 1970',
                excerpt: attributes.excerpt || '',
                tags: attributes.tags || [],
                readTime: attributes.readTime || '1 min',
                content: html
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getResume() {
    if (fs.existsSync(RESUME_FILE)) {
        return fs.readFileSync(RESUME_FILE, 'utf8');
    }
    return '';
}

function getTimeline() {
    if (fs.existsSync(TIMELINE_FILE)) {
        return fs.readFileSync(TIMELINE_FILE, 'utf8');
    }
    return '';
}

// Build
console.log('Building content data...');
try {
    const posts = getPosts();
    const resume = getResume();
    const timeline = getTimeline();

    const data = {
        blogPosts: posts,
        resume: resume,
        timeline: timeline
    };

    const fileContent = `window.contentData = ${JSON.stringify(data, null, 4)};`;
    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`Successfully generated ${OUTPUT_FILE}.`);
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}
