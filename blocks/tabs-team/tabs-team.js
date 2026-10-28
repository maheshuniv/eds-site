import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

const OPTION_CLASSES = [];
const ROLE_MAX_LENGTH = 60;

let instanceCount = 0;

/**
 * Splits a profile cell into an identity column (round photo, name, optional role)
 * and a bio column. The picture plus the first line after it (the name) and an optional
 * short second line (the role) form the identity; everything else is the bio.
 * @param {Element[]} cells the profile content cells of one row
 * @returns {HTMLDivElement} the decorated profile
 */
function buildProfile(cells) {
  const profile = document.createElement('div');
  profile.className = 'tabs-team-profile';
  const identity = document.createElement('div');
  identity.className = 'tabs-team-identity';
  const bio = document.createElement('div');
  bio.className = 'tabs-team-bio';

  const nodes = cells.flatMap((cell) => [...cell.children]);
  // a cell with bare text (no block-level children) still counts as one paragraph
  cells.forEach((cell) => {
    if (!cell.children.length && cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      nodes.push(p);
    }
  });

  const photoIndex = nodes.findIndex((n) => n.tagName === 'PICTURE' || (n.querySelector('picture') && !n.textContent.trim()));
  let rest = nodes;
  if (photoIndex !== -1) {
    const photoNode = nodes[photoIndex];
    const img = photoNode.querySelector('img') || (photoNode.tagName === 'IMG' ? photoNode : null);
    const photo = document.createElement('div');
    photo.className = 'tabs-team-photo';
    photo.append(img ? createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]) : photoNode);
    identity.append(photo);
    rest = nodes.filter((_, i) => i !== photoIndex);
  }

  const isText = (n) => n && /^(P|H[1-6])$/.test(n.tagName) && n.textContent.trim() && !n.querySelector('picture');
  let i = 0;
  // the name: first text line (only when a photo or another identity line exists)
  if (isText(rest[0]) && (photoIndex !== -1 || rest.length > 1)) {
    rest[0].classList.add('tabs-team-name');
    identity.append(rest[0]);
    i = 1;
    // the role: an optional short line directly under the name, when bio text follows
    const role = rest[1];
    if (isText(role) && role.textContent.trim().length <= ROLE_MAX_LENGTH && rest.length > 2) {
      role.classList.add('tabs-team-role');
      identity.append(role);
      i = 2;
    }
  }
  rest.slice(i).forEach((n) => {
    if (n.textContent.trim() || n.querySelector('picture, img')) bio.append(n);
  });

  if (identity.children.length) profile.append(identity);
  if (bio.children.length) profile.append(bio);
  if (!identity.children.length || !bio.children.length) profile.classList.add('tabs-team-profile-single');
  return profile;
}

/**
 * Tabs (team): each row is "tab label | profile" (photo, name, optional role, bio paragraphs).
 * The first tab is active; clicking or arrow keys switch the single visible panel.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  instanceCount += 1;
  const prefix = `tabs-team-${instanceCount}`;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-team-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children].filter((row) => row.children.length && row.textContent.trim());
  const panels = [];
  const buttons = [];

  const select = (index, focus = false) => {
    panels.forEach((panel, i) => {
      panel.setAttribute('aria-hidden', i !== index);
      panel.hidden = i !== index;
    });
    buttons.forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === index);
      btn.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    if (focus) buttons[index].focus();
  };

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    // a single-cell row has no separate label: use the profile name as the tab label
    const contentCells = cells.length > 1 ? cells.slice(1) : cells;
    const profile = buildProfile(contentCells);
    const nameEl = profile.querySelector('.tabs-team-name');
    const label = (cells.length > 1 ? labelCell.textContent.trim() : '')
      || (nameEl && nameEl.textContent.trim()) || `Tab ${i + 1}`;
    const id = `${prefix}-${toClassName(label) || i}`;

    const panel = document.createElement('div');
    panel.className = 'tabs-team-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${id}-tab`);
    panel.setAttribute('tabindex', '0');
    panel.append(profile);

    const button = document.createElement('button');
    button.className = 'tabs-team-tab';
    button.id = `${id}-tab`;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    button.textContent = label;
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', (e) => {
      const last = rows.length - 1;
      let next = null;
      if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
      else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = last;
      if (next !== null) {
        e.preventDefault();
        select(next, true);
      }
    });

    tablist.append(button);
    buttons.push(button);
    panels.push(panel);
  });

  block.replaceChildren(tablist, ...panels);
  if (panels.length) select(0);
}
