/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-magazine-secure. Base: cards.
 * Source: https://wknd.site/us/en/magazine.html (AEM Core Components teasers, .teaser.cmp-teaser--secure)
 * Generated: 2026-10-07
 *
 * The page renders each gated teaser as its own sibling element (Alaskan Adventure,
 * Fly Fishing the Amazon). The parser receives the first one, collects it plus every
 * immediately-following sibling .teaser.cmp-teaser--secure, and emits ONE block:
 *   one row per teaser = image cell | text cell (heading, description, "Read More" label paragraph)
 * The "Read More" label is not a link on the source, so it is kept as a plain paragraph.
 * Extra siblings are removed afterwards (the import script skips detached elements).
 *
 * Validated selectors (source.html + instances/01.html): .cmp-teaser__title,
 * .cmp-teaser__description (with or without inner <p>), .cmp-teaser__action-container,
 * .cmp-teaser__image img.
 */
const TEASER_SELECTOR = '.teaser.cmp-teaser--secure';

function textParagraphs(container, document) {
  if (!container) return [];
  const paras = [...container.querySelectorAll('p')].filter((p) => p.textContent.trim());
  if (paras.length) {
    return paras.map((src) => {
      const p = document.createElement('p');
      p.textContent = src.textContent.trim();
      return p;
    });
  }
  const text = container.textContent.trim();
  if (!text) return [];
  const p = document.createElement('p');
  p.textContent = text;
  return [p];
}

export default function parse(element, { document }) {
  // Collect this teaser plus all immediately-following sibling secure teasers.
  const teasers = [element];
  let next = element.nextElementSibling;
  while (next && next.matches(TEASER_SELECTOR)) {
    teasers.push(next);
    next = next.nextElementSibling;
  }

  const cells = [];
  teasers.forEach((teaser) => {
    const image = teaser.querySelector('.cmp-teaser__image img, .cmp-image img, img');
    const heading = teaser.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
    const description = teaser.querySelector('.cmp-teaser__description');
    const action = teaser.querySelector('.cmp-teaser__action-container');

    const textCell = [];
    if (heading && heading.textContent.trim()) {
      const h = document.createElement(/^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h2');
      h.textContent = heading.textContent.trim();
      textCell.push(h);
    }
    textCell.push(...textParagraphs(description, document));
    if (action && action.textContent.trim()) {
      // Non-link status label on the source: keep as a plain paragraph.
      const p = document.createElement('p');
      p.textContent = action.textContent.trim().replace(/\s+/g, ' ');
      textCell.push(p);
    }

    if (!image && !textCell.length) return;
    cells.push([image || '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-magazine-secure', cells });
  teasers.slice(1).forEach((t) => t.remove());
  element.replaceWith(block);
}
