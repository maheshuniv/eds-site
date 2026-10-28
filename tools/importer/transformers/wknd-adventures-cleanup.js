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

    // figure > img + figcaption (default content): image paragraph + caption as an emphasised-only paragraph
    element.querySelectorAll('#main-content figure').forEach((figure) => {
      const img = figure.querySelector('img');
      if (!img) return;
      const doc = figure.ownerDocument;
      const imgP = doc.createElement('p');
      imgP.append(img);
      const parts = [imgP];
      const caption = figure.querySelector('figcaption');
      const text = caption ? caption.textContent.replace(/\s+/g, ' ').trim() : '';
      if (text) {
        const capP = doc.createElement('p');
        const em = doc.createElement('em');
        em.textContent = text;
        capP.append(em);
        parts.push(capP);
      }
      figure.replaceWith(...parts);
    });

    // Global chrome removed before parsing so megamenu cards/links can never match block selectors.
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      'div.navbar',
      '.nav-megamenu',
      'footer.footer.inverse-footer',
      'script',
      'noscript',
    ]);

    // The importer merges neighbouring links that share an href into one <a> (e.g. "Community" + "Submit a
    // Story" both -> community.html). Split such a button back into one link per label; the merged ones
    // lose their class, so they become ghost (secondary) buttons, as on the source.
    element.querySelectorAll('.button-group a').forEach((a) => {
      const labels = [...a.querySelectorAll(':scope > .button-label')];
      if (labels.length < 2) return;
      let after = a;
      labels.slice(1).forEach((label) => {
        const extra = a.ownerDocument.createElement('a');
        extra.setAttribute('href', a.getAttribute('href'));
        extra.className = 'button--ghost';
        extra.append(label);
        after.after(extra);
        after = extra;
      });
    });

    // Default-content CTAs: scripts.js decorateButtons only buttonizes bold (primary) / italic (secondary) links.
    // accent buttons are bold + italic (accent) in decorateButtons. Each button gets its own
    // paragraph: decorateButtons only buttonizes a link that is alone in its paragraph.
    element.querySelectorAll('.button-group a.button, .button-group a.button--ghost, .button-group a.accent-button').forEach((a) => {
      const label = a.querySelector('.button-label');
      if (label) a.textContent = label.textContent.trim();
      const p = document.createElement('p');
      a.replaceWith(p);
      let inner = p;
      if (a.classList.contains('accent-button')) {
        const strong = document.createElement('strong');
        p.append(strong);
        inner = strong;
      }
      const wrap = document.createElement(a.classList.contains('button--ghost') ? 'em' : (inner === p ? 'strong' : 'em'));
      inner.append(wrap);
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
