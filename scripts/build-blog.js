const fs = require('fs');
const path = require('path');
const { marked } = require('./lib/marked.js');

// Conf
const POSTS_DIR = path.join(__dirname, '../content/posts');
const OUTPUT_FILE = path.join(__dirname, '../js/blog-data.js');

// Ensure output dir exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Simple Front Matter Parser
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

            // Handle arrays [a, b]
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
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
}

// Build
console.log('Building blog data with zero dependencies...');
try {
    const posts = getPosts();
    // Add ID fallback - we use client side slug, so ID is less critical but needed for legacy check
    const postsWithIds = posts.map((post, index) => ({
        ...post,
        id: index + 1
    }));

    const fileContent = `window.blogPosts = ${JSON.stringify(postsWithIds, null, 4)};`;
    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`Successfully generated ${OUTPUT_FILE} with ${posts.length} posts.`);
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}
