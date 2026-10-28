/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-blog. Base: hero.
 * Source: https://wknd-adventures.com/blog/patagonia-trek.html (all /blog/*.html share the structure)
 * Structure (blocks/hero-blog/hero-blog.js): 1 column;
 *   row 1 = background image;
 *   row 2 = tag paragraph, H1, avatar image, author name paragraph, meta paragraph.
 * Validated selectors (source.html): .hero-bg img, .hero-content span.tag, h1.h1-heading,
 *   .article-byline .avatar img, p.article-byline-name, p.article-byline-meta
 * Image src values are left untouched (wknd-adventures-cleanup resolves relative URLs beforehand).
 */
export default function parse(element, { document }) {
  const content = element.querySelector('.hero-content') || element;
  const bgImage = element.querySelector('.hero-bg img')
    || [...element.querySelectorAll('img')].find((img) => !img.closest('.article-byline, .avatar'));

  const tagEl = content.querySelector('.tag');
  const heading = content.querySelector('h1') || content.querySelector('h2');
  const byline = content.querySelector('.article-byline');
  const avatar = (byline || content).querySelector('.avatar img');
  const nameEl = (byline || content).querySelector('.article-byline-name');
  const metaEl = (byline || content).querySelector('.article-byline-meta');

  if (!heading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // The tag is a <span> in the source; the block expects a paragraph before the H1.
  const toParagraph = (el) => {
    if (!el) return null;
    if (el.tagName === 'P') return el;
    const p = document.createElement('p');
    p.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    return p.textContent ? p : null;
  };

  const cells = [];
  if (bgImage) cells.push([bgImage]);

  const contentCell = [];
  const tagP = toParagraph(tagEl);
  if (tagP) contentCell.push(tagP);
  if (heading) contentCell.push(heading);
  if (avatar) contentCell.push(avatar);
  const nameP = toParagraph(nameEl);
  if (nameP) contentCell.push(nameP);
  const metaP = toParagraph(metaEl);
  if (metaP) contentCell.push(metaP);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-blog', cells });
  element.replaceWith(block);
}
