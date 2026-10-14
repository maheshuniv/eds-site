/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion (EDS library convention).
 * Source: https://wknd-adventures.com/basecamp.html
 * Structure: 2 columns; each row = title cell (question) | content cell (answer).
 * Validated selectors (source): .faq-item, .faq-question (button > span), .faq-answer.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .faq-item')];
  if (!items.length) items = [...element.querySelectorAll(':scope > div, :scope > details')];

  const cells = [];
  items.forEach((item) => {
    const question = item.querySelector('.faq-question, summary, button, h3, h4');
    const answer = item.querySelector('.faq-answer') || [...item.children].find((c) => c !== question);
    const title = question ? question.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!title) return;

    // content cell: answers may be bare text, so wrap text runs in a paragraph
    const content = [];
    if (answer) {
      const hasBlockChildren = [...answer.children].some((c) => /^(P|UL|OL|DIV|H\d)$/.test(c.tagName));
      if (hasBlockChildren) {
        content.push(...answer.childNodes);
      } else if (answer.textContent.trim()) {
        const p = document.createElement('p');
        p.append(...answer.childNodes);
        content.push(p);
      }
    }
    cells.push([title, content]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
