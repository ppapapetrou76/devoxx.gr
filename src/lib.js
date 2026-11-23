// Helpers for the base path, so the site works both on devoxx.gr ("/")
// and on a github.io project URL ("/devoxx.gr/").
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const url = (path) => (/^(https?:|mailto:|tel:|#)/.test(path) ? path : base + path);

export const withBase = (html) =>
  base
    ? html
        .replace(/\b(href|src)="\/(?!\/)/g, `$1="${base}/`)
        .replace(/url\(\/(?!\/)/g, `url(${base}/`)
    : html;

export const isExternal = (path) => /^https?:/.test(path);

// Ticket price including Greek VAT, e.g. "223.20".
export const withVat = (price, vat) => (Number(price) * (1 + vat / 100)).toFixed(2);

// schema.org offers for the ticket batches (prices include VAT, as buyers pay them).
export const ticketOffers = (tickets, event) =>
  tickets.tiers.map((t) => ({
    '@type': 'Offer',
    name: `${t.name} ticket`,
    url: event.tickets,
    price: withVat(t.price, tickets.vat),
    priceCurrency: 'EUR',
    availability:
      t.state === 'on-sale' ? 'https://schema.org/InStock'
      : t.state === 'sold-out' ? 'https://schema.org/SoldOut'
      : 'https://schema.org/PreOrder',
    ...(t.validFrom ? { validFrom: t.validFrom } : {}),
  }));
