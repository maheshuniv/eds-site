const OPTION_CLASSES = [];

const ATTRIBUTION = /^\s*[—–-]/;

/**
 * Marks up a quote cell: quote paragraphs become a blockquote and a trailing
 * paragraph starting with a dash (or an authored <cite>) becomes the attribution.
 * @param {Element} cell the quote cell
 */
function decorateQuote(cell) {
  cell.classList.add('columns-aside-quote');
  let quote = cell.querySelector('blockquote');
  if (!quote) {
    quote = document.createElement('blockquote');
    [...cell.children].forEach((el) => quote.append(el));
    cell.append(quote);
  }

  const paras = [...quote.querySelectorAll(':scope > p')];
  let attribution = quote.querySelector('cite');
  if (!attribution) {
    const last = paras[paras.length - 1];
    if (last && paras.length > 1 && ATTRIBUTION.test(last.textContent)) attribution = last;
  }
  // an attribution paragraph authored after the blockquote, still in the cell
  if (!attribution) {
    const after = quote.nextElementSibling;
    if (after && after.tagName === 'P' && ATTRIBUTION.test(after.textContent)) attribution = after;
  }

  // the attribution sits inside the quote (under the same rule) as <p><cite>
  if (attribution) {
    const p = document.createElement('p');
    p.className = 'columns-aside-attribution';
    const cite = document.createElement('cite');
    cite.append(...attribution.childNodes);
    p.append(cite);
    const parent = attribution.parentElement;
    attribution.remove();
    if (parent !== quote && parent.tagName === 'P' && !parent.textContent.trim()) parent.remove();
    quote.append(p);
  }
  quote.querySelectorAll(':scope > p:not(.columns-aside-attribution)')
    .forEach((el) => el.classList.add('columns-aside-quote-body'));
}

/**
 * Columns (aside): one row of a narrow detail cell (H3 + short list) beside a wide
 * pull-quote cell (quote paragraph(s) + attribution). ~1/3 + 2/3 on desktop, stacked on mobile.
 * Tolerates extra rows, empty cells, a single cell, and a quote authored as a blockquote
 * or as plain paragraphs.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  [...block.children].forEach((row) => {
    row.className = 'columns-aside-row';
    const cells = [...row.children].filter((cell) => {
      if (cell.textContent.trim() || cell.querySelector('picture, img')) return true;
      cell.remove();
      return false;
    });
    if (!cells.length) {
      row.remove();
      return;
    }
    row.classList.add(`columns-aside-${cells.length}-cols`);

    cells.forEach((cell, i) => {
      const hasList = cell.querySelector('ul, ol');
      const looksLikeQuote = cell.querySelector('blockquote')
        || (!hasList && !cell.querySelector('h1, h2, h3, h4, h5, h6'));
      if (cells.length > 1 && i > 0 && looksLikeQuote) {
        decorateQuote(cell);
      } else {
        cell.classList.add('columns-aside-detail');
      }
    });
  });
}
