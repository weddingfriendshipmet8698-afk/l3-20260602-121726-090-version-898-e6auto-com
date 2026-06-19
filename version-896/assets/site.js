(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var input = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var list = document.querySelector('[data-filter-list]');
  var autofill = document.querySelector('[data-autofill-query]');

  if (autofill) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      autofill.value = query;
    }
  }

  function runFilter() {
    if (!list) {
      return;
    }
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
      var matchKeyword = keyword === '' || haystack.indexOf(keyword) !== -1;
      var matchYear = year === '' || card.getAttribute('data-year') === year;
      card.classList.toggle('is-filter-hidden', !(matchKeyword && matchYear));
    });
  }

  if (input) {
    input.addEventListener('input', runFilter);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', runFilter);
  }
  if (list) {
    runFilter();
  }
})();
