/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-wknd-author. Base: columns.
 * Source: https://wknd.site/us/en/magazine/arctic-surfing.html (+ all /us/en/magazine/*.html)
 * Generated: 2026-10-07
 *
 * Output (matches blocks/columns-wknd-author/columns-wknd-author.js):
 *   row 1: block name
 *   row 2: [ photo | name (h2), roles <p>, social <p> ]
 *          social <p> = plain text links "Facebook | Twitter | Instagram" with source hrefs.
 *          The " | " separators stop html2md merging adjacent anchors with equal hrefs ("#").
 *
 * Validated selectors (source.html + instances/01-03.html):
 *   .cmp-byline__image img        author photo (relative /content/experience-fragments/... src)
 *   .cmp-byline__image .cmp-image[data-cmp-src]   lazy-image fallback ({.width} template)
 *   .cmp-byline__name             author name (h2)
 *   .cmp-byline__occupations      roles line
 *   .cmp-buildingblock--btn-list a.cmp-button   social links (label in .cmp-button__text)
 *   .cmp-separator                decorative rule - dropped (block draws its own)
 */
const SITE_ORIGIN = 'https://wknd.site';

function absoluteUrl(src) {
  const raw = (src || '').trim();
  if (!raw || /^data:/i.test(raw)) return '';
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

const clean = (t) => (t || '').replace(/[\s ]+/g, ' ').trim();

export default function parse(element, { document }) {
  const byline = element.querySelector('.cmp-byline') || element;

  // photo
  let photo = null;
  const srcImg = byline.querySelector('.cmp-byline__image img, img.cmp-image__image, img');
  let src = srcImg ? srcImg.getAttribute('src') : '';
  if (!src || /^data:/i.test(src)) {
    const lazy = byline.querySelector('[data-cmp-src]');
    if (lazy) src = lazy.getAttribute('data-cmp-src').replace('{.width}', '');
  }
  if (src) {
    photo = document.createElement('img');
    photo.src = absoluteUrl(src);
    photo.alt = (srcImg && srcImg.getAttribute('alt')) || '';
  }

  // name
  const nameSrc = byline.querySelector('.cmp-byline__name, h1, h2, h3, h4');
  const name = nameSrc ? clean(nameSrc.textContent) : '';
  // roles
  const rolesSrc = byline.querySelector('.cmp-byline__occupations')
    || [...byline.querySelectorAll('p')].find((p) => clean(p.textContent));
  const roles = rolesSrc ? clean(rolesSrc.textContent) : '';

  // social links
  let socialSrc = [...element.querySelectorAll('.cmp-buildingblock--btn-list a.cmp-button')];
  if (!socialSrc.length) socialSrc = [...element.querySelectorAll('a.cmp-button, .button a[href]')];
  const socialP = document.createElement('p');
  socialSrc.forEach((a) => {
    const label = clean(a.querySelector('.cmp-button__text')?.textContent)
      || clean(a.getAttribute('aria-label')) || clean(a.textContent);
    if (!label) return;
    const link = document.createElement('a');
    link.href = a.getAttribute('href') || '#';
    link.textContent = label;
    if (socialP.childNodes.length) socialP.append(document.createTextNode(' | '));
    socialP.append(link);
  });

  if (!name && !photo) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const text = [];
  if (name) {
    const h = document.createElement('h2');
    h.textContent = name;
    text.push(h);
  }
  if (roles) {
    const p = document.createElement('p');
    p.textContent = roles;
    text.push(p);
  }
  if (socialP.childNodes.length) text.push(socialP);

  const cells = [[photo || '', text]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-wknd-author', cells });
  element.replaceWith(block);
}
