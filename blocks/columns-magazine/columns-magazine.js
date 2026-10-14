import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * columns-magazine: featured-article split layout.
 * Content contract (one row, two cells, either order):
 *   image cell | text cell (eyebrow paragraph, heading, description, CTA link)
 * Extra rows are decorated the same way; missing cells degrade to a single column.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-magazine-row');
    const cells = [...row.children];

    cells.forEach((cell) => {
      const pic = cell.querySelector('picture');
      const hasText = [...cell.children].some((el) => !el.querySelector('picture') && el.textContent.trim());
      if (pic && !hasText) {
        cell.classList.add('columns-magazine-image');
        const img = pic.querySelector('img');
        if (img) {
          pic.replaceWith(createOptimizedPicture(img.src, img.alt, true, [
            { media: '(min-width: 900px)', width: '1200' },
            { width: '750' },
          ]));
        }
        return;
      }

      cell.classList.add('columns-magazine-content');

      // eyebrow: a short paragraph that precedes the first heading
      const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const prev = heading.previousElementSibling;
        if (prev && prev.tagName === 'P' && !prev.querySelector('a')) {
          prev.classList.add('columns-magazine-eyebrow');
        }
      }

      // CTA: last paragraph consisting solely of a link
      const ctaPara = [...cell.querySelectorAll(':scope > p')].reverse().find((p) => {
        const link = p.querySelector('a');
        return link && p.textContent.trim() === link.textContent.trim();
      });
      if (ctaPara) {
        ctaPara.classList.add('columns-magazine-cta');
        ctaPara.querySelector('a').classList.add('columns-magazine-cta-link');
      }
    });

    if (cells.length < 2) row.classList.add('columns-magazine-single');
  });
}
