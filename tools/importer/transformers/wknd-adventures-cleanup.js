/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Adventures site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html:
 *   - <a href="#main-content" class="skip-link">Skip to main content</a>
 *   - <div class="navbar"> (logo, nav#nav-menu with .nav-megamenu panels, .nav-right Subscribe/toggle)
 *   - <footer class="footer inverse-footer">
 * Scripts/tracking/embeds are removed generically (script, noscript, link, iframe, style).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const ABSOLUTE_OR_SPECIAL = /^(?:[a-z][a-z0-9+.-]*:|\/|#)/i;

/**
 * Maps a same-site URL to its EDS page path: root-relative, no ".html", "/index" -> "/".
 */
function toEdsPath(url) {
  const pathname = url.pathname.replace(/\.html?$/, '').replace(/\/index$/, '/') || '/';
  return `${pathname}${url.search}${url.hash}`;
}

/**
 * The source mixes "/images/..." with path-relative "images/..." (and "blog/x.html") references.
 * WebImporter.rules.adjustImageUrls drops path-relative images, so resolve them against the page URL:
 * images become absolute, same-site links become extensionless EDS paths.
 */
function resolveRelativeUrls(element, baseUrl) {
  if (!baseUrl) return;
  const { origin } = new URL(baseUrl);
  element.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !ABSOLUTE_OR_SPECIAL.test(src)) img.setAttribute('src', new URL(src, baseUrl).href);
  });
  element.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^(?:mailto|tel):/i.test(href)) return;
    const resolved = new URL(href, baseUrl);
    if (resolved.origin !== origin) return;
    a.setAttribute('href', toEdsPath(resolved));
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    resolveRelativeUrls(element, (payload.params && payload.params.originalURL) || payload.url);

    // Global chrome removed before parsing so megamenu cards/links can never match block selectors.
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      'div.navbar',
      '.nav-megamenu',
      'footer.footer.inverse-footer',
      'script',
      'noscript',
    ]);

    // Default-content CTAs: scripts.js decorateButtons only buttonizes bold (primary) / italic (secondary) links.
    element.querySelectorAll('.button-group a.button, .button-group a.button--ghost').forEach((a) => {
      const label = a.querySelector('.button-label');
      if (label) a.textContent = label.textContent.trim();
      const wrap = document.createElement(a.classList.contains('button--ghost') ? 'em' : 'strong');
      a.replaceWith(wrap);
      wrap.append(a);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Safety net for anything re-introduced, plus non-authorable leftovers.
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      'div.navbar',
      'footer.footer.inverse-footer',
      'script',
      'noscript',
      'link',
      'style',
      'iframe',
    ]);

    // Strip inline event handlers / tracking attributes if present.
    element.querySelectorAll('*').forEach((el) => {
      ['onclick', 'onload', 'data-track', 'data-analytics'].forEach((attr) => {
        if (el.hasAttribute(attr)) el.removeAttribute(attr);
      });
    });
  }
}
