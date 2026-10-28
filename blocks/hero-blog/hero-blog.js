import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Removes a paragraph wrapper left empty after its picture was moved out.
 * @param {Element} el the former parent of a moved picture
 */
function removeIfEmpty(el) {
  if (el && el.tagName === 'P' && !el.textContent.trim() && !el.children.length) el.remove();
}

/**
 * Hero (blog): full-bleed background image with overlaid tag pill, H1 and an author byline
 * (avatar, name, meta line) separated from the headline by a divider.
 * Content contract: row 1 = background image; row 2 = tag paragraph, H1, avatar image,
 * author name paragraph, meta paragraph. Tolerates image and text in one cell, a missing
 * background image, a missing avatar, or a missing tag.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // collected once so future options can branch here (see block-options.md)
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const media = document.createElement('div');
  media.className = 'hero-blog-media';
  const content = document.createElement('div');
  content.className = 'hero-blog-content';

  // gather every node from every row/cell, in authored order
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });

  const heading = content.querySelector('h1, h2, h3');
  // background = first picture authored before the heading (any picture when there is no heading)
  const ordered = [...content.querySelectorAll('h1, h2, h3, picture')];
  const headingIndex = heading ? ordered.indexOf(heading) : ordered.length;
  const bgPicture = ordered.slice(0, headingIndex).find((el) => el.tagName === 'PICTURE');
  if (bgPicture) {
    const img = bgPicture.querySelector('img');
    const parent = bgPicture.parentElement;
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt, true, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }])
      : bgPicture;
    media.append(optimized);
    bgPicture.remove();
    removeIfEmpty(parent);
  } else {
    block.classList.add('hero-blog-no-image');
  }

  // paragraphs before the heading are the tag pill
  if (heading) {
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P' && prev.textContent.trim()) prev.classList.add('hero-blog-tag');
      prev = prev.previousElementSibling;
    }
  }

  // everything after the heading forms the byline: avatar + name + meta
  const after = [];
  if (heading) {
    let next = heading.nextElementSibling;
    while (next) {
      after.push(next);
      next = next.nextElementSibling;
    }
  }

  if (after.length) {
    const byline = document.createElement('div');
    byline.className = 'hero-blog-byline';
    const text = document.createElement('div');
    text.className = 'hero-blog-byline-text';

    const avatarPic = after
      .map((el) => (el.tagName === 'PICTURE' ? el : el.querySelector('picture')))
      .find(Boolean);
    if (avatarPic) {
      const img = avatarPic.querySelector('img');
      const parent = avatarPic.parentElement;
      const avatar = document.createElement('div');
      avatar.className = 'hero-blog-avatar';
      avatar.append(img ? createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]) : avatarPic);
      avatarPic.remove();
      removeIfEmpty(parent);
      byline.append(avatar);
    }

    after
      .filter((el) => el.parentElement === content)
      .forEach((el) => text.append(el));
    const paras = [...text.children].filter((el) => el.tagName === 'P');
    if (paras[0]) paras[0].classList.add('hero-blog-author');
    paras.slice(1).forEach((p) => p.classList.add('hero-blog-meta'));
    if (text.children.length) byline.append(text);
    if (byline.children.length) content.append(byline);
  }

  const inner = document.createElement('div');
  inner.className = 'hero-blog-content-inner';
  inner.append(...content.childNodes);
  content.append(inner);

  block.replaceChildren(...(media.children.length ? [media] : []), content);
}
