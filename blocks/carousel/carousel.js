export default function decorate(block) {
  const items = [...block.children];

  if (!items.length) return;

  const carouselContainer = document.createElement('div');
  carouselContainer.classList.add('carousel-container');

  items.forEach((item, index) => {
    const slide = document.createElement('div');
    slide.classList.add('carousel-item');

    if (index === 0) {
      slide.classList.add('active');
    }

    // Keep complete row (image + content)
    slide.appendChild(item);

    carouselContainer.appendChild(slide);
  });

  /* Controls */
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-btn prev';
  prevBtn.type = 'button';
  prevBtn.setAttribute('aria-label', 'Previous Slide');
  prevBtn.innerHTML = '&#10094;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-btn next';
  nextBtn.type = 'button';
  nextBtn.setAttribute('aria-label', 'Next Slide');
  nextBtn.innerHTML = '&#10095;';

  /* Dots */
  const dotsContainer = document.createElement('div');
  dotsContainer.classList.add('carousel-dots');

  items.forEach((_, index) => {
    const dot = document.createElement('span');

    if (index === 0) {
      dot.classList.add('active');
    }

    dot.addEventListener('click', () => {
      showSlide(index);
      startAutoAdvance();
    });

    dotsContainer.appendChild(dot);
  });

  block.innerHTML = '';

  block.appendChild(carouselContainer);
  block.appendChild(prevBtn);
  block.appendChild(nextBtn);
  block.appendChild(dotsContainer);

  const slides = carouselContainer.querySelectorAll('.carousel-item');
  const dots = dotsContainer.querySelectorAll('span');

  let currentSlide = 0;
  let autoAdvanceId;

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
    clearInterval(autoAdvanceId);
  }

  function startAutoAdvance() {
    stopAutoAdvance();

    autoAdvanceId = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 4000);
  }

  prevBtn.addEventListener('click', () => {
    showSlide(currentSlide - 1);
    startAutoAdvance();
  });

  nextBtn.addEventListener('click', () => {
    showSlide(currentSlide + 1);
    startAutoAdvance();
  });

  /* Swipe Support */
  let startX = 0;

  carouselContainer.addEventListener(
    'touchstart',
    (e) => {
      startX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  carouselContainer.addEventListener(
    'touchend',
    (e) => {
      const endX = e.changedTouches[0].screenX;

      if (startX - endX > 50) {
        showSlide(currentSlide + 1);
      }

      if (endX - startX > 50) {
        showSlide(currentSlide - 1);
      }

      startAutoAdvance();
    },
    { passive: true }
  );

  block.addEventListener('mouseenter', stopAutoAdvance);
  block.addEventListener('mouseleave', startAutoAdvance);

  showSlide(0);
  startAutoAdvance();
}
