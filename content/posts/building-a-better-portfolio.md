---
title: Building a Better Portfolio with AI Agents
date: Jan 02, 2026
readTime: 8 min
tags: [Coding, AI, Blog]
excerpt: "How I built this site using advanced AI agents (Antigravity & Claude Code) and hosted it on GitHub Pages."
---

When I set out to redesign this personal site, I didn't just want to build another portfolio—I wanted to experiment with a new way of coding. Instead of writing every line from scratch or wrestling with a heavy framework, I pair-programmed this entire project using **Antigravity** and **Claude Code**, two powerful AI coding agents.

### The Goals

- **Agentic Workflow**: Let the AI handle the heavy lifting of boilerplate, refactoring, and CSS grid calculations.
- **Vanilla Performance**: Stick to pure HTML, CSS, and JS. No heavy bundles.
- **Automated Deployment**: Simple hosting via GitHub Pages.

### Coding with AI Agents

This site was built by interacting with **Antigravity**, a Google Deepmind agent, and **Claude Code**. Here is how the workflow typically looked:

1.  **Refactoring at Speed**: I asked the agent to "modularize the massive `styles.css` file," and it intelligently split the code into `base.css`, `components.css`, `sections.css`, and `responsive.css`, updating the HTML links automatically.
2.  **Live Coding**: I could say "Make the timeline marker active when I scroll," and the agent wrote the Intersection Observer logic in `js/timeline.js` instantly.
3.  **Content Management**: We built a custom Node.js script to compile these Markdown files into a JSON object, so I can write blogs in Markdown without needing a database.

It wasn't just auto-complete; it was *auto-complete for entire features*.

### Tech Stack

-   **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+).
-   **Styling**: Custom CSS Variables and Grid layouts.
-   **Build System**: A zero-dependency Node.js script that compiles content.
-   **Hosting**: GitHub Pages.

### How to Host This on GitHub Pages

One of the best parts of this stack is how easy it is to deploy. Since it's a static site, you don't need Vercel or Netlify (though those work too).

1.  **Push your code** to a public GitHub repository.
2.  Go to your repository **Settings** > **Pages**.
3.  Under **Source**, select `Deploy from a branch`.
4.  Choose your `main` branch and the `/ (root)` folder.
5.  Click **Save**.

Your site will be live at `https://<username>.github.io/<repo-name>/`.

### Developing Locally

If you want to try this "AI-native" development flow yourself:

1.  **Clone the repo**: `git clone <your-repo-url>`
2.  **Run the build script**: Whenever you add a new post (like this one), just run:
    ```bash
    node scripts/build-content.js
    ```
3.  **Open in Browser**: No dev server required, just open `index.html`.

This project is proof that with the right AI tools, you can build high-quality, custom software faster than ever before.
