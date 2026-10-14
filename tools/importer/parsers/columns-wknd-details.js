/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-wknd-details. Base: columns.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (AEM Core Components content fragment, element view)
 * Generated: 2026-10-07
 *
 * Output (matches blocks/columns-wknd-details/columns-wknd-details.js):
 *   row 1: block name
 *   each following row: 2 cells = label | value
 *   (Activity, Adventure Type, Trip Length, Group Size, Difficulty, Price)
 *
 * Validated selectors (source.html + all 16 /us/en/adventures/*.html pages, 6 elements each):
 *   dl.cmp-contentfragment__elements > .cmp-contentfragment__element   detail (repeating unit, x6)
 *   dt.cmp-contentfragment__element-title                              label
 *   dd.cmp-contentfragment__element-value                              value
 * The fragment title (h3.cmp-contentfragment__title) repeats the page title and is not part of the block.
 */
const clean = (t) => (t || '').replace(/[\s ]+/g, ' ').trim();

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.cmp-contentfragment__elements > .cmp-contentfragment__element')];
  if (!items.length) items = [...element.querySelectorAll('.cmp-contentfragment__element')];

  const cells = [];
  items.forEach((item) => {
    const labelEl = item.querySelector('.cmp-contentfragment__element-title') || item.querySelector('dt');
    const valueEl = item.querySelector('.cmp-contentfragment__element-value') || item.querySelector('dd');
    const label = clean(labelEl && labelEl.textContent);
    const value = clean(valueEl && valueEl.textContent);
    if (!label && !value) return;
    cells.push([label, value]);
  });

  if (!cells.length) {
    // Fallback: bare definition list without CF classes
    const dts = [...element.querySelectorAll('dt')];
    dts.forEach((dt) => {
      const dd = dt.nextElementSibling && dt.nextElementSibling.matches('dd') ? dt.nextElementSibling : null;
      const label = clean(dt.textContent);
      const value = clean(dd && dd.textContent);
      if (label || value) cells.push([label, value]);
    });
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // pages whose fragment is authored with narrower phone/tablet columns (aem-GridColumn--phone--7 /
  // --tablet--9) get the "narrow" option; others stay full width when stacked
  const narrow = /aem-GridColumn--(phone|tablet)--\d+/.test(element.className || '');
  const block = WebImporter.Blocks.createBlock(document, { name: narrow ? 'columns-wknd-details (narrow)' : 'columns-wknd-details', cells });
  element.replaceWith(block);
}
