export default function decorate(block) {
  // Carousel block decoration logic
  const carouselContainer = document.createElement('div');
  carouselContainer.classList.add('carousel-container');

  // Get all items in the block
  const items = block.querySelectorAll(':scope > div');

  if (!items.length) {
    return;
  }

  items.forEach((item, index) => {
    const carouselItem = document.createElement('div');
    carouselItem.classList.add('carousel-item');
    if (index === 0) {
      carouselItem.classList.add('active');
    }

    const content = item.firstElementChild || item;
    carouselItem.appendChild(content);
    carouselContainer.appendChild(carouselItem);
  });

  // Create carousel controls
  const controls = document.createElement('div');
  controls.classList.add('carousel-controls');

  const prevBtn = document.createElement('button');
  prevBtn.classList.add('carousel-btn', 'prev');
  prevBtn.setAttribute('type', 'button');
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.textContent = '❮';

  const nextBtn = document.createElement('button');
  nextBtn.classList.add('carousel-btn', 'next');
  nextBtn.setAttribute('type', 'button');
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.textContent = '❯';

  controls.appendChild(prevBtn);
  controls.appendChild(nextBtn);

  block.innerHTML = '';
  block.appendChild(carouselContainer);
  block.appendChild(controls);

  // Carousel logic
  let currentSlide = 0;
  let autoAdvanceId = null;
  const AUTO_DELAY = 4000;

  function showSlide(n) {
    const slides = carouselContainer.querySelectorAll('.carousel-item');
    if (!slides.length) {
      return;
    }

    if (n >= slides.length) {
      currentSlide = 0;
    } else if (n < 0) {
      currentSlide = slides.length - 1;
    } else {
      currentSlide = n;
    }

    slides.forEach((slide, index) => slide.classList.toggle('active', index === currentSlide));
  }

  function stopAutoAdvance() {
    if (autoAdvanceId) {
      window.clearInterval(autoAdvanceId);
      autoAdvanceId = null;
    }
  }

  function startAutoAdvance() {
    stopAutoAdvance();
    autoAdvanceId = window.setInterval(() => {
      currentSlide += 1;
      showSlide(currentSlide);
    }, AUTO_DELAY);
  }

  prevBtn.addEventListener('click', () => {
    currentSlide -= 1;
    showSlide(currentSlide);
    startAutoAdvance();
  });

  nextBtn.addEventListener('click', () => {
    currentSlide += 1;
    showSlide(currentSlide);
    startAutoAdvance();
  });

  block.addEventListener('mouseenter', stopAutoAdvance);
  block.addEventListener('mouseleave', startAutoAdvance);
  block.addEventListener('focusin', stopAutoAdvance);
  block.addEventListener('focusout', startAutoAdvance);

  showSlide(currentSlide);
  startAutoAdvance();
}