import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * hero-wknd-teaser: full-bleed photo with a white text panel overlapping its bottom edge.
 * Authored: [image] | [heading, paragraph, CTA link] — as one row with two cells, two rows,
 * or image and text in the same cell. The CTA is an authored bold link, which scripts.js
 * turns into the primary button before this block runs.
 * @param {Element} block
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const looseImg = picture ? null : block.querySelector('img');

  const media = document.createElement('div');
  media.className = 'hero-wknd-teaser-media';
  const source = picture || looseImg;
  if (source) {
    const img = picture ? picture.querySelector('img') : looseImg;
    const parentP = source.closest('p');
    source.remove();
    if (parentP && !parentP.textContent.trim() && !parentP.children.length) parentP.remove();
    if (img) {
      media.append(createOptimizedPicture(img.src, img.alt || '', false, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]));
    } else {
      media.append(source);
    }
  }

  const content = document.createElement('div');
  content.className = 'hero-wknd-teaser-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    if (cell.textContent.trim() || cell.querySelector('a')) {
      content.append(...cell.childNodes);
    }
  });

  // mark the CTA paragraph (a paragraph holding just one link) for layout
  content.querySelectorAll('p').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
      p.classList.add('hero-wknd-teaser-cta');
    }
  });

  block.replaceChildren();
  if (media.children.length) block.append(media);
  else block.classList.add('hero-wknd-teaser-no-image');
  if (content.children.length || content.textContent.trim()) block.append(content);
}
