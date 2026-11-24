# devoxx.gr

Static version of the Devoxx Greece website, built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Run it locally

```sh
npm install
npm run dev            # http://localhost:4321
npm run build          # production build into dist/
```

The images are committed under `public/images/`. `npm run fetch-assets` downloads any image listed in `scripts/assets.txt` that is missing; the deploy workflow runs it as a safety net.

New photos get a resized WebP copy, which is what the pages reference:

```sh
npm run webp -- public/images/atmosphere/new-photo.jpg            # max 1200 px wide
npm run webp -- --width 1920 public/images/hero-4.jpg             # hero photos
npm run webp -- --square 240 public/images/committee/jane-doe.jpg # committee photos
```

## Where things live

| What | Where |
| --- | --- |
| Menu, announcement bar, hero text, stats, footer links, event dates and links | `src/data/site.json` |
| Homepage content: session types, tracks, photos, important dates, tickets, sponsors, venue | `src/data/home.json` |
| Program committee (name, title, photo, bio) | `src/data/committee.json` |
| Homepage layout | `src/pages/index.astro` |
| Team, Sponsorships and Press Kit pages | `src/pages/team.astro`, `sponsorships.astro`, `press-kit.astro` |
| Text pages (FAQ, Code of Conduct, ...): one HTML file each, the file name is the URL | `src/content/pages/` |
| Text page titles | `src/data/pages.json` |
| Header, footer, `<head>` | `src/layouts/Base.astro` |
| Colours, fonts, layout | `src/styles/global.css` |
| Images | `public/images/` |

Common edits:

- **Ticket batch changes:** in `src/data/home.json` set the tier's `state` to `on-sale`, `upcoming` or `sold-out` and update `status` and `cta`. Update `announcement` in `src/data/site.json` to match.
- **New sponsor:** add it under `sponsors.tiers` in `src/data/home.json`, e.g. `{ "name": "Platinum", "sponsors": [{ "name": "Acme", "logo": "/images/sponsors/acme.png", "href": "https://acme.example" }] }`.
- **New text page:** drop `my-page.html` in `src/content/pages/` and add its title to `src/data/pages.json`. It is served at `/my-page/`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.
In the repository settings, **Pages → Source** must be **GitHub Actions**.

The site is live on `https://devoxx.gr`, served by GitHub Pages behind Cloudflare.
