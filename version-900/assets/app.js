(function () {
  "use strict";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function updateMobileMenu() {
    var button = $("[data-mobile-menu-button]");
    var panel = $("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHeroCarousel() {
    var carousel = $("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = $all("[data-hero-slide]", carousel);
    var dots = $all("[data-hero-dot]", carousel);
    var prev = $("[data-hero-prev]", carousel);
    var next = $("[data-hero-next]", carousel);
    var activeIndex = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === activeIndex);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === activeIndex);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(activeIndex - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(activeIndex + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function initFilters() {
    var filter = $("[data-catalog-filter]");
    var containers = $all("[data-card-container]");
    if (!filter || !containers.length) {
      return;
    }

    var input = $("[data-filter-input]", filter);
    var year = $("[data-filter-year]", filter);
    var type = $("[data-filter-type]", filter);
    var region = $("[data-filter-region]", filter);
    var category = $("[data-filter-category]", filter);
    var result = $("[data-filter-result]", filter);
    var initialQuery = readQuery();

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function cardMatches(card) {
      var query = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      var categoryValue = normalize(category && category.value);
      var searchable = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));

      if (query && searchable.indexOf(query) === -1) {
        return false;
      }
      if (yearValue && normalize(card.dataset.year) !== yearValue) {
        return false;
      }
      if (typeValue && normalize(card.dataset.type) !== typeValue) {
        return false;
      }
      if (regionValue && normalize(card.dataset.region) !== regionValue) {
        return false;
      }
      if (categoryValue && normalize(card.dataset.category) !== categoryValue) {
        return false;
      }
      return true;
    }

    function applyFilter() {
      var total = 0;
      var visible = 0;
      containers.forEach(function (container) {
        $all(".movie-card", container).forEach(function (card) {
          total += 1;
          var ok = cardMatches(card);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
      });
      if (result) {
        result.textContent = "显示 " + visible + " / " + total + " 部内容";
      }
    }

    [input, year, type, region, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }

  function initRankingTabs() {
    var tabs = $("[data-ranking-tabs]");
    if (!tabs) {
      return;
    }

    var buttons = $all("[data-ranking-target]", tabs);
    var panels = $all("[data-ranking-panel]");

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var target = button.dataset.rankingTarget;
        buttons.forEach(function (btn) {
          btn.classList.toggle("is-active", btn === button);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle("is-active", panel.id === target);
        });
      });
    });
  }

  function initPlayers() {
    $all(".js-hls-player").forEach(function (video) {
      var url = video.dataset.src || video.getAttribute("src");
      var shell = video.closest(".video-shell");
      var overlay = shell ? $("[data-video-play]", shell) : null;
      var status = shell ? $("[data-video-status]", shell) : null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachSource() {
        if (!url) {
          setStatus("未找到播放源。");
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源加载完成，可点击播放。");
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus("网络错误，正在尝试重新加载播放源。");
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus("媒体错误，正在尝试恢复播放。");
              hls.recoverMediaError();
            } else {
              setStatus("播放器遇到错误，请刷新后重试。");
              hls.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          setStatus("浏览器原生支持 HLS，可点击播放。");
        } else {
          video.src = url;
          setStatus("浏览器可能不支持 HLS；可尝试打开 m3u8 源。");
        }
      }

      function playOrPause() {
        if (video.paused) {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              setStatus("浏览器阻止自动播放，请再次点击播放器。");
            });
          }
        } else {
          video.pause();
        }
      }

      if (overlay) {
        overlay.addEventListener("click", playOrPause);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playOrPause();
        }
      });

      video.addEventListener("play", function () {
        if (shell) {
          shell.classList.add("is-playing");
        }
        setStatus("正在播放。");
      });

      video.addEventListener("pause", function () {
        if (shell) {
          shell.classList.remove("is-playing");
        }
        setStatus("已暂停，可继续播放。");
      });

      video.addEventListener("error", function () {
        setStatus("视频加载失败，请检查播放源或网络环境。");
      });

      attachSource();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateMobileMenu();
    initHeroCarousel();
    initFilters();
    initRankingTabs();
    initPlayers();
  });
})();
