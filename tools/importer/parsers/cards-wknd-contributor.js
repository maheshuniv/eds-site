/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-wknd-contributor. Base: cards.
 * Source: https://wknd.site/us/en/about-us.html (AEM Core Components)
 *
 * Each contributor card is its own sibling element in the AEM grid
 * (section.experiencefragment.cmp-experience-fragment--contributor). Consecutive
 * cards form one run (e.g. 4 after "Our Contributors", 3 after "WKND Guides").
 * The first card of a run builds ONE block holding every card of the run and
 * removes the consumed siblings; later cards of a run are skipped.
 *
 * Block table (Cards convention: 2 columns, one row per card):
 *   image | text: h3 name, p roles, p social links (Facebook/Twitter/Instagram)
 *
 * Generated: 2026-10-07
 */
const CARD_CLASS = 'cmp-experience-fragment--contributor';

function isCard(el) {
  return !!el && !!el.classList && el.classList.contains(CARD_CLASS);
}

function buildRow(card, document) {
  // Photo
  const img = card.querySelector('.cmp-image img, img.cmp-image__image') || card.querySelector('img');

  // Name: h3 title (fallback: first heading)
  const nameSrc = card.querySelector('h3.cmp-title__text') || card.querySelector('h1, h2, h3, h4');
  // Roles: h5 title (fallback: next title component)
  let rolesSrc = card.querySelector('h5.cmp-title__text');
  if (!rolesSrc) {
    const titles = [...card.querySelectorAll('.cmp-title__text')].filter((t) => t !== nameSrc);
    rolesSrc = titles[0] || null;
  }

  // Social links in source order
  let linkEls = [...card.querySelectorAll('.buildingblock a.cmp-button')];
  if (!linkEls.length) linkEls = [...card.querySelectorAll('a.cmp-button')];

  const name = nameSrc ? nameSrc.textContent.trim() : '';
  const roles = rolesSrc ? rolesSrc.textContent.trim() : '';
  if (!img && !name && !roles && !linkEls.length) return null;

  const textCell = [];
  if (name) {
    const h3 = document.createElement('h3');
    h3.textContent = name;
    textCell.push(h3);
  }
  if (roles) {
    const p = document.createElement('p');
    p.textContent = roles;
    textCell.push(p);
  }
  if (linkEls.length) {
    const p = document.createElement('p');
    linkEls.forEach((src, i) => {
      const label = (src.querySelector('.cmp-button__text')?.textContent || src.textContent || '').trim()
        || src.getAttribute('aria-label') || '';
      const a = document.createElement('a');
      a.setAttribute('href', src.getAttribute('href') || '#');
      a.textContent = label;
      // visible separator keeps adjacent links (often identical hrefs) from merging
      if (i > 0) p.append(document.createTextNode(' | '));
      p.append(a);
    });
    textCell.push(p);
  }

  let imageCell = '';
  if (img) {
    if (!img.getAttribute('alt') && name) img.setAttribute('alt', name);
    imageCell = img;
  }
  return [imageCell, textCell.length ? textCell : ''];
}

export default function parse(element, { document }) {
  // Already consumed as part of an earlier run
  if (isCard(element.previousElementSibling)) return;

  const run = [element];
  let next = element.nextElementSibling;
  while (isCard(next)) {
    run.push(next);
    next = next.nextElementSibling;
  }

  const cells = [];
  run.forEach((card) => {
    const row = buildRow(card, document);
    if (row) cells.push(row);
  });

  run.slice(1).forEach((c) => c.remove());
  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-wknd-contributor', cells });
  element.replaceWith(block);
}
