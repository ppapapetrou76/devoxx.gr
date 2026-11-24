# devoxx.gr

The Devoxx Greece conference website (currently the 2027 edition, 15–17 April 2027, Megaron Athens).
A fully static [Astro](https://astro.build) site: no CMS, no backend, no client framework. Content lives
in JSON and HTML files; pages are `.astro` templates. Pushing to `main` deploys to production
(`https://devoxx.gr`, GitHub Pages behind Cloudflare). The repo is `SoftConf/devoxx.gr`.

`README.md` has the "where things live" table for content editors. This file covers what you need to
change the site safely.

## Commands

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # into dist/; the only automated check there is
npm run preview    # serve dist/
npm run webp -- [--width N | --square N] <image>...   # resized .webp next to each image
npm run fetch-assets   # re-downloads images listed in scripts/assets.txt that are missing
```

There are no tests and no linter. A change is verified by `npm run build` passing and by looking at the
affected pages in `npm run dev`, at desktop and phone width (about 375 px).

## Workflow

- Never push to `main`: it deploys straight to production. Work on a branch, open a PR, and the PR is
  squash-merged.
- Before opening a PR: `npm run build` passes, and every page you touched has been checked in the dev
  server.
- Commit and PR titles are short imperative sentences ("Add Tickets and Call for Papers pages"). The
  body is a few bullets describing what changes for a visitor, not which files changed.

## Layout of the code

| Path | Holds |
| --- | --- |
| `src/data/site.json` | Site-wide: name, titles, event facts (`event`), announcement bar, hero, stats, menu, footer, contacts |
| `src/data/home.json` | Homepage sections, also reused by other pages: sessions, tracks, photos, key dates, tickets, sponsors, venue |
| `src/data/committee.json` | Program committee (Team page and homepage) |
| `src/data/pages.json` | Title, caption and meta description of each text page |
| `src/content/pages/*.html` | Text pages (FAQ, Code of Conduct, terms, privacy...). Raw HTML, file name = URL slug |
| `src/pages/` | One `.astro` per page; `[slug].astro` renders the text pages; `robots.txt.js` |
| `src/layouts/Base.astro` | `<head>` (title, meta, canonical, Open Graph), header, menu, footer, Metricool analytics |
| `src/components/` | `SectionTitle` (house heading style) and `TicketTiers` (used on homepage and Tickets page) |
| `src/lib.js` | `url()` / `withBase()` base-path helpers, `withVat()`, `ticketOffers()` for schema.org |
| `src/styles/global.css`, `dark.css` | Base styles and the dark theme, which is loaded after it and is what ships |
| `astro.config.mjs` | `site`, `base`, `trailingSlash: 'always'`, redirects from the old WordPress URLs, sitemap |
| `public/images/` | All images, committed |

## Rules that are easy to break

**Base path.** The build supports a non-root base (`BASE` env var, e.g. `/devoxx.gr` on a github.io
URL), even though production is at `/`. Keep it working:
- In `.astro` files, wrap every internal link and image path with `url()` from `src/lib.js`.
  Absolute `https:`, `mailto:`, `tel:` and `#` links pass through unchanged.
- In JSON data, write root-relative paths (`/images/x.webp`, `/tickets/`); the templates add the base.
- HTML in `src/content/pages/` is passed through `withBase()`, which rewrites `href="/..."`,
  `src="/..."` and `url(/...)`. Write root-relative links there too.

**Trailing slashes.** `trailingSlash: 'always'`: internal links end in `/` (`/team/`, not `/team`).

**Menu highlight.** Each page passes `current` to `Base`, and it must equal a `label` in
`site.menu` exactly (`"Home"`, `"Tickets"`, `"CFP"`, ...). `[slug].astro` hard-codes `FAQ` for the
FAQ page.

**Redirects vs. new pages.** `astro.config.mjs` maps old WordPress URLs to new ones. `/speakers/`,
`/schedule/...`, `/talk/` and others currently go to `/`. When you build a real page at one of those
paths, remove its entry from the `moved` map, or the redirect and the page will collide. When you
rename or remove a page, add a redirect from the old path.

**Same facts in several places.** Dates, prices, the venue and the ticket rules are repeated in
`site.json`, `home.json` (`about.caption`, `dates`, `tickets`), and the HTML of `faq.html` and
`terms-of-participation.html`. When one changes, grep for the old value across `src/` and update every
copy (`grep -rn "April" src`, `grep -rn "180" src`).

The edition year is also hard-coded outside `site.name`: the countdown's end text in `index.astro`,
the descriptions of `sponsorships.astro` and `press-kit.astro` (and its intro paragraph), and the
descriptions in `pages.json`. For a new edition, `grep -rn "2027" src` and update every hit, plus
`site.event`, `site.announcement`, `home.tickets` and `home.dates`.

**Dark theme.** `dark.css` overrides colours from `global.css`. A new component styled only in
`global.css` may look wrong on the dark page; check it in the browser and add dark overrides to
`dark.css`. Three blocks are light on purpose: the stats cards, the Important dates band and the
closing cards.

## SEO conventions (from earlier SEO passes; keep them)

- Every page gives `Base` a `title` (rendered as `<title> – Devoxx Greece 2027`) and its own
  `description`. The homepage uses `site.homeTitle`.
- Exactly one `<h1>` per page: use `<SectionTitle level="h1" ...>` for the page heading, default
  `h2` for sections. Footer column titles are not headings.
- Every content image has meaningful `alt` text; purely decorative images use `alt=""`.
- Photos are referenced as `.webp` (see Images). The exception is the Open Graph / JSON-LD image
  (`site.hero.image`), which is a JPG; `site.hero.photo` is the WebP shown on the page.
- The homepage emits schema.org `Event` JSON-LD, with ticket offers built from `home.tickets` by
  `ticketOffers()`; the Team page emits `Person` markup. Keep them in step with the data.
- Canonical, Open Graph and JSON-LD URLs are always `https` (`astro.config.mjs` forces it).
- New pages are picked up by the sitemap automatically (the 404 page and redirect stubs are left
  out). `noindex` on `Base` adds a robots `noindex` meta tag instead of a canonical link; the 404 page
  uses it.

## Images

- Commit both the original and its WebP copy under `public/images/`, and reference the `.webp`.
- Make the WebP with `npm run webp`. Sizes used so far:
  - hero photos: `--width 1920`
  - committee photos: `--square 240` (centre crop; small sources are scaled up)
  - other photos (atmosphere, sponsorships, press kit): the default, at most 1200 px wide
- `scripts/assets.txt` lists images that were imported from the old WordPress site. New images do not
  go there.

## Common changes

- **Ticket batch changes:** in `home.json` → `tickets.tiers`, set `state` to `on-sale`, `upcoming` or
  `sold-out`, and update `status` and `cta`. Only `on-sale` gets a live buy button; `state` also
  drives schema.org availability. Prices are written without VAT; the VAT rate is `tickets.vat` and
  `withVat()` computes the total where needed. Update `site.announcement` to match, and the FAQ prices
  if they changed.
- **Key dates:** `home.dates`; `done: true` marks a date as passed (gold marker on the timeline).
  Nothing sets it automatically.
- **Call for Papers:** the page is built open or closed from `site.event.cfpCloses`, and an inline
  script also switches to the closed message in the browser once that date passes, so the page does
  not need a rebuild on the closing day. For a new edition, update `cfp`, `cfpCloses` and
  `cfpClosesLabel`.
- **Sponsors:** add logos under `home.sponsors.tiers` (it is empty today):
  `{ "name": "Platinum", "sponsors": [{ "name": "Acme", "logo": "/images/sponsors/acme.png", "href": "https://acme.example" }] }`.
  Logos go in `public/images/sponsors/`, and the sponsor name is used as the logo's alt text.
- **Committee member:** add an entry to `committee.json` and a 240×240 WebP photo in
  `public/images/committee/`.
- **New text page:** add `src/content/pages/<slug>.html` and an entry with `title`, `caption` and
  `description` in `pages.json`. It is served at `/<slug>/`. Link it from `site.menu` or
  `site.footer` if visitors need to find it.
- **New page with its own layout:** add `src/pages/<name>.astro` using `Base` and `SectionTitle`,
  following `tickets.astro` or `call-for-papers.astro`. Read data from the JSON files rather than
  hard-coding facts that already exist there.

## Upcoming work

- **Speakers and schedule pages**, once the CFP has closed (30 November 2026) and the program is
  published. They replace today's redirects of `/speakers/` and `/schedule/...` to the homepage (see
  "Redirects vs. new pages").
- **Sponsor logos** in `home.sponsors.tiers` as sponsors sign.

## Writing style for site text

Short, plain sentences, describing what the visitor gets. Dates in new text are written
"15–17 April 2027" (en dash), as in `site.event.dates`. The site name is "Devoxx Greece 2027" and the
organiser is SoftConf.
