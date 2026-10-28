/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Site (wknd.site, AEM core components) site-wide cleanup.
 * Separate from the WKND Adventures import (wknd-adventures-*.js) - do not merge.
 *
 * Selectors verified in migration-work/cleaned.html (https://wknd.site/us/en/magazine.html):
 *   - <header class="experiencefragment cmp-experiencefragment--header ...">  global header XF
 *       (.sign-in-buttons, .languagenavigation, .cmp-navigation--header, .cmp-search--header, logo)
 *   - <footer class="experiencefragment cmp-experiencefragment--footer ..."> global footer XF
 *   - <div id="toggleNav"> / <div id="mobileNav" class="cmp-navigation--mobile">  mobile nav chrome
 *   - <iframe id="destination_publishing_iframe_wkndsite_0" class="aamIframeLoaded">  Adobe ID sync
 *   - <meta> elements left inside .cmp-image wrappers
 * Skip links: none present in captured DOM; any in-page "Skip to ..." anchor is removed by text match.
 * script / noscript / style / link are removed generically.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const SOURCE_ORIGIN = 'https://wknd.site';
const DEFAULT_BASE = `${SOURCE_ORIGIN}/us/en/magazine.html`;

const CHROME_SELECTORS = [
  'header.cmp-experiencefragment--header',
  '.cmp-experiencefragment--header',
  'footer.cmp-experiencefragment--footer',
  '.cmp-experiencefragment--footer',
  '.sign-in-buttons',
  '.languagenavigation',
  '.cmp-navigation--header',
  '.cmp-search--header',
  '#toggleNav',
  '#mobileNav',
  '.cmp-navigation--mobile',
  // adventure pages: third-party "Share this Adventure" widget (script-driven) and its heading
  '.title:has(+ .sharing)',
  '.sharing',
  'iframe',
  'script',
  'noscript',
  'style',
  'link',
];

function getBaseUrl(payload) {
  const candidate = (payload && ((payload.params && payload.params.originalURL) || payload.url)) || '';
  try {
    const url = new URL(candidate);
    // When imported through a proxy (e.g. localhost), always resolve against the real source origin.
    return url.origin === SOURCE_ORIGIN ? url.href : `${SOURCE_ORIGIN}${url.pathname}${url.search}`;
  } catch (e) {
    return DEFAULT_BASE;
  }
}

function toAbsolute(value, baseUrl) {
  try {
    const resolved = new URL(value, baseUrl);
    // Same-origin references (including proxy/localhost origins) are pinned to https://wknd.site.
    if (resolved.origin === new URL(baseUrl).origin || /^(?:localhost|127\.0\.0\.1)$/.test(resolved.hostname)) {
      return `${SOURCE_ORIGIN}${resolved.pathname}${resolved.search}${resolved.hash}`;
    }
    return resolved.href;
  } catch (e) {
    return value;
  }
}

function isSkippable(value) {
  return !value || value.startsWith('#') || /^(?:mailto|tel|javascript|data):/i.test(value);
}

function resolveUrls(element, baseUrl) {
  // Images: absolute src so WebImporter.rules.adjustImageUrls never drops one.
  element.querySelectorAll('img').forEach((img) => {
    let src = img.getAttribute('src');
    if (!src || /^data:/i.test(src)) {
      const lazy = img.getAttribute('data-cmp-src') || img.getAttribute('data-src');
      if (lazy) src = lazy.replace('{.width}', '');
    }
    if (src && !/^data:/i.test(src)) img.setAttribute('src', toAbsolute(src, baseUrl));
    if (img.hasAttribute('srcset')) img.removeAttribute('srcset');
  });
  // Links: these pages are not part of this site, so same-origin hrefs become absolute wknd.site URLs.
  element.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href').trim();
    if (isSkippable(href)) return;
    a.setAttribute('href', toAbsolute(href, baseUrl));
  });
}

/**
 * All wknd.site /us/en pages are migrated to this site, so page links (https://wknd.site/us/en/... .html)
 * become local extensionless paths (/us/en/...). Assets (images, /content/dam PDFs) stay on wknd.site.
 */
function localizePageLinks(element) {
  element.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href').trim();
    let url;
    try { url = new URL(href, SOURCE_ORIGIN); } catch (e) { return; }
    if (url.origin !== SOURCE_ORIGIN || !/^\/us\/en(\/.*)?\.html$/.test(url.pathname)) return;
    a.setAttribute('href', `${url.pathname.replace(/\.html$/, '')}${url.search}${url.hash}`);
  });
}

function removeSkipLinks(element) {
  element.querySelectorAll('a[href^="#"]').forEach((a) => {
    if (/^\s*skip\s+to\b/i.test(a.textContent)) a.remove();
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove global chrome before parsing so header/footer content can never match block/section selectors.
    WebImporter.DOMUtils.remove(element, CHROME_SELECTORS);
    removeSkipLinks(element);
    element.querySelectorAll('.cmp-image meta').forEach((m) => m.remove());
    resolveUrls(element, getBaseUrl(payload));
    // standalone button components (default content, e.g. "All Articles"): a link whose only child is a
    // span is lost in conversion, so rebuild as <p><strong><a>label</a></strong></p> (= primary button)
    // (buttons inside experience fragments — contributor/author social links — are left to their block parsers)
    element.querySelectorAll('.button > a.cmp-button').forEach((a) => {
      if (a.closest('.experiencefragment, .cmp-experiencefragment')) return;
      const label = (a.textContent || '').replace(/\s+/g, ' ').trim();
      const href = a.getAttribute('href');
      if (!label || !href) return;
      const doc = a.ownerDocument;
      const p = doc.createElement('p');
      const strong = doc.createElement('strong');
      const link = doc.createElement('a');
      link.setAttribute('href', href);
      link.textContent = label;
      strong.append(link);
      p.append(strong);
      a.replaceWith(p);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Safety net for anything re-introduced, plus non-authorable leftovers.
    WebImporter.DOMUtils.remove(element, CHROME_SELECTORS);
    removeSkipLinks(element);
    resolveUrls(element, getBaseUrl(payload));
    // runs after all parsers (which build absolute wknd.site links), so every page link is covered
    localizePageLinks(element);

    element.querySelectorAll('*').forEach((el) => {
      ['onclick', 'onload', 'data-cmp-data-layer', 'data-cmp-clickable'].forEach((attr) => {
        if (el.hasAttribute(attr)) el.removeAttribute(attr);
      });
    });
  }
}
