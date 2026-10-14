import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-magazine: wrapping grid of article tiles.
 * Content contract (one row per article):
 *   image cell (picture, optionally linked) | body cell (linked title, description)
 * Cells may be omitted or merged; anything without a lone picture is treated as body.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-magazine-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      const pic = div.querySelector('picture');
      const onlyPicture = pic && !div.textContent.trim();
      div.className = onlyPicture ? 'cards-magazine-card-image' : 'cards-magazine-card-body';
    });

    // body: first heading or first link-only paragraph is the title, remaining text is description
    const body = li.querySelector('.cards-magazine-card-body');
    if (body) {
      const title = body.querySelector('h1, h2, h3, h4, h5, h6')
        || [...body.querySelectorAll(':scope > p')].find((p) => {
          const a = p.querySelector('a');
          return a && p.textContent.trim() === a.textContent.trim();
        })
        || body.querySelector(':scope > p');
      if (title) title.classList.add('cards-magazine-card-title');
      body.querySelectorAll(':scope > p').forEach((p) => {
        if (p !== title) p.classList.add('cards-magazine-card-description');
      });

      // link the image to the title link when the image is not already linked
      const href = title?.querySelector('a')?.href;
      const imageCell = li.querySelector('.cards-magazine-card-image');
      if (href && imageCell && !imageCell.querySelector('a')) {
        const pic = imageCell.querySelector('picture');
        const a = document.createElement('a');
        a.href = href;
        a.tabIndex = -1;
        a.setAttribute('aria-hidden', 'true');
        pic.replaceWith(a);
        a.append(pic);
      }
    }

    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }]));
  });
  block.replaceChildren(ul);
}
