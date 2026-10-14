/*
 * Tabs (WKND) block
 * Each authored row = tab label | tab content (rich: headings, bold, lists, images).
 * First tab is selected by default; switching is instant. ARIA tablist/tab/tabpanel
 * with roving tabindex and arrow/Home/End keyboard support. Selecting a tab writes
 * its id to the URL hash; a matching location.hash on load (or hashchange) selects it.
 */
import { toClassName } from '../../scripts/aem.js';

function uniqueId(base, used) {
  const root = base || 'tab';
  let id = root;
  let n = 2;
  while (used.has(id) || document.getElementById(id)) {
    id = `${root}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

function selectTab(block, index, { focus = false, updateHash = false } = {}) {
  const tabs = [...block.querySelectorAll('.tabs-wknd-tab')];
  const panels = [...block.querySelectorAll('.tabs-wknd-panel')];
  if (!tabs[index]) return;

  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', selected ? 'true' : 'false');
    tab.tabIndex = selected ? 0 : -1;
    panels[i].hidden = !selected;
  });

  if (focus) tabs[index].focus();
  if (updateHash) {
    const url = new URL(window.location.href);
    url.hash = tabs[index].id;
    // replaceState avoids the browser scroll-jump to the tab element
    window.history.replaceState(window.history.state, '', url);
  }
}

function selectFromHash(block) {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (!hash) return false;
  const tabs = [...block.querySelectorAll('.tabs-wknd-tab')];
  const index = tabs.findIndex((tab) => tab.id === hash);
  if (index < 0) return false;
  selectTab(block, index);
  return true;
}

export default function decorate(block) {
  const used = new Set();
  const tablist = document.createElement('div');
  tablist.className = 'tabs-wknd-list';
  tablist.setAttribute('role', 'tablist');

  const panels = [];
  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.textContent.trim() || row.querySelector('picture, img'));

  rows.forEach((row, i) => {
    const [labelCell, ...contentCells] = [...row.children];
    const label = (labelCell?.textContent || '').trim() || `Tab ${i + 1}`;
    const id = uniqueId(toClassName(label), used);

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-wknd-tab';
    tab.id = id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${id}-panel`);
    tab.textContent = label;
    tab.addEventListener('click', () => selectTab(block, i, { updateHash: true }));
    tablist.append(tab);

    const panel = document.createElement('div');
    panel.className = 'tabs-wknd-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', id);
    panel.tabIndex = 0;
    contentCells.forEach((cell) => panel.append(...cell.childNodes));
    panels.push(panel);
  });

  tablist.addEventListener('keydown', (e) => {
    const tabs = [...tablist.querySelectorAll('.tabs-wknd-tab')];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let target = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') target = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') target = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = tabs.length - 1;
    if (target === null) return;
    e.preventDefault();
    selectTab(block, target, { focus: true, updateHash: true });
  });

  block.replaceChildren(tablist, ...panels);

  if (!selectFromHash(block)) selectTab(block, 0);
  window.addEventListener('hashchange', () => selectFromHash(block));
}
