/*
 * Carousel (WKND) block
 * Each authored row = one slide: image cell, optional caption cell.
 * No autoplay; instant swap (no animation); prev/next wrap around.
 * Dot indicators sit centred below the image, icon-only prev/next buttons at
 * the right. Controls render even when there is a single slide.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

let carouselCount = 0;

function showSlide(block, index) {
  const slides = [...block.querySelectorAll('.carousel-wknd-slide')];
  if (!slides.length) return;
  const total = slides.length;
  const target = ((index % total) + total) % total; // wrap around
  block.dataset.activeSlide = target;

  slides.forEach((slide, idx) => {
    const active = idx === target;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    slide.querySelectorAll('a, button, [tabindex]').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });

  block.querySelectorAll('.carousel-wknd-indicator button').forEach((btn, idx) => {
    if (idx === target) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });
}

function buildSlide(row, idx, total, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-wknd-slide';
  slide.id = `${id}-slide-${idx + 1}`;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${idx + 1} of ${total}`);

  const cells = [...row.children];
  // image cell = first cell containing a picture/img, else the first cell
  const imageCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
  if (imageCell) {
    imageCell.className = 'carousel-wknd-slide-image';
    imageCell.querySelectorAll('img').forEach((img) => {
      const picture = img.closest('picture');
      const optimized = createOptimizedPicture(img.src, img.alt, idx === 0, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]);
      if (picture) picture.replaceWith(optimized);
      else img.replaceWith(optimized);
    });
    // unwrap a lone <p> wrapper around the picture
    const p = imageCell.querySelector(':scope > p');
    if (p && p.children.length === 1 && p.querySelector('picture') && !p.textContent.trim()) {
      p.replaceWith(p.firstElementChild);
    }
    slide.append(imageCell);
  }

  cells.filter((c) => c !== imageCell && c.textContent.trim()).forEach((cell) => {
    cell.className = 'carousel-wknd-slide-caption';
    slide.append(cell);
  });

  return slide;
}

export default function decorate(block) {
  carouselCount += 1;
  const id = `carousel-wknd-${carouselCount}`;
  block.id = block.id || id;

  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.querySelector('picture, img') || row.textContent.trim());
  const total = rows.length;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.hasAttribute('aria-label')) block.setAttribute('aria-label', 'Image carousel');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-wknd-slides';
  slidesWrapper.id = `${id}-slides`;
  slidesWrapper.setAttribute('aria-live', 'polite');
  rows.forEach((row, idx) => slidesWrapper.append(buildSlide(row, idx, total, id)));

  // controls row: dots (centre) + prev/next (right)
  const controls = document.createElement('div');
  controls.className = 'carousel-wknd-controls';

  const indicators = document.createElement('ol');
  indicators.className = 'carousel-wknd-indicators';
  indicators.setAttribute('aria-label', 'Choose slide');
  for (let i = 0; i < total; i += 1) {
    const li = document.createElement('li');
    li.className = 'carousel-wknd-indicator';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Show slide ${i + 1} of ${total}`);
    btn.setAttribute('aria-controls', `${id}-slide-${i + 1}`);
    btn.addEventListener('click', () => showSlide(block, i));
    li.append(btn);
    indicators.append(li);
  }

  const nav = document.createElement('div');
  nav.className = 'carousel-wknd-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'carousel-wknd-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  prev.setAttribute('aria-controls', slidesWrapper.id);
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-wknd-next';
  next.setAttribute('aria-label', 'Next slide');
  next.setAttribute('aria-controls', slidesWrapper.id);
  prev.addEventListener('click', () => showSlide(block, Number(block.dataset.activeSlide || 0) - 1));
  next.addEventListener('click', () => showSlide(block, Number(block.dataset.activeSlide || 0) + 1));
  nav.append(prev, next);

  controls.append(indicators, nav);

  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      showSlide(block, Number(block.dataset.activeSlide || 0) - 1);
    } else if (e.key === 'ArrowRight') {
      showSlide(block, Number(block.dataset.activeSlide || 0) + 1);
    }
  });

  block.replaceChildren(slidesWrapper, controls);
  showSlide(block, 0);
}
