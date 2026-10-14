/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-wknd. Base: hero.
 * Source: https://wknd.site/us/en/adventures.html (AEM Core Components teaser, .cmp-teaser--hero)
 * Block structure (1 column): row 1 = background image; row 2 = heading + description.
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  const descWrap = element.querySelector('.cmp-teaser__description');
  const pretitle = element.querySelector('.cmp-teaser__pretitle');

  const textCell = [];
  if (pretitle && pretitle.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = pretitle.textContent.trim();
    textCell.push(p);
  }
  if (heading) {
    const h = document.createElement('h2');
    h.textContent = heading.textContent.trim();
    textCell.push(h);
  }
  if (descWrap) {
    const paras = [...descWrap.querySelectorAll('p')];
    if (paras.length) textCell.push(...paras);
    else if (descWrap.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descWrap.textContent.trim();
      textCell.push(p);
    }
  }
  // Optional CTA(s)
  element.querySelectorAll('.cmp-teaser__action-link').forEach((a) => textCell.push(a));

  if (!image && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (image) cells.push([image]);
  if (textCell.length) cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-wknd', cells });
  element.replaceWith(block);
}
