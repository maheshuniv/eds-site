import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Cards (article): grid of linked article tiles. Each row = image | tag, linked heading,
 * description. Tolerates a missing image cell, extra cells, and cells in either order.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-article-card';
    const cells = [...row.children];
    const imageCells = [];
    const bodyCells = [];
    cells.forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'cards-article-card-image';
        imageCells.push(cell);
      } else if (cell.textContent.trim() || cell.children.length) {
        cell.className = 'cards-article-card-body';
        bodyCells.push(cell);
      }
    });
    if (!imageCells.length && !bodyCells.length) return;
    // image always renders on top, whatever the authored cell order
    li.append(...imageCells, ...bodyCells);

    bodyCells.forEach((body) => {
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const prev = heading.previousElementSibling;
        if (prev && prev.tagName === 'P' && !prev.querySelector('a')) prev.classList.add('cards-article-card-tag');
      }
    });

    const firstBody = bodyCells[0];
    const heading = firstBody && firstBody.querySelector('h1, h2, h3, h4, h5, h6');
    const link = (heading && heading.querySelector('a')) || (firstBody && firstBody.querySelector('a'));
    if (link) {
      link.classList.add('cards-article-card-link');
      li.classList.add('cards-article-card-linked');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
