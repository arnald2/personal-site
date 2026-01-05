---
title: Vive coding a Person site. 
date: Jan 02, 2026
readTime: 10 min
tags: [Code]
excerpt: "A step-by-step guide on how I built this portfolio using AI agents"
---

I have wanted a personal site for years. I used to have a simple one hosted on my universities server, but eventually i lost access to it, and they also took it down at some point. I played around with some templates in the past, but never really took the time to actually host a site, and did not really see the point. However with the receent leaps in Agentic coding, it's become extremely easy to quickly put something together. With a single prompt Claude code was able to quickly generate a whole professinal looking site, and it gave me ideas on how to host it for free on Github, it even included detailed instructions. 

I then wanted to test the Antigravity IDE from Google. So i openend the repository in the IDE and continued adding the fetures i wanted for the site. I added a personal timeline, and blog tab, and a various small improvement like url linking to blog post, and code refactoring. All while writting 0 lines of code myself. I have literally not looked at the JS or CSS files at all. It might be beutiful, or spagetti code, i have no idea, but the site looks good enough, and behaves as expected, and that's all i care about for now. If anyone is reading this, and wants a similar site, feel free to fork ([this repository](https://github.com/arnaldo/personal-site)), and follow the step by step guide below, and just change the information to match your own. Can probably do it all much faster if you use Claude code, and Antigravity IDE. Starting from scratch as i did is probably fun too, but it does take a bit more timme. One frustartion i had with Antigravity is that it hangs a lot, and i have to cancel the request and restart it. I had to do that pretty frequently. 

One downside to github hosting is that it's not ideas for adding media files. I might end up having to look 
for an alternative to host the media files as the repo gets larger. 


### 1. Hosting on GitHub Pages

Github supports free static hosting for public repositories. 

**Steps to Host:**
1.  **Create a Repository**: Go to GitHub and create a new public repository (e.g., `my-portfolio`).
2.  **Upload Code**: Push your HTML, CSS, and JS files to this repository.
3.  **Enable Pages**:
    *   Go to your repository **Settings**.
    *   Click on **Pages** in the sidebar.
    *   Under **Source**, select `Deploy from a branch`.
    *   Choose your `main` branch and `/ (root)` folder.
    *   Click **Save**.

That's it! Your site will be online at `https://<username>.github.io/<repository>/`.

---

### 2. Managing Your Content

One "vive coded" extra feature i added is making the page easier to edit by separating the content from the code. And also separating the pages into inidivual files. This way, the resume, timeline, and blog posts can be updated without touching the code.

#### 📅 Editing the Timeline
The vertical timeline in the "About" section is great for showing your career journey.
*   **File to Edit**: `content/timeline.html`
*   **How**: Open this file. You will see blocks like `<div class="timeline-marker">` and `<div class="story-milestone">`.
*   **To Add a Milestone**: Copy an existing block, change the year and the text description. The site automatically handles the scrolling animation.

#### 📄 Updating the Resume
The Resume tab has nice styling to separate all the scetions
*   **File to Edit**: `content/resume.html`
*   **How**: This is standard HTML. Look for the `<div class="card">` elements under "Work Experience".
*   **Tip**: Copy a whole `card` div to add a new job. Update the `<h2>` texts for your skills.

#### 📮 Contact Info
*   **File to Edit**: `index.html` (Look for the `#contact` section).
*   **How**: Update the `href` links for your Email and LinkedIn.

#### ✍️ Adding a Blog Post
The blog uses Markdown, so it's easier to add new entries without dealing with HTML. I use [Obsidian](https://obsidian.md/) for note taking already, so i am very used to markdown styling. 
Side note on Obsidian: Since it's just a text file on the file system. The directories can also be opened in Antigravity IDE, so you get the cappabilites of having the AI agents explore notes for ideas, and update the written content etc. 

**Steps:**
1.  Create a new file in `content/posts/` (e.g., `my-new-post.md`).
2.  Add this "Frontmatter" at the very top:
    ```yaml
    ---
    title: My New Post
    date: Jan 03, 2026
    readTime: 5 min
    tags: [Life, Coding]
    excerpt: "A short summary of what this post is about."
    ---
    ```
3.  Write your content below it!
4.  **Important**: Run the build script to update the site.
    ```bash
    node scripts/build-content.js
    ```
    *(If you don't want to run code, you can ask an AI agent to "Update the blog content" for you!)*


