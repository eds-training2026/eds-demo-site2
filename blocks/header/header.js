import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  block.textContent = '';

  /* ---------- Load Navigation & Top Bar Fragments ---------- */
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';

  const [navFragment, topFragment] = await Promise.all([
    loadFragment(navPath),
    loadFragment('/header-top'),
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

  const buildNavStructure = (fragment) => {
    if (!fragment) return;

    const source = fragment.firstElementChild || fragment;
    const sourceList = source.querySelector('ul, ol') || (source.matches('ul, ol') ? source : null);

    const brandWrap = document.createElement('div');
    brandWrap.classList.add('nav-brand');

    const sectionsWrap = document.createElement('div');
    sectionsWrap.classList.add('nav-sections');

    const toolsWrap = document.createElement('div');
    toolsWrap.classList.add('nav-tools');

    if (!sourceList) {
      while (source.firstElementChild) {
        const child = source.firstElementChild;
        if (child.matches('h1, h2, h3, h4, p, a, ul, ol, div')) {
          if (child.matches('ul, ol')) {
            sectionsWrap.append(child.cloneNode(true));
          } else {
            brandWrap.append(child.cloneNode(true));
          }
        } else {
          brandWrap.append(child.cloneNode(true));
        }
      }
      nav.append(brandWrap, sectionsWrap, toolsWrap);
      return;
    }

    const list = sourceList.cloneNode(true);
    const items = [...list.children];

    if (items.length) {
      const firstItem = items[0];
      const firstText = firstItem.textContent.trim().toLowerCase();

      if (firstText.includes('brand') || firstText.includes('logo')) {
        const brandNode = firstItem.cloneNode(true);
        const brandLink = brandNode.querySelector('a') || brandNode;
        if (brandLink && brandLink.tagName !== 'A') {
          const link = document.createElement('a');
          link.href = '#';
          link.textContent = brandNode.textContent.trim() || 'Brand';
          brandWrap.append(link);
        } else {
          brandWrap.append(brandNode);
        }
        items.shift();
      }
    }

    const navList = document.createElement('ul');
    items.forEach((item) => navList.append(item));
    sectionsWrap.append(navList);

    nav.append(brandWrap, sectionsWrap, toolsWrap);
  };

  buildNavStructure(navFragment);

  /* ---------- Search Button ---------- */
  const searchBtn = document.createElement('button');
  searchBtn.classList.add('search-btn');
  searchBtn.setAttribute('aria-label', 'Search');
  searchBtn.innerHTML = '<span>🔍</span>';

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
