import { loadSections } from '../../scripts/aem.js';
// eslint-disable-next-line import/no-cycle
import { decorateMain } from '../../scripts/scripts.js';

// media query match that indicates desktop width (source switches to the hamburger at <= 1024px)
const isDesktop = window.matchMedia('(width >= 1025px)');

const HAMBURGER_ICON = '<svg class="nav-icon-open" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="2" fill="currentColor"/><rect x="3" y="11" width="18" height="2" fill="currentColor"/><rect x="3" y="16" width="18" height="2" fill="currentColor"/></svg>'
  + '<svg class="nav-icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

/**
 * Fetches the nav fragment: /content (local preview) first, then the site root (DA/EDS).
 * Relative image paths are resolved against the fragment URL, not the current page.
 * @returns {Promise<HTMLElement|null>} decorated fragment root
 */
async function loadNavFragment() {
  let url = '/content/nav.plain.html';
  let resp = await fetch(url);
  if (!resp.ok) {
    url = '/nav.plain.html';
    resp = await fetch(url);
  }
  if (!resp.ok) return null;
  const main = document.createElement('main');
  main.innerHTML = await resp.text();
  const base = new URL(url, window.location);
  main.querySelectorAll('img[src], source[srcset]').forEach((media) => {
    const attr = media.tagName === 'IMG' ? 'src' : 'srcset';
    const value = media.getAttribute(attr);
    if (value && !/^(?:[a-z]+:|\/)/i.test(value)) media.setAttribute(attr, new URL(value, base).href);
  });
  decorateMain(main);
  await loadSections(main);
  return main;
}

/**
 * Sets the open state of one dropdown (and closes all others).
 * @param {Element} sections the nav sections element
 * @param {Element|null} item the nav item to open, or null to close all
 */
function setOpenItem(sections, item) {
  sections.querySelectorAll('.nav-drop').forEach((drop) => {
    const open = drop === item;
    drop.classList.toggle('is-open', open);
    drop.querySelector(':scope > button').setAttribute('aria-expanded', open);
  });
}

/**
 * Toggles the mobile menu.
 * @param {Element} nav the nav element
 * @param {boolean} [force] explicit state
 */
function toggleMenu(nav, force) {
  const expanded = force ?? nav.getAttribute('aria-expanded') !== 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded);
  button.setAttribute('aria-expanded', expanded);
  button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
}

/**
 * Turns a list item of "<p><a>title</a></p><p>description</p>" into a card.
 * The title link is stretched over the whole card, so the card is clickable
 * while the link's accessible name stays the concise title.
 * @param {Element} li list item
 */
function buildCard(li) {
  const link = li.querySelector('a');
  if (!link) return;
  li.classList.add('nav-card');
  link.className = 'nav-card-title';
  const desc = [...li.querySelectorAll('p')].filter((p) => !p.contains(link)).map((p) => {
    const span = document.createElement('span');
    span.className = 'nav-card-desc';
    span.textContent = p.textContent.trim();
    return span;
  });
  li.replaceChildren(link, ...desc);
}

/**
 * Builds a dropdown panel from a nav item: every list becomes a link group,
 * a paragraph directly before a list becomes that group's label.
 * @param {Element} item nav item (li)
 * @returns {Element|null} the panel element
 */
function buildPanel(item) {
  const lists = [...item.querySelectorAll(':scope > ul')];
  if (!lists.length) return null;
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  const inner = document.createElement('div');
  inner.className = 'nav-panel-inner';
  lists.forEach((list) => {
    const group = document.createElement('div');
    group.className = 'nav-group';
    const label = list.previousElementSibling;
    if (label && label.tagName === 'P' && label !== item.firstElementChild) {
      label.className = 'nav-group-label';
      label.textContent = label.textContent.trim();
      group.append(label);
      group.classList.add('nav-group-labelled');
    }
    list.querySelectorAll(':scope > li').forEach(buildCard);
    group.append(list);
    inner.append(group);
  });
  inner.classList.add(lists.length > 1 ? 'nav-panel-split' : 'nav-panel-grid');
  panel.append(inner);
  return panel;
}

/**
 * Decorates the nav sections: each item with lists becomes a dropdown trigger + panel.
 * @param {Element} sections the nav sections element
 */
function decorateSections(sections) {
  const list = sections.querySelector('ul');
  if (!list) return;
  list.classList.add('nav-list');
  list.querySelectorAll(':scope > li').forEach((item) => {
    item.classList.add('nav-item');
    const panel = buildPanel(item);
    if (!panel) return;
    item.classList.add('nav-drop');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-trigger';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-haspopup', 'true');
    const label = document.createElement('span');
    label.textContent = item.firstElementChild.textContent.trim();
    const caret = document.createElement('span');
    caret.className = 'nav-caret';
    caret.setAttribute('aria-hidden', 'true');
    button.append(label, caret);
    item.replaceChildren(button, panel);

    button.addEventListener('click', () => {
      setOpenItem(sections, item.classList.contains('is-open') ? null : item);
    });
    item.addEventListener('mouseenter', () => {
      if (isDesktop.matches) setOpenItem(sections, item);
    });
    item.addEventListener('mouseleave', () => {
      if (isDesktop.matches) setOpenItem(sections, null);
    });
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await loadNavFragment();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  ['brand', 'sections', 'tools'].forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const brandLink = nav.querySelector('.nav-brand a');
  if (brandLink) {
    brandLink.className = 'nav-logo';
    brandLink.setAttribute('aria-label', brandLink.textContent.trim() || 'Home');
    // wrap the wordmark (text + line breaks) so it can be styled apart from the logo mark
    const wordmark = document.createElement('span');
    wordmark.className = 'nav-logo-text';
    [...brandLink.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE || n.nodeName === 'BR')
      .forEach((n) => wordmark.append(n));
    if (wordmark.textContent.trim()) brandLink.append(wordmark);
    const wrapper = brandLink.closest('.button-wrapper');
    if (wrapper) wrapper.className = '';
  }

  const sections = nav.querySelector('.nav-sections');
  if (sections) decorateSections(sections);

  // hamburger (shown at <= 1024px), placed after the tools like the source
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-expanded="false" aria-label="Open navigation">${HAMBURGER_ICON}</button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = sections && sections.querySelector('.nav-drop.is-open');
    if (open) {
      setOpenItem(sections, null);
      open.querySelector('button').focus();
    } else if (nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.querySelector('button').focus();
    }
  });
  nav.addEventListener('focusout', (e) => {
    if (!sections || !isDesktop.matches || nav.contains(e.relatedTarget)) return;
    setOpenItem(sections, null);
  });

  // reset menu state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    if (sections) setOpenItem(sections, null);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
