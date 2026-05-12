
# Personal Tech Blog — Design Spec

**Date:** 2026-05-12
**Status:** approved

## Overview

A personal technical blog built with Hugo, deployed to GitHub Pages. Apple-inspired design language: clean, minimal, typography-first.

## Tech Stack

- **Generator:** Hugo (Go binary, no Node.js/Ruby dependency)
- **Hosting:** GitHub Pages (via GitHub Actions)
- **CSS:** Hand-written, single file, no framework
- **JavaScript:** None

## Site Structure

```
/          — Home: article list, reverse chronological
/posts/*   — Article detail
/about/    — Personal intro page
```

## Visual Design — Apple Style

### Colors
| Role | Value | Usage |
|------|-------|-------|
| Background | `#fbfbfd` | Page background |
| Text primary | `#1d1d1f` | Body text, headings |
| Text secondary | `#86868b` | Dates, meta, footer |
| Accent | `#0071e3` | Links, hover states |
| Code bg | `#f5f5f7` | Inline code, code blocks |

### Typography
| Element | Font | Size | Weight |
|---------|------|------|--------|
| Site title | `-apple-system, SF Pro Display` | 20px | 600 |
| Home article title | `-apple-system, SF Pro Display` | 28px | 700 |
| Article page title | `-apple-system, SF Pro Display` | 40px | 700 |
| Body text | `-apple-system, SF Pro Text` | 17px | 400 |
| Code | `SF Mono, monospace` | 14px | 400 |
| Secondary text | `-apple-system, SF Pro Text` | 15px | 400 |

### Spacing
- Content max-width: 680px
- Line height (body): 1.6
- Article list item gap: 48px
- Section margins: generous whitespace

### Layout
- Single column, centered
- Fixed top nav: site title (left) + About link (right)
- No cards, no shadows — whitespace separates content
- Minimal footer: `© 2026 Name` in secondary color

### Interactions
- Link hover: color transition to accent blue, `0.2s ease`
- Code blocks: 12px border-radius, light gray background
- All transitions: subtle, `0.2s ease`

## Pages

### Home (`/`)
- Site title at top
- Paginated article list (10 per page)
- Each item: title (28px bold) + date (secondary color) + optional summary (one line)
- No images, no tags, no categories — content-first

### Article (`/posts/<slug>`)
- Title (40px bold)
- Date below title
- Body: 17px, comfortable line-height
- Code blocks with syntax highlighting (Hugo built-in)
- Back link to home at bottom

### About (`/about/`)
- Brief personal intro (2-3 sentences)
- Optional: small avatar
- Links: GitHub, email, etc.
- Same clean typography

## Content Authoring

- Articles written in Markdown under `content/posts/`
- Hugo frontmatter: `title`, `date`, `draft`, optional `summary`
- `hugo new posts/my-post.md` to scaffold

## Deployment

- GitHub Pages via GitHub Actions
- Push to `main` → Hugo builds → deploys to `gh-pages` branch
- Custom domain supported if needed later

## Out of Scope

- Comments system
- Tags/categories
- Search
- Dark mode (can add later)
- RSS (can add later, Hugo has built-in support)
