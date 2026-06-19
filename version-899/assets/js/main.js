(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navLinks = document.querySelector('[data-nav-links]');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            const open = navLinks.classList.toggle('is-open');
            document.body.classList.toggle('is-nav-open', open);
            navToggle.setAttribute('aria-expanded', String(open));
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        let active = 0;

        function showSlide(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(active + 1);
            }, 6500);
        }
    }

    const filterBlocks = Array.from(document.querySelectorAll('[data-filter-block]'));

    filterBlocks.forEach(function (block) {
        const input = block.querySelector('[data-search-input]');
        const yearSelect = block.querySelector('[data-year-select]');
        const typeSelect = block.querySelector('[data-type-select]');
        const regionSelect = block.querySelector('[data-region-select]');
        const scope = document.querySelector(block.getAttribute('data-filter-block')) || document;
        const cards = Array.from(scope.querySelectorAll('[data-card]'));

        function norm(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            const term = norm(input ? input.value : '');
            const year = norm(yearSelect ? yearSelect.value : '');
            const type = norm(typeSelect ? typeSelect.value : '');
            const region = norm(regionSelect ? regionSelect.value : '');

            cards.forEach(function (card) {
                const text = norm([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                const cardYear = norm(card.getAttribute('data-year'));
                const cardType = norm(card.getAttribute('data-type'));
                const cardRegion = norm(card.getAttribute('data-region'));
                const pass = (!term || text.indexOf(term) !== -1)
                    && (!year || cardYear === year)
                    && (!type || cardType.indexOf(type) !== -1)
                    && (!region || cardRegion.indexOf(region) !== -1);

                card.hidden = !pass;
            });
        }

        [input, yearSelect, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();
