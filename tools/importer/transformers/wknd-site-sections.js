/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Site (wknd.site) section breaks + Section Metadata, driven by payload.template.sections.
 * Separate from the WKND Adventures import (wknd-adventures-sections.js) - do not merge.
 *
 * The page is a flat AEM grid (main > .cmp-container > .aem-Grid > items). Selectors come from
 * tools/importer/page-templates.json and were verified in migration-work/cleaned.html:
 *   section 2: main .aem-Grid > .title.cmp-title--underline:has(+ .image-list)   ("All Articles")
 *   section 3: main .aem-Grid > .title.cmp-title--underline:has(+ .text)         ("Members Only")
 *   section 4: main .aem-Grid > .separator  (div.separator.cmp-separator--space-medium) - the separator
 *              itself is replaced by the section break so it never survives as content.
 * First section gets no break.
 *
 * Breaks are inserted in beforeTransform (before parsers replace section elements);
 * Section Metadata is inserted in afterTransform, anchored to marker <hr> elements.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector in this environment - try the next candidate
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  // a single section still needs its Section Metadata when it carries a style (e.g. wknd-sidebar)
  if (!sections.length || (sections.length < 2 && !sections[0].style)) return;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue;

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);

      if (i > 0 && sectionEl.classList.contains('separator')) {
        // The source separator *is* the boundary: replace it with the section break.
        sectionEl.replaceWith(hr);
      } else {
        sectionEl.before(hr);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }

    // Safety net: no source separator markup may survive as content.
    element.querySelectorAll('main .separator, .cmp-separator').forEach((el) => el.remove());
  }
}
