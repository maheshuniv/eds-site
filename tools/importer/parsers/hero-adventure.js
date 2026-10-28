/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-adventure. Base: hero.
 * Source: https://wknd-adventures.com/adventures.html
 * Structure: 1 column; row 2 = background image; row 3 = tag paragraph, H1, lead paragraph.
 * Validated selectors (source.html): .hero-bg img, .hero-content-inner p.tag, h1, p.hero-lead
 */
export default function parse(element, { document }) {
  const bgImage = element.querySelector('.hero-bg img, :scope > img, picture img');
  const content = element.querySelector('.hero-content-inner, .hero-content') || element;

  const tag = content.querySelector('p.tag, .tag');
  const heading = content.querySelector('h1, h2');
  const lead = content.querySelector('p.hero-lead, p[class*="paragraph-xl"]');

  // Remaining paragraphs / CTAs not already captured (handles variations)
  const extras = [...content.querySelectorAll('p, a.button')].filter(
    (el) => el !== tag && el !== lead && !el.closest('p.tag') && !(el.tagName === 'A' && el.closest('p')),
  );

  if (!heading && !lead && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bgImage) cells.push([bgImage]);

  const contentCell = [];
  if (tag) contentCell.push(tag);
  if (heading) contentCell.push(heading);
  if (lead) contentCell.push(lead);
  extras.forEach((el) => { if (!contentCell.includes(el)) contentCell.push(el); });
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-adventure', cells });
  element.replaceWith(block);
}
