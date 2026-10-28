/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote-wknd. Base: quote (custom, no library convention).
 * Source: https://wknd.site/us/en/magazine/guide-la-skateparks.html (also ski-touring, western-australia)
 * Generated: 2026-10-07
 *
 * Output (matches blocks/quote-wknd/quote-wknd.js):
 *   row 1: quotation - one cell of paragraph(s)
 *   row 2: attribution (optional) - one cell, only when the source has text after the quote
 *
 * Validated selectors (source.html + instances/01-02.html):
 *   .cmp-text                 text component body
 *   .cmp-text > blockquote    the quotation (inline markup: b, br, nested b)
 *   .cmp-text > p             attribution (wrapped in <u>, sometimes <b><i><u>)
 */

/** Unwraps <u> (underline has no markdown equivalent) and keeps b/i/em/strong/br. */
function stripUnderline(el) {
  el.querySelectorAll('u').forEach((u) => u.replaceWith(...u.childNodes));
  return el;
}

/**
 * Normalises emphasis so it converts to clean markdown:
 * - unwraps <b>/<strong> nested inside another <b>/<strong> (western-australia quote)
 * - splits a bold run that spans a <br> into one bold run per line, so the
 *   emphasis markers never straddle a hard line break.
 */
function normaliseBold(el, document) {
  el.querySelectorAll('b b, b strong, strong b, strong strong')
    .forEach((inner) => inner.replaceWith(...inner.childNodes));
  el.querySelectorAll('b, strong').forEach((bold) => {
    if (!bold.querySelector('br')) return;
    const frag = document.createDocumentFragment();
    let run = document.createElement(bold.tagName.toLowerCase());
    const flush = () => {
      // trim nbsp/whitespace at the run edges
      const text = run.textContent.replace(/ /g, ' ');
      if (text.trim()) {
        if (run.firstChild && run.firstChild.nodeType === 3) {
          run.firstChild.textContent = run.firstChild.textContent.replace(/^[\s ]+/, '');
        }
        if (run.lastChild && run.lastChild.nodeType === 3) {
          run.lastChild.textContent = run.lastChild.textContent.replace(/[\s ]+$/, '');
        }
        frag.append(run);
      }
      run = document.createElement(bold.tagName.toLowerCase());
    };
    [...bold.childNodes].forEach((n) => {
      if (n.nodeName === 'BR') {
        flush();
        frag.append(document.createElement('br'));
      } else {
        run.append(n);
      }
    });
    flush();
    bold.replaceWith(frag);
  });
  return el;
}

/** Turns a source node's inline content into one or more <p> elements. */
function toParagraphs(node, document) {
  const clone = normaliseBold(stripUnderline(node.cloneNode(true)), document);
  const blockKids = [...clone.children].filter((c) => /^(P|DIV)$/.test(c.tagName));
  const sources = blockKids.length ? blockKids : [clone];
  return sources
    .map((src) => {
      const p = document.createElement('p');
      p.innerHTML = src.innerHTML.trim();
      return p;
    })
    .filter((p) => p.textContent.replace(/ /g, ' ').trim());
}

export default function parse(element, { document }) {
  const body = element.querySelector('.cmp-text') || element;

  const quoteEl = body.querySelector(':scope > blockquote') || body.querySelector('blockquote');
  const quotation = [];
  const attribution = [];

  if (quoteEl) {
    quotation.push(...toParagraphs(quoteEl, document));
    // everything after the blockquote is the attribution
    [...body.children]
      .filter((c) => c !== quoteEl && !c.contains(quoteEl)
        && (quoteEl.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING))
      .forEach((c) => attribution.push(...toParagraphs(c, document)));
  } else {
    // no blockquote: first paragraph is the quote, the rest attribution
    const paras = [...body.querySelectorAll(':scope > p')];
    if (paras[0]) quotation.push(...toParagraphs(paras[0], document));
    paras.slice(1).forEach((p) => attribution.push(...toParagraphs(p, document)));
  }

  if (!quotation.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[quotation]];
  if (attribution.length) cells.push([attribution]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-wknd', cells });
  element.replaceWith(block);
}
