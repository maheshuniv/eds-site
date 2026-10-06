/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards.
 * Source: https://wknd-adventures.com/adventures.html
 * Structure: 2 columns; each row = image | tag paragraph, linked h3, description.
 * Validated selectors (source.html): .article-card-body, .article-card-image img, .tag, h3, p.
 * Iteration keyed on .article-card-body (inner block wrapper) rather than the a.article-card
 * anchors, so html2md inline-merge preprocessing can't collapse cards. The anchor href is
 * re-attached to the heading.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.article-card-body')].map((body) => {
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
    items = [...element.querySelectorAll(':scope > a, :scope > .card, :scope > article')].map((card) => ({
      body: card,
      image: card.querySelector('img'),
      href: card.getAttribute('href') || card.querySelector('a')?.getAttribute('href'),
    }));
  }

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    const text = [];

    const tagEl = item.body.querySelector('.tag');
    if (tagEl && tagEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = tagEl.textContent.trim();
      text.push(p);
    }

    const headingSrc = item.body.querySelector('h3, h2, h4, h5, h6');
    if (headingSrc) {
      const h3 = document.createElement('h3');
      const title = headingSrc.textContent.trim();
      if (item.href) {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      text.push(h3);
    }

    item.body.querySelectorAll('p').forEach((p) => {
      if (!p.closest('.article-card-meta') && p.textContent.trim()) text.push(p);
    });

    cells.push([item.image || '', text.length ? text : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
