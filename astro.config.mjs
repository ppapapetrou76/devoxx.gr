import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE and BASE are set by the GitHub Pages workflow. With the custom domain
// (devoxx.gr) BASE is "/"; on the temporary github.io preview it is "/devoxx.gr".
const base = process.env.BASE || '/';
const prefix = base.replace(/\/$/, '');

// GitHub Pages reports the custom domain as http:// until "Enforce HTTPS" is on.
// Canonical, social and structured-data URLs must always be https.
const site = (process.env.SITE || 'https://devoxx.gr').replace(/^http:\/\//, 'https://');

// Addresses of the old WordPress site, sent to the closest page of this one.
const moved = {
  '/press-kit-2/': '/press-kit/',
  '/register/': '/tickets/',
  '/cfp/': '/call-for-papers/',
  '/venue/': '/#venue',
  '/sponsors/': '/#sponsors',
  '/tracks/': '/#tracks',
  '/program-committee/': '/team/',
  '/practical-tips-info/': '/faq/',
  '/info-for-speakers/': '/call-for-papers/',
  '/speakers/': '/',
  '/talk/': '/',
  '/schedule/': '/',
  '/schedule/speaker-details/': '/',
  '/schedule/talks-by-tracks/': '/',
  '/schedule/talks-by-sessions/': '/',
  '/schedule/search-results/': '/',
  '/schedule/wednesday-schedule/': '/',
  '/schedule/thursday-schedule/': '/',
  '/schedule/friday-schedule/': '/',
  '/schedule/my-schedule/': '/',
  '/overview/': '/',
  '/mobile-app/': '/',
  '/newsletters/': '/#contact',
  '/buddiesprogram/': '/',
  '/workshop-1/': '/',
};

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  redirects: Object.fromEntries(Object.entries(moved).map(([from, to]) => [from, prefix + to])),
  integrations: [sitemap()],
});
