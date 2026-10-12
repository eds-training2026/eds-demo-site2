import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  block.textContent = '';

  /* ---------- Load Navigation & Top Bar Fragments ---------- */
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  
  const [navFragment, topFragment] = await Promise.all([
    loadFragment(navPath),
    loadFragment('/header-top')
  ]);

  const header = document.createElement('div');
  header.classList.add('custom-header');

  /* ---------- Top Bar Setup ---------- */
  const topBar = document.createElement('div');
  topBar.classList.add('top-bar');
  if (topFragment) {
    while (topFragment.firstElementChild) {
      topBar.append(topFragment.firstElementChild);
    }
  }

  /* ---------- Main Navigation Setup ---------- */
  const nav = document.createElement('nav');
  nav.classList.add('main-nav');
  if (navFragment) {
    while (navFragment.firstElementChild) {
      nav.append(navFragment.firstElementChild);
    }
  }

  // Assign structural classes dynamically
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((name, index) => {
    const section = nav.children[index];
    if (section) {
      section.classList.add(`nav-${name}`);
    }
  });

  /* ---------- Search Button ---------- */
  const searchBtn = document.createElement('button');
  searchBtn.classList.add('search-btn');
  searchBtn.setAttribute('aria-label', 'Search');
  searchBtn.innerHTML = `<span>🔍</span>`;

  /* ---------- Quote Button ---------- */
  const quoteBtn = document.createElement('a');
  quoteBtn.href = '/contact';
  quoteBtn.classList.add('quote-btn');
  quoteBtn.textContent = 'Get Quotes';

  // Find or fallback create the tools container
  let tools = nav.querySelector('.nav-tools');
  if (!tools) {
    tools = document.createElement('div');
    tools.classList.add('nav-tools');
    nav.append(tools);
  }
  
  tools.append(searchBtn);
  tools.append(quoteBtn);

  header.append(topBar);
  header.append(nav);
  block.append(header);
}