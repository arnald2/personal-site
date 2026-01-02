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
│   └── posts/          # Source Markdown files for blog posts
├── css/
│   └── styles.css      # Main stylesheet (Variables, Layout, Components)
├── js/
│   ├── app.js          # Core application logic (Routing, UI, Animations)
│   └── blog-data.js    # Generated content file (Do not edit manually)
├── scripts/
│   ├── build-blog.js   # Build script to compile MD -> JS
│   └── lib/            # Vendored dependencies (marked.js)
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
3. Run the build command.

### Resume
1. Edit `content/resume.md`.
2. Run `node scripts/build-content.js`.



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
- **Responsive Design**: Fully responsive layout using CSS Grid and Flexbox.
- **Zero-Dependency Runtime**: The site works efficiently without heavy client-side frameworks like React or Vue.
