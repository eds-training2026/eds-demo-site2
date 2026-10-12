import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  // Load nav fragment from metadata or default to /nav
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // Clear block and set up wrapper
  block.textContent = '';
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  if (fragment) {
    const fragmentSections = fragment.querySelectorAll(':scope > div');
    
    // Top Bar Section
    if (fragmentSections[0]) {
      const topBar = document.createElement('div');
      topBar.className = 'nav-top-bar';
      topBar.innerHTML = fragmentSections[0].innerHTML;
      navWrapper.append(topBar);
    }

    // Main Navigation Section
    if (fragmentSections[1]) {
      const mainBar = document.createElement('div');
      mainBar.className = 'nav-main-bar';
      mainBar.innerHTML = fragmentSections[1].innerHTML;
      navWrapper.append(mainBar);
    }
  }

  // Add interactive behaviors (e.g., mobile hamburger menu, dropdown toggles)
  const navTools = navWrapper.querySelector('.nav-main-bar');
  if (navTools) {
    // Add search icon functionality hook if needed
    const searchLink = navTools.querySelector('a[href*="search"]');
    if (searchLink) {
      searchLink.innerHTML = `<svg class="icon icon-search" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" stroke-width="2" d="M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zm7.5-1.5l4.5 4.5"/></svg>`;
    }
  }

  block.append(navWrapper);
}