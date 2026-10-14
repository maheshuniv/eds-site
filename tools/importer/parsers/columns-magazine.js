/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-magazine. Base: columns.
 * Source: https://wknd.site/us/en/magazine.html (AEM Core Components teaser, .cmp-teaser--featured)
 * Generated: 2026-10-07
 *
 * Output: one row, two cells = image cell | text cell
 *   text cell: eyebrow paragraph, heading, description paragraph, bold CTA link (primary button).
 * Image is placed first even though the source renders the text first.
 *
 * Validated selectors (source.html): .cmp-teaser__pretitle, .cmp-teaser__title,
 * .cmp-teaser__description, .cmp-teaser__action-link, .cmp-teaser__image img.
 */
const SOURCE_ORIGIN = 'https://wknd.site';

function absoluteHref(href) {
  if (!href) return href;
  if (/^(mailto:|tel:|#|javascript:)/i.test(href)) return href;
  try {
    const url = new URL(href, SOURCE_ORIGIN);
    if (/^https?:$/.test(url.protocol) && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      return `${SOURCE_ORIGIN}${url.pathname}${url.search}${url.hash}`;
    }
    return url.href;
  } catch (e) {
    return href;
  }
}

export default function parse(element, { document }) {
  const teaser = element.querySelector('.cmp-teaser') || element;

  const pretitle = teaser.querySelector('.cmp-teaser__pretitle');
  const heading = teaser.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const description = teaser.querySelector('.cmp-teaser__description');
  const ctas = [...teaser.querySelectorAll('.cmp-teaser__action-link')];
  if (!ctas.length) {
    const fallback = teaser.querySelector('.cmp-teaser__action-container a, .cmp-teaser__content a[href]');
    if (fallback) ctas.push(fallback);
  }
  const image = teaser.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  if (!heading && !description && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Image cell
  const imageCell = [];
  if (image) imageCell.push(image);

  // Text cell
  const textCell = [];
  if (pretitle && pretitle.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = pretitle.textContent.trim();
    textCell.push(p);
  }
  if (heading) {
    const h = document.createElement(/^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h2');
    h.textContent = heading.textContent.trim();
    textCell.push(h);
  }
  if (description) {
    const paras = [...description.querySelectorAll('p')].filter((p) => p.textContent.trim());
    if (paras.length) {
      textCell.push(...paras);
    } else if (description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      textCell.push(p);
    }
  }
  ctas.forEach((a) => {
    const label = a.textContent.trim();
    if (!label) return;
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const link = document.createElement('a');
    link.href = absoluteHref(a.getAttribute('href'));
    link.textContent = label;
    strong.append(link);
    p.append(strong);
    textCell.push(p);
  });

  const cells = [[imageCell.length ? imageCell : '', textCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-magazine', cells });
  element.replaceWith(block);
}
