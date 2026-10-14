/*
 * Columns (WKND details) block
 * Each authored row = label | value (e.g. Activity | Surfing).
 * Rendered as a definition list: <dl><div><dt>label</dt><dd>value</dd></div>…</dl>.
 * A single-cell row of the form "Label: value" is split on the first colon;
 * extra cells are appended to the value.
 */

function moveContent(from, to) {
  // unwrap a lone paragraph so dt/dd hold inline content
  const only = from.children.length === 1 ? from.firstElementChild : null;
  const source = only && only.tagName === 'P' && from.textContent.trim() === only.textContent.trim()
    ? only : from;
  to.append(...source.childNodes);
}

export default function decorate(block) {
  const dl = document.createElement('dl');
  dl.className = 'columns-wknd-details-list';

  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('img, picture'));
    if (!cells.length) return;

    const item = document.createElement('div');
    item.className = 'columns-wknd-details-item';
    const dt = document.createElement('dt');
    dt.className = 'columns-wknd-details-label';
    const dd = document.createElement('dd');
    dd.className = 'columns-wknd-details-value';

    if (cells.length === 1) {
      const text = cells[0].textContent.trim();
      const sep = text.indexOf(':');
      if (sep > 0) {
        dt.textContent = text.slice(0, sep).trim();
        dd.textContent = text.slice(sep + 1).trim();
      } else {
        moveContent(cells[0], dd);
      }
    } else {
      moveContent(cells[0], dt);
      cells.slice(1).forEach((cell, i) => {
        if (i > 0) dd.append(' ');
        moveContent(cell, dd);
      });
    }

    if (dt.textContent.trim()) item.append(dt);
    item.append(dd);
    dl.append(item);
  });

  block.replaceChildren(dl);
}
