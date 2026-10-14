/*
 * Breadcrumb (WKND) block
 * Static authored trail: one cell holding the parent link(s) followed by the
 * current page title (plain text). Authors may use paragraphs, a list, or a
 * single paragraph of links + trailing text. Renders
 * <nav aria-label="Breadcrumb"><ol>…</ol></nav> with aria-current="page"
 * on the last item.
 */

/**
 * Collects trail items from the authored cell as { text, href } records.
 * @param {Element} cell
 * @returns {{text: string, href: string|null}[]}
 */
function collectItems(cell) {
  const items = [];
  const push = (text, href = null) => {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    if (clean) items.push({ text: clean, href });
  };

  const listItems = cell.querySelectorAll('li');
  const paragraphs = cell.querySelectorAll('p');
  let containers = [];
  if (listItems.length) containers = [...listItems];
  else if (paragraphs.length) containers = [...paragraphs];
  else containers = [cell];

  containers.forEach((container) => {
    const links = container.querySelectorAll('a[href]');
    if (links.length <= 1 && containers.length > 1) {
      // one item per container
      const link = links[0];
      push(container.textContent, link ? link.getAttribute('href') : null);
      return;
    }
    // a single container holding several links and/or trailing text
    container.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.matches('a[href]')) {
        push(node.textContent, node.getAttribute('href'));
      } else if (node.nodeType === Node.ELEMENT_NODE && node.querySelector('a[href]')) {
        const a = node.querySelector('a[href]');
        push(a.textContent, a.getAttribute('href'));
      } else {
        // strip common separator characters authors may type between items
        push((node.textContent || '').replace(/^[\s>/|»›]+|[\s>/|»›]+$/g, ''));
      }
    });
  });

  return items;
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const items = cells.flatMap((cell) => collectItems(cell));

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  ol.className = 'breadcrumb-wknd-list';

  items.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'breadcrumb-wknd-item';
    const isLast = idx === items.length - 1;
    if (isLast) {
      // current page: never a link
      const span = document.createElement('span');
      span.textContent = item.text;
      span.setAttribute('aria-current', 'page');
      li.append(span);
    } else if (item.href) {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.text;
      li.append(a);
    } else {
      li.textContent = item.text;
    }
    ol.append(li);
  });

  nav.append(ol);
  block.replaceChildren(nav);
}
