/*
 * Accordion (WKND) block
 * Each authored row = question cell | answer cell.
 * All items start closed, several can be open at once, opening an item
 * writes its id to the URL hash, and an item matching location.hash on load starts open.
 */

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueId(base, used) {
  const root = base || 'item';
  let id = root;
  let n = 2;
  while (used.has(id) || document.getElementById(id)) {
    id = `${root}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

function setOpen(item, open) {
  const button = item.querySelector('.accordion-wknd-button');
  const panel = item.querySelector('.accordion-wknd-panel');
  if (!button || !panel) return;
  item.classList.toggle('is-open', open);
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
  panel.hidden = !open;
}

function openFromHash(block) {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (!hash) return;
  const item = [...block.querySelectorAll('.accordion-wknd-item')].find((el) => el.id === hash);
  if (item) setOpen(item, true);
}

export default function decorate(block) {
  const used = new Set();
  const list = document.createElement('div');
  list.className = 'accordion-wknd-items';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const questionCell = cells[0];
    const answerCells = cells.slice(1);
    const questionText = questionCell.textContent.trim();
    // skip completely empty rows
    if (!questionText && answerCells.every((c) => !c.textContent.trim() && !c.querySelector('img, picture'))) return;

    const id = uniqueId(slugify(questionText), used);

    const item = document.createElement('div');
    item.className = 'accordion-wknd-item';
    item.id = id;

    const heading = document.createElement('h3');
    heading.className = 'accordion-wknd-header';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-wknd-button';
    button.id = `${id}-button`;
    button.setAttribute('aria-controls', `${id}-panel`);

    const title = document.createElement('span');
    title.className = 'accordion-wknd-title';
    // keep inline formatting but drop wrapping block elements (e.g. <p>)
    const inner = questionCell.querySelector(':scope > p:only-child') || questionCell;
    title.append(...inner.childNodes);

    const icon = document.createElement('span');
    icon.className = 'accordion-wknd-icon';
    icon.setAttribute('aria-hidden', 'true');

    button.append(title, icon);
    heading.append(button);

    const panel = document.createElement('div');
    panel.className = 'accordion-wknd-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', button.id);
    answerCells.forEach((cell) => panel.append(...cell.childNodes));

    item.append(heading, panel);
    setOpen(item, false);

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      setOpen(item, open);
      if (open && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', `#${id}`);
      }
    });

    list.append(item);
  });

  block.replaceChildren(list);

  openFromHash(block);
  window.addEventListener('hashchange', () => openFromHash(block));
}
