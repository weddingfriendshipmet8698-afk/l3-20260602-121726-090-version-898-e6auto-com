document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const targetIndex = Number(dot.getAttribute('data-hero-dot'));
      showSlide(targetIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 6200);
  }

  const movieSearch = document.querySelector('[data-movie-search]');
  const movieCards = Array.from(document.querySelectorAll('[data-movie-card]'));

  if (movieSearch && movieCards.length) {
    movieSearch.addEventListener('input', function () {
      const keyword = movieSearch.value.trim().toLowerCase();

      movieCards.forEach(function (card) {
        const searchText = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden', keyword && !searchText.includes(keyword));
      });
    });
  }
});
