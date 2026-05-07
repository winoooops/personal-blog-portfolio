# Repository Guidelines

## Project Structure & Module Organization

This is an Astro static site for a personal portfolio, blog, and Obsidian-fed notes workflow. Route files live in `src/pages`; current saved routes include the home page and blog index/detail pages. Add dashboard routes as `src/pages/dashboard.astro` or `src/pages/dashboard/index.astro` so Astro can generate `/dashboard`.

Reusable UI belongs in `src/components`, shared page chrome in `src/layouts`, site-wide CSS in `src/styles/global.css`, and small helpers in `src/lib`. Portfolio copy, projects, skills, and profile metadata are centralized in `src/data/profile.ts`. Blog posts live in `src/content/blog` and must match the schema in `src/content.config.ts`. Static assets belong in `public`; Obsidian image sync output should use `public/obsidian-assets`.

## Build, Test, and Development Commands

- `npm install`: install dependencies; Node `>=22.12.0` is required.
- `npm run dev -- --port 4322`: start the Astro dev server on the current local port, `http://localhost:4322`.
- `npm run build`: validate content collections and emit the production site to `dist/`.
- `npm run preview`: serve the built site locally for final checks.
- `npm run sync:obsidian`: copy configured Obsidian notes into `src/content/blog`.

## Coding Style & Naming Conventions

Use TypeScript-aware Astro patterns and keep the strict Astro `tsconfig` intact. Follow the existing two-space indentation style. Name Astro components in PascalCase, such as `PostCard.astro`; route files and Markdown slugs should be lowercase and hyphenated, such as `start-here.md`. Keep content data in typed modules instead of duplicating constants across pages.

## Testing Guidelines

No dedicated test framework is configured yet. Treat `npm run build` as the required validation step before committing because it checks Astro compilation and content frontmatter. For blog posts, verify `title`, `description`, `pubDate`, optional `updatedDate`, `tags`, `draft`, and `source` against `src/content.config.ts`.

## Commit & Pull Request Guidelines

This repository has no existing commit history, so use concise imperative commit messages, for example `Add dashboard route` or `Update blog card styles`. Pull requests should include a short summary, validation steps run, linked issues when applicable, and screenshots for visual changes. For deployment-related changes, note any required GitHub Pages variables such as `PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH`.

## Security & Configuration Tips

Keep `obsidian.config.json` private; it is gitignored because it can contain local vault paths. Commit only reviewed generated Markdown and public-safe assets.
