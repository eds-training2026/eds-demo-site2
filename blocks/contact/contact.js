import { decorateBlock, loadBlock } from '../../scripts/aem.js';

/**
 * Contact block (uses the boilerplate "form" block for the fields)
 *
 * Authoring (2 columns per row):
 *   location | Title + text
 *   phone    | Title + text
 *   email    | Title + text
 *   form     | Line 1: heading
 *            | Line 2: link to the form sheet  (e.g. /contact-form.json)
 *            | Line 3: link to the submit endpoint (optional while testing)
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFAULT_SHEET = '/contact-form.json';

const ICONS = {
  location: 'M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z',
  phone: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 3v12h8V5H8zm4 14.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
  email: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.6 2L12 12.6 19.4 7H4.6zM4 17h16V9.2l-8 6-8-6V17z',
};
ICONS.gmail = ICONS.email;
ICONS.mail = ICONS.email;

function buildIcon(key) {
  const path = ICONS[key];
  const span = document.createElement('span');
  span.className = 'contact-icon';
  if (!path) return span;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(SVG_NS, 'path');
  p.setAttribute('d', path);
  svg.append(p);
  span.append(svg);
  return span;
}

function buildInfoCard(key, content) {
  const card = document.createElement('div');
  card.className = 'contact-card';

  const text = document.createElement('div');
  text.className = 'contact-card-text';

  const [first, ...rest] = [...content.children];
  if (first) {
    const title = document.createElement('h3');
    title.textContent = first.textContent.trim();
    text.append(title);
  }
  rest.forEach((el) => text.append(el));

  card.append(buildIcon(key), text);
  return card;
}

/** Links of the same site become relative paths (avoids cross-origin fetches). */
function toLocal(url) {
  try {
    const u = new URL(url, window.location.origin);
    const sameSite = u.hostname === window.location.hostname
      || /\.aem\.(page|live)$/.test(u.hostname);
    return sameSite ? `${u.pathname}${u.search}` : u.href;
  } catch (e) {
    return url;
  }
}

/** URLs from real links, or from plain URL text if the author did not add links. */
function getUrls(content) {
  const fromLinks = [...content.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  if (fromLinks.length) return fromLinks;
  return content.textContent.match(/https?:\/\/[^\s]+/g) || [];
}

/** Heading = first line that is not a link / URL. */
function getHeading(content) {
  const el = [...content.children].find((c) => !c.querySelector('a') && !/https?:\/\//.test(c.textContent));
  return el ? el.textContent.trim() : '';
}

function buildFormSide(content) {
  const wrap = document.createElement('div');
  wrap.className = 'contact-form-wrap';

  const headingText = getHeading(content);
  if (headingText) {
    const h = document.createElement('h2');
    h.textContent = headingText;
    wrap.append(h);
  }

  const [sheet = DEFAULT_SHEET, submit] = getUrls(content);

  // build the markup the boilerplate form block expects: one link per row
  const formBlock = document.createElement('div');
  formBlock.className = 'form';
  [sheet, submit].filter(Boolean).forEach((url) => {
    const row = document.createElement('div');
    const cell = document.createElement('div');
    const a = document.createElement('a');
    a.href = toLocal(url);
    a.textContent = url;
    cell.append(a);
    row.append(cell);
    formBlock.append(row);
  });
  wrap.append(formBlock);

  decorateBlock(formBlock);
  loadBlock(formBlock);

  return wrap;
}

export default function decorate(block) {
  const info = document.createElement('div');
  info.className = 'contact-info';
  let formSide = null;

  [...block.children].forEach((row) => {
    const key = row.children[0]?.textContent.trim().toLowerCase();
    const content = row.children[1];
    if (!content) return;
    if (key === 'form') {
      formSide = buildFormSide(content);
    } else {
      info.append(buildInfoCard(key, content));
    }
  });

  block.textContent = '';
  block.append(info);
  if (formSide) block.append(formSide);
}