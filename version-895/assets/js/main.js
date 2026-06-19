(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.poster-frame img, .hero-poster img, .category-cover img, .detail-poster img').forEach(function (img) {
    img.addEventListener('error', function () {
      var frame = img.closest('.poster-frame, .hero-poster, .category-cover, .detail-poster');
      if (frame) {
        frame.classList.add('poster-missing');
      }
      img.remove();
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
    var search = document.getElementById('siteSearch');
    var yearFilter = document.getElementById('yearFilter');
    var sortSelect = document.getElementById('sortSelect');
    var countNode = document.querySelector('[data-result-count]');

    if (!lists.length || (!search && !yearFilter && !sortSelect)) {
      return;
    }

    var cards = [];
    lists.forEach(function (list) {
      Array.prototype.slice.call(list.querySelectorAll('[data-card]')).forEach(function (card) {
        card.__originalParent = list;
        cards.push(card);
      });
    });

    function cardText(card) {
      return normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(' '));
    }

    function matchesYear(card, value) {
      if (!value) {
        return true;
      }
      var year = Number(card.dataset.year || 0);
      if (value === 'older') {
        return year < 2020;
      }
      return String(year) === value;
    }

    function apply() {
      var q = normalize(search ? search.value : '');
      var yearValue = yearFilter ? yearFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var ok = (!q || cardText(card).indexOf(q) !== -1) && matchesYear(card, yearValue);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
      }
    }

    function sortCards() {
      if (!sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      lists.forEach(function (list) {
        var localCards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        localCards.sort(function (a, b) {
          if (mode === 'year-asc') {
            return Number(a.dataset.year) - Number(b.dataset.year);
          }
          if (mode === 'title-asc') {
            return String(a.dataset.title).localeCompare(String(b.dataset.title), 'zh-Hans-CN');
          }
          return Number(b.dataset.year) - Number(a.dataset.year);
        });
        localCards.forEach(function (card) {
          list.appendChild(card);
        });
      });
      apply();
    }

    if (search) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        search.value = query;
      }
      search.addEventListener('input', apply);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }

    apply();
  }

  setupFilters();

  function loadScript(src, onload) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = onload;
    script.onerror = onload;
    document.head.appendChild(script);
  }

  function startPlayer(box) {
    var video = box.querySelector('video');
    var src = box.getAttribute('data-video-src');

    if (!video || !src) {
      return;
    }

    function playNative() {
      if (!video.getAttribute('src')) {
        video.src = src;
      }
      box.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function attachHls() {
      if (window.Hls && window.Hls.isSupported()) {
        if (!box.__hls) {
          box.__hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          box.__hls.loadSource(src);
          box.__hls.attachMedia(video);
        }
        box.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        playNative();
      } else {
        playNative();
      }
    }

    if (window.Hls || video.canPlayType('application/vnd.apple.mpegurl')) {
      attachHls();
    } else {
      loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest', attachHls);
    }
  }

  document.querySelectorAll('.player-box').forEach(function (box) {
    var button = box.querySelector('.player-start');
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(box);
      });
    }
  });
})();
