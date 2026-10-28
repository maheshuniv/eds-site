/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-wknd-adventure. Base: cards.
 * Source: https://wknd.site/us/en/adventures.html (AEM Core Components .tabs.panelcontainer / cmp-tabs,
 * each tab panel holding a cmp-image-list).
 *
 * Output: one row per unique adventure, taken from the "All" panel in its order:
 *   image | text (linked title + description) | categories (comma-separated non-"All" tab labels
 *   whose panel contains the adventure, matched by link href, in tab order; empty cell if none).
 *
 * Iteration is keyed on li.cmp-image-list__item (block-level, iterationSafe) — never on the anchors.
 */
const ORIGIN = 'https://wknd.site';

function absoluteUrl(href) {
  if (!href) return '';
  const raw = href.trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  try {
    return new URL(raw, `${ORIGIN}/us/en/adventures.html`).href;
  } catch (e) {
    return raw;
  }
}

function hrefKey(href) {
  const abs = absoluteUrl(href);
  try {
    const u = new URL(abs);
    return u.pathname.replace(/\/$/, '').toLowerCase();
  } catch (e) {
    return abs.toLowerCase();
  }
}

function itemHref(item) {
  const a = item.querySelector('a.cmp-image-list__item-title-link[href], a.cmp-image-list__item-image-link[href]')
    || item.querySelector('a[href]');
  return a ? a.getAttribute('href') : '';
}

// Items that belong directly to this panel (guards against nested panels in malformed markup).
function panelItems(panel) {
  return [...panel.querySelectorAll('li.cmp-image-list__item, .cmp-image-list > li')]
    .filter((li, i, arr) => arr.indexOf(li) === i)
    .filter((li) => li.closest('.cmp-tabs__tabpanel, [role="tabpanel"]') === panel);
}

export default function parse(element, { document }) {
  const tabs = [...element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, ol[role="tablist"] > li')]
    .filter((t, i, arr) => arr.indexOf(t) === i);
  const panels = [...element.querySelectorAll('.cmp-tabs__tabpanel')];

  // Pair tabs with panels: prefer aria-controls / id match, fall back to index order.
  const pairs = tabs.map((tab, i) => {
    const label = tab.textContent.replace(/\s+/g, ' ').trim();
    let panel = null;
    const controls = tab.getAttribute('aria-controls');
    if (controls) panel = panels.find((p) => p.id === controls) || null;
    if (!panel && tab.id && tab.id.endsWith('-tab')) {
      const pid = `${tab.id.slice(0, -4)}-tabpanel`;
      panel = panels.find((p) => p.id === pid) || null;
    }
    if (!panel) panel = panels[i] || null;
    return { label, panel };
  });

  let allPair = pairs.find((p) => /^all$/i.test(p.label));
  if (!allPair && pairs.length) [allPair] = pairs;
  const categoryPairs = pairs.filter((p) => p !== allPair && p.panel);

  // Category membership by normalized href.
  const categoriesByHref = new Map();
  categoryPairs.forEach(({ label, panel }) => {
    panelItems(panel).forEach((li) => {
      const key = hrefKey(itemHref(li));
      if (!key) return;
      if (!categoriesByHref.has(key)) categoriesByHref.set(key, []);
      const list = categoriesByHref.get(key);
      if (!list.includes(label)) list.push(label);
    });
  });

  // Source items: "All" panel; fallback to every item in the block, deduped by href.
  let sourceItems = allPair && allPair.panel ? panelItems(allPair.panel) : [];
  if (!sourceItems.length) sourceItems = [...element.querySelectorAll('li.cmp-image-list__item')];

  const seen = new Set();
  const cells = [];
  sourceItems.forEach((li) => {
    const rawHref = itemHref(li);
    const key = hrefKey(rawHref) || li.textContent.trim();
    if (seen.has(key)) return;
    seen.add(key);

    const img = li.querySelector('.cmp-image-list__item-image img, img');
    const titleEl = li.querySelector('.cmp-image-list__item-title, .cmp-image-list__item-title-link');
    const descEl = li.querySelector('.cmp-image-list__item-description');
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const desc = descEl ? descEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!img && !title && !desc) return;

    const textCell = [];
    if (title) {
      const p = document.createElement('p');
      if (rawHref) {
        const a = document.createElement('a');
        a.href = absoluteUrl(rawHref);
        a.textContent = title;
        p.append(a);
      } else {
        p.textContent = title;
      }
      textCell.push(p);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      textCell.push(p);
    }

    const categories = (categoriesByHref.get(hrefKey(rawHref)) || []).join(', ');
    cells.push([img || '', textCell.length ? textCell : '', categories]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-wknd-adventure', cells });
  element.replaceWith(block);
}
