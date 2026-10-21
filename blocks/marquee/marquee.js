/**
 * marquee block
 * Authored as a table: every cell is one scrolling item.
 *   | marquee       |
 *   | Cloud Service |
 *   | IT Service    |
 *   | Web Design    |
 * (Several cells in one row work too.)
 */
function buildGroup(items) {
  const group = document.createElement('div');
  group.className = 'marquee-group';
  items.forEach((text) => {
    const item = document.createElement('span');
    item.className = 'marquee-item';
    item.textContent = text;
    group.append(item);
  });
  return group;
}

export default function decorate(block) {
  const items = [...block.querySelectorAll(':scope > div > div')]
    .map((cell) => cell.textContent.trim())
    .filter(Boolean);

  if (!items.length) return;

  // Screen readers get the list once, not the endless copies
  block.setAttribute('aria-label', items.join(', '));

  const track = document.createElement('div');
  track.className = 'marquee-track';
  block.replaceChildren(track);

  // Repeat the items until one group is wider than the block (no gaps in the loop)
  let repeated = [...items];
  let group = buildGroup(repeated);
  track.append(group);

  for (let i = 0; i < 10 && group.scrollWidth < block.clientWidth; i += 1) {
    repeated = repeated.concat(items);
    const next = buildGroup(repeated);
    group.replaceWith(next);
    group = next;
  }

  // Duplicate the group so translating by -50% loops seamlessly
  const clone = group.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.append(clone);

  // Constant speed: about 100px per second, whatever the text length
  const seconds = Math.max(10, Math.round(group.scrollWidth / 100));
  block.style.setProperty('--marquee-duration', `${seconds}s`);
}