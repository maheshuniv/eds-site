import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// the source switches to the hamburger + off-canvas drawer at <= 1024px
const isDesktop = window.matchMedia('(width >= 1025px)');

// the source adds its "scrolly" state (shadow, compact desktop row) past 15px of scroll
const SCROLL_THRESHOLD = 15;

// the source opens the language panel 240px left of the toggle
const LANG_PANEL_OFFSET = 240;

// body class while the drawer is open (pushes the page, see templates/wknd-site/wknd-site.css)
const BODY_OPEN = 'header-wknd-nav-open';
// body class while the page is pushed or sliding back
const BODY_PUSHED = 'header-wknd-nav-pushed';
// drawer slide duration (ms), keep in sync with the CSS transition
const DRAWER_TRANSITION = 500;

// wknd-icon-font glyphs (search U+E913, menu U+E916), drawn on the font's em box
const ICON_VIEWBOX = '0 -960 1075.2 1024';
const SEARCH_ICON = `<svg class="header-wknd-icon" viewBox="${ICON_VIEWBOX}" aria-hidden="true" focusable="false"><path transform="scale(1 -1)" d="M1075.2 8.397l-76.032-72.397-228.096 217.19 76.032 72.448zM430.080 243.2c-163.28 8.22-292.557 142.609-292.557 307.192 0 169.86 137.699 307.558 307.558 307.558 169.857 0 307.554-137.694 307.558-307.55v0c-4.584-170.673-144.033-307.282-315.387-307.282-2.522 0-5.037 0.030-7.545 0.088l0.373-0.007zM430.080 960c-217.741-10.942-390.144-190.15-390.144-409.626 0-226.499 183.613-410.112 410.112-410.112s410.112 183.613 410.112 410.112c0 0.009 0 0.018 0 0.027v-0.002c-5.883 227.522-191.723 409.718-420.118 409.718-3.503 0-6.996-0.043-10.479-0.128l0.516 0.010z"/></svg>`;
const MENU_ICON = `<svg class="header-wknd-icon" viewBox="${ICON_VIEWBOX}" aria-hidden="true" focusable="false"><path transform="scale(1 -1)" d="M0 806.4h1075.2v-102.4h-1075.2v102.4zM0 540.16h839.68v-102.4h-839.68v102.4zM0 248.32h614.4v-102.4h-614.4v102.4z"/></svg>`;

/**
 * Normalizes a path for comparisons: drops the local /content prefix, .html, index
 * and the trailing slash.
 * @param {string} pathname URL path
 * @returns {string} normalized path
 */
function normalizePath(pathname) {
  return pathname
    .replace(/^\/content(?=\/)/, '')
    .replace(/\.html$/, '')
    .replace(/\/index$/, '')
    .replace(/\/$/, '') || '/';
}

/**
 * Returns the normalized path of a same-origin link, or null for other origins.
 * @param {HTMLAnchorElement} a link
 * @returns {string|null} normalized path
 */
function linkPath(a) {
  try {
    const url = new URL(a.getAttribute('href'), window.location);
    return url.origin === window.location.origin ? normalizePath(url.pathname) : null;
  } catch {
    return null;
  }
}

/**
 * Loads the nav fragment: the /content path (local preview) first, then the site path.
 * Honours the `nav` page metadata, defaulting to /us/en/nav.
 * @returns {Promise<HTMLElement|null>} fragment root
 */
async function loadNav() {
  const meta = getMetadata('nav');
  const path = meta ? new URL(meta, window.location).pathname.replace(/\.plain\.html$/, '') : '/us/en/nav';
  const candidates = path.startsWith('/content/') ? [path] : [`/content${path}`, path];
  // eslint-disable-next-line no-restricted-syntax
  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const fragment = await loadFragment(candidate);
    if (fragment) return fragment;
  }
  return null;
}

/**
 * URL of a country flag shipped with this block.
 * @param {string} code ISO country code (e.g. US)
 * @returns {string} flag URL
 */
function flagUrl(code) {
  return `${window.hlx?.codeBasePath || ''}/blocks/header-wknd/flags/${code}.svg`;
}

/**
 * Derives the country code from a language link text (e.g. "en-US" -> "US").
 * @param {string} locale locale text
 * @returns {string|null} country code
 */
function countryCode(locale) {
  const match = /^[a-z]{2,3}[-_]([a-z]{2})$/i.exec(locale.trim());
  return match ? match[1].toUpperCase() : null;
}

/**
 * Builds the language picker (toggle + panel) from the utility list of countries.
 * @param {Element} list `<ul>` of `<li><p>Country</p><ul><li><a>xx-YY</a></li></ul></li>`
 * @returns {{toggle: HTMLButtonElement, panel: HTMLElement}|null} picker parts
 */
function buildLanguagePicker(list) {
  const current = normalizePath(window.location.pathname);
  let active = null;
  let activeLength = -1;

  const panelList = document.createElement('ul');
  panelList.className = 'header-wknd-countries';
  [...list.children].filter((li) => li.tagName === 'LI').forEach((item) => {
    const links = [...item.querySelectorAll('a[href]')];
    if (!links.length) return;
    const country = document.createElement('li');
    country.className = 'header-wknd-country';
    const label = [...item.childNodes]
      .filter((n) => !(n.nodeType === Node.ELEMENT_NODE && (n.tagName === 'UL' || n.querySelector('a'))))
      .map((n) => n.textContent)
      .join(' ')
      .trim();
    const code = links.map((a) => countryCode(a.textContent)).find(Boolean);
    if (code) country.style.setProperty('--header-wknd-flag', `url('${flagUrl(code)}')`);

    const title = document.createElement('span');
    title.className = 'header-wknd-country-title';
    title.textContent = label || code || '';
    const languages = document.createElement('ul');
    languages.className = 'header-wknd-languages';
    links.forEach((a) => {
      const locale = a.textContent.trim();
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = locale;
      if (a.title) link.title = a.title;
      if (countryCode(locale)) {
        link.lang = locale;
        link.hreflang = locale;
      }
      li.append(link);
      languages.append(li);
      // the active locale is the link whose path is the longest prefix of the current page
      const path = linkPath(a);
      if (path && (current === path || current.startsWith(`${path}/`)) && path.length > activeLength) {
        active = { link, locale, code };
        activeLength = path.length;
      }
    });
    if (title.textContent) title.lang = links[0].textContent.trim();
    country.append(title, languages);
    panelList.append(country);
  });
  if (!panelList.children.length) return null;

  if (active) {
    active.link.setAttribute('aria-current', 'page');
    active.link.closest('.header-wknd-country').classList.add('is-active');
  }

  const panel = document.createElement('nav');
  panel.id = 'header-wknd-languages';
  panel.className = 'header-wknd-lang-panel';
  panel.setAttribute('aria-label', 'Language');
  panel.hidden = true;
  panel.append(panelList);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'header-wknd-lang-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', panel.id);
  const prefix = document.createElement('span');
  prefix.className = 'header-wknd-sr-only';
  prefix.textContent = 'Language: ';
  const label = document.createElement('span');
  label.className = 'header-wknd-lang-label';
  label.textContent = active ? active.locale : 'Language';
  toggle.append(prefix, label);
  if (active?.code) toggle.style.setProperty('--header-wknd-flag', `url('${flagUrl(active.code)}')`);

  return { toggle, panel };
}

/**
 * Reads the sections list: top-level items (e.g. Home) and their nested links.
 * @param {Element|null} section nav sections element
 * @returns {{top: HTMLAnchorElement[], nested: HTMLAnchorElement[], all: HTMLAnchorElement[]}}
 */
function readSections(section) {
  const result = { top: [], nested: [], all: [] };
  const list = section && section.querySelector('ul');
  if (!list) {
    // no list: every link is a top-level item
    const links = section ? [...section.querySelectorAll('a[href]')] : [];
    result.top = links;
    result.all = links;
    return result;
  }
  [...list.children].filter((li) => li.tagName === 'LI').forEach((item) => {
    // the item's own link is not inside one of its nested lists
    const own = [...item.querySelectorAll('a[href]')].find((a) => a.closest('ul') === list);
    const nested = [...item.querySelectorAll(':scope > ul a[href]')];
    if (own) {
      result.top.push(own);
      result.all.push(own);
    }
    result.nested.push(...nested);
    result.all.push(...nested);
  });
  return result;
}

