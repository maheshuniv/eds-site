/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-wknd. Base: carousel.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (AEM Core Components cmp-carousel--mini)
 * Generated: 2026-10-07
 *
 * Output (matches blocks/carousel-wknd/carousel-wknd.js and the Block Collection carousel):
 *   row 1: block name
 *   each following row: one cell = slide image (with alt). No caption cell (WKND slides are image-only).
 *
 * Validated selectors (source.html + all 16 /us/en/adventures/*.html pages, 1-3 slides):
 *   .cmp-carousel__content > .cmp-carousel__item   slide (active AND inactive slides are read)
 *   .cmp-image img.cmp-image__image                slide image
 * Controls (.cmp-carousel__actions buttons, .cmp-carousel__indicators) are ignored.
 * Iteration is keyed on .cmp-carousel__item divs (block-level, iterationSafe).
 */
const SITE_ORIGIN = 'https://wknd.site';

function absoluteSrc(src) {
  const raw = (src || '').trim();
  if (!raw || /^data:/i.test(raw)) return raw;
  try {
    const url = new URL(raw, SITE_ORIGIN);
    if (/^\//.test(raw) || /(^|\.)wknd\.site$/i.test(url.hostname)
      || /^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
      return `${SITE_ORIGIN}${url.pathname}${url.search}`;
    }
    return url.href;
  } catch (e) {
    return raw;
  }
}

function buildImage(slide, document) {
  const src = slide.querySelector('img.cmp-image__image') || slide.querySelector('img');
  let url = src ? (src.getAttribute('src') || '') : '';
  if (!url || /^data:/i.test(url)) {
    // lazy AEM imageV3: fall back to the component's data-cmp-src template
    const holder = slide.querySelector('[data-cmp-src]');
    if (holder) url = holder.getAttribute('data-cmp-src').replace('{.width}', '');
  }
  if (!url) return null;
  const img = document.createElement('img');
  img.src = absoluteSrc(url);
  const alt = (src && (src.getAttribute('alt') || src.getAttribute('title'))) || '';
  img.alt = alt.trim();
  return img;
}

export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.cmp-carousel__content > .cmp-carousel__item')];
  if (!slides.length) slides = [...element.querySelectorAll('.cmp-carousel__item, [data-cmp-hook-carousel="item"]')];
  if (!slides.length) {
    // Fallback: each image component is a slide
    slides = [...element.querySelectorAll('.cmp-image')];
  }

  const cells = [];
  slides.forEach((slide) => {
    const img = buildImage(slide, document);
    if (img) cells.push([img]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-wknd', cells });
  element.replaceWith(block);
}
