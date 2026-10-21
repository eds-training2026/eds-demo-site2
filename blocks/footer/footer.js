import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Group the first footer section into columns.
 * Everything before the first heading = brand column (logo, text, social icons).
 * Every heading starts a new column (Important Link, Quick Info, Recent Posts ...).
 */
function buildColumns(section) {
  const source = section.querySelector('.default-content-wrapper') || section;
  const columns = [{ className: 'footer-brand', items: [] }];

  [...source.children].forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName)) {
      columns.push({ className: 'footer-links', items: [el] });
    } else {
      columns[columns.length - 1].items.push(el);
    }
  });

  const grid = document.createElement('div');
  grid.className = 'footer-columns';

  columns.forEach(({ className, items }) => {
    if (!items.length) return;
    const col = document.createElement('div');
    col.className = `footer-col ${className}`;
    col.append(...items);
    grid.append(col);
  });

  return grid;
}

/** A paragraph that only contains icons (e.g. :facebook: :x:) becomes the social row. */
function decorateSocial(col) {
  col.querySelectorAll('p').forEach((p) => {
    const hasIcons = p.querySelectorAll('.icon').length >= 2;
    const plainText = p.textContent.replace(/\s/g, '');
    if (hasIcons && !plainText) p.classList.add('footer-social');
  });
}

/**
 * Recent posts: author each post as
 *   paragraph with an image
 *   paragraph with the title, line break (Shift+Enter), then the date
 */
function decoratePosts(col) {
  [...col.querySelectorAll(':scope > p')].forEach((imgP) => {
    if (!imgP.querySelector('picture') || imgP.textContent.trim()) return;
    const textP = imgP.nextElementSibling;
    if (!textP || textP.tagName !== 'P') return;

    const nodes = [...textP.childNodes];
    const br = nodes.findIndex((n) => n.nodeName === 'BR');
    const titleNodes = br < 0 ? nodes : nodes.slice(0, br);
    const dateNodes = br < 0 ? [] : nodes.slice(br + 1);

    const title = document.createElement('p');
    title.className = 'footer-post-title';
    title.append(...titleNodes);

    const date = document.createElement('p');
    date.className = 'footer-post-date';
    date.append(...dateNodes);

    const thumb = document.createElement('div');
    thumb.className = 'footer-post-image';
    thumb.append(imgP.querySelector('picture'));

    const body = document.createElement('div');
    body.className = 'footer-post-body';
    body.append(title, date);

    const post = document.createElement('div');
    post.className = 'footer-post';
    post.append(thumb, body);

    imgP.replaceWith(post);
    textP.remove();
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  const [mainSection, bottomSection] = [...fragment.children];

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  if (mainSection) {
    const columns = buildColumns(mainSection);
    columns.querySelectorAll('.footer-col').forEach((col) => {
      decorateSocial(col);
      if (!col.classList.contains('footer-brand')) decoratePosts(col);
    });
    footer.append(columns);
  }

  if (bottomSection) {
    const bottom = document.createElement('div');
    bottom.className = 'footer-bottom';
    const source = bottomSection.querySelector('.default-content-wrapper') || bottomSection;
    bottom.append(...source.childNodes);
    footer.append(bottom);
  }

  block.append(footer);
}