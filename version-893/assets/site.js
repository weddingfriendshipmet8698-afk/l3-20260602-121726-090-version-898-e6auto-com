(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === active);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearch() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("[data-search-input]");
        var category = panel.querySelector("[data-category-filter]");
        var sort = panel.querySelector("[data-sort-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var noResults = document.querySelector("[data-no-results]");
        var listRoot = document.querySelector("[data-list-root]");
        var gridButton = panel.querySelector("[data-view='grid']");
        var listButton = panel.querySelector("[data-view='list']");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function filterCards() {
            var query = normalize(input && input.value);
            var selected = category ? category.value : "all";
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cats = card.getAttribute("data-category") || "";
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedCategory = selected === "all" || cats.indexOf(selected) !== -1;
                var show = matchedQuery && matchedCategory;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle("is-visible", visible === 0);
            }
        }

        function sortCards() {
            if (!sort || !listRoot) {
                return;
            }
            var mode = sort.value;
            var sorted = cards.slice().sort(function (a, b) {
                if (mode === "year") {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                }
                if (mode === "title") {
                    return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
                }
                return 0;
            });
            sorted.forEach(function (card) {
                listRoot.appendChild(card);
            });
        }

        function setView(mode) {
            document.body.classList.toggle("list-mode", mode === "list");
            if (gridButton) {
                gridButton.classList.toggle("is-active", mode === "grid");
            }
            if (listButton) {
                listButton.classList.toggle("is-active", mode === "list");
            }
        }

        if (input) {
            input.addEventListener("input", filterCards);
        }
        if (category) {
            category.addEventListener("change", filterCards);
        }
        if (sort) {
            sort.addEventListener("change", function () {
                sortCards();
                filterCards();
            });
        }
        if (gridButton) {
            gridButton.addEventListener("click", function () {
                setView("grid");
            });
        }
        if (listButton) {
            listButton.addEventListener("click", function () {
                setView("list");
            });
        }
        sortCards();
        filterCards();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-hls-player"));
        players.forEach(function (video) {
            var src = video.getAttribute("data-hls");
            if (!src) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                video._hls = hls;
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            }
        });

        Array.prototype.slice.call(document.querySelectorAll(".js-play-video")).forEach(function (button) {
            button.addEventListener("click", function () {
                var panel = button.closest(".player-card");
                var video = panel ? panel.querySelector("video") : document.querySelector("video");
                if (video) {
                    video.play().catch(function () {});
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });
})();
