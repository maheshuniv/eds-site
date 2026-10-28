/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-wknd. Base: tabs.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (AEM Core Components cmp-tabs)
 * Generated: 2026-10-07
 *
 * Output (Block Collection tabs convention, matches blocks/tabs-wknd/tabs-wknd.js):
 *   row 1: block name
 *   each following row: 2 cells = tab label (plain text) | tab content (rich text)
 *
 * Validated selectors (source.html + all 16 /us/en/adventures/*.html pages):
 *   .cmp-tabs__tablist > li.cmp-tabs__tab   tab label (x3: Overview / Itinerary / What to Bring)
 *   .cmp-tabs__tabpanel                     panel (active AND hidden panels are read);
 *                                           paired to its tab via aria-controls / id, else by order
 *   .cmp-contentfragment__elements          rich content inside the panel's content fragment
 *   h3.cmp-contentfragment__title           fragment title (repeats page title) - dropped
 * Panel content (h2 headings, <b> sub-heads, paragraphs, lists, up to 7 images) is flattened
 * out of the AEM wrapper divs (aem-Grid / image / cmp-image) in document order.
 */
const SITE_ORIGIN = 'https://wknd.site';
const CONTENT_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'BLOCKQUOTE', 'TABLE', 'PRE', 'HR']);
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'META', 'NOSCRIPT', 'BUTTON', 'TEMPLATE']);

const clean = (t) => (t || '').replace(/[\s ]+/g, ' ').trim();

function absoluteUrl(raw, keepHash) {
  const v = (raw || '').trim();
  if (!v || /^(#|mailto:|tel:|javascript:|data:)/i.test(v)) return v;
  try {
    const url = new URL(v, SITE_ORIGIN);
    if (/^\//.test(v) || /(^|\.)wknd\.site$/i.test(url.hostname)
      || /^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
      return `${SITE_ORIGIN}${url.pathname}${url.search}${keepHash ? url.hash : ''}`;
    }
    return url.href;
  } catch (e) {
    return v;
  }
}

function buildImage(img, document) {
  let src = img.getAttribute('src') || '';
  if (!src || /^data:/i.test(src)) {
    const holder = img.closest('[data-cmp-src]');
    if (holder) src = holder.getAttribute('data-cmp-src').replace('{.width}', '');
  }
  if (!src) return null;
  const out = document.createElement('img');
  out.src = absoluteUrl(src, false);
  out.alt = clean(img.getAttribute('alt') || img.getAttribute('title') || '');
  return out;
}

function tidy(el, document) {
  // collapse nbsp, absolutize links, rebuild nested images, drop empty inline children
  const walker = document.createTreeWalker(el, 4 /* SHOW_TEXT */);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((t) => { if (t.nodeValue.includes(' ')) t.nodeValue = t.nodeValue.replace(/ /g, ' '); });
  el.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absoluteUrl(a.getAttribute('href'), true)));
  el.querySelectorAll('img').forEach((img) => {
    const n = buildImage(img, document);
    if (n) img.replaceWith(n); else img.remove();
  });
  el.querySelectorAll('meta, script, style').forEach((n) => n.remove());
  return el;
}

// Flatten AEM wrapper divs down to the actual content elements, in document order.
function collectContent(node, out, document) {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === 3) {
      const text = clean(child.nodeValue);
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        out.push(p);
      }
      return;
    }
    if (child.nodeType !== 1) return;
    const tag = child.tagName;
    if (SKIP_TAGS.has(tag)) return;
    if (child.matches('.cmp-contentfragment__title')) return;
    if (tag === 'IMG') {
      const img = buildImage(child, document);
      if (img) out.push(img);
      return;
    }
    if (tag === 'PICTURE') {
      const img = child.querySelector('img');
      const built = img && buildImage(img, document);
      if (built) out.push(built);
      return;
    }
    if (CONTENT_TAGS.has(tag)) {
      tidy(child, document);
      if (tag !== 'HR' && !clean(child.textContent) && !child.querySelector('img')) return;
      out.push(child);
      return;
    }
    if (child.matches('.cmp-image__title')) {
      // visible image caption: emphasised paragraph right after the image (styled as a caption by the block)
      const text = clean(child.textContent);
      if (!text) return;
      const p = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = text;
      p.append(em);
      out.push(p);
      return;
    }
    if (['B', 'STRONG', 'I', 'EM', 'A', 'SPAN', 'U'].includes(tag)) {
      // stray inline content directly inside a wrapper div: wrap in a paragraph
      tidy(child, document);
      if (!clean(child.textContent)) return;
      const p = document.createElement('p');
      p.append(child);
      out.push(p);
      return;
    }
    // wrapper (div, section, article, figure, ...) -> recurse
    collectContent(child, out, document);
  });
  return out;
}

export default function parse(element, { document }) {
  const root = element.querySelector('.cmp-tabs') || element;

  // image captions the source styles hide (display: none) are not visible content - drop them.
  // (computed display is checked on the caption itself, so captions in inactive panels are judged correctly)
  root.querySelectorAll('.cmp-image__title').forEach((caption) => {
    const view = (caption.ownerDocument && caption.ownerDocument.defaultView) || null;
    if (view && view.getComputedStyle(caption).display === 'none') caption.remove();
  });

  let tabs = [...root.querySelectorAll(':scope > .cmp-tabs__tablist > .cmp-tabs__tab')];
  if (!tabs.length) tabs = [...root.querySelectorAll('.cmp-tabs__tab, [role="tab"]')];
  let panels = [...root.querySelectorAll(':scope > .cmp-tabs__tabpanel')];
  if (!panels.length) panels = [...root.querySelectorAll('.cmp-tabs__tabpanel, [role="tabpanel"]')];

  const cells = [];
  const used = new Set();
  const count = Math.max(tabs.length, panels.length);
  for (let i = 0; i < count; i += 1) {
    const tab = tabs[i];
    // pair panel to tab by aria-controls / id, else by order
    let panel = null;
    if (tab) {
      const ctrl = tab.getAttribute('aria-controls') || (tab.id ? `${tab.id}panel` : '');
      panel = panels.find((p) => !used.has(p) && p.id && (p.id === ctrl || p.getAttribute('aria-labelledby') === tab.id)) || null;
    }
    if (!panel) panel = panels.find((p) => !used.has(p)) || null;
    if (panel) used.add(panel);

    const label = clean(tab && tab.textContent) || `Tab ${i + 1}`;
    let content = [];
    if (panel) {
      const scope = panel.querySelector('.cmp-contentfragment__elements') || panel;
      content = collectContent(scope, [], document);
    }
    if (!clean(tab && tab.textContent) && !content.length) continue;
    cells.push([label, content.length ? content : '']);
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-wknd', cells });
  element.replaceWith(block);
}
