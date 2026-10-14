export default function decorate(block) {
  const carouselContainer = document.createElement('div');
  carouselContainer.classList.add('carousel-container');

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

  /* Controls */
  const controls = document.createElement('div');
  controls.classList.add('carousel-controls');

  const prevBtn = document.createElement('button');
  prevBtn.classList.add('carousel-btn', 'prev');
  prevBtn.setAttribute('type', 'button');
  prevBtn.setAttribute('aria-label', 'Previous Slide');
  prevBtn.innerHTML = '❮';

  const nextBtn = document.createElement('button');
  nextBtn.classList.add('carousel-btn', 'next');
  nextBtn.setAttribute('type', 'button');
  nextBtn.setAttribute('aria-label', 'Next Slide');
  nextBtn.innerHTML = '❯';

  controls.append(prevBtn, nextBtn);

  /* Dots */
  const dotsContainer = document.createElement('div');
  dotsContainer.classList.add('carousel-dots');

  items.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');

    if (index === 0) {
      dot.classList.add('active');
    }

    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);

    dot.addEventListener('click', () => {
      showSlide(index);
      startAutoAdvance();
    });

    dotsContainer.appendChild(dot);
  });

  block.innerHTML = '';

  block.appendChild(carouselContainer);
  block.appendChild(controls);
  block.appendChild(dotsContainer);

  let currentSlide = 0;
  let autoAdvanceId = null;
  const AUTO_DELAY = 4000;

  const slides = carouselContainer.querySelectorAll('.carousel-item');
  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function showSlide(index) {
    if (index >= slides.length) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = slides.length - 1;
    } else {
      currentSlide = index;
    }

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function stopAutoAdvance() {
    if (autoAdvanceId) {
      clearInterval(autoAdvanceId);
      autoAdvanceId = null;
    }
  }

  function startAutoAdvance() {
    stopAutoAdvance();

    autoAdvanceId = setInterval(() => {
      showSlide(currentSlide + 1);
    }, AUTO_DELAY);
  }

  /* Previous */
  prevBtn.addEventListener('click', () => {
    showSlide(currentSlide - 1);
    startAutoAdvance();
  });

  /* Next */
  nextBtn.addEventListener('click', () => {
    showSlide(currentSlide + 1);
    startAutoAdvance();
  });

  /* Pause on Hover */
  block.addEventListener('mouseenter', stopAutoAdvance);
  block.addEventListener('mouseleave', startAutoAdvance);

  block.addEventListener('focusin', stopAutoAdvance);
  block.addEventListener('focusout', startAutoAdvance);

  /* Keyboard Navigation */
  block.setAttribute('tabindex', '0');

  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      showSlide(currentSlide - 1);
      startAutoAdvance();
    }

    if (e.key === 'ArrowRight') {
      showSlide(currentSlide + 1);
      startAutoAdvance();
    }
  });

  /* Pause when tab inactive */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoAdvance();
    } else {
      startAutoAdvance();
    }
  });

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
  column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
  slide.append(column);
  });

  /* Touch Swipe Support */
  let touchStartX = 0;
  let touchEndX = 0;

  carouselContainer.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  carouselContainer.addEventListener(
    'touchend',
    (e) => {
      touchEndX = e.changedTouches[0].screenX;

      if (touchStartX - touchEndX > 50) {
        showSlide(currentSlide + 1);
      }

      if (touchEndX - touchStartX > 50) {
        showSlide(currentSlide - 1);
      }

      startAutoAdvance();
    },
    { passive: true }
  );

  showSlide(0);
  startAutoAdvance();
}
