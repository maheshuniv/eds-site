/**
 * Accordion (FAQ): each row = question | answer. Questions become toggle buttons;
 * any number of items can be open at once. A single-cell row is treated as a question
 * whose first paragraph-free text is the label and the rest is the answer.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const blockId = `accordion-faq-${Math.random().toString(36).slice(2, 8)}`;

  [...block.children].forEach((row, i) => {
    const [questionCell, ...answerCells] = [...row.children];
    if (!questionCell || !questionCell.textContent.trim()) {
      row.remove();
      return;
    }

    const item = document.createElement('div');
    item.className = 'accordion-faq-item';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-faq-question';
    button.id = `${blockId}-q${i}`;
    button.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.textContent = questionCell.textContent.trim();
    const icon = document.createElement('span');
    icon.className = 'accordion-faq-icon';
    icon.setAttribute('aria-hidden', 'true');
    button.append(label, icon);

    const answer = document.createElement('div');
    answer.className = 'accordion-faq-answer';
    answer.id = `${blockId}-a${i}`;
    answer.setAttribute('role', 'region');
    answer.setAttribute('aria-labelledby', button.id);
    answer.hidden = true;
    answerCells.forEach((cell) => answer.append(...cell.childNodes));
    button.setAttribute('aria-controls', answer.id);

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', open);
      if (open) {
        answer.hidden = false;
        // flush layout so the max-height transition starts from the collapsed state
        answer.getBoundingClientRect();
      }
      item.classList.toggle('is-open', open);
      if (!open && window.matchMedia('(prefers-reduced-motion: reduce)').matches) answer.hidden = true;
    });
    // keep closed answers out of the accessibility tree once the collapse transition ends
    answer.addEventListener('transitionend', () => {
      if (!item.classList.contains('is-open')) answer.hidden = true;
    });

    item.append(button, answer);
    row.replaceWith(item);
  });
}
