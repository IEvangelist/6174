# 6174

A GitHub Pages-ready React + Vite + TypeScript + Tailwind CSS single-page app that animates Kaprekar's routine and shows how valid 4-digit inputs collapse into **6174**.

## Features

- Oversized input-first interface with random, replay, reset, and share actions
- Query-string sharing via `?seed=3524`
- Theme-aware styling with light/dark support
- Keyboard-friendly controls, ARIA labels, and reduced-motion-safe animation
- GitHub Pages deployment on merges to `main`

## Local development

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - run TypeScript build checks and create the production bundle
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build locally

## Deployment

The workflow in `.github/workflows/pages.yml` builds the site and deploys `dist/` to GitHub Pages on pushes to `main`.

If GitHub prompts for a Pages source, choose **GitHub Actions** in the repository settings.
