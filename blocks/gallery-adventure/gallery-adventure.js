import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Gallery (adventure): an image-only gallery. Each row is one visual row and each cell
 * holds one image, so a row's cell count sets its column count (3 cells = 3-up grid,
 * 1 cell = full-width wide image). Empty cells and rows are dropped; text left in a
 * cell is kept beneath its image as a caption.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((cell) => cell.querySelector('picture, img') || cell.textContent.trim());
    if (!cells.length) {
      row.remove();
      return;
    }
    row.className = 'gallery-adventure-row';
    row.style.setProperty('--gallery-adventure-cols', cells.length);
    if (cells.length === 1) row.classList.add('gallery-adventure-row-wide');

    [...row.children].forEach((cell) => {
      if (!cells.includes(cell)) cell.remove();
    });

    cells.forEach((cell) => {
      cell.className = 'gallery-adventure-item';
      const wide = cells.length === 1;
      cell.querySelectorAll('picture > img, img').forEach((img) => {
        const pic = img.closest('picture') || img;
        const optimized = createOptimizedPicture(img.src, img.alt, false, wide
          ? [{ media: '(min-width: 900px)', width: '2000' }, { width: '750' }]
          : [{ media: '(min-width: 900px)', width: '750' }, { width: '750' }]);
        // unwrap a picture the pipeline placed inside its own paragraph
        const p = pic.parentElement;
        if (p && p.tagName === 'P' && p !== cell && p.children.length === 1 && !p.textContent.trim()) {
          p.replaceWith(optimized);
        } else {
          pic.replaceWith(optimized);
        }
      });
      const pictures = cell.querySelectorAll('picture');
      if (pictures.length) {
        const media = document.createElement('div');
        media.className = 'gallery-adventure-image';
        media.append(...pictures);
        cell.prepend(media);
      }
      cell.querySelectorAll(':scope > p').forEach((p) => {
        if (p.textContent.trim()) p.classList.add('gallery-adventure-caption');
        else p.remove();
      });
    });
  });
}
