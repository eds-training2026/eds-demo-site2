import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  block.textContent = '';

  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.setAttribute('aria-expanded', 'false');

  if (fragment) {
    const fragmentSections = fragment.querySelectorAll(':scope > div');

    if (fragmentSections[0]) {
      const topBar = document.createElement('div');
      topBar.className = 'nav-top-bar';
      topBar.innerHTML = fragmentSections[0].innerHTML;
      navWrapper.append(topBar);
    }

    if (fragmentSections[1]) {
      const mainBar = document.createElement('div');
      mainBar.className = 'nav-main-bar';
      mainBar.innerHTML = fragmentSections[1].innerHTML;

      const hamburgerButton = document.createElement('button');
      hamburgerButton.type = 'button';
      hamburgerButton.className = 'nav-hamburger';
      hamburgerButton.setAttribute('aria-label', 'Toggle navigation');
      hamburgerButton.setAttribute('aria-expanded', 'false');
      hamburgerButton.innerHTML = '<span class="nav-hamburger-icon"></span>';
      hamburgerButton.addEventListener('click', () => {
        const isExpanded = navWrapper.getAttribute('aria-expanded') === 'true';
        const nextState = String(!isExpanded);

        navWrapper.setAttribute('aria-expanded', nextState);
        hamburgerButton.setAttribute('aria-expanded', nextState);
      });

      mainBar.prepend(hamburgerButton);
      navWrapper.append(mainBar);
    }
  }

  block.append(navWrapper);
}
