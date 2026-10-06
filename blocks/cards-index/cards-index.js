const OPTION_CLASSES = [];

/**
 * Cards (index): vertical numbered list. Each row = one text cell holding a number
 * paragraph, heading, paragraph and optional CTA. Also accepts the number in its own
 * first cell. Items without a number still render (content spans the full width).
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ol = document.createElement('ol');
  [...block.children].forEach((row) => {
    const nodes = [];
    [...row.children].forEach((cell) => nodes.push(...cell.childNodes));
    const elements = nodes.filter((n) => n.nodeType === Node.ELEMENT_NODE
      || (n.nodeType === Node.TEXT_NODE && n.textContent.trim()));
    if (!elements.length) return;

    const li = document.createElement('li');
    li.className = 'cards-index-item';
    const content = document.createElement('div');
    content.className = 'cards-index-content';

    // the number is the leading short text (paragraph or bare text) before the heading
    let number = null;
    const first = elements[0];
    const firstIsHeading = first.nodeType === Node.ELEMENT_NODE && /^H[1-6]$/.test(first.tagName);
    const hasHeadingLater = elements.slice(1).some((n) => n.nodeType === Node.ELEMENT_NODE && /^H[1-6]$/.test(n.tagName));
    if (!firstIsHeading && hasHeadingLater && first.textContent.trim().length <= 8) {
      number = document.createElement('div');
      number.className = 'cards-index-number';
      number.textContent = first.textContent.trim();
      elements.shift();
    }

    elements.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const p = document.createElement('p');
        p.textContent = n.textContent.trim();
        content.append(p);
      } else {
        content.append(n);
      }
    });

    if (number) li.append(number);
    else li.classList.add('cards-index-item-no-number');
    li.append(content);
    ol.append(li);
  });

  block.replaceChildren(ol);
}
