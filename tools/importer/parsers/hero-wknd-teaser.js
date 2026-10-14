/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-wknd-teaser. Base: hero.
 * Source: https://wknd.site/us/en.html (AEM Core Components teaser, .cmp-teaser--hero.cmp-teaser--imagebottom)
 * Block structure: one row, two cells = [image] | [eyebrow?, heading, description, CTA].
 * The CTA is emitted as a bold link (<strong><a>) with an absolute https://wknd.site href.
 */
const ORIGIN = 'https://wknd.site';

function absUrl(href) {
  if (!href) return href;
  try {
    return new URL(href, ORIGIN).href;
  } catch (e) {
    return href;
  }
}

export default function parse(element, { document }) {
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');
  const pretitle = element.querySelector('.cmp-teaser__pretitle');
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const descWrap = element.querySelector('.cmp-teaser__description');
  const ctas = [...element.querySelectorAll('.cmp-teaser__action-link')];

  const text = [];
  if (pretitle && pretitle.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = pretitle.textContent.trim();
    text.push(p);
  }
  if (heading && heading.textContent.trim()) {
    const h = document.createElement('h2');
    h.textContent = heading.textContent.trim();
    text.push(h);
  }
  if (descWrap) {
    const paras = [...descWrap.querySelectorAll('p')].filter((p) => p.textContent.trim());
    if (paras.length) {
      paras.forEach((para) => {
        const p = document.createElement('p');
        p.textContent = para.textContent.trim();
        text.push(p);
      });
    } else if (descWrap.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descWrap.textContent.trim();
      text.push(p);
    }
  }
  ctas.forEach((link) => {
    const label = link.textContent.trim();
    if (!label) return;
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = absUrl(link.getAttribute('href'));
    a.textContent = label;
    strong.append(a);
    p.append(strong);
    text.push(p);
  });

  if (!image && !text.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[image || '', text.length ? text : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-wknd-teaser', cells });
  element.replaceWith(block);
}
