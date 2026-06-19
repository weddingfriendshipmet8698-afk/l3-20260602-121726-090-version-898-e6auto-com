(function () {
    var menuButton = document.querySelector(".menu-button");
    var nav = document.querySelector(".main-nav");
    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var current = 0;
        var show = function (index) {
            current = index % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var count = document.getElementById("searchCount");
    if (input && results && count) {
        var rows = Array.prototype.slice.call(results.querySelectorAll(".search-row"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        var run = function () {
            var query = input.value.trim().toLowerCase();
            var shown = 0;
            rows.forEach(function (row) {
                var haystack = row.getAttribute("data-search") || "";
                var ok = !query || haystack.indexOf(query) !== -1;
                row.classList.toggle("is-hidden", !ok);
                if (ok) {
                    shown += 1;
                }
            });
            count.textContent = shown + " 部影片";
        };
        input.addEventListener("input", run);
        run();
    }
})();
