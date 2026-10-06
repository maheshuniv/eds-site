/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-activity. Base: tabs.
 * Source: https://wknd-adventures.com/adventures.html
 * Structure: 2 columns; each row = tab label | tab content
 *   (repeating groups: image, tag paragraph, h3 linked to article, description).
 * Validated selectors (source.html): .tab-menu button.tab-menu-link, .tab-pane,
 *   .article-card-body, .article-card-image img, .tag, h3, p.
 * All panes are included, active or not.
 * Iteration is keyed on .article-card-body (inner block wrapper), not the a.article-card
 * anchors, so html2md inline-merge preprocessing can't collapse items.
 */

function getItems(pane) {
  let items = [...pane.querySelectorAll('.article-card-body')].map((body) => {
    let image = null;
    let sib = body.previousElementSibling;
    while (sib && !image) {
      image = sib.matches('img') ? sib : sib.querySelector('img');
      sib = sib.previousElementSibling;
    }
    return { body, image, href: body.closest('a')?.getAttribute('href') };
  });
  if (!items.length) {
    // Fallback: card wrappers without an inner body class
    items = [...pane.querySelectorAll('a.article-card, .card, article')].map((card) => ({
      body: card,
      image: card.querySelector('img'),
      href: card.getAttribute('href') || card.querySelector('a')?.getAttribute('href'),
    }));
  }
  return items;
}

function buildItemContent(item, document) {
  const out = [];
  if (item.image) out.push(item.image);

  const tagEl = item.body.querySelector('.tag');
  if (tagEl && tagEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = tagEl.textContent.trim();
    out.push(p);
  }

  const headingSrc = item.body.querySelector('h3, h2, h4, h5, h6');
  if (headingSrc) {
    const h3 = document.createElement('h3');
    const text = headingSrc.textContent.trim();
    if (item.href) {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = text;
      h3.append(a);
    } else {
      h3.textContent = text;
    }
    out.push(h3);
  }

  item.body.querySelectorAll('p').forEach((p) => {
    if (!p.closest('.article-card-meta') && p.textContent.trim()) out.push(p);
  });
  return out;
}

export default function parse(element, { document }) {
  const labels = [...element.querySelectorAll('.tab-menu button, .tab-menu .tab-menu-link:not(button), [role="tab"]')]
    .filter((el, i, arr) => arr.indexOf(el) === i);
  const panes = [...element.querySelectorAll('.tab-pane, [role="tabpanel"]')]
    .filter((el) => !el.parentElement.closest('.tab-pane, [role="tabpanel"]'));

  if (!panes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  panes.forEach((pane, i) => {
    let label = labels[i]?.textContent.trim();
    if (!label && pane.id) {
      label = pane.id.replace(/^tab-/, '').replace(/-/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }
    const content = [];
    getItems(pane).forEach((item) => content.push(...buildItemContent(item, document)));
    cells.push([label || `Tab ${i + 1}`, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-activity', cells });
  element.replaceWith(block);
}
