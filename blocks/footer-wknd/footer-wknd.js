import { getMetadata, loadSections } from '../../scripts/aem.js';
// eslint-disable-next-line import/no-cycle
import { decorateMain } from '../../scripts/scripts.js';

// social networks with an icon in ./icons/<name>.svg
const SOCIAL_ICONS = ['facebook', 'twitter', 'instagram'];

/**
 * Lists the fragment URLs to try: the /content copy (local preview) first, then the site root.
 * Page metadata "footer" overrides the default /us/en/footer fragment.
 * @returns {string[]} candidate .plain.html URLs
 */
function getFragmentUrls() {
  const meta = getMetadata('footer');
  const path = (meta ? new URL(meta, window.location).pathname : '/us/en/footer')
    .replace(/(\.plain)?\.html$/, '')
    .replace(/\/$/, '');
  const urls = [`${path}.plain.html`];
  if (!path.startsWith('/content/')) urls.unshift(`/content${path}.plain.html`);
  return urls;
}

/**
 * Fetches the first URL that responds OK.
 * @param {string[]} urls candidate URLs, in order
 * @returns {Promise<{url: string, html: string}|null>}
 */
async function fetchFirst(urls) {
  if (!urls.length) return null;
  const [url, ...rest] = urls;
  try {
    const resp = await fetch(url);
    if (resp.ok) return { url, html: await resp.text() };
  } catch { /* try the next candidate */ }
  return fetchFirst(rest);
}

/**
 * Loads and decorates the footer fragment.
 * Relative image paths are resolved against the fragment URL, not the current page.
 * @returns {Promise<HTMLElement|null>} decorated fragment root
 */
async function loadFooterFragment() {
  const fragment = await fetchFirst(getFragmentUrls());
  if (!fragment) return null;
  const main = document.createElement('main');
  main.innerHTML = fragment.html;
  const base = new URL(fragment.url, window.location);
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
 * Normalizes a path for comparison: no /content prefix, no .html, no trailing slash.
 * @param {string} path URL path
 * @returns {string}
 */
function normalizePath(path) {
  return path.replace(/^\/content(?=\/)/, '').replace(/(\.plain)?\.html$/, '').replace(/\/$/, '') || '/';
}

/**
 * Builds the footer navigation from the authored list. Only leaf links are shown:
 * a parent item (e.g. "Home" wrapping the page list) is dropped, like on the source.
 * @param {Element} list authored ul
 * @returns {Element} nav landmark
 */
function buildNav(list) {
  const nav = document.createElement('nav');
  nav.className = 'footer-wknd-nav';
  nav.setAttribute('aria-label', 'Footer navigation');
  const ul = document.createElement('ul');
  const current = normalizePath(window.location.pathname);
  list.querySelectorAll('li').forEach((li) => {
    if (li.querySelector('ul')) return;
    const link = li.querySelector('a[href]');
    if (!link) return;
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = link.textContent.trim();
    if (new URL(a.href).origin === window.location.origin
      && normalizePath(new URL(a.href).pathname) === current) {
      a.setAttribute('aria-current', 'page');
    }
    const item = document.createElement('li');
    item.append(a);
    ul.append(item);
  });
  nav.append(ul);
  return nav;
}

/**
 * Builds the icon-only social buttons; the link text stays as the accessible name.
 * Links without a known icon keep a visible text label.
 * @param {Element} list authored ul
 * @param {Element|null} heading heading labelling the list
 * @returns {Element} social list
 */
function buildSocial(list, heading) {
  const ul = document.createElement('ul');
  ul.className = 'footer-wknd-social';
  if (heading) {
    heading.id = heading.id || 'footer-wknd-follow';
    ul.setAttribute('aria-labelledby', heading.id);
  }
  list.querySelectorAll('a[href]').forEach((link) => {
    const label = link.textContent.trim();
    const key = `${label} ${link.getAttribute('href')}`.toLowerCase();
    const icon = SOCIAL_ICONS.find((name) => key.includes(name));
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.className = 'footer-wknd-social-link';
    const text = document.createElement('span');
    text.className = 'footer-wknd-social-label';
    text.textContent = label;
    if (icon) {
      a.classList.add('footer-wknd-social-icon');
      const glyph = document.createElement('span');
      glyph.className = `footer-wknd-icon footer-wknd-icon-${icon}`;
      glyph.setAttribute('aria-hidden', 'true');
      a.append(glyph);
    }
    a.append(text);
    const li = document.createElement('li');
    li.append(a);
    ul.append(li);
  });
  return ul;
}

/**
 * loads and decorates the wknd.site footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await loadFooterFragment();
  if (!fragment) return;

  const lists = [...fragment.querySelectorAll('ul')].filter((ul) => !ul.parentElement.closest('ul'));
  const heading = fragment.querySelector('h1, h2, h3, h4, h5, h6');
  // the social list follows the heading ("Follow Us"); the nav is the first other list
  let socialList = heading && heading.nextElementSibling;
  while (socialList && socialList.tagName !== 'UL') socialList = socialList.nextElementSibling;
  if (!socialList) socialList = lists.length > 1 ? lists[lists.length - 1] : null;
  const navList = lists.find((ul) => ul !== socialList);
  const logo = fragment.querySelector('img');
  // authored elements used by the brand/nav/social columns; the rest becomes the legal text
  const used = [navList, socialList, heading, logo]
    .filter(Boolean)
    .map((el) => el.closest('.default-content-wrapper > *'));

  const inner = document.createElement('div');
  inner.className = 'footer-wknd-inner';

  const brand = document.createElement('div');
  brand.className = 'footer-wknd-brand';
  if (logo) {
    const logoLink = logo.closest('a');
    const a = document.createElement('a');
    a.className = 'footer-wknd-logo';
    a.href = logoLink ? logoLink.getAttribute('href') : '/us/en';
    logo.loading = 'lazy';
    a.append(logo);
    brand.append(a);
  }

  const follow = document.createElement('div');
  follow.className = 'footer-wknd-follow';
  if (heading) {
    heading.className = 'footer-wknd-follow-title';
    follow.append(heading);
  }

  const social = document.createElement('div');
  social.className = 'footer-wknd-social-wrapper';
  if (socialList) social.append(buildSocial(socialList, heading));

  inner.append(brand, navList ? buildNav(navList) : document.createElement('div'), follow, social);

  // everything else (copyright, credits) becomes the legal text
  const legal = document.createElement('div');
  legal.className = 'footer-wknd-legal';
  fragment.querySelectorAll('.default-content-wrapper > *').forEach((el) => {
    if (used.includes(el)) return;
    if (el.matches('p.button-wrapper')) el.className = '';
    el.querySelectorAll('a.button').forEach((a) => { a.className = ''; });
    legal.append(el);
  });
  inner.append(legal);

  block.replaceChildren(inner);
}
