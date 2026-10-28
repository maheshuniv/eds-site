/*
 * Carousel (WKND hero) block
 * Each authored row = one slide: [image] | [optional eyebrow, heading, paragraph, CTA link].
 * No autoplay; 0.5s fade between slides (CSS); prev/next wrap around.
 * Controls row under the slide: dots centred, prev/next arrows at the right.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

let carouselCount = 0;

function showSlide(block, index) {
  const slides = [...block.querySelectorAll('.carousel-wknd-hero-slide')];
  if (!slides.length) return;
  const total = slides.length;
  const target = ((index % total) + total) % total; // wrap around
  block.dataset.activeSlide = target;

  slides.forEach((slide, idx) => {
    const active = idx === target;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    slide.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });

  block.querySelectorAll('.carousel-wknd-hero-indicator button').forEach((btn, idx) => {
    if (idx === target) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });
}

function decorateImageCell(cell, eager) {
  cell.className = 'carousel-wknd-hero-slide-image';
  cell.querySelectorAll('img').forEach((img) => {
    const picture = img.closest('picture');
    const optimized = createOptimizedPicture(img.src, img.alt || '', eager, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]);
    if (eager) {
      const optImg = optimized.querySelector('img');
      if (optImg) optImg.fetchPriority = 'high';
    }
    (picture || img).replaceWith(optimized);
  });
  // unwrap <p> wrappers that only hold a picture
  cell.querySelectorAll(':scope > p').forEach((p) => {
    if (p.querySelector('picture') && !p.textContent.trim()) p.replaceWith(...p.childNodes);
  });
}

function decorateContent(content) {
  content.className = 'carousel-wknd-hero-slide-content';
  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');

  // a short paragraph authored before the heading is the eyebrow / pretitle
  if (heading) {
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P' && prev.textContent.trim() && !prev.querySelector('a')) {
        prev.classList.add('carousel-wknd-hero-eyebrow');
      }
      prev = prev.previousElementSibling;
    }
  }

  // a paragraph that only holds a link is the CTA; authored bold links are already
  // buttonized by scripts.js, plain links are promoted to the primary button here
  content.querySelectorAll('p').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length !== 1 || p.textContent.trim() !== links[0].textContent.trim()) return;
    const a = links[0];
    if (a.querySelector('img')) return;
    p.classList.add('button-wrapper', 'carousel-wknd-hero-cta');
    if (!a.classList.contains('button')) a.classList.add('button', 'primary');
  });
}

function buildSlide(row, idx, total, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-wknd-hero-slide';
  slide.id = `${id}-slide-${idx + 1}`;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${idx + 1} of ${total}`);

  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture, img'));

  // image and text authored in the same cell: split the picture out
  let media = imageCell;
  if (imageCell && imageCell.textContent.trim()) {
    media = document.createElement('div');
    const pic = imageCell.querySelector('picture') || imageCell.querySelector('img');
    const wrapperP = pic.closest('p');
    media.append(pic);
    if (wrapperP && !wrapperP.textContent.trim() && !wrapperP.children.length) wrapperP.remove();
  }
  if (media) {
    decorateImageCell(media, idx === 0);
    slide.append(media);
  }

  const content = document.createElement('div');
  cells.forEach((cell) => {
    if (cell === media) return;
    if (!cell.textContent.trim() && !cell.querySelector('a')) return;
    content.append(...cell.childNodes);
  });
  if (content.children.length || content.textContent.trim()) {
    decorateContent(content);
    slide.append(content);
  } else {
    slide.classList.add('carousel-wknd-hero-slide-no-content');
  }

  return slide;
}

function createButton(className, label, controlsId) {
  const btn = document.createElement('button');
  btn.type = 'button';
  if (className) btn.className = className;
  btn.setAttribute('aria-label', label);
  btn.setAttribute('aria-controls', controlsId);
  return btn;
}

export default function decorate(block) {
  carouselCount += 1;
  const id = `carousel-wknd-hero-${carouselCount}`;
  if (!block.id) block.id = id;

  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.querySelector('picture, img') || row.textContent.trim());
  const total = rows.length;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.hasAttribute('aria-label')) block.setAttribute('aria-label', 'Featured adventures');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-wknd-hero-slides';
  slidesWrapper.id = `${id}-slides`;
  slidesWrapper.setAttribute('aria-live', 'polite');
  rows.forEach((row, idx) => slidesWrapper.append(buildSlide(row, idx, total, id)));

  const children = [slidesWrapper];

  if (total > 1) {
    const controls = document.createElement('div');
    controls.className = 'carousel-wknd-hero-controls';

    const indicators = document.createElement('ol');
    indicators.className = 'carousel-wknd-hero-indicators';
    indicators.setAttribute('aria-label', 'Choose slide');
    for (let i = 0; i < total; i += 1) {
      const li = document.createElement('li');
      li.className = 'carousel-wknd-hero-indicator';
      const btn = createButton(null, `Show slide ${i + 1} of ${total}`, `${id}-slide-${i + 1}`);
      btn.addEventListener('click', () => showSlide(block, i));
      li.append(btn);
      indicators.append(li);
    }

    const nav = document.createElement('div');
    nav.className = 'carousel-wknd-hero-nav';
    const prev = createButton('carousel-wknd-hero-prev', 'Previous slide', slidesWrapper.id);
    const next = createButton('carousel-wknd-hero-next', 'Next slide', slidesWrapper.id);
    prev.addEventListener('click', () => showSlide(block, Number(block.dataset.activeSlide || 0) - 1));
    next.addEventListener('click', () => showSlide(block, Number(block.dataset.activeSlide || 0) + 1));
    nav.append(prev, next);

    controls.append(indicators, nav);
    children.push(controls);

    block.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const step = e.key === 'ArrowLeft' ? -1 : 1;
      showSlide(block, Number(block.dataset.activeSlide || 0) + step);
      // keep focus on the dot of the newly active slide when navigating from the dots
      if (e.target.closest('.carousel-wknd-hero-indicators')) {
        const dot = block.querySelector('.carousel-wknd-hero-indicator button[aria-current="true"]');
        if (dot) dot.focus();
      }
    });
  }

  block.replaceChildren(...children);
  showSlide(block, 0);
}
