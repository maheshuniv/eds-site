/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-wknd. Base: accordion.
 * Source: https://wknd.site/us/en/faqs.html (AEM Core Components cmp-accordion)
 * Generated: 2026-10-07
 *
 * Output (Block Collection accordion convention, matches blocks/accordion-wknd/accordion-wknd.js):
 *   row 1: block name
 *   each following row: question cell (plain text) | answer cell (rich text)
 *
 * Validated selectors (source.html):
 *   .cmp-accordion > .cmp-accordion__item        repeating item (x7, iterationSafe)
 *   .cmp-accordion__header .cmp-accordion__title question text (inside <button>)
 *   .cmp-accordion__panel                         answer panel (may be hidden / --hidden)
 *   .cmp-text                                     rich text inside the panel
 * Panels are read regardless of visibility (collapsed panels carry --hidden).
 */
const SITE_ORIGIN = 'https://wknd.site';
const NBSP_RUN = /[ \t\r\n]*\u00a0[\u00a0 \t\r\n]*/g;
const MEDIA = 'img, picture, video, iframe, svg';

function collapseNbsp(root, document) {
  const walker = document.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((t) => {
    if (t.nodeValue.includes('\u00a0')) t.nodeValue = t.nodeValue.replace(NBSP_RUN, ' ');
  });
}

function isEmpty(el) {
  return !el.textContent.replace(/[\s\u00a0]+/g, '') && !el.querySelector(MEDIA)
    && !el.matches(MEDIA);
}

// Flatten AEM wrapper divs (container/responsivegrid/cmp-container/text/cmp-text)
// down to the actual content elements.
function collectContent(node, out) {
  [...node.children].forEach((child) => {
    const tag = child.tagName.toLowerCase();
    if (tag === 'div' || tag === 'section' || tag === 'article') {
      collectContent(child, out);
    } else if (tag !== 'script' && tag !== 'style' && tag !== 'button') {
      out.push(child);
    }
  });
  return out;
}

function absolutizeLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href').trim();
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) return;
    try {
      const url = new URL(href, SITE_ORIGIN);
      // same-site (relative, localhost proxy or wknd.site) -> absolute https://wknd.site/...
      if (/^\//.test(href) || /(^|\.)wknd\.site$/i.test(url.hostname) || /^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
        a.setAttribute('href', `${SITE_ORIGIN}${url.pathname}${url.search}${url.hash}`);
      }
    } catch (e) { /* leave as-is */ }
  });
}

export default function parse(element, { document }) {
  const root = element.matches('.cmp-accordion') ? element : (element.querySelector('.cmp-accordion') || element);

  let items = [...root.querySelectorAll(':scope > .cmp-accordion__item')];
  if (!items.length) items = [...root.querySelectorAll('.cmp-accordion__item, [data-cmp-hook-accordion="item"]')];

  const cells = [];
  items.forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title')
      || item.querySelector('.cmp-accordion__button, .cmp-accordion__header, h2, h3, h4');
    const question = titleEl ? titleEl.textContent.replace(/[\s\u00a0]+/g, ' ').trim() : '';

    const panel = item.querySelector(':scope > .cmp-accordion__panel')
      || item.querySelector('.cmp-accordion__panel, [data-cmp-hook-accordion="panel"], [role="region"]');

    const answer = [];
    if (panel) {
      collectContent(panel, []).forEach((el) => {
        collapseNbsp(el, document);
        // drop empty headings / paragraphs (e.g. <h3>&nbsp;</h3> in answer 2)
        el.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((inner) => { if (isEmpty(inner)) inner.remove(); });
        if (isEmpty(el)) return;
        absolutizeLinks(el);
        answer.push(el);
      });
    }

    if (!question && !answer.length) return;
    cells.push([question, answer.length ? answer : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-wknd', cells });
  element.replaceWith(block);
}
