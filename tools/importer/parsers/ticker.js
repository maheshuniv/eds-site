/* eslint-disable */
/* global WebImporter */
/**
 * Parser for ticker.
 * Source: https://wknd-adventures.com/basecamp.html
 * Structure: 1 column; one row holding the words (authored once), separated by " · ".
 * Validated selectors (source): .ticker-strip > .ticker-track (words as text), span.ticker-sep (separators).
 * The source track repeats the words for its loop; the repeat is dropped (the block re-creates it).
 */
export default function parse(element, { document }) {
  // read the words from the text, split on the separators: the importer unwraps plain <span>s,
  // so words may be bare text nodes between the span.ticker-sep elements
  const track = element.querySelector('.ticker-track') || element;
  const seps = [...track.querySelectorAll('.ticker-sep')].map((s) => s.textContent.trim()).filter(Boolean);
  const sep = seps[0] || '·';
  const words = track.textContent.split(sep).map((w) => w.replace(/\s+/g, ' ').trim()).filter(Boolean);

  // keep the first loop only: stop at the first repeat of the opening sequence
  let unique = words;
  for (let len = 1; len <= words.length / 2; len += 1) {
    if (words.length % len === 0 && words.every((w, i) => w === words[i % len])) {
      unique = words.slice(0, len);
      break;
    }
  }

  if (!unique.length) {
    element.remove();
    return;
  }

  // one paragraph of "·"-separated words (a list-only cell is dropped by the md conversion)
  const p = document.createElement('p');
  p.textContent = unique.join(' · ');

  const block = WebImporter.Blocks.createBlock(document, { name: 'ticker', cells: [[p]] });
  element.replaceWith(block);
}
