/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-wknd-hero. Base: carousel.
 * Source: https://wknd.site/us/en.html (AEM Core Components carousel, .cmp-carousel--hero)
 * Block structure (2 columns): one row per slide = [image] | [eyebrow?, heading, description, CTA].
 * The CTA is emitted as a bold link (<strong><a>) with an absolute https://wknd.site href.
 * All .cmp-carousel__item panels are read, including the inactive (hidden) ones.
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

function buildSlide(item, document) {
  const image = item.querySelector('.cmp-teaser__image img, .cmp-image img, img');
  const pretitle = item.querySelector('.cmp-teaser__pretitle');
  const heading = item.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const descWrap = item.querySelector('.cmp-teaser__description');
  const ctas = [...item.querySelectorAll('.cmp-teaser__action-link')];

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

  if (!image && !text.length) return null;
  return [image || '', text.length ? text : ''];
}

export default function parse(element, { document }) {
  // Iterate the panel wrappers (stable block-level divs), not links.
  let items = [...element.querySelectorAll('.cmp-carousel__content > .cmp-carousel__item')];
  if (!items.length) items = [...element.querySelectorAll('.cmp-carousel__item')];
  if (!items.length) items = [...element.querySelectorAll('.cmp-teaser')];

  const cells = [];
  items.forEach((item) => {
    const row = buildSlide(item, document);
    if (row) cells.push(row);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-wknd-hero', cells });
  element.replaceWith(block);
}
