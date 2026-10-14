/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Adventures section breaks + Section Metadata.
 * Every top-level <section> (and .ticker-strip) of #main-content becomes an EDS section; its style is derived
 * from the source classes, so it works for any section order on any page of the site:
 *   .accent-section -> accent, .secondary-section -> secondary, .inverse-section -> dark,
 *   .container--narrow -> narrow, .utility-text-align-center container -> centered
 * Breaks are inserted in beforeTransform (before parsers replace section elements);
 * Section Metadata is inserted in afterTransform, anchored to marker <hr> elements.
 */
const SECTION_STYLE_ATTR = 'data-excat-section-style';

const SECTION_CLASS_STYLES = [
  ['accent-section', 'accent'],
  ['secondary-section', 'secondary'],
  ['inverse-section', 'dark'],
  // blog posts: the article body section (narrow reading column + article typography)
  ['blog-article-section', 'narrow'],
  ['blog-article-section', 'article'],
];

const CONTAINER_CLASS_STYLES = [
  ['container--narrow', 'narrow'],
  ['utility-text-align-center', 'centered'],
];

function sectionStyle(section) {
  const styles = SECTION_CLASS_STYLES
    .filter(([cls]) => section.classList.contains(cls))
    .map(([, style]) => style);
  const container = section.querySelector(':scope > .container');
  if (container) {
    CONTAINER_CLASS_STYLES
      .filter(([cls]) => container.classList.contains(cls))
      .forEach(([, style]) => styles.push(style));
    // a .section-heading followed by running text keeps its larger gap below the heading
    const heading = container.querySelector(':scope > .section-heading');
    const next = heading && heading.nextElementSibling;
    if (next && ['P', 'UL', 'OL', 'H3', 'H4'].includes(next.tagName)) styles.push('spaced-heading');
    // a tag pill opening the section's text (p.tag before the heading) -> "eyebrow"
    const first = container.firstElementChild;
    if (first && first.matches('p.tag')) styles.push('eyebrow');
  }
  return styles.join(', ');
}

// eslint-disable-next-line no-unused-vars
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // full-width strips that sit between sections (e.g. the ticker) become their own section
    const sections = [...element.querySelectorAll('#main-content > section, main > section, #main-content > .ticker-strip')]
      .filter((s, i, all) => all.indexOf(s) === i);
    if (sections.length < 2) return;
    sections.forEach((section, i) => {
      const style = sectionStyle(section);
      if (i === 0 && !style) return;
      const hr = document.createElement('hr');
      if (style) hr.setAttribute(SECTION_STYLE_ATTR, style);
      if (i === 0) hr.setAttribute('data-excat-first-section', '');
      section.before(hr);
    });
  }

  if (hookName === 'afterTransform') {
    element.querySelectorAll(`[${SECTION_STYLE_ATTR}]`).forEach((marker) => {
      const style = marker.getAttribute(SECTION_STYLE_ATTR);
      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style },
      });
      marker.after(metadataBlock);
      marker.removeAttribute(SECTION_STYLE_ATTR);
      if (marker.hasAttribute('data-excat-first-section')) marker.remove();
    });
  }
}
