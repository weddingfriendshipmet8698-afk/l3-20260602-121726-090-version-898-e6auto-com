function normalizeText(value) {
  return (value || "").toString().trim().toLowerCase();
}

function setupMobileNavigation() {
  const button = document.querySelector(".mobile-toggle");
  const panel = document.querySelector(".mobile-panel");

  if (!button || !panel) {
    return;
  }

  button.addEventListener("click", function () {
    const isOpen = panel.classList.toggle("is-open");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

function setupHeroCarousel() {
  const carousel = document.querySelector(".hero-carousel");

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
  const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
  const prev = carousel.querySelector(".hero-prev");
  const next = carousel.querySelector(".hero-next");
  let current = 0;
  let timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(current - 1);
      startTimer();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      startTimer();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      startTimer();
    });
  });

  if (slides.length > 1) {
    startTimer();
  }
}

function setupSearchForms() {
  const forms = document.querySelectorAll(".site-search");

  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector("input[type='search']");
      const query = input ? input.value.trim() : "";

      if (!query) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });
}

function setupInlineFilters() {
  const filterForms = document.querySelectorAll(".inline-filter");

  filterForms.forEach(function (form) {
    const input = form.querySelector("input[type='search']");
    const section = form.closest("section");
    const cards = section ? Array.from(section.querySelectorAll(".movie-card")) : [];

    if (!input || cards.length === 0) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });

    input.addEventListener("input", function () {
      const query = normalizeText(input.value);
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalizeText(card.getAttribute("data-search"));
        const match = !query || haystack.includes(query);
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });

      document.body.classList.toggle("has-empty-results", visible === 0);
    });
  });
}

function setupSearchPageQuery() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q") || "";
  const largeSearch = document.querySelector(".large-search input[type='search']");
  const firstInlineFilter = document.querySelector(".inline-filter input[type='search']");

  if (largeSearch && query) {
    largeSearch.value = query;
  }

  if (firstInlineFilter && query) {
    firstInlineFilter.value = query;
    firstInlineFilter.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function setupPetals() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let count = 0;

  setInterval(function () {
    if (count > 36) {
      return;
    }

    const petal = document.createElement("span");
    const size = 7 + Math.random() * 8;
    petal.className = "cherry-blossom";
    petal.style.left = Math.random() * 100 + "vw";
    petal.style.width = size + "px";
    petal.style.height = size + "px";
    petal.style.setProperty("--drift", Math.round((Math.random() - 0.5) * 220) + "px");
    petal.style.animationDuration = 8 + Math.random() * 8 + "s";
    document.body.appendChild(petal);
    count += 1;

    petal.addEventListener("animationend", function () {
      petal.remove();
      count -= 1;
    });
  }, 1100);
}

function initMoviePlayer(videoId, overlayId, sourceUrl, posterUrl) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);
  let loaded = false;
  let hls = null;

  if (!video || !overlay || !sourceUrl) {
    return;
  }

  function loadVideo() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (posterUrl) {
      video.setAttribute("poster", posterUrl);
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function playVideo() {
    loadVideo();
    overlay.classList.add("is-hidden");
    const promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  overlay.addEventListener("click", playVideo);

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });

  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupMobileNavigation();
  setupHeroCarousel();
  setupSearchForms();
  setupInlineFilters();
  setupSearchPageQuery();
  setupPetals();
});
