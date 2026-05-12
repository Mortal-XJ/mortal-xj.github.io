# Personal Tech Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Apple-style personal technical blog with Hugo, deploy to GitHub Pages.

**Architecture:** Hugo generates static HTML from Markdown content. Hand-written CSS provides Apple-inspired typography-first design. GitHub Actions builds and deploys to GitHub Pages on every push to main.

**Tech Stack:** Hugo (static site generator), hand-written CSS, GitHub Pages, GitHub Actions

---

## File Structure

```
aitest/
├── hugo.toml                              # Hugo configuration
├── archetypes/
│   └── default.md                         # Post scaffold template
├── content/
│   ├── posts/
│   │   └── hello-world.md                 # Sample first post
│   └── about.md                           # About page
├── layouts/
│   ├── _default/
│   │   ├── baseof.html                    # Base HTML shell
│   │   └── single.html                    # Article and about page template
│   ├── index.html                         # Home page (article list)
│   └── partials/
│       ├── head.html                      # <head> metadata
│       ├── header.html                    # Fixed top nav
│       └── footer.html                    # Minimal footer
├── static/
│   └── css/
│       └── style.css                      # All styles (Apple design)
└── .github/
    └── workflows/
        └── deploy.yml                     # GitHub Pages deploy action
```

### Responsibility Boundaries

| File | Responsibility |
|------|---------------|
| `hugo.toml` | Site config: baseURL, language, markup settings |
| `layouts/_default/baseof.html` | HTML document shell, imports partials, defines blocks |
| `layouts/partials/head.html` | `<head>` tag: meta charset, viewport, title, CSS link |
| `layouts/partials/header.html` | Fixed top nav: site title left, About link right |
| `layouts/partials/footer.html` | Page footer: copyright line |
| `layouts/index.html` | Home page: iterates posts, renders title+date+summary list |
| `layouts/_default/single.html` | Post and about pages: title, date, content |
| `static/css/style.css` | All visual design: colors, fonts, layout, code blocks |
| `archetypes/default.md` | Template for `hugo new posts/...` |
| `.github/workflows/deploy.yml` | CI: checkout → setup Hugo → build → deploy to Pages |

---

### Task 1: Install Hugo and scaffold project structure

**Files:**
- Create: all directories under `layouts/`, `static/css/`, `content/posts/`, `archetypes/`, `.github/workflows/`
- Create: `.gitignore`

- [ ] **Step 1: Install Hugo**

Run: `choco install hugo-extended -y`
Expected: Hugo installed. Verify with `hugo version` (expect v0.x or later).

- [ ] **Step 2: Create directory structure**

Run:
```bash
mkdir -p layouts/_default layouts/partials static/css content/posts archetypes .github/workflows
```

- [ ] **Step 3: Update .gitignore**

Replace `.gitignore` content with:
```
.superpowers/
/public/
/resources/
.hugo_build.lock
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore: scaffold Hugo project directories"
```

---

### Task 2: Write Hugo configuration

**Files:**
- Create: `hugo.toml`

- [ ] **Step 1: Write hugo.toml**

```toml
baseURL = "https://71588.github.io/"
languageCode = "zh-cn"
title = "71588"
theme = ""

[pagination]
  pagerSize = 10

[markup]
  [markup.highlight]
    style = "github"
  [markup.goldmark.renderer]
    unsafe = true
```

- [ ] **Step 2: Commit**

```bash
git add hugo.toml
git commit -m "feat: add Hugo configuration"
```

---

### Task 3: Write base template and head partial

**Files:**
- Create: `layouts/_default/baseof.html`
- Create: `layouts/partials/head.html`

- [ ] **Step 1: Write head partial**

Create `layouts/partials/head.html`:
```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }} — {{ .Site.Title }}{{ end }}</title>
<link rel="stylesheet" href="/css/style.css">
```

- [ ] **Step 2: Write baseof.html**

Create `layouts/_default/baseof.html`:
```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}">
<head>
  {{ partial "head.html" . }}
</head>
<body>
  {{ partial "header.html" . }}
  <main>
    {{ block "main" . }}{{ end }}
  </main>
  {{ partial "footer.html" . }}
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add layouts/_default/baseof.html layouts/partials/head.html
git commit -m "feat: add base template and head partial"
```

---

### Task 4: Write header and footer partials

**Files:**
- Create: `layouts/partials/header.html`
- Create: `layouts/partials/footer.html`

- [ ] **Step 1: Write header partial**

Create `layouts/partials/header.html`:
```html
<header class="site-header">
  <nav class="site-nav">
    <a href="/" class="site-title">{{ .Site.Title }}</a>
    <a href="/about/" class="nav-link">About</a>
  </nav>
</header>
```

- [ ] **Step 2: Write footer partial**

Create `layouts/partials/footer.html`:
```html
<footer class="site-footer">
  <p>&copy; {{ now.Format "2006" }} {{ .Site.Title }}</p>
</footer>
```

- [ ] **Step 3: Commit**

```bash
git add layouts/partials/header.html layouts/partials/footer.html
git commit -m "feat: add header and footer partials"
```

