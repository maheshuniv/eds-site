/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-team. Base: tabs.
 * Source: https://wknd-adventures.com/about.html
 * Structure (from blocks/tabs-team/tabs-team.js): 2 columns; one row per tab =
 *   tab label | profile (photo, name, optional role, bio paragraphs).
 * The matched element is the .tab-menu (buttons); the panels are the following sibling
 *   .tab-pane elements, which are consumed into this one block and removed.
 * Validated selectors (source.html): .tab-menu > button.tab-menu-link,
 *   ~ .tab-pane.tab-pane--padded, .profile-circle img, .profile-name,
 *   .team-profile-col p (role after name), .team-profile-bio p.
 * Iteration is keyed on the .tab-pane panels (block-level siblings, not nested buttons).
 * Image src values are kept as-is (the cleanup transformer resolves relative paths).
 */

function collectPanes(element) {
  // panes inside the matched element (if the selector ever matches a container)
  let panes = [...element.querySelectorAll('.tab-pane, [role="tabpanel"]')];
  if (panes.length) return panes;
  // the usual case: consecutive sibling panes following the tab menu
  panes = [];
  let sib = element.nextElementSibling;
  while (sib && sib.matches('.tab-pane, [role="tabpanel"]')) {
    panes.push(sib);
    sib = sib.nextElementSibling;
  }
  return panes;
}

function labelFromPane(pane) {
  if (!pane.id) return '';
  const text = pane.id.replace(/^tab-/, '').replace(/-/g, ' ').trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function buildProfile(pane, document) {
  const content = [];
  const photo = pane.querySelector('.profile-circle img, .team-profile-col img, img');
  if (photo) content.push(photo);

  const nameEl = pane.querySelector('.profile-name, .team-profile-col h3, .team-profile-col h4, .team-profile-col h5');
  if (nameEl) {
    const name = document.createElement('p');
    name.textContent = nameEl.textContent.trim();
    content.push(name);
    // optional role: the text line(s) following the name in the identity column
    let roleEl = nameEl.nextElementSibling;
    while (roleEl) {
      if (roleEl.textContent.trim() && !roleEl.querySelector('img')) {
        const role = document.createElement('p');
        role.textContent = roleEl.textContent.trim();
        content.push(role);
      }
      roleEl = roleEl.nextElementSibling;
    }
  }

  let bio = pane.querySelector('.team-profile-bio');
  let bioParas = bio ? [...bio.querySelectorAll('p, h3, h4, ul, ol')] : [];
  if (!bioParas.length) {
    // fallback: every paragraph outside the identity column
    bioParas = [...pane.querySelectorAll('p')].filter((p) => !p.closest('.team-profile-col') && p !== nameEl);
  }
  bioParas.forEach((p) => {
    if (p.textContent.trim() && !content.some((n) => n.contains(p))) content.push(p);
  });
  return content;
}

export default function parse(element, { document }) {
  const labels = [...element.querySelectorAll('button, .tab-menu-link, [role="tab"]')]
    .filter((el, i, arr) => !arr.some((o) => o !== el && o.contains(el)));
  const panes = collectPanes(element);

  if (!panes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  panes.forEach((pane, i) => {
    const label = labels[i]?.textContent.trim() || labelFromPane(pane) || `Tab ${i + 1}`;
    const profile = buildProfile(pane, document);
    cells.push([label, profile.length ? profile : '']);
  });

  // remove the consumed sibling panels
  panes.forEach((pane) => { if (!element.contains(pane)) pane.remove(); });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-team', cells });
  element.replaceWith(block);
}
