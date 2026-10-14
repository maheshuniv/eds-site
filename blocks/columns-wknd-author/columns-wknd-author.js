/*
 * columns-wknd-author: wknd.site article author bio strip.
 * Content model: one row per author, 2 cells
 *   cell 1 = photo
 *   cell 2 = name (heading), roles line, social links as plain text links
 *            labelled Facebook / Twitter / Instagram
 * Renders: rule-topped strip, round photo | name + roles | inline-SVG social icon links.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

const SVG_NS = 'http://www.w3.org/2000/svg';

/* Inline icon paths (24x24 viewBox) - no external icon font. */
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
  svg.classList.add('columns-wknd-author-icon');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', NETWORKS[network].path);
  path.setAttribute('fill', 'currentColor');
  svg.append(path);
  return svg;
}

/**
 * Removes the now-empty wrappers (p, li, ul, button-container) left behind after
 * moving a link out, walking up until a node with real content or the cell itself.
 * @param {Element|null} start
 * @param {Element} stop
 */
function pruneEmpty(start, stop) {
  let node = start;
  while (node && node !== stop && stop.contains(node)
    && !node.textContent.replace(/[\s|,·•]/g, '') && !node.querySelector('img, picture, a')) {
    const parent = node.parentElement;
    node.remove();
    node = parent;
  }
}

/**
 * Pulls the recognised social links out of the given cells into one icon list.
 * Links to unknown networks are left where the author put them.
 * @param {Element[]} cells
 * @param {string} name author name, used for accessible link titles
 * @returns {HTMLUListElement|null}
 */
function buildSocial(cells, name) {
  const links = cells
    .flatMap((cell) => [...cell.querySelectorAll('a')].map((a) => ({ a, cell })))
    .map((item) => ({ ...item, network: detectNetwork(item.a) }))
    .filter(({ network }) => network);
  if (!links.length) return null;

  const list = document.createElement('ul');
  list.className = 'columns-wknd-author-social';

  links.forEach(({ a, cell, network }) => {
    const oldParent = a.parentElement;
    const authored = a.textContent.trim();
    // a pasted URL is not a useful accessible name; fall back to the network name
    const label = authored && !/[/.]/.test(authored) ? authored : NETWORKS[network].label;
    a.classList.remove('button', 'primary', 'secondary');
    a.classList.add('columns-wknd-author-social-link', `columns-wknd-author-social-${network}`);
    if (!a.title) a.title = name ? `${name} on ${label}` : label;
    const text = document.createElement('span');
    text.className = 'columns-wknd-author-sr';
    text.textContent = label;
    a.replaceChildren(createIcon(network), text);
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
    pruneEmpty(oldParent, cell);
  });

  return list;
}

/**
 * Decorates one authored row into an author strip.
 * @param {Element} row
 * @returns {Element|null}
 */
function decorateRow(row) {
  const cells = [...row.children];
  if (!cells.length || (!row.textContent.trim() && !row.querySelector('picture, img'))) return null;

  const strip = document.createElement('div');
  strip.className = 'columns-wknd-author-row';

  // photo: first cell with an image (normally cell 1)
  const imageCell = cells.find((c) => c.querySelector('img'));
  if (imageCell) {
    const img = imageCell.querySelector('img');
    const photo = document.createElement('div');
    photo.className = 'columns-wknd-author-photo';
    photo.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '120' }]));
    const media = img.closest('picture') || img;
    const holder = media.parentElement;
    media.remove();
    pruneEmpty(holder, imageCell);
    strip.append(photo);
  }

  // text: every other cell, plus any text left in the image cell
  const textCells = cells.filter((c) => c !== imageCell || c.textContent.trim());
  const info = document.createElement('div');
  info.className = 'columns-wknd-author-info';

  const heading = textCells.map((c) => c.querySelector('h1, h2, h3, h4, h5, h6')).find(Boolean);
  const nameText = heading ? heading.textContent.trim() : '';
  const social = buildSocial(textCells, nameText);

  textCells.forEach((cell) => {
    // loose text nodes directly in a cell become a paragraph
    const loose = [...cell.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (loose.length && !cell.querySelector(':scope > *')) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      cell.append(p);
    }
    info.append(...cell.childNodes);
  });

  // name: first heading, else the first non-empty paragraph
  const name = heading || [...info.children].find((el) => el.tagName === 'P' && el.textContent.trim());
  if (name) name.classList.add('columns-wknd-author-name');

  // roles: first non-empty, link-free paragraph that is not the name
  const roles = [...info.querySelectorAll(':scope > p')]
    .find((p) => p !== name && p.textContent.trim() && !p.querySelector('a'));
  if (roles) roles.classList.add('columns-wknd-author-roles');

  if (info.textContent.trim() || info.querySelector('a')) strip.append(info);
  if (social) strip.append(social);

  if (!strip.children.length) return null;
  if (!imageCell) strip.classList.add('columns-wknd-author-no-photo');
  return strip;
}

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const strips = [...block.children].map(decorateRow).filter(Boolean);
  block.replaceChildren(...strips);
}
