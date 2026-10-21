/**
 * price-plan block
 * Authored as rows of 4 cells: [title] [price + period] [feature list] [button]
 * Decorated into one card per row.
 */
export default function decorate(block) {
  const cards = [...block.children].map((row) => {
    const [titleCell, priceCell, listCell, ctaCell] = [...row.children];

    const card = document.createElement('div');
    card.className = 'price-plan-card';

    // ----- Title -----
    const titleText = titleCell?.textContent.trim();
    if (titleText) {
      const title = document.createElement('h3');
      title.className = 'price-plan-title';
      title.textContent = titleText;
      card.append(title);
    }

    // ----- Price circle: "$09" + "Per Month" -----
    const priceLines = priceCell
      ? [...priceCell.querySelectorAll('h1, h2, h3, h4, h5, h6, p')]
        .map((el) => el.textContent.trim())
        .filter(Boolean)
      : [];

    if (priceLines.length) {
      const [rawPrice, period] = priceLines;
      // split "$09" into currency "$" and amount "09"
      const match = rawPrice.match(/^(\D*)(.*)$/);
      const currencyText = match?.[1].trim() || '';
      const amountText = match?.[2].trim() || rawPrice;

      const price = document.createElement('div');
      price.className = 'price-plan-price';

      const value = document.createElement('div');
      value.className = 'price-plan-value';

      if (currencyText) {
        const currency = document.createElement('span');
        currency.className = 'price-plan-currency';
        currency.textContent = currencyText;
        value.append(currency);
      }

      const amount = document.createElement('span');
      amount.className = 'price-plan-amount';
      amount.textContent = amountText;
      value.append(amount);
      price.append(value);

      if (period) {
        const per = document.createElement('div');
        per.className = 'price-plan-period';
        per.textContent = period;
        price.append(per);
      }

      card.append(price);
    }

    // ----- Features -----
    const sourceList = listCell?.querySelector('ul');
    if (sourceList) {
      const features = document.createElement('ul');
      features.className = 'price-plan-features';
      sourceList.querySelectorAll(':scope > li').forEach((li) => {
        const item = document.createElement('li');
        item.textContent = li.textContent.trim();
        features.append(item);
      });
      card.append(features);
    }

    // ----- Button (works with <em><a>, or <ul><li><em><a>) -----
    const link = ctaCell?.querySelector('a');
    if (link) {
      const button = document.createElement('a');
      button.className = 'price-plan-button';
      button.href = link.href;
      button.textContent = link.textContent.trim();
      if (link.title) button.title = link.title;
      card.append(button);
    }

    return card;
  });

  block.replaceChildren(...cards);
}