# Personal Portfolio Website

A modern, high-performance personal portfolio website built with vanilla web technologies. Features a distinct "Engineering/Terminal" aesthetic with dark mode, deep linking, and a custom static content system.

## 🚀 Tech Stack

- **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Styling**: Pure CSS with Variables and CSS Grid. No external CSS frameworks.
- **Build System**: Custom Node.js scripts (Zero-dependency runtime).
- **Content**: Markdown-based blog system.

## 📂 Project Structure

```
├── content/
│   ├── posts/          # Source Markdown files for blog posts
│   ├── resume.html     # Resume content (HTML)
│   └── timeline.html   # Timeline content (HTML)
├── css/
│   ├── base.css        # CSS Variables & Theme Definitions
│   ├── components.css  # UI Components (Buttons, Cards, Nav)
│   ├── sections.css    # Layout for specific sections
│   └── responsive.css  # Mobile responsiveness
├── js/
│   ├── app.js          # Core application logic
│   ├── ui.js           # UI interactions & Theming
│   ├── content-data.js # Generated blog content (Do not edit manually)
│   └── ...             # Other modules (router, timeline, etc.)
├── scripts/
│   └── build-content.js # Build script to compile Blog MD -> JS
├── index.html          # Main entry point
└── package.json        # Project metadata
```


## 🛠️ Setup & Build

This project relies on a lightweight **Static Content Generation** step. Blog posts and Resume content are written in Markdown and compiled into a single JavaScript data file that the browser works with directly.

### Prerequisites
- Node.js (v14+ recommended)

### Installation
1. Clone the repository.
2. No `npm install` required (dependencies are vendored).

### Building Content
Whenever you add or edit files in `content/`, you must rebuild the data:

```bash
node scripts/build-content.js
```

This generates `js/content-data.js`, which `index.html` loads automatically.

## ✍️ Adding New Content

### Blog Posts
1. Create a new `.md` file in `content/posts/`.
2. Add the required Frontmatter.
3. Run `node scripts/build-content.js`.

### Resume & Timeline
The Resume and Timeline are now maintained as **HTML fragments** for greater styling control.
1. **Resume**: Edit `content/resume.html`.
2. **Timeline**: Edit `content/timeline.html`.
3. No build step required for these! Changes appear instantly on reload.



## 🚀 Deployment

### GitHub Pages (Recommended)
This site is designed to be hosted directly on **GitHub Pages**.

1.  Push your code to a GitHub repository.
2.  Go to **Settings** > **Pages**.
3.  Under **Source**, select `Deploy from a branch`.
4.  Select your `main` branch and `/ (root)` folder.
5.  Click **Save**.

Your site will be live at `https://<username>.github.io/<repo-name>/`.

**Note**: Since we generate `js/blog-data.js` locally and commit it, you do **not** need a complicated CI/CD action. Just build locally, commit, and push.

## 🔗 Features

- **Deep Linking**: Hash-based routing allows sharing links to specific tabs (`#blog`) or posts (`#blog?post=my-new-post`).
- **Multi-Theme System**: Includes 7 distinct themes including 'Miami Vice', 'Havana Night', and 'Cherry Blossoms', with a persistent selector.
- **Responsive Design**: Fully responsive layout using CSS Grid and Flexbox.
- **Zero-Dependency Runtime**: The site works efficiently without heavy client-side frameworks like React or Vue.
