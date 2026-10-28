/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-story. Base: columns.
 * Source: https://wknd-adventures.com/about.html
 * Structure (from blocks/columns-story/columns-story.js): one row, two cells:
 *   text cell (heading + paragraphs) | wide image cell.
 * Validated selectors (source.html): .grid-layout.tablet-1-column > div (text column),
 *   .section-heading h2, p; img.gallery-img--wide (direct child image).
 * Image src values are kept as-is (the cleanup transformer resolves relative paths).
 */
export default function parse(element, { document }) {
  const children = [...element.children];

  // image column: a direct-child image, or a child wrapper holding only an image
  let image = element.querySelector(':scope > img.gallery-img--wide, :scope > img');
  if (!image) {
    const imgWrap = children.find((c) => c.querySelector('img') && !c.textContent.trim());
    image = imgWrap ? imgWrap.querySelector('img') : element.querySelector('img.gallery-img--wide');
  }

  // text column: the first child holding text
  const textCol = children.find((c) => c !== image && c.textContent.trim()) || element;

  const textCell = [];
  const heading = textCol.querySelector('.section-heading h2, .section-heading h3, h2, h3');
  if (heading) textCell.push(heading);
  [...textCol.querySelectorAll('p')].forEach((p) => {
    if (p.textContent.trim() && !(heading && heading.contains(p))) textCell.push(p);
  });
  // keep any CTA links that are not inside the collected paragraphs
  [...textCol.querySelectorAll('a')].forEach((a) => {
    if (!textCell.some((n) => n.contains(a))) textCell.push(a);
  });

  if (!textCell.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell.length ? textCell : '', image || '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-story', cells });
  element.replaceWith(block);
}