---

### Task 5: Write home page template

**Files:**
- Create: `layouts/index.html`

- [ ] **Step 1: Write index.html**

Create `layouts/index.html`:
```html
{{ define "main" }}
<div class="home">
  {{ range .Paginator.Pages }}
  <article class="post-item">
    <h2 class="post-title">
      <a href="{{ .RelPermalink }}">{{ .Title }}</a>
    </h2>
    <time class="post-date" datetime="{{ .Date.Format "2006-01-02" }}">
      {{ .Date.Format "2006-01-02" }}
    </time>
    {{ with .Summary }}
    <p class="post-summary">{{ . }}</p>
    {{ end }}
  </article>
  {{ end }}

  {{ if gt .Paginator.TotalPages 1 }}
  <nav class="pagination">
    {{ if .Paginator.HasPrev }}
    <a href="{{ .Paginator.Prev.URL }}">&larr; Newer</a>
    {{ end }}
    {{ if .Paginator.HasNext }}
    <a href="{{ .Paginator.Next.URL }}">Older &rarr;</a>
    {{ end }}
  </nav>
  {{ end }}
</div>
{{ end }}
```

- [ ] **Step 2: Commit**

```bash
git add layouts/index.html
git commit -m "feat: add home page template with pagination"
```

---

### Task 6: Write single page template

**Files:**
- Create: `layouts/_default/single.html`

- [ ] **Step 1: Write single.html**

Create `layouts/_default/single.html`:
```html
{{ define "main" }}
<article class="single-post">
  <header class="post-header">
    <h1 class="post-title-single">{{ .Title }}</h1>
    {{ if ne .Type "page" }}
    <time class="post-date" datetime="{{ .Date.Format "2006-01-02" }}">
      {{ .Date.Format "2006-01-02" }}
    </time>
    {{ end }}
  </header>
  <div class="post-content">
    {{ .Content }}
  </div>
  <div class="post-back">
    <a href="/">&larr; Back</a>
  </div>
</article>
{{ end }}
```

- [ ] **Step 2: Commit**

```bash
git add layouts/_default/single.html
git commit -m "feat: add single page template"
```

---

### Task 7: Write CSS — Apple-inspired design

**Files:**
- Create: `static/css/style.css`

- [ ] **Step 1: Write style.css**

Create `static/css/style.css`:
```css
/* ===== Reset ===== */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ===== Base ===== */
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
  font-size: 17px;
  line-height: 1.6;
  color: #1d1d1f;
  background: #fbfbfd;
}

/* ===== Header ===== */
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(251, 251, 253, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 100;
}

.site-nav {
  max-width: 680px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  text-decoration: none;
  transition: color 0.2s ease;
}

.site-title:hover {
  color: #0071e3;
}

.nav-link {
  font-size: 15px;
  color: #86868b;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #0071e3;
}

/* ===== Main Content ===== */
main {
  max-width: 680px;
  margin: 0 auto;
  padding: 96px 24px 64px;
}

/* ===== Home Page ===== */
.post-item {
  margin-bottom: 48px;
}

.post-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 8px;
  text-wrap: balance;
}

.post-title a {
  color: #1d1d1f;
  text-decoration: none;
  transition: color 0.2s ease;
}

.post-title a:hover {
  color: #0071e3;
}

.post-date {
  display: block;
  font-size: 15px;
  color: #86868b;
  margin-bottom: 12px;
}

.post-summary {
  font-size: 17px;
  color: #86868b;
  line-height: 1.5;
}

/* ===== Single Post ===== */
.post-header {
  margin-bottom: 40px;
}

.post-title-single {
  font-size: 40px;
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 12px;
  text-wrap: balance;
}

.post-content {
  font-size: 17px;
  line-height: 1.6;
}

.post-content p {
  margin-bottom: 1.5em;
}

.post-content h2 {
  font-size: 24px;
  font-weight: 600;
  margin-top: 48px;
  margin-bottom: 16px;
}

.post-content h3 {
  font-size: 20px;
  font-weight: 600;
  margin-top: 36px;
  margin-bottom: 12px;
}

.post-content a {
  color: #0071e3;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.post-content a:hover {
  opacity: 0.7;
}

.post-content ul, .post-content ol {
  margin-bottom: 1.5em;
  padding-left: 1.5em;
}

.post-content li {
  margin-bottom: 0.5em;
}

.post-content blockquote {
  border-left: 3px solid #86868b;
  margin: 1.5em 0;
  padding: 0.5em 0 0.5em 1.5em;
  color: #86868b;
}

/* ===== Code ===== */
.post-content code {
  font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
  font-size: 14px;
  background: #f5f5f7;
  padding: 2px 6px;
  border-radius: 6px;
}

.post-content pre {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 20px 24px;
  overflow-x: auto;
  margin-bottom: 1.5em;
  line-height: 1.5;
}

.post-content pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}

/* ===== Post Back Link ===== */
.post-back {
  margin-top: 64px;
  padding-top: 24px;
}

.post-back a {
  color: #86868b;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.2s ease;
}

.post-back a:hover {
  color: #0071e3;
}

/* ===== Footer ===== */
.site-footer {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 24px 32px;
  font-size: 14px;
  color: #86868b;
}

/* ===== Pagination ===== */
.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: 48px;
  font-size: 15px;
}

.pagination a {
  color: #86868b;
  text-decoration: none;
  transition: color 0.2s ease;
}

.pagination a:hover {
  color: #0071e3;
}

/* ===== About Page ===== */
.about-page p {
  margin-bottom: 1em;
}

.about-page a {
  color: #0071e3;
  text-decoration: none;
}
```

