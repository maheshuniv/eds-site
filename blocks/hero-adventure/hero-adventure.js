import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Hero (adventure): full-bleed background image with overlaid tag, H1 and lead paragraph.
 * Content contract: one row with the background image, one row with the text.
 * Tolerates authors putting image and text in the same row/cell, or omitting the image.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // collected once so future options can branch here (see block-options.md)
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const media = document.createElement('div');
  media.className = 'hero-adventure-media';
  const content = document.createElement('div');
  content.className = 'hero-adventure-content';

  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt, true, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }])
      : picture;
    const pictureParent = picture.parentElement;
    media.append(optimized);
    picture.remove();
    // drop a now-empty paragraph wrapper left behind by the picture
    if (pictureParent && pictureParent.tagName === 'P' && !pictureParent.textContent.trim() && !pictureParent.children.length) {
      pictureParent.remove();
    }
  } else {
    block.classList.add('hero-adventure-no-image');
  }

  // gather all remaining text content from every row/cell, in order
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });

  // a paragraph preceding the heading is the eyebrow tag
  const heading = content.querySelector('h1, h2, h3');
  if (heading) {
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P') prev.classList.add('hero-adventure-tag');
      prev = prev.previousElementSibling;
    }
    const next = heading.nextElementSibling;
    if (next && next.tagName === 'P' && !next.querySelector('a')) next.classList.add('hero-adventure-lead');
  }

  const inner = document.createElement('div');
  inner.className = 'hero-adventure-content-inner';
  inner.append(...content.childNodes);
  content.append(inner);

  block.replaceChildren(...(media.children.length ? [media] : []), content);
}
