import { createOptimizedPicture } from '../../scripts/aem.js';

let instanceCount = 0;

/**
 * Splits an authored categories cell ("Climbing, Travel") into labels.
 * @param {Element} cell
 * @returns {string[]}
 */
function parseCategories(cell) {
  if (!cell) return [];
  return cell.textContent
    .split(/[,;\n]/)
    .map((c) => c.trim())
    .filter(Boolean);
}

const toKey = (label) => label.toLowerCase().replace(/\s+/g, '-');

/**
 * Builds one card <li> from an authored row.
 * Row: image | text (linked title, description) | categories.
 * @param {Element} row
 * @returns {{ li: Element, categories: string[] }}
 */
function buildCard(row) {
  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture'));
  const otherCells = cells.filter((c) => c !== imageCell);
  // the last non-image cell is the categories cell when there are 2+ of them
  const categoriesCell = otherCells.length > 1 ? otherCells.pop() : null;

  const li = document.createElement('li');
  if (imageCell) {
    imageCell.className = 'cards-wknd-adventure-card-image';
    li.append(imageCell);
  }
  if (otherCells.length) {
    const body = document.createElement('div');
    body.className = 'cards-wknd-adventure-card-body';
    otherCells.forEach((c) => {
      while (c.firstChild) body.append(c.firstChild);
    });
    li.append(body);

    // styling hooks: first heading / link-only paragraph is the title, other paragraphs describe
    const title = body.querySelector('h1, h2, h3, h4, h5, h6')
      || [...body.querySelectorAll(':scope > p')].find((p) => {
        const a = p.querySelector('a');
        return a && p.textContent.trim() === a.textContent.trim();
      })
      || body.querySelector(':scope > p');
    if (title) title.classList.add('cards-wknd-adventure-card-title');
    body.querySelectorAll(':scope > p').forEach((p) => {
      if (p !== title) p.classList.add('cards-wknd-adventure-card-description');
    });

    // the source tile image links to the adventure, like the title
    const href = title?.querySelector('a')?.href;
    const pic = imageCell?.querySelector('picture');
    if (href && pic && !pic.closest('a')) {
      const a = document.createElement('a');
      a.href = href;
      a.tabIndex = -1;
      a.setAttribute('aria-hidden', 'true');
      pic.replaceWith(a);
      a.append(pic);
    }
  }

  const categories = parseCategories(categoriesCell);
  li.dataset.categories = categories.map(toKey).join(' ');
  return { li, categories };
}

export default function decorate(block) {
  instanceCount += 1;
  const idPrefix = `cards-wknd-adventure-${instanceCount}`;

  const ul = document.createElement('ul');
  ul.className = 'cards-wknd-adventure-grid';
  const categoryMap = new Map(); // key -> label (first spelling wins)

  [...block.children].forEach((row) => {
    if (!row.children.length) return;
    const { li, categories } = buildCard(row);
    categories.forEach((label) => {
      const key = toKey(label);
      if (!categoryMap.has(key)) categoryMap.set(key, label);
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  // no categories authored: render a plain grid without tabs
  if (!categoryMap.size) {
    block.replaceChildren(ul);
    return;
  }

  const tablist = document.createElement('div');
  tablist.className = 'cards-wknd-adventure-tabs';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Filter by category');

  const panelId = `${idPrefix}-panel`;
  ul.id = panelId;
  ul.setAttribute('role', 'tabpanel');
  ul.tabIndex = 0;

  // "All" first, then categories alphabetically (as on the source), independent of card order
  const sorted = [...categoryMap.entries()].sort(([, a], [, b]) => a.localeCompare(b));
  const filters = [['all', 'All'], ...sorted];
  const tabs = filters.map(([key, label], i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'cards-wknd-adventure-tab';
    tab.id = `${idPrefix}-tab-${i}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);
    tab.dataset.filter = key;
    tab.textContent = label;
    tablist.append(tab);
    return tab;
  });

  const select = (tab, focus = false) => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.tabIndex = active ? 0 : -1;
    });
    ul.setAttribute('aria-labelledby', tab.id);
    const { filter } = tab.dataset;
    [...ul.children].forEach((li) => {
      const cats = li.dataset.categories ? li.dataset.categories.split(' ') : [];
      li.hidden = filter !== 'all' && !cats.includes(filter);
    });
    if (focus) tab.focus();
  };

  tablist.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) select(tab);
  });

  tablist.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let next;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (current + 1) % tabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (current - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    select(tabs[next], true);
  });

  select(tabs[0]);
  block.replaceChildren(tablist, ul);
}
