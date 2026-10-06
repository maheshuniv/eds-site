const OPTION_CLASSES = [];

/**
 * Cards (promo): side-by-side text tiles without images. Each row = one text cell
 * holding a tag paragraph, heading, paragraph and optional CTA link. Extra cells in a
 * row are merged into the same tile; empty rows are dropped.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const body = document.createElement('div');
    body.className = 'cards-promo-card-body';
    [...row.children].forEach((cell) => body.append(...cell.childNodes));
    if (!body.textContent.trim()) return;

    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const prev = heading.previousElementSibling;
      if (prev && prev.tagName === 'P' && !prev.querySelector('a')) prev.classList.add('cards-promo-card-tag');
    }

    // paragraphs holding only links form the CTA area, pinned to the tile bottom
    body.querySelectorAll(':scope > p').forEach((p) => {
      const links = [...p.querySelectorAll('a')];
      if (links.length && p.textContent.trim() === links.map((a) => a.textContent).join('').trim()) {
        p.classList.add('cards-promo-card-cta');
      }
    });

    const li = document.createElement('li');
    li.className = 'cards-promo-card';
    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
