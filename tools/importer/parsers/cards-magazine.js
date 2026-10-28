/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-magazine. Base: cards.
 * Source: https://wknd.site/us/en/magazine.html (AEM Core Components image-list, .image-list)
 * Generated: 2026-10-07
 *
 * Output: one row per article = image cell | text cell (title as link to the article, description paragraph).
 *
 * Validated selectors (source.html): li.cmp-image-list__item, .cmp-image-list__item-image img,
 * .cmp-image-list__item-title-link, .cmp-image-list__item-title, .cmp-image-list__item-description.
 * Iteration is keyed on the <li> wrappers (block-level), never on the inline <a> elements, since
 * the image link and title link share the same href and could be merged by html2md preprocessing.
 */
const SOURCE_ORIGIN = 'https://wknd.site';

function absoluteHref(href) {
  if (!href) return href;
  if (/^(mailto:|tel:|#|javascript:)/i.test(href)) return href;
  try {
    const url = new URL(href, SOURCE_ORIGIN);
    if (/^https?:$/.test(url.protocol) && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      return `${SOURCE_ORIGIN}${url.pathname}${url.search}${url.hash}`;
    }
    return url.href;
  } catch (e) {
    return href;
  }
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('li.cmp-image-list__item')];
  if (!items.length) items = [...element.querySelectorAll('article, li')];

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    const image = item.querySelector('.cmp-image-list__item-image img, img');
    const titleEl = item.querySelector('.cmp-image-list__item-title, h2, h3, h4');
    const titleLink = item.querySelector('a.cmp-image-list__item-title-link')
      || titleEl?.closest('a')
      || item.querySelector('a[href]');
    const descEl = item.querySelector('.cmp-image-list__item-description');

    const titleText = (titleEl || titleLink)?.textContent.trim();
    const descText = descEl?.textContent.trim();
    if (!image && !titleText && !descText) return;

    const textCell = [];
    if (titleText) {
      const p = document.createElement('p');
      const href = titleLink?.getAttribute('href');
      if (href) {
        const a = document.createElement('a');
        a.href = absoluteHref(href);
        a.textContent = titleText;
        p.append(a);
      } else {
        p.textContent = titleText;
      }
      textCell.push(p);
    }
    if (descText) {
      const p = document.createElement('p');
      p.textContent = descText;
      textCell.push(p);
    }

    cells.push([image || '', textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-magazine', cells });
  element.replaceWith(block);
}
