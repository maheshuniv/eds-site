import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Columns (story): a story intro -- text cell (heading + paragraphs) beside a wide image cell.
 * Cells keep their authored order on desktop and stack in that order on mobile (text first
 * when authored first). Tolerates extra rows, swapped cells and a missing image.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  [...block.children].forEach((row) => {
    row.className = 'columns-story-row';
    const cells = [...row.children].filter((cell) => {
      if (cell.querySelector('picture, img') || cell.textContent.trim()) return true;
      cell.remove();
      return false;
    });
    if (!cells.length) {
      row.remove();
      return;
    }

    cells.forEach((cell) => {
      const pic = cell.querySelector('picture');
      const isImageCell = pic && !cell.textContent.trim();
      if (isImageCell) {
        cell.className = 'columns-story-image';
        cell.querySelectorAll('picture > img').forEach((img) => {
          const optimized = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]);
          const picture = img.closest('picture');
          const p = picture.parentElement;
          if (p && p.tagName === 'P' && p !== cell) p.replaceWith(optimized);
          else picture.replaceWith(optimized);
        });
      } else {
        cell.className = 'columns-story-body';
      }
    });

    if (!cells.some((c) => c.classList.contains('columns-story-image'))) {
      row.classList.add('columns-story-no-image');
    }
  });
}
