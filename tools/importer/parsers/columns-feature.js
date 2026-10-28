/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base: columns.
 * Source: https://wknd-adventures.com/adventures.html
 * Structure: row 2 = cell 1 image | cell 2 tag paragraph, H2, paragraph, button link.
 * Validated selectors (source.html): .featured-article-image img, p.tag, h2, p.paragraph-lg,
 * .featured-article-footer a.button
 */
export default function parse(element, { document }) {
  const imageWrap = element.querySelector(':scope > .featured-article-image, :scope > [class*="image"]');
  const image = (imageWrap || element).querySelector('picture, img');

  // Text column: the direct child that is not the image wrapper
  const textCol = [...element.querySelectorAll(':scope > div')].find((d) => d !== imageWrap) || element;

  const tag = textCol.querySelector('p.tag, .tag');
  const heading = textCol.querySelector('h2, h1, h3');
  const paragraphs = [...textCol.querySelectorAll('p')].filter((p) => p !== tag && !p.closest('.featured-article-footer'));
  const ctas = [...textCol.querySelectorAll('.featured-article-footer a, a.button')]
    .filter((a, i, arr) => arr.indexOf(a) === i);

  if (!heading && !paragraphs.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const textCell = [];
  if (tag) textCell.push(tag);
  if (heading) textCell.push(heading);
  textCell.push(...paragraphs);
  ctas.forEach((a) => {
    const label = a.querySelector('.button-label');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = (label || a).textContent.trim();
    // Bold = primary button (scripts.js decorateButtons only buttonizes emphasized links)
    const strong = document.createElement('strong');
    strong.append(link);
    const p = document.createElement('p');
    p.append(strong);
    textCell.push(p);
  });

  const cells = [[image || '', textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
