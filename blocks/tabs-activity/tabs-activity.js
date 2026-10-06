import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

let instanceCount = 0;

/**
 * Splits a tab-content cell into card groups. A new card starts at each picture;
 * when the cell has no pictures, a new card starts at each heading instead.
 * @param {Element} cell the tab content cell
 * @returns {Element[][]} groups of nodes, one per card
 */
function groupCards(cell) {
  // unwrap pictures that the pipeline placed inside their own paragraph
  cell.querySelectorAll(':scope > p > picture').forEach((pic) => {
    const p = pic.parentElement;
    if (!p.textContent.trim() && p.children.length === 1) p.replaceWith(pic);
  });

  const nodes = [...cell.children];
  const hasPictures = nodes.some((n) => n.tagName === 'PICTURE' || n.querySelector('picture'));
  const isStart = (n) => (hasPictures
    ? (n.tagName === 'PICTURE' || (n.querySelector('picture') && !n.textContent.trim()))
    : /^H[1-6]$/.test(n.tagName));

  const groups = [];
  let current = null;
  nodes.forEach((n) => {
    // text before the first start marker (e.g. a tag before the first heading) begins a card
    if (!current || (isStart(n) && current.some(isStart))) {
      current = [];
      groups.push(current);
    }
    current.push(n);
  });
  return groups.filter((g) => g.some((n) => n.textContent.trim() || n.querySelector('picture') || n.tagName === 'PICTURE'));
}

/**
 * Builds one card list item from a group of authored nodes.
 * @param {Element[]} group nodes belonging to one card
 * @returns {HTMLLIElement}
 */
function buildCard(group) {
  const li = document.createElement('li');
  li.className = 'tabs-activity-card';
  const imageWrap = document.createElement('div');
  imageWrap.className = 'tabs-activity-card-image';
  const body = document.createElement('div');
  body.className = 'tabs-activity-card-body';

  group.forEach((n) => {
    const pic = n.tagName === 'PICTURE' ? n : n.querySelector('picture');
    if (pic && !n.textContent.trim()) {
      const img = pic.querySelector('img');
      imageWrap.append(img ? createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]) : pic);
    } else {
      body.append(n);
    }
  });

  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    const prev = heading.previousElementSibling;
    if (prev && prev.tagName === 'P' && !prev.querySelector('a')) prev.classList.add('tabs-activity-card-tag');
  }

  // the whole card is clickable via the heading link (or first link) stretched over the card
  const link = (heading && heading.querySelector('a')) || body.querySelector('a');
  if (link) {
    link.classList.add('tabs-activity-card-link');
    li.classList.add('tabs-activity-card-linked');
  }

  if (imageWrap.children.length) li.append(imageWrap);
  li.append(body);
  return li;
}

/**
 * Tabs (activity): each row is "tab label | tab content". The tab content holds
 * repeating card groups (image, tag, linked heading, description) which this block
 * renders as a card grid inside the tab panel, since blocks cannot nest.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  instanceCount += 1;
  const prefix = `tabs-activity-${instanceCount}`;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-activity-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children].filter((row) => row.children.length);
  const panels = [];
  const buttons = [];

  const select = (index, focus = false) => {
    panels.forEach((panel, i) => panel.setAttribute('aria-hidden', i !== index));
    buttons.forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === index);
      btn.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    if (focus) buttons[index].focus();
  };

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    // content may be in the second cell; tolerate authors adding more cells
    const contentCells = cells.slice(1);
    const label = labelCell.textContent.trim() || `Tab ${i + 1}`;
    const id = `${prefix}-${toClassName(label) || i}`;

    const panel = document.createElement('div');
    panel.className = 'tabs-activity-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${id}-tab`);

    const ul = document.createElement('ul');
    ul.className = 'tabs-activity-grid';
    contentCells.forEach((cell) => {
      groupCards(cell).forEach((group) => ul.append(buildCard(group)));
    });
    if (ul.children.length) panel.append(ul);

    const button = document.createElement('button');
    button.className = 'tabs-activity-tab';
    button.id = `${id}-tab`;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    button.innerHTML = labelCell.innerHTML.trim() ? labelCell.innerHTML : label;
    // strip paragraph wrappers that would otherwise sit inside the button
    button.querySelectorAll('p').forEach((p) => p.replaceWith(...p.childNodes));
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', (e) => {
      const last = rows.length - 1;
      let next = null;
      if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
      else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = last;
      if (next !== null) {
        e.preventDefault();
        select(next, true);
      }
    });

    tablist.append(button);
    buttons.push(button);
    panels.push(panel);
  });

  block.replaceChildren(tablist, ...panels);
  if (panels.length) select(0);
}
