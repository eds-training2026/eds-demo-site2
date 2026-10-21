import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Latest News block
 * Each row = one news card, 2 columns:
 *   col 1: image (optional, leave empty for a text-only card)
 *   col 2: heading with link (title), description paragraph, button link (italic link)
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const bodyCell = cells.length > 1 ? cells[1] : cells[0];
    const imageCell = cells.length > 1 ? cells[0] : null;
    if (!bodyCell) return;

    const li = document.createElement('li');
    li.className = 'news-card';

    const heading = bodyCell.querySelector('h1, h2, h3, h4, h5, h6');
    const titleLink = heading?.querySelector('a');

    /* ---------- image ---------- */
    const img = imageCell?.querySelector('img');
    if (img) {
      const media = document.createElement('div');
      media.className = 'news-card-image';
      const pic = createOptimizedPicture(
        img.src,
        img.alt,
        false,
        [{ media: '(min-width: 900px)', width: '800' }, { width: '600' }],
      );
      if (titleLink) {
        const a = document.createElement('a');
        a.href = titleLink.href;
        a.tabIndex = -1;
        a.setAttribute('aria-hidden', 'true');
        a.append(pic);
        media.append(a);
      } else {
        media.append(pic);
      }
      li.append(media);
    } else {
      li.classList.add('no-image');
    }

    /* ---------- body ---------- */
    const body = document.createElement('div');
    body.className = 'news-card-body';

    if (heading) {
      heading.querySelectorAll('strong, em').forEach((el) => el.replaceWith(...el.childNodes));
      const h3 = document.createElement('h3');
      h3.className = 'news-card-title';
      h3.append(...heading.childNodes);
      body.append(h3);
    }

    // button = a link that is not the title link (usually the italic link)
    const btnSource = [...bodyCell.querySelectorAll('a')].find((a) => !heading?.contains(a));

    bodyCell.querySelectorAll('p').forEach((p) => {
      if (btnSource && p.contains(btnSource)) return;
      if (!p.textContent.trim()) return;
      const text = document.createElement('p');
      text.className = 'news-card-text';
      text.append(...p.childNodes);
      body.append(text);
    });

    if (btnSource) {
      const actions = document.createElement('div');
      actions.className = 'news-card-actions';
      const a = document.createElement('a');
      a.href = btnSource.href;
      a.textContent = btnSource.textContent.trim();
      a.className = 'news-btn';
      actions.append(a);
      body.append(actions);
    }

    li.append(body);
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}