/**
 * reviews block
 * Authored as rows of 3 cells:
 *   [photo, name (h4), role (h6)] [review text] [rating, e.g. "5 Excellent"]
 * Decorated into one testimonial card per row.
 */
export default function decorate(block) {
  const cards = [...block.children].map((row) => {
    const [profileCell, textCell, ratingCell] = [...row.children];

    const card = document.createElement('article');
    card.className = 'reviews-card';

    // ----- Header: photo + name + role -----
    const header = document.createElement('div');
    header.className = 'reviews-header';

    const picture = profileCell?.querySelector('picture');
    if (picture) {
      const photo = document.createElement('div');
      photo.className = 'reviews-photo';
      photo.append(picture); // moves the existing optimized <picture>
      header.append(photo);
    }

    const headings = [...(profileCell?.querySelectorAll('h1, h2, h3, h4, h5, h6') || [])];
    const [name, role] = headings;

    const person = document.createElement('div');
    person.className = 'reviews-person';

    if (name) {
      const nameEl = document.createElement('p');
      nameEl.className = 'reviews-name';
      nameEl.textContent = name.textContent.trim();
      person.append(nameEl);
    }
    if (role) {
      const roleEl = document.createElement('p');
      roleEl.className = 'reviews-role';
      roleEl.textContent = role.textContent.trim();
      person.append(roleEl);
    }
    header.append(person);
    card.append(header);

    // ----- Rating (authored in 3rd cell, e.g. "5 Excellent") -----
    const ratingText = ratingCell?.textContent.trim() || '';
    const ratingMatch = ratingText.match(/^(\d+(?:\.\d+)?)\s*(.*)$/s);

    if (ratingMatch) {
      const labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
      const count = Math.max(0, Math.min(5, Math.round(parseFloat(ratingMatch[1]))));
      const labelText = ratingMatch[2].trim() || labels[count] || '';

      const rating = document.createElement('div');
      rating.className = 'reviews-rating';

      const stars = document.createElement('span');
      stars.className = 'reviews-stars';
      stars.setAttribute('role', 'img');
      stars.setAttribute('aria-label', `${count} out of 5 stars`);
      for (let i = 0; i < 5; i += 1) {
        const star = document.createElement('span');
        star.textContent = '☆';
        if (i >= count) star.className = 'reviews-star-off';
        stars.append(star);
      }
      rating.append(stars);

      if (labelText) {
        const label = document.createElement('span');
        label.className = 'reviews-label';
        label.textContent = labelText;
        rating.append(label);
      }

      card.append(rating);
    }

    // ----- Review text -----
    const text = textCell?.textContent.trim();
    if (text) {
      const quote = document.createElement('p');
      quote.className = 'reviews-text';
      quote.textContent = text;
      card.append(quote);
    }

    return card;
  });

  block.replaceChildren(...cards);
}