/**
 * Builds a link list for the desktop nav or the drawer.
 * @param {HTMLAnchorElement[]} links source links
 * @param {boolean} highlightAncestors mark links to ancestors of the current page active
 * @returns {HTMLUListElement} list
 */
function buildLinkList(links, highlightAncestors) {
  const current = normalizePath(window.location.pathname);
  const ul = document.createElement('ul');
  links.forEach((a) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    const path = linkPath(a);
    if (path && path === current) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('is-active');
    } else if (highlightAncestors && path && path !== '/' && current.startsWith(`${path}/`)) {
      link.classList.add('is-active');
    }
    li.append(link);
    ul.append(li);
  });
  return ul;
}

/**
 * loads and decorates the wknd.site header
 * @param {Element} block The header-wknd block element
 */
export default async function decorate(block) {
  const fragment = await loadNav();
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const [utility, brand, navSections, tools] = sections;

  // utility bar: sign in + language picker
  const utilityBar = document.createElement('div');
  utilityBar.className = 'header-wknd-utility';
  const utilityInner = document.createElement('div');
  utilityInner.className = 'header-wknd-utility-inner';
  utilityBar.append(utilityInner);

  const signInCol = document.createElement('div');
  signInCol.className = 'header-wknd-signin';
  const signIn = utility && [...utility.querySelectorAll('a[href]')].find((a) => !a.closest('ul'));
  if (signIn) {
    const link = document.createElement('a');
    link.href = signIn.getAttribute('href');
    link.textContent = signIn.textContent.trim();
    signInCol.append(link);
  }
  const langCol = document.createElement('div');
  langCol.className = 'header-wknd-lang';
  const countries = utility && utility.querySelector('ul');
  const picker = countries ? buildLanguagePicker(countries) : null;
  if (picker) langCol.append(picker.toggle, picker.panel);
  utilityInner.append(signInCol, langCol);

  // main row: logo, sections, search
  const mainRow = document.createElement('div');
  mainRow.className = 'header-wknd-main';
  const mainInner = document.createElement('div');
  mainInner.className = 'header-wknd-main-inner';
  mainRow.append(mainInner);

  const brandCol = document.createElement('div');
  brandCol.className = 'header-wknd-brand';
  const brandLink = brand && brand.querySelector('a[href]');
  const brandImg = brand && brand.querySelector('picture, img');
  if (brandLink || brandImg) {
    const link = document.createElement('a');
    link.href = brandLink ? brandLink.getAttribute('href') : '/';
    if (brandImg) {
      const img = brandImg.querySelector('img') || brandImg;
      img.loading = 'eager';
      link.append(brandImg);
      if (!img.alt) link.setAttribute('aria-label', 'Home');
    } else {
      link.textContent = brandLink.textContent.trim();
    }
    brandCol.append(link);
  }

  const { top, nested, all } = readSections(navSections);
  const desktopNav = document.createElement('nav');
  desktopNav.className = 'header-wknd-sections';
  desktopNav.setAttribute('aria-label', 'Main');
  // the top-level item (Home) is not shown in the desktop bar, only its children
  desktopNav.append(buildLinkList(nested.length ? nested : top, true));

  const toolsCol = document.createElement('div');
  toolsCol.className = 'header-wknd-tools';
  const searchSrc = tools && tools.querySelector('a[href]');
  if (searchSrc) {
    const search = document.createElement('a');
    search.className = 'header-wknd-search';
    search.href = searchSrc.getAttribute('href');
    const label = (searchSrc.getAttribute('title') || searchSrc.textContent).trim() || 'Search';
    search.title = label;
    search.setAttribute('aria-label', label);
    search.innerHTML = SEARCH_ICON;
    toolsCol.append(search);
  }
  mainInner.append(brandCol, desktopNav, toolsCol);

  const bar = document.createElement('div');
  bar.className = 'header-wknd-bar';
  bar.append(utilityBar, mainRow);

  // off-canvas drawer (<= 1024px): every item, top level included
  const drawer = document.createElement('nav');
  drawer.id = 'header-wknd-drawer';
  drawer.className = 'header-wknd-drawer';
  drawer.setAttribute('aria-label', 'Main');
  drawer.append(buildLinkList(all, false));

  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'header-wknd-hamburger';
  hamburger.setAttribute('aria-controls', drawer.id);
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.innerHTML = MENU_ICON;

  // the hamburger lives in the bar (before the logo) so it moves with the bar when the drawer opens
  mainInner.prepend(hamburger);
  block.append(bar, drawer);

  // language panel
  const setLangOpen = (open) => {
    if (!picker) return;
    const { toggle, panel } = picker;
    if (open) {
      // same placement as the source: 240px left of the toggle, never past the left edge
      const left = toggle.getBoundingClientRect().left - bar.getBoundingClientRect().left;
      panel.style.left = `${Math.max(0, left - LANG_PANEL_OFFSET)}px`;
    }
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open);
    block.classList.toggle('is-lang-open', open);
  };
  const isLangOpen = () => picker && !picker.panel.hidden;

  // drawer
  let pushTimer;
  const isDrawerOpen = () => hamburger.getAttribute('aria-expanded') === 'true';
  const setDrawerOpen = (open, { focus = false } = {}) => {
    if (open === isDrawerOpen()) return;
    hamburger.setAttribute('aria-expanded', open);
    hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    block.classList.toggle('is-nav-open', open);
    window.clearTimeout(pushTimer);
    if (open) {
      document.body.classList.add(BODY_PUSHED, BODY_OPEN);
      if (focus) drawer.querySelector('a')?.focus({ preventScroll: true });
    } else {
      document.body.classList.remove(BODY_OPEN);
      pushTimer = window.setTimeout(
        () => document.body.classList.remove(BODY_PUSHED),
        DRAWER_TRANSITION,
      );
      if (focus) hamburger.focus();
    }
  };

  if (picker) {
    picker.toggle.addEventListener('click', () => {
      const open = !isLangOpen();
      if (open) setDrawerOpen(false);
      setLangOpen(open);
    });
  }
  hamburger.addEventListener('click', (e) => {
    const open = !isDrawerOpen();
    if (open) setLangOpen(false);
    // keyboard activation (no pointer: detail 0) moves focus into the drawer
    setDrawerOpen(open, { focus: open && e.detail === 0 });
  });

  // clicks outside close the open panel / drawer (like the source)
  document.addEventListener('click', (e) => {
    if (isLangOpen() && !picker.panel.contains(e.target) && !picker.toggle.contains(e.target)) {
      setLangOpen(false);
    }
    if (isDrawerOpen() && !drawer.contains(e.target) && !hamburger.contains(e.target)) {
      setDrawerOpen(false);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (isLangOpen()) {
      setLangOpen(false);
      picker.toggle.focus();
    } else if (isDrawerOpen()) {
      setDrawerOpen(false, { focus: true });
    }
  });

  // keyboard focus leaving a menu closes it
  langCol.addEventListener('focusout', (e) => {
    if (isLangOpen() && e.relatedTarget && !langCol.contains(e.relatedTarget)) setLangOpen(false);
  });
  drawer.addEventListener('focusout', (e) => {
    if (isDrawerOpen() && e.relatedTarget && !drawer.contains(e.relatedTarget)
      && e.relatedTarget !== hamburger) setDrawerOpen(false);
  });

  // reset when crossing the desktop breakpoint; keep the language panel aligned
  isDesktop.addEventListener('change', () => {
    setDrawerOpen(false);
    setLangOpen(false);
  });
  window.addEventListener('resize', () => {
    if (isLangOpen()) setLangOpen(true);
  });

  // scrolled state: shadow, compact desktop row
  const onScroll = () => block.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
