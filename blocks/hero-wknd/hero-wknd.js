import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * hero-wknd: full-width background image with a text panel
 * overlapping its lower-left edge.
 * Authored rows: [background image] | [heading + sentence].
 * Tolerates the image and text being in the same row/cell, or extra cells.
 * @param {Element} block
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');

  const media = document.createElement('div');
  media.className = 'hero-wknd-media';
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt || '', true, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ])
      : picture;
    if (img) {
      const optImg = optimized.querySelector('img');
      if (optImg) {
        optImg.loading = 'eager';
        optImg.fetchPriority = 'high';
      }
    }
    // drop the wrapping <p> if the picture was authored inside one
    const parentP = picture.closest('p');
    picture.remove();
    if (parentP && !parentP.textContent.trim() && !parentP.children.length) parentP.remove();
    media.append(optimized);
  }

  const content = document.createElement('div');
  content.className = 'hero-wknd-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    if (cell.textContent.trim() || cell.querySelector('a, img')) {
      while (cell.firstChild) content.append(cell.firstChild);
    }
  });

  block.replaceChildren();
  if (media.children.length) block.append(media);
  else block.classList.add('hero-wknd-no-image');
  if (content.children.length || content.textContent.trim()) block.append(content);
}
