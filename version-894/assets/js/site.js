(function () {
    "use strict";

    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initNavigation() {
        var toggle = select("[data-nav-toggle]");
        var menu = select("[data-nav-menu]");

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initImageFallbacks() {
        selectAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
                image.removeAttribute("src");
            }, { once: true });
        });
    }

    function initHero() {
        var hero = select("[data-hero-carousel]");

        if (!hero) {
            return;
        }

        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    function initCardFilters() {
        var search = select("[data-card-search]");
        var type = select("[data-card-type]");
        var year = select("[data-card-year]");
        var cards = selectAll("[data-card]");

        if (!cards.length || (!search && !type && !year)) {
            return;
        }

        function apply() {
            var keyword = normalize(search && search.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-year")
                ].join(" "));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (typeValue && cardType !== typeValue) {
                    matched = false;
                }

                if (yearValue && cardYear.indexOf(yearValue) === -1) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
            });
        }

        [search, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                """: "&quot;"
            }[character];
        });
    }

    function movieCardHtml(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
            "<article class="movie-card">",
            "<a class="poster" href="" + escapeHtml(item.detail) + "">",
            "<img src="" + escapeHtml(item.cover) + "" alt="" + escapeHtml(item.title) + "" loading="lazy">",
            "<span class="poster-badge">" + escapeHtml(item.year) + "</span>",
            "<span class="poster-play">▶</span>",
            "</a>",
            "<div class="card-body">",
            "<div class="meta-line"><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.region) + "</span></div>",
            "<h3><a href="" + escapeHtml(item.detail) + "">" + escapeHtml(item.title) + "</a></h3>",
            "<p>" + escapeHtml(item.oneLine) + "</p>",
            "<div class="tag-row">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function initSearchPage() {
        var app = select("[data-search-app]");

        if (!app || !window.SITE_CATALOG) {
            return;
        }

        var input = select("[data-search-input]", app);
        var category = select("[data-search-category]", app);
        var year = select("[data-search-year]", app);
        var results = select("[data-search-results]", app);
        var count = select("[data-search-count]", app);

        function render() {
            var keyword = normalize(input && input.value);
            var categoryValue = normalize(category && category.value);
            var yearValue = normalize(year && year.value);
            var filtered = window.SITE_CATALOG.filter(function (item) {
                var haystack = normalize([
                    item.title,
                    item.year,
                    item.type,
                    item.region,
                    item.genre,
                    item.category,
                    (item.tags || []).join(" ")
                ].join(" "));

                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }

                if (categoryValue && normalize(item.category) !== categoryValue) {
                    return false;
                }

                if (yearValue && normalize(item.year).indexOf(yearValue) === -1) {
                    return false;
                }

                return true;
            });

            count.textContent = "筛选到 " + filtered.length + " 部影片，当前显示前 80 部。";
            results.innerHTML = filtered.slice(0, 80).map(movieCardHtml).join("");
            initImageFallbacks();
        }

        [input, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", render);
                control.addEventListener("change", render);
            }
        });

        render();
    }

    function initPlayer() {
        var video = select("[data-video-player]");

        if (!video) {
            return;
        }

        var button = select("[data-player-button]");
        var status = select("[data-player-status]");
        var source = video.getAttribute("data-src");
        var prepared = false;
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function prepare() {
            if (prepared || !source) {
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                setStatus("正在使用浏览器原生播放能力加载视频。");
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("播放源加载完成，可以开始观看。");
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("视频加载遇到网络或浏览器兼容问题，请刷新后重试。");
                    }
                });
                return;
            }

            setStatus("当前浏览器缺少 HLS 支持，建议使用最新版 Chrome、Edge 或 Safari。 ");
        }

        if (button) {
            button.addEventListener("click", function () {
                prepare();
                button.classList.add("is-hidden");
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        setStatus("浏览器阻止了自动播放，请再次点击视频控制条播放。 ");
                    });
                }
            });
        }

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initNavigation();
        initImageFallbacks();
        initHero();
        initCardFilters();
        initSearchPage();
        initPlayer();
    });
})();
