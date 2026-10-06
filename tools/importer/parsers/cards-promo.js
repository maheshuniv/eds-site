/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards (no-image variant).
 * Source: https://wknd-adventures.com/adventures.html
 * Structure: 1 column; each row = text cell (tag paragraph, h3, paragraph, CTA link).
 * Validated selectors (source.html): :scope > .card, p.tag, h3, p, a.button--ghost.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .card')];
  if (!items.length) items = [...element.querySelectorAll(':scope > div, :scope > article')];

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    const content = [];
    const tag = item.querySelector('p.tag, .tag');
    if (tag && tag.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = tag.textContent.trim();
      content.push(p);
    }
    const heading = item.querySelector('h3, h2, h4');
    if (heading) content.push(heading);
    item.querySelectorAll('p').forEach((p) => {
      if (p !== tag && p.textContent.trim()) content.push(p);
    });
    item.querySelectorAll('a').forEach((a) => {
      if (a.closest('p, h1, h2, h3, h4, h5, h6')) return;
      const label = a.querySelector('.button-label');
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = (label || a).textContent.trim();
      // Ghost buttons map to italic = secondary button in scripts.js decorateButtons
      const em = document.createElement('em');
      em.append(link);
      p.append(em);
      content.push(p);
    });
    if (content.length) cells.push([content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
