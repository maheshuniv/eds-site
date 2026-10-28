/*
 * quote-wknd: wknd.site pull quote (magazine articles).
 * Content model (Block Collection quote):
 *   row 1 = quotation (required)
 *   row 2 = attribution (optional)
 * Renders <blockquote>: .quote-wknd-quotation, .quote-wknd-rule, footer.quote-wknd-attribution.
 */

const OPTION_CLASSES = [];

/**
 * Returns the non-empty content cells of the block, one per row.
 * Extra cells in a row are merged into the first cell so no authored content is lost.
 * @param {Element} block
 * @returns {Element[]}
 */
function getRowCells(block) {
  return [...block.children]
    .map((row) => {
      const cells = [...row.children];
      if (!cells.length) return null;
      const [first, ...rest] = cells;
      rest.forEach((extra) => first.append(...extra.childNodes));
      return first;
    })
    .filter((cell) => cell && (cell.textContent.trim() || cell.querySelector('img, picture')));
}

/**
 * Wraps loose text in a paragraph so styling always has a block element to target.
 * @param {Element} cell
 */
function ensureParagraph(cell) {
  if (cell.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol')) return;
  const p = document.createElement('p');
  p.append(...cell.childNodes);
  cell.append(p);
}

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const [quotation, attribution, ...extra] = getRowCells(block);
  if (!quotation) {
    block.replaceChildren();
    return;
  }

  const blockquote = document.createElement('blockquote');

  // quotation: authors sometimes paste the quote as a nested blockquote — unwrap it
  quotation.querySelectorAll('blockquote').forEach((bq) => bq.replaceWith(...bq.childNodes));
  ensureParagraph(quotation);
  quotation.className = 'quote-wknd-quotation';
  blockquote.append(quotation);

  // decorative rule under the quote
  const rule = document.createElement('span');
  rule.className = 'quote-wknd-rule';
  rule.setAttribute('aria-hidden', 'true');
  blockquote.append(rule);

  // any rows after the attribution are treated as more attribution text
  if (attribution) {
    extra.forEach((cell) => attribution.append(...cell.childNodes));
    const footer = document.createElement('footer');
    footer.className = 'quote-wknd-attribution';
    ensureParagraph(attribution);
    footer.append(...attribution.childNodes);
    // italic text in the attribution is the cited work/source
    footer.querySelectorAll('em').forEach((em) => {
      const cite = document.createElement('cite');
      cite.append(...em.childNodes);
      em.replaceWith(cite);
    });
    blockquote.append(footer);
  }

  block.replaceChildren(blockquote);
}
