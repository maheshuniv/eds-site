/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Site (wknd.site) magazine article (template "wknd-site-article").
 * Runs AFTER wknd-site-cleanup.js and alongside wknd-site-sections.js. Article body stays
 * default content; quote-wknd / columns-wknd-author / breadcrumb-wknd are left to their parsers.
 *
 * Selectors verified in migration-work/cleaned.html (arctic-surfing) and the live source of
 * guide-la-skateparks, san-diego-surf, ski-touring, western-australia:
 *   - h3.cmp-contentfragment__title          duplicate CF title, display:none on source (all 5)
 *   - .separator.cmp-separator--hidden       invisible spacer (aside, after the share widget)
 *   - aside .download (no .cmp-download)     empty download teaser (western-australia)
 *   - .cmp-image > span.cmp-image__title     visible image caption (san-diego-surf)
 *   - .list.cmp-list--upnext ul.cmp-list > li.cmp-list__item > a.cmp-list__item-link
 *       > span.cmp-list__item-title + span.cmp-list__item-date
 *   - .download .cmp-download: h3.cmp-download__title > a.cmp-download__title-link,
 *       .cmp-download__description, dl.cmp-download__properties dd.cmp-download__property-content
 *       (dt labels are hidden on source), a.cmp-download__action > span.cmp-download__action-text
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const SOURCE_ORIGIN = 'https://wknd.site';

const HIDDEN_SELECTORS = [
  'h3.cmp-contentfragment__title',
  '.separator.cmp-separator--hidden',
];

function absolute(href) {
  if (!href) return href;
  try {
    const url = new URL(href, SOURCE_ORIGIN);
    if (url.origin === SOURCE_ORIGIN || /^(?:localhost|127\.0\.0\.1)$/.test(url.hostname)) {
      return `${SOURCE_ORIGIN}${url.pathname}${url.search}${url.hash}`;
    }
    return url.href;
  } catch (e) {
    return href;
  }
}

// AEM download servlet suffix -> plain DAM asset URL (both serve the PDF on wknd.site).
function pdfUrl(href) {
  return absolute(href).replace(/(\.pdf)\.coredownload\.pdf(?=$|[?#])/i, '$1');
}

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function isHidden(el) {
  if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') return true;
  if (/display\s*:\s*none/i.test(el.getAttribute('style') || '')) return true;
  try {
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (view && view.getComputedStyle && el.isConnected) {
      const cs = view.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return true;
    }
  } catch (e) {
    // no layout available - fall back to markup checks only
  }
  return false;
}

function removeHidden(element) {
  WebImporter.DOMUtils.remove(element, HIDDEN_SELECTORS);
  // Empty download teaser (component placeholder with no file, e.g. western-australia).
  // Checks for real content, so the already-rewritten teaser survives the afterTransform pass.
  element.querySelectorAll('.download').forEach((d) => {
    if (!d.querySelector('.cmp-download, a[href], h1, h2, h3, h4, h5, h6, p') && !text(d)) d.remove();
  });
}

function convertCaptions(element, doc) {
  element.querySelectorAll('.cmp-image > .cmp-image__title').forEach((span) => {
    const caption = text(span);
    const hidden = isHidden(span);
    const image = span.closest('.image') || span.parentElement;
    span.remove();
    if (!caption || hidden || !image) return;
    const p = doc.createElement('p');
    const em = doc.createElement('em');
    em.textContent = caption;
    p.append(em);
    image.after(p);
  });
}

function rewriteUpNext(element, doc) {
  element.querySelectorAll('.list.cmp-list--upnext ul.cmp-list > li').forEach((li) => {
    const link = li.querySelector('a.cmp-list__item-link') || li.querySelector('a[href]');
    if (!link) return;
    const title = text(link.querySelector('.cmp-list__item-title')) || text(link);
    const date = text(link.querySelector('.cmp-list__item-date'));
    const a = doc.createElement('a');
    a.setAttribute('href', absolute(link.getAttribute('href')));
    a.textContent = title;
    li.replaceChildren(a);
    if (date) li.append(doc.createElement('br'), doc.createTextNode(date));
  });
}

function rewriteDownload(element, doc) {
  element.querySelectorAll('.download .cmp-download').forEach((dl) => {
    const action = dl.querySelector('a.cmp-download__action');
    const titleLink = dl.querySelector('.cmp-download__title-link');
    const href = (action && action.getAttribute('href')) || (titleLink && titleLink.getAttribute('href'));
    if (!href) return;
    const url = pdfUrl(href);
    const out = [];

    const titleEl = dl.querySelector('.cmp-download__title');
    if (text(titleEl)) {
      const h3 = doc.createElement('h3');
      const a = doc.createElement('a');
      a.setAttribute('href', url);
      a.textContent = text(titleEl);
      h3.append(a);
      out.push(h3);
    }

    const desc = dl.querySelector('.cmp-download__description');
    if (desc) {
      const ps = desc.querySelectorAll('p');
      (ps.length ? [...ps] : [desc]).forEach((src) => {
        if (!text(src)) return;
        const p = doc.createElement('p');
        p.textContent = text(src);
        out.push(p);
      });
    }

    const props = [...dl.querySelectorAll('.cmp-download__property-content')].map(text).filter(Boolean);
    if (props.length) {
      const p = doc.createElement('p');
      props.forEach((v, i) => {
        if (i) p.append(doc.createElement('br'));
        p.append(doc.createTextNode(v));
      });
      out.push(p);
    }

    const label = text(action && (action.querySelector('.cmp-download__action-text') || action)) || 'Download';
    const p = doc.createElement('p');
    const strong = doc.createElement('strong');
    const a = doc.createElement('a');
    a.setAttribute('href', url);
    a.textContent = label;
    strong.append(a);
    p.append(strong);
    out.push(p);

    dl.replaceWith(...out);
  });
}

export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument || document;

  if (hookName === TransformHook.beforeTransform) {
    // Captions are read before anything detaches the image from layout (visibility check).
    convertCaptions(element, doc);
    removeHidden(element);
    rewriteUpNext(element, doc);
    rewriteDownload(element, doc);
  }

  if (hookName === TransformHook.afterTransform) {
    // Idempotent safety net (each step is a no-op once already applied).
    removeHidden(element);
    convertCaptions(element, doc);
  }
}
