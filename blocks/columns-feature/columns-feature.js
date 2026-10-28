import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Columns (feature): a single featured item, image cell beside a text cell
 * (tag, heading, paragraph, CTA). Tolerates extra rows (each decorated the same way),
 * swapped cell order, and a missing image.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  [...block.children].forEach((row) => {
    row.classList.add('columns-feature-row');
    const cells = [...row.children];
    cells.forEach((cell) => {
      const pic = cell.querySelector('picture');
      const isImageCell = pic && !cell.textContent.trim();
      if (isImageCell) {
        cell.className = 'columns-feature-image';
        cell.querySelectorAll('picture > img').forEach((img) => {
          img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]));
        });
      } else {
        cell.className = 'columns-feature-body';
        const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          const prev = heading.previousElementSibling;
          if (prev && prev.tagName === 'P' && !prev.querySelector('a, picture')) {
            prev.classList.add('columns-feature-tag');
          }
        }
        // a paragraph holding only links is the CTA footer
        cell.querySelectorAll(':scope > p').forEach((p) => {
          const links = p.querySelectorAll('a');
          if (links.length && p.textContent.trim() === [...links].map((a) => a.textContent).join('').trim()) {
            p.classList.add('columns-feature-cta');
          }
        });
      }
    });
    if (!cells.some((c) => c.classList.contains('columns-feature-image'))) {
      row.classList.add('columns-feature-no-image');
    }
  });
}
