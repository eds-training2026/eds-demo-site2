import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * FAQ block: image on the left, intro text + accordion on the right.
 * Right column can contain (optional): a small paragraph (eyebrow), a heading,
 * an intro paragraph, and an "Accordion" table with Question | Answer rows.
 */
function buildAccordion(table) {
  const wrap = document.createElement('div');
  wrap.className = 'faq-accordion';

  [...table.querySelectorAll('tr')].forEach((tr) => {
    const cells = [...tr.children];
    // skip the "Accordion" title row (single cell / colspan)
    if (cells.length < 2) return;

    const [q, a] = cells;

    const summary = document.createElement('summary');
    summary.className = 'faq-item-label';
    // unwrap <p> inside the question so it stays inline
    if (q.children.length === 1 && q.firstElementChild.tagName === 'P') {
      summary.append(...q.firstElementChild.childNodes);
    } else {
      summary.append(...q.childNodes);
    }

    const body = document.createElement('div');
    body.className = 'faq-item-body';
    body.append(...a.childNodes);

    const details = document.createElement('details');
    details.className = 'faq-item';
    details.append(summary, body);
    wrap.append(details);
  });

  // first item open by default
  const first = wrap.querySelector('details');
  if (first) first.open = true;

  // only one item open at a time
  wrap.addEventListener('toggle', (e) => {
    const opened = e.target;
    if (!opened.open) return;
    wrap.querySelectorAll('details[open]').forEach((d) => {
      if (d !== opened) d.open = false;
    });
  }, true);

  return wrap;
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const [imageCol, contentCol] = row.children;

  row.classList.add('faq-row');
  imageCol?.classList.add('faq-image');
  contentCol?.classList.add('faq-content');

  // optimized image
  const img = imageCol?.querySelector('img');
  if (img) {
    const pic = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ media: '(min-width: 900px)', width: '900' }, { width: '750' }],
    );
    img.closest('picture').replaceWith(pic);
  }

  if (!contentCol) return;

  // eyebrow = paragraph placed right before the heading
  const heading = contentCol.querySelector('h1, h2, h3, h4');
  const prev = heading?.previousElementSibling;
  if (prev && prev.tagName === 'P') prev.classList.add('faq-eyebrow');

  // accordion from the table
  const table = contentCol.querySelector('table');
  if (table) table.replaceWith(buildAccordion(table));
}