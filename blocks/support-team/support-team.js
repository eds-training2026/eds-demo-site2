import { createOptimizedPicture } from '../../scripts/aem.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/* Icon definitions: viewBox is 24x24 for all */
const ICONS = {
  facebook: {
    paths: ['M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3z'],
    label: 'Facebook',
  },
  x: {
    paths: ['M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'],
    label: 'X',
  },
  twitter: { alias: 'x' },
  instagram: {
    stroke: true,
    paths: [
      'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z',
      'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
      'M17.5 6.5h.01',
    ],
    label: 'Instagram',
  },
  vimeo: {
    paths: ['M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.123C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z'],
    label: 'Vimeo',
  },
};

/* Display order, matches the design: facebook, x, instagram, vimeo */
const ORDER = ['facebook', 'x', 'instagram', 'vimeo'];

function resolveIcon(name) {
  const key = name.trim().toLowerCase();
  const def = ICONS[key];
  if (!def) return null;
  if (def.alias) return { key: def.alias, ...ICONS[def.alias] };
  return { key, ...def };
}

function buildSvg(icon) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  if (icon.stroke) svg.classList.add('stroke');
  icon.paths.forEach((d) => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  });
  return svg;
}

function decorateSocial(ul) {
  const items = [...ul.querySelectorAll(':scope > li')]
    .map((li) => {
      const existing = li.querySelector('a');
      const icon = resolveIcon(existing ? existing.textContent || '' : li.textContent || '');
      return icon ? { icon, href: existing?.href || '#' } : null;
    })
    .filter(Boolean) // drops empty / unknown <li>
    .sort((a, b) => ORDER.indexOf(a.icon.key) - ORDER.indexOf(b.icon.key));

  ul.textContent = '';
  ul.classList.add('support-team-social');

  items.forEach(({ icon, href }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.setAttribute('aria-label', icon.label);
    a.title = icon.label;
    if (href !== '#') {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    a.append(buildSvg(icon));
    li.append(a);
    ul.append(li);
  });
}

export default function decorate(block) {
  [...block.children].forEach((card) => {
    card.classList.add('support-team-card');

    const [imageCol, bodyCol] = card.children;
    imageCol?.classList.add('support-team-image');
    bodyCol?.classList.add('support-team-body');

    // optimized responsive image
    const img = imageCol?.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(
        img.src,
        img.alt,
        false,
        [{ media: '(min-width: 600px)', width: '700' }, { width: '600' }],
      );
      img.closest('picture').replaceWith(optimized);
    }

    // social icons
    const ul = bodyCol?.querySelector('ul');
    if (ul) decorateSocial(ul);
  });
}