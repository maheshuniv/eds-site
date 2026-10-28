import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-magazine-secure: gated (members-only) teaser tiles.
 * Content contract (one row per teaser, cells in any order):
 *   image cell (picture) | body cell (heading, description, "Read More" label)
 * The body renders above the image. The "Read More" label is a non-link status label;
 * a plain paragraph matching /read more/i (or the last unlinked paragraph after the
 * description) is marked as the label.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-magazine-secure-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      const pic = div.querySelector('picture');
      const onlyPicture = pic && !div.textContent.trim();
      div.className = onlyPicture ? 'cards-magazine-secure-card-image' : 'cards-magazine-secure-card-body';
    });

    const body = li.querySelector('.cards-magazine-secure-card-body');
    if (body) {
      const title = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (title) title.classList.add('cards-magazine-secure-card-title');

      const paras = [...body.querySelectorAll(':scope > p')];
      const label = paras.find((p) => /^read more$/i.test(p.textContent.trim()))
        || (paras.length > 1 && !paras[paras.length - 1].querySelector('a') ? paras[paras.length - 1] : null);
      if (label) {
        label.classList.add('cards-magazine-secure-card-label');
        label.setAttribute('aria-disabled', 'true');
      }
      paras.forEach((p) => {
        if (p !== label) p.classList.add('cards-magazine-secure-card-description');
      });

      // body always precedes the image
      li.prepend(body);
    }

    li.classList.add('cards-magazine-secure-locked');
    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
