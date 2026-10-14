import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

const SVG_NS = 'http://www.w3.org/2000/svg';

/* Inline icon paths (24x24 viewBox) — no external icon font. */
const NETWORKS = {
  facebook: {
    label: 'Facebook',
    match: /facebook|fb\.com/i,
    path: 'M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z',
  },
  twitter: {
    label: 'Twitter',
    match: /twitter|(^|[^a-z])x\.com/i,
    path: 'M22 5.9c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-.8-.8-1.9-1.3-3-1.3-2.3 0-4.1 1.8-4.1 4.1 0 .3 0 .6.1.9-3.4-.2-6.4-1.8-8.4-4.3-.4.6-.6 1.3-.6 2.1 0 1.4.7 2.7 1.8 3.4-.7 0-1.3-.2-1.9-.5 0 2 1.4 3.7 3.3 4.1-.3.1-.7.1-1.1.1-.3 0-.5 0-.8-.1.5 1.6 2 2.8 3.8 2.9-1.4 1.1-3.2 1.8-5.1 1.8H2c1.8 1.2 4 1.8 6.3 1.8 7.5 0 11.7-6.2 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z',
  },
  instagram: {
    label: 'Instagram',
    match: /instagram|insta/i,
    path: 'M12 4.2c2.5 0 2.8 0 3.8.1 2.6.1 3.8 1.3 3.9 3.9.1 1 .1 1.3.1 3.8s0 2.8-.1 3.8c-.1 2.6-1.3 3.8-3.9 3.9-1 .1-1.3.1-3.8.1s-2.8 0-3.8-.1c-2.6-.1-3.8-1.3-3.9-3.9-.1-1-.1-1.3-.1-3.8s0-2.8.1-3.8c.1-2.6 1.3-3.8 3.9-3.9 1-.1 1.3-.1 3.8-.1zM12 2.5c-2.6 0-2.9 0-3.9.1-3.5.2-5.4 2.1-5.6 5.6-.1 1-.1 1.3-.1 3.9s0 2.9.1 3.9c.2 3.5 2.1 5.4 5.6 5.6 1 .1 1.3.1 3.9.1s2.9 0 3.9-.1c3.5-.2 5.4-2.1 5.6-5.6.1-1 .1-1.3.1-3.9s0-2.9-.1-3.9c-.2-3.5-2.1-5.4-5.6-5.6-1-.1-1.3-.1-3.9-.1zm0 4.6a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8zm0 8.1a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.1-9.4a1.1 1.1 0 1 0 0 2.3 1.1 1.1 0 0 0 0-2.3z',
  },
};

/**
 * Detects the social network of a link from its label first, then its href.
 * @param {HTMLAnchorElement} a
 * @returns {string|null} network key
 */
function detectNetwork(a) {
  const label = a.textContent.trim();
  const href = a.getAttribute('href') || '';
  const byLabel = Object.keys(NETWORKS).find((k) => NETWORKS[k].match.test(label));
  if (byLabel) return byLabel;
  return Object.keys(NETWORKS).find((k) => NETWORKS[k].match.test(href)) || null;
}

function createIcon(network) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('cards-wknd-contributor-icon');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', NETWORKS[network].path);
  path.setAttribute('fill', 'currentColor');
  svg.append(path);
  return svg;
}

/**
 * Turns plain-text social links into icon links, collected in one list.
 * @param {Element} body card body cell
 */
function decorateSocial(body) {
  const links = [...body.querySelectorAll('a')]
    .map((a) => ({ a, network: detectNetwork(a) }))
    .filter(({ network }) => network);
  if (!links.length) return;

  const list = document.createElement('ul');
  list.className = 'cards-wknd-contributor-social';
  const firstContainer = links[0].a.closest('p, ul, ol') || links[0].a.parentElement;
  if (firstContainer && firstContainer !== body && body.contains(firstContainer)) {
    firstContainer.before(list);
  } else {
    body.append(list);
  }

  links.forEach(({ a, network }) => {
    const oldParent = a.parentElement;
    const label = a.textContent.trim() || NETWORKS[network].label;
    a.classList.remove('button', 'primary', 'secondary');
    a.classList.add('cards-wknd-contributor-social-link', `cards-wknd-contributor-social-${network}`);
    if (!a.title) a.title = label;
    const text = document.createElement('span');
    text.className = 'cards-wknd-contributor-sr';
    text.textContent = label;
    a.replaceChildren(createIcon(network), text);
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
    // drop wrappers (p / li / button-wrapper) left empty by moving the link out
    let node = oldParent;
    while (node && node !== body && !node.textContent.trim() && !node.querySelector('img, picture, a')) {
      const parent = node.parentElement;
      node.remove();
      node = parent;
    }
  });

  // drop containers left holding only separators (spaces, pipes) between links
  [...body.querySelectorAll(':scope > p, :scope > ul:not(.cards-wknd-contributor-social)')].forEach((el) => {
    if (!el.querySelector('a, img, picture') && !el.textContent.replace(/[\s|,·•]/g, '')) el.remove();
  });
}

function decorateBody(body) {
  body.className = 'cards-wknd-contributor-card-body';
  decorateSocial(body);

  // name: first heading, else first strong-only / first paragraph
  let name = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (!name) {
    const firstP = [...body.children].find((el) => el.tagName === 'P' && el.textContent.trim());
    if (firstP) name = firstP;
  }
  if (name) name.classList.add('cards-wknd-contributor-name');

  // roles: first non-empty paragraph after the name that is not the social list
  const roles = [...body.querySelectorAll(':scope > p')]
    .find((p) => p !== name && p.textContent.trim() && !p.querySelector('a'));
  if (roles) roles.classList.add('cards-wknd-contributor-roles');
}

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length || (!row.textContent.trim() && !row.querySelector('picture, img'))) return;

    const li = document.createElement('li');
    li.className = 'cards-wknd-contributor-card';

    const imageCell = cells.find((c) => c.querySelector('picture, img'));
    const textCells = cells.filter((c) => c !== imageCell && (c.textContent.trim() || c.querySelector('a')));

    if (imageCell) {
      const image = document.createElement('div');
      image.className = 'cards-wknd-contributor-card-image';
      const img = imageCell.querySelector('img');
      // keep only the picture; any stray text in the image cell joins the body
      const picture = img.closest('picture') || img;
      image.append(picture);
      li.append(image);
      if (imageCell.textContent.trim()) textCells.unshift(imageCell);
    }

    if (textCells.length) {
      const body = textCells[0];
      textCells.slice(1).forEach((extra) => body.append(...extra.childNodes));
      decorateBody(body);
      li.append(body);
    }

    ul.append(li);
  });

  ul.querySelectorAll('.cards-wknd-contributor-card-image img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    (img.closest('picture') || img).replaceWith(optimized);
  });

  block.replaceChildren(ul);
}
