/* eslint-disable */
/* global WebImporter */
/**
 * Parser for gallery-adventure. Base: columns (custom image gallery).
 * Source: https://wknd-adventures.com/
 * Structure (from blocks/gallery-adventure/gallery-adventure.js): one row per visual row,
 *   one image per cell. Row 1 = the 3-up grid images; row 2 = the full-width wide image.
 *   Rows are padded with empty cells to an even width; the block drops empty cells, so a
 *   row holding one image still renders full width.
 * Validated selectors (source.html): .grid-layout.grid-images > img.gallery-img,
 *   following sibling .utility-margin-top-lg > img.gallery-img--wide (consumed and removed).
 * Image src values are kept as-is (the cleanup transformer resolves relative paths).
 */
export default function parse(element, { document }) {
  // Row 1: the grid images (direct children first, any descendant image as fallback)
  let gridImages = [...element.querySelectorAll(':scope > img')];
  if (!gridImages.length) gridImages = [...element.querySelectorAll('img')];

  // Row 2: the wide image held by the following sibling wrapper
  const wideRows = [];
  const next = element.nextElementSibling;
  if (next && next.matches('.utility-margin-top-lg')
    && next.querySelector('img') && !next.textContent.trim()) {
    const wideImages = [...next.querySelectorAll('img')];
    wideRows.push(wideImages);
    next.remove();
  }

  if (!gridImages.length && !wideRows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const rows = [];
  if (gridImages.length) rows.push(gridImages);
  rows.push(...wideRows);

  const width = Math.max(...rows.map((r) => r.length));
  const cells = rows.map((r) => {
    const row = [...r];
    while (row.length < width) row.push('');
    return row;
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'gallery-adventure', cells });
  element.replaceWith(block);
}
