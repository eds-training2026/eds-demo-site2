import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  [...block.children].forEach((card) => {
    card.classList.add('gallery-card');

    const [imageCol, captionCol] = card.children;
    imageCol?.classList.add('gallery-image');
    captionCol?.classList.add('gallery-caption');

    // optimized responsive image
    const img = imageCol?.querySelector('img');
    if (img) {
      const pic = createOptimizedPicture(
        img.src,
        img.alt,
        false,
        [{ media: '(min-width: 900px)', width: '800' }, { width: '600' }],
      );
      img.closest('picture').replaceWith(pic);
    }

    // if the title or category is authored as a link, make the whole card clickable
    const link = captionCol?.querySelector('a');
    if (link) {
      card.classList.add('has-link');
      link.classList.add('gallery-link');
    }
  });
}