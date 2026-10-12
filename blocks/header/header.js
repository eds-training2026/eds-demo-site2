import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 1025px)');

const SEARCH_ICON = `
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"></circle>
    <line x1="16.5" y1="16.5" x2="21" y2="21"></line>
  </svg>`;

function closeDropdowns(root, except = null) {
  root.querySelectorAll('.nav-drop.is-open').forEach((item) => {
    if (item !== except) item.classList.remove('is-open');
  });
}

function setMenuOpen(wrapper, open) {
  wrapper.dataset.open = String(open);
  wrapper.querySelector('.nav-hamburger').setAttribute('aria-expanded', String(open));
  if (!open) closeDropdowns(wrapper);
}

function buildTopBar(section) {
  const topBar = document.createElement('div');
  topBar.className = 'nav-top-bar';
  topBar.innerHTML = section.innerHTML;
  topBar.querySelector('.header-top > div')?.classList.add('nav-top-row');
  decorateIcons(topBar);
  return topBar;
}

function buildMainBar(section, wrapper) {
  const mainBar = document.createElement('nav');
  mainBar.className = 'nav-main-bar';
  mainBar.setAttribute('aria-label', 'Main navigation');
  mainBar.innerHTML = section.innerHTML;

  const row = mainBar.querySelector('.main-nav > div');
  if (!row) return mainBar;
  row.classList.add('nav-row');

  const [brand, sections, cta] = [...row.children];
  brand?.classList.add('nav-brand');
  sections?.classList.add('nav-sections');
  cta?.classList.add('nav-cta');

  // Dropdowns: any top-level <li> that contains a nested <ul>
  sections?.querySelectorAll(':scope > ul > li').forEach((li) => {
    if (!li.querySelector(':scope > ul')) return;
    li.classList.add('nav-drop');
    const label = li.querySelector(':scope > p');
    if (!label) return;
    label.setAttribute('role', 'button');
    label.setAttribute('tabindex', '0');
    label.setAttribute('aria-haspopup', 'true');

    const toggle = (e) => {
      // Let real links navigate normally; only toggle when the label itself is clicked
      if (e.target.closest('a') && isDesktop.matches) return;
      e.preventDefault();
      const willOpen = !li.classList.contains('is-open');
      closeDropdowns(sections, li);
      li.classList.toggle('is-open', willOpen);
    };
    label.addEventListener('click', toggle);
    label.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') toggle(e);
    });
  });

  // Right-hand tools: search + CTA + hamburger
  const tools = document.createElement('div');
  tools.className = 'nav-tools';

  const search = document.createElement('button');
  search.type = 'button';
  search.className = 'nav-search';
  search.setAttribute('aria-label', 'Search');
  search.innerHTML = SEARCH_ICON;

  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Toggle navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  hamburger.addEventListener('click', () => {
    setMenuOpen(wrapper, wrapper.dataset.open !== 'true');
  });

  tools.append(search);
  if (cta) tools.append(cta);
  tools.append(hamburger);
  row.append(tools);

  return mainBar;
}

export default async function decorate(block) {
  block.textContent = '';

  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const [topSection, mainSection] = fragment.querySelectorAll(':scope > div');

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.dataset.open = 'false';

  if (topSection) wrapper.append(buildTopBar(topSection));
  if (mainSection) wrapper.append(buildMainBar(mainSection, wrapper));

  // Close on Escape, outside click, or when resizing up to desktop
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenuOpen(wrapper, false);
  });
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) closeDropdowns(wrapper);
  });
  isDesktop.addEventListener('change', () => setMenuOpen(wrapper, false));

  block.append(wrapper);
}