- [ ] **Step 2: Commit**

```bash
git add static/css/style.css
git commit -m "feat: add Apple-inspired CSS design system"
```

---

### Task 8: Create about page content

**Files:**
- Create: `content/about.md`

- [ ] **Step 1: Write about.md**

Create `content/about.md`:
```markdown
---
title: "About"
layout: "single"
type: "page"
---

<div class="about-page">

Hi, I'm a software developer passionate about building things and sharing what I learn along the way.

This blog is where I write about programming, tools, and the occasional deep dive into whatever has my attention.

Find me on [GitHub](https://github.com/71588).

</div>
```

- [ ] **Step 2: Commit**

```bash
git add content/about.md
git commit -m "feat: add about page content"
```

---

### Task 9: Create archetype and sample post

**Files:**
- Create: `archetypes/default.md`
- Create: `content/posts/hello-world.md`

- [ ] **Step 1: Write archetype**

Create `archetypes/default.md`:
```markdown
---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
---
```

- [ ] **Step 2: Write sample post**

Create `content/posts/hello-world.md`:
```markdown
---
title: "Hello, World"
date: 2026-05-12
draft: false
summary: "First post on this blog. A fresh start."
---

This is the first post. The blog is built with [Hugo](https://gohugo.io/), styled with an Apple-inspired design, and hosted on GitHub Pages.

## Code Example

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

## What to Expect

I plan to write about software development, tools I use, and things I learn. Stay tuned.
```

- [ ] **Step 3: Commit**

```bash
git add archetypes/default.md content/posts/hello-world.md
git commit -m "feat: add archetype and sample first post"
```

---

### Task 10: Verify local build

- [ ] **Step 1: Build the site**

Run: `hugo`
Expected: Site builds with no errors. Output in `public/`.

- [ ] **Step 2: Serve locally and inspect**

Run: `hugo server --disableFastRender`
Expected: Server starts on `http://localhost:1313`. Open browser and verify:
- Home page shows "Hello, World" article with title, date, summary
- Click article → article page with proper heading, code blocks styled
- Navigate to `/about/` → about page renders
- Header fixed at top, footer visible
- All links work, hover states visible

- [ ] **Step 3: Stop the server (Ctrl+C) and commit**

```bash
git add --all
git commit -m "chore: any changes from local verification"
```
(If no changes, skip this commit.)

---

### Task 11: Create GitHub Actions workflow for deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write deploy.yml**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: false

      - uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build
        run: hugo --minify

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions deploy workflow"
```

---

### Task 12: Create GitHub repo and push

**This task requires user confirmation before executing — it involves creating a remote repo and pushing code.**

- [ ] **Step 1: Check if gh CLI is authenticated**

Run: `gh auth status`
Expected: "Logged in to github.com as ..."

If not authenticated, ask user to run `gh auth login` first.

- [ ] **Step 2: Create GitHub repo**

Run: `gh repo create 71588.github.io --public --source=. --remote=origin --push`
Expected: Repo created on GitHub, code pushed to `main`.
(Using `<username>.github.io` as the repo name gives the clean URL `https://71588.github.io/`.)

If main branch doesn't exist locally yet, create it first:
```bash
git branch -M main
```

- [ ] **Step 3: Enable GitHub Pages**

Run:
```bash
gh api repos/71588/71588.github.io/pages -X POST -f "source[branch]=gh-pages" -f "source[path]=/" --jq ".html_url"
```
Wait: Allow a few minutes for the first deploy action to complete.

---

### Task 13: Verify deployment

- [ ] **Step 1: Check workflow status**

Run: `gh run list --repo 71588/71588.github.io --limit 1`
Expected: Latest workflow shows "completed" with green checkmark.

If still running, wait and re-check with:
```bash
gh run watch $(gh run list --repo 71588/71588.github.io --limit 1 --json databaseId --jq '.[0].databaseId')
```

- [ ] **Step 2: Open the deployed site**

The site will be at: `https://71588.github.io/71588.github.io/`

Verify in browser:
- Home page loads
- Navigation works
- About page loads
- Post page loads with code highlighting

- [ ] **Step 3: Update hugo.toml baseURL if needed**

If the URL differs, update `baseURL` in `hugo.toml` and push.

---

## Post-Deployment

The site is live. To add new posts:

```bash
hugo new posts/my-new-post.md
# Edit content/posts/my-new-post.md
# Set draft: false when ready to publish
git add content/posts/my-new-post.md
git commit -m "feat: add new post"
git push
```

GitHub Actions will automatically build and deploy.
