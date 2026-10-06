/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-index. Base: cards (no-image variant).
 * Source: https://wknd-adventures.com/adventures.html
 * Structure: 1 column; each row = text cell (number paragraph, h3, paragraph).
 * Validated selectors (source.html): .editorial-index-item, .editorial-index-number, h3, p.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .editorial-index-item')];
  if (!items.length) items = [...element.querySelectorAll('.editorial-index-item, :scope > div')];

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    const content = [];
    const num = item.querySelector('.editorial-index-number, [class*="number"]');
    if (num && num.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = num.textContent.trim();
      content.push(p);
    }
    const heading = item.querySelector('h3, h2, h4');
    if (heading) content.push(heading);
    item.querySelectorAll('p').forEach((p) => {
      if (p !== num && p.textContent.trim()) content.push(p);
    });
    item.querySelectorAll('a').forEach((a) => {
      if (!a.closest('p, h1, h2, h3, h4, h5, h6')) {
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = a.textContent.trim();
        p.append(link);
        content.push(p);
      }
    });
    if (content.length) cells.push([content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-index', cells });
  element.replaceWith(block);
}
