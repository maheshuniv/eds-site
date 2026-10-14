/**
 * Ticker: a horizontally scrolling strip of words.
 * Content: one cell holding a list (or paragraphs / "·"-separated text) of words.
 * The words are rendered twice so the scroll loops seamlessly; the copy is aria-hidden.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const items = [...block.querySelectorAll('li')].map((li) => li.textContent.trim());
  if (!items.length) {
    block.textContent.split(/[·•|\n]/).map((t) => t.trim()).filter(Boolean).forEach((t) => items.push(t));
  }
  if (!items.length) {
    block.remove();
    return;
  }

  const track = document.createElement('div');
  track.className = 'ticker-track';
  [false, true].forEach((isCopy) => {
    const list = document.createElement('ul');
    list.className = 'ticker-list';
    if (isCopy) list.setAttribute('aria-hidden', 'true');
    items.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      list.append(li);
    });
    track.append(list);
  });
  block.replaceChildren(track);
}
