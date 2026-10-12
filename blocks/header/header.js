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

  const brandWrap = document.createElement('div');
  brandWrap.classList.add('nav-brand');

  const sectionsWrap = document.createElement('div');
  sectionsWrap.classList.add('nav-sections');

  const buildNavStructure = (fragment) => {
    if (!fragment) return;

    const source = fragment.firstElementChild || fragment;
    const list = source.querySelector('ul, ol') || (source.matches('ul, ol') ? source : null);

    if (!list) {
      while (source.firstElementChild) {
        brandWrap.append(source.firstElementChild);
      }
      return;
    }

    const items = [...list.children];
    if (!items.length) return;

    const firstItem = items[0];
    const firstText = firstItem.textContent.trim().toLowerCase();

    if (
      firstText.includes('brand')
      || firstText.includes('logo')
      || firstText.includes('techno')
      || firstItem.querySelector('img')
    ) {
      const brandNode = firstItem.cloneNode(true);
      brandWrap.append(brandNode);
      items.shift();
    }

    const cleanList = document.createElement('ul');

    items.forEach((item) => {
      const li = document.createElement('li');
      const itemLink = item.querySelector('a');

      if (itemLink) {
        const link = document.createElement('a');
        link.href = itemLink.href || '#';
        link.textContent = itemLink.textContent.trim();
        li.append(link);
      } else {
        li.textContent = item.textContent.trim();
      }

      const nestedList = item.querySelector('ul, ol');
      if (nestedList) {
        const nestedUl = document.createElement('ul');
        [...nestedList.children].forEach((childItem) => {
          const childLi = document.createElement('li');
          const childLink = childItem.querySelector('a');

          if (childLink) {
            const link = document.createElement('a');
            link.href = childLink.href || '#';
            link.textContent = childLink.textContent.trim();
            childLi.append(link);
          } else {
            childLi.textContent = childItem.textContent.trim();
          }

          nestedUl.append(childLi);
        });
        li.append(nestedUl);
      }

      cleanList.append(li);
    });

    sectionsWrap.append(cleanList);
  };

  buildNavStructure(navFragment);
  nav.append(brandWrap, sectionsWrap);

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
