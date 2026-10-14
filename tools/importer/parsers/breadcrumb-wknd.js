/* eslint-disable */
/* global WebImporter */
/**
 * Parser for breadcrumb-wknd. Base: breadcrumb (custom, no library convention).
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (AEM Core Components cmp-breadcrumb)
 * Generated: 2026-10-07
 *
 * Output (matches blocks/breadcrumb-wknd/breadcrumb-wknd.js):
 *   row 1: block name
 *   row 2: one cell holding a <ul> of trail items -
 *          ancestors as links (absolute https://wknd.site/... URLs),
 *          last item (current page) as plain text.
 *
 * Validated selectors (source.html + all 16 /us/en/adventures/*.html pages):
 *   .cmp-breadcrumb__list > li.cmp-breadcrumb__item   trail item (x2 on every adventure page)
 *   a.cmp-breadcrumb__item-link                        ancestor link
 *   .cmp-breadcrumb__item--active                      current page (no link)
 */
const SITE_ORIGIN = 'https://wknd.site';

function absoluteHref(href) {
  const raw = (href || '').trim();
  if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return raw;
  try {
    const url = new URL(raw, SITE_ORIGIN);
    if (/^\//.test(raw) || /(^|\.)wknd\.site$/i.test(url.hostname)
      || /^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
      return `${SITE_ORIGIN}${url.pathname}${url.search}${url.hash}`;
    }
    return url.href;
  } catch (e) {
    return raw;
  }
}

const clean = (t) => (t || '').replace(/[\s ]+/g, ' ').trim();

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.cmp-breadcrumb__list > .cmp-breadcrumb__item')];
  if (!items.length) items = [...element.querySelectorAll('.cmp-breadcrumb__item, nav ol > li, nav ul > li')];

  const ul = document.createElement('ul');
  items.forEach((item, idx) => {
    const isLast = idx === items.length - 1;
    const link = item.querySelector('a[href]');
    const nameEl = item.querySelector('[itemprop="name"], span') || link || item;
    const text = clean(nameEl.textContent) || clean(item.textContent);
    if (!text) return;

    const li = document.createElement('li');
    if (link && !isLast && !item.classList.contains('cmp-breadcrumb__item--active')) {
      const a = document.createElement('a');
      a.href = absoluteHref(link.getAttribute('href'));
      a.textContent = text;
      li.append(a);
    } else {
      li.textContent = text;
    }
    ul.append(li);
  });

  if (!ul.children.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[ul]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumb-wknd', cells });
  element.replaceWith(block);
}
