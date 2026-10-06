/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the site navigation fragment (content/nav.plain.html).
 * Source: the global header (div.navbar) of any wknd-adventures.com page.
 *
 * Output is flat, semantic DA-friendly markup (no classes/ids/forms):
 *   section 1 (brand): <p><a><img logo> WKND<br>Adventures</a></p>
 *   section 2 (sections): <ul> one <li> per megamenu trigger:
 *       <p>Trigger label</p>
 *       [<p>Group label</p>] <ul><li><p><a>Title</a></p><p>Description</p></li>...</ul>  (one per link group)
 *   section 3 (tools): <p><strong><a>Subscribe</a></strong></p>  (bold = primary button)
 */

const LOGO_SRC = 'images/wknd-logo.svg';

/** Same-site URL -> extensionless EDS path ("/index" -> "/"). */
function toEdsPath(href, baseUrl) {
  if (!href) return href;
  const url = new URL(href, baseUrl);
  if (url.origin !== new URL(baseUrl).origin) return url.href;
  const pathname = url.pathname.replace(/\.html?$/, '').replace(/\/index$/, '/') || '/';
  return `${pathname}${url.search}${url.hash}`;
}

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function el(document, tag, ...children) {
  const node = document.createElement(tag);
  children.filter(Boolean).forEach((c) => node.append(typeof c === 'string' ? document.createTextNode(c) : c));
  return node;
}

function link(document, href, label, baseUrl) {
  const a = el(document, 'a', label);
  a.setAttribute('href', toEdsPath(href, baseUrl));
  return a;
}

/** Builds <ul> of title/description items from megamenu link anchors. */
function buildLinkList(document, anchors, baseUrl) {
  const ul = el(document, 'ul');
  anchors.forEach((a) => {
    const title = a.querySelector('[class*="-title"]');
    const desc = a.querySelector('[class*="-desc"]');
    const li = el(document, 'li', el(document, 'p', link(document, a.getAttribute('href'), text(title) || text(a), baseUrl)));
    if (desc && text(desc)) li.append(el(document, 'p', text(desc)));
    ul.append(li);
  });
  return ul;
}

function buildBrand(document, navbar, baseUrl) {
  const logo = navbar.querySelector('a.logo');
  const a = link(document, logo ? logo.getAttribute('href') : '/', '', baseUrl);
  const img = document.createElement('img');
  img.setAttribute('src', LOGO_SRC);
  img.setAttribute('alt', 'WKND Adventures');
  a.append(img);
  const lines = logo ? [...logo.querySelector('.logo-text').childNodes].map((n) => n.textContent.trim()).filter(Boolean) : ['WKND', 'Adventures'];
  lines.forEach((line, i) => {
    if (i > 0) a.append(document.createElement('br'));
    a.append(document.createTextNode(line));
  });
  return el(document, 'div', el(document, 'p', a));
}

function buildSections(document, navbar, baseUrl) {
  const ul = el(document, 'ul');
  navbar.querySelectorAll('.nav-menu-list > li').forEach((item) => {
    const trigger = item.querySelector('.nav-megamenu-trigger, .nav-link');
    const li = el(document, 'li', el(document, 'p', text(trigger)));
    const panel = item.querySelector('.nav-megamenu');
    if (panel) {
      // link groups: each direct container of links becomes one list, preceded by its label if any
      const groups = panel.querySelectorAll('.nav-megamenu-grid, .nav-megamenu-stories-pages, .nav-megamenu-stories-articles');
      groups.forEach((group) => {
        const label = group.querySelector('.nav-megamenu-section-label');
        if (label) li.append(el(document, 'p', el(document, 'strong', text(label))));
        li.append(buildLinkList(document, [...group.querySelectorAll('a')], baseUrl));
      });
    } else if (trigger && trigger.tagName === 'A') {
      li.firstChild.replaceChildren(link(document, trigger.getAttribute('href'), text(trigger), baseUrl));
    }
    ul.append(li);
  });
  return el(document, 'div', ul);
}

function buildTools(document, navbar, baseUrl) {
  const section = el(document, 'div');
  navbar.querySelectorAll('.nav-right a').forEach((a) => {
    const label = text(a.querySelector('.button-label')) || text(a);
    const anchor = link(document, a.getAttribute('href'), label, baseUrl);
    section.append(el(document, 'p', a.classList.contains('button') ? el(document, 'strong', anchor) : anchor));
  });
  return section;
}

export default {
  transform: (payload) => {
    const { document, params } = payload;
    const baseUrl = params.originalURL;
    const navbar = document.querySelector('.navbar');
    const main = document.createElement('main');
    if (navbar) {
      // sections are separated by <hr> (each becomes a top-level <div> in the fragment)
      [buildBrand, buildSections, buildTools].forEach((build, i) => {
        if (i > 0) main.append(document.createElement('hr'));
        main.append(...build(document, navbar, baseUrl).childNodes);
      });
    }
    document.body.replaceChildren(main);
    return [{
      element: main,
      path: '/nav',
      report: { title: 'nav', sections: main.children.length, links: main.querySelectorAll('a').length },
    }];
  },
};
