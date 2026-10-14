/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-aside. Base: columns.
 * Source: https://wknd-adventures.com/blog/patagonia-trek.html (all /blog/*.html share the structure)
 * Structure (blocks/columns-aside/columns-aside.js): one row, two cells:
 *   left  = H3 + list (detail cell)
 *   right = blockquote with the pull-quote paragraph(s), then an attribution paragraph
 *           starting with "— " after the blockquote (decorateQuote picks it up as attribution).
 * Validated selectors (source.html): :scope > div:not(.span-2) (h3 + ul.blog-gear-list),
 *   :scope > .span-2 blockquote.pull-quote, p.pull-quote-body, cite.pull-quote-attribution
 */
export default function parse(element, { document }) {
  const children = [...element.children];
  const quoteCol = element.querySelector(':scope > .span-2')
    || children.find((c) => c.querySelector('.pull-quote, blockquote'));
  const detailCol = children.find((c) => c !== quoteCol && c.querySelector('h1, h2, h3, h4, h5, h6, ul, ol'))
    || children.find((c) => c !== quoteCol);

  // Left cell: heading + list (plus any other authored content in that column)
  const leftCell = [];
  if (detailCol) {
    [...detailCol.children].forEach((el) => {
      if (el.textContent.trim() || el.querySelector('img')) leftCell.push(el);
    });
  }

  // Right cell: quote body paragraph(s) in a blockquote, then "— attribution" paragraph
  const rightCell = [];
  if (quoteCol) {
    const pull = quoteCol.querySelector('.pull-quote') || quoteCol.querySelector('blockquote') || quoteCol;
    const attributionEl = pull.querySelector('.pull-quote-attribution') || pull.querySelector('cite');
    let bodies = [...pull.querySelectorAll('.pull-quote-body')];
    if (!bodies.length) bodies = [...pull.querySelectorAll('p')].filter((p) => !p.contains(attributionEl));

    if (bodies.length) {
      const blockquote = document.createElement('blockquote');
      bodies.forEach((b) => {
        const p = document.createElement('p');
        p.innerHTML = b.innerHTML;
        blockquote.append(p);
      });
      rightCell.push(blockquote);
    }

    if (attributionEl) {
      const text = attributionEl.textContent.replace(/\s+/g, ' ').trim();
      if (text) {
        const p = document.createElement('p');
        p.textContent = /^[—–-]/.test(text) ? text : `— ${text}`;
        rightCell.push(p);
      }
    }
  }

  if (!leftCell.length && !rightCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[leftCell.length ? leftCell : '', rightCell.length ? rightCell : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-aside', cells });
  element.replaceWith(block);
}
