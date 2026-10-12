import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  block.textContent = '';

  /* ---------- Load Navigation ---------- */

  const navMeta = getMetadata('nav');
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : '/nav';

  const navFragment = await loadFragment(navPath);

  /* ---------- Load Top Bar ---------- */

  const topFragment = await loadFragment('/header-top');

  const header = document.createElement('div');
  header.classList.add('custom-header');

  /* ---------- Top Bar ---------- */

  const topBar = document.createElement('div');
  topBar.classList.add('top-bar');

  while (topFragment.firstElementChild) {
    topBar.append(topFragment.firstElementChild);
  }

  /* ---------- Main Navigation ---------- */

  const nav = document.createElement('nav');
  nav.classList.add('main-nav');

  while (navFragment.firstElementChild) {
    nav.append(navFragment.firstElementChild);
  }

  const classes = ['brand', 'sections', 'tools'];

  classes.forEach((name, index) => {
    const section = nav.children[index];

    if (section) {
      section.classList.add(`nav-${name}`);
    }
  });

  /* ---------- Search Icon ---------- */

  const searchBtn = document.createElement('button');

  searchBtn.classList.add('search-btn');

  searchBtn.innerHTML = `
    <span>🔍</span>
  `;

  /* ---------- Quote Button ---------- */

  const quoteBtn = document.createElement('a');

  quoteBtn.href = '/contact';

  quoteBtn.classList.add('quote-btn');

  quoteBtn.textContent = 'Get Quotes';

  const tools = nav.querySelector('.nav-tools');

  if (tools) {
    tools.append(searchBtn);
    tools.append(quoteBtn);
  }

  header.append(topBar);
  header.append(nav);

  block.append(header);
}