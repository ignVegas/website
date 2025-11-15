document.addEventListener('DOMContentLoaded', function () {
    const checkbox = document.querySelector('.hamburger input');
    const dropdownOverlay = document.getElementById('dropdownOverlay');
    const logoLink = document.getElementById('logoLink');
    const menuStyle = document.querySelector('.menu-style');

    // version modal may not exist in this markup; guard before using
    const versionModal = document.getElementById('versionModal');
    if (versionModal) {
        versionModal.classList.remove('hidden');
        versionModal.classList.add('open');

        const professionalBtn = document.getElementById('professionalBtn');
        if (professionalBtn) {
            professionalBtn.addEventListener('click', function () {
                versionModal.classList.remove('open');
                versionModal.classList.add('hidden');
            });
        }

        const gameModeBtn = document.getElementById('gameModeBtn');
        if (gameModeBtn) {
            gameModeBtn.addEventListener('click', function () {
                window.location.href = 'game.html'; // Redirect to game mode version
            });
        }
    }

    if (checkbox) {
        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                if (logoLink) logoLink.classList.add('logo-link-expanded');
                if (dropdownOverlay) dropdownOverlay.classList.add('active');
                if (menuStyle) menuStyle.classList.add('active');
            } else {
                if (logoLink) logoLink.classList.remove('logo-link-expanded');
                if (dropdownOverlay) dropdownOverlay.classList.remove('active');
                if (menuStyle) menuStyle.classList.remove('active');
            }
        });
    }


    // JavaScript function to redirect when clicking on a card
    function redirectToUrl(url) {
        window.location.href = url;
    }

    // Tab switcher logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabIndicator = document.querySelector('.tab-indicator');
    const tabContents = document.querySelectorAll('.tab-content');

    function updateActiveTab(tabName, clickedBtn) {
        tabButtons.forEach(b => b.classList.toggle('active', b === clickedBtn));
        tabContents.forEach(c => {
            // allow grouping: any pane whose id equals the tab name OR starts with 'projects' when the projects tab is active
            const isActive = c.id === tabName || (tabName === 'projects' && c.id.startsWith('projects'));
            c.classList.toggle('active', isActive);
        });

        // move indicator under active button
        if (!clickedBtn || !tabIndicator) return;
        const rect = clickedBtn.getBoundingClientRect();
        const parentRect = clickedBtn.parentElement.getBoundingClientRect();
        // center the fixed-width indicator under the middle of the button
        const indicatorWidth = parseFloat(getComputedStyle(tabIndicator).width) || 40;
        const btnCenter = rect.left - parentRect.left + rect.width / 2;
        const offset = btnCenter - (indicatorWidth / 2);
        tabIndicator.style.transform = `translateX(${offset}px)`;
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => updateActiveTab(btn.dataset.tab, btn));
    });

    // initialize indicator position after fonts/load
    function initIndicator() {
        const active = document.querySelector('.tab-btn.active');
        if (active) updateActiveTab(active.dataset.tab, active);
    }
    setTimeout(initIndicator, 200);
    // recompute position on resize
    window.addEventListener('resize', initIndicator);
    // recompute position when scrolling so indicator stays aligned
    // use requestAnimationFrame to avoid layout thrash and keep smooth scrolling
    const rightContainerEl = document.querySelector('.right-container');
    const leftContainerEl = document.querySelector('.left-container');
    let ticking = false;
    function scheduleIndicatorUpdate() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                initIndicator();
                ticking = false;
            });
        }
    }
    if (rightContainerEl) {
        rightContainerEl.addEventListener('scroll', scheduleIndicatorUpdate, { passive: true });
        // also monitor for velocity effects
        // set initial CSS vars
        document.documentElement.style.setProperty('--scroll-v', '0');
        document.documentElement.style.setProperty('--scroll-v-abs', '0');
    }
    window.addEventListener('scroll', scheduleIndicatorUpdate, { passive: true });

    // --- Scroll velocity tracking for motion-blur emulation ---
    (function() {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return; // don't run motion blur for reduced-motion

        const target = rightContainerEl || document.scrollingElement || window;
        let lastPos = (rightContainerEl ? rightContainerEl.scrollTop : window.scrollY) || 0;
        let lastTime = performance.now();

        function updateVelocity(currentPos, now) {
            const dy = currentPos - lastPos;
            const dt = Math.max(1, now - lastTime); // ms
            // velocity in px per ms, scale to perceptible px-level movement
            const raw = dy / dt; // px/ms
            const scaled = raw * 40; // tuning factor
            // clamp
            const clamped = Math.max(-24, Math.min(24, scaled));
            document.documentElement.style.setProperty('--scroll-v', `${clamped}px`);
            document.documentElement.style.setProperty('--scroll-v-abs', `${Math.abs(clamped)}px`);
            lastPos = currentPos;
            lastTime = now;
        }

        function onScroll(e) {
            const now = performance.now();
            const pos = rightContainerEl ? rightContainerEl.scrollTop : window.scrollY;
            updateVelocity(pos, now);
            // also trigger the existing scroll activity visual mode
            const evt = new Event('scroll');
            // call scheduleIndicatorUpdate indirectly via existing handlers
            // but also update the is-scrolling marker
            if (!document.documentElement.classList.contains('is-scrolling')) {
                document.documentElement.classList.add('is-scrolling');
            }
            // debounce removal handled elsewhere (onScrollActivity)
        }

        (rightContainerEl || document).addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('wheel', (e) => {
            const now = performance.now();
            // wheel deltaY is typically in pixels on most browsers
            const pos = rightContainerEl ? rightContainerEl.scrollTop + e.deltaY : window.scrollY + e.deltaY;
            updateVelocity(pos, now);
            if (!document.documentElement.classList.contains('is-scrolling')) {
                document.documentElement.classList.add('is-scrolling');
            }
        }, { passive: true });
    })();

    // Forward wheel/trackpad scrolls on the left container to the right container
    // so users can scroll projects by placing cursor on the left side.
    if (leftContainerEl && rightContainerEl) {
        leftContainerEl.addEventListener('wheel', (e) => {
            // Forward vertical scroll delta to right column. Use scrollBy when available.
            try {
                if (typeof rightContainerEl.scrollBy === 'function') {
                    rightContainerEl.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });
                } else {
                    rightContainerEl.scrollTop += e.deltaY;
                }
            } catch (err) {
                // swallow errors and avoid breaking other handlers
            }
        }, { passive: true });
    }

    // If Smooth Scrollbar is being used (it exposes a Scrollbar API), attach listener too
    try {
        if (window.Scrollbar && typeof Scrollbar.get === 'function') {
            const sb = Scrollbar.get(rightContainerEl);
            if (sb && typeof sb.addListener === 'function') {
                sb.addListener(() => scheduleIndicatorUpdate());
            }
        }
    } catch (e) {
        // ignore if Smooth Scrollbar isn't present or accessible
    }

    // Star-mode removed: no toggle wiring needed

});


const texts = [
    "Software Engineering Student @ UWGB",
    "Experienced in Java, C#, .NET, SQL, Azure, and C++",
    "Graduating in May 2026 with a B.S.",
    "Previously interned at West Bend Insurance",
    "Developing secure cloud integrations with Microsoft Azure",
    "Proficient in database management with MySQL and SQL Server",
    "Skilled in API design, identity management, and authentication",
    "Version control and collaboration using Git and GitHub",
    "Focused on delivering reliable, high-performance software"
];

let currentTextIndex = 0;
const matrixTextElement = document.getElementById("matrixText");

function scrambleAndChangeText() {
    const originalText = texts[currentTextIndex];
    let displayText = Array.from({length: originalText.length}, () => " ");
    let charIndex = 0;

    const interval = setInterval(() => {
        if (charIndex < originalText.length) {
            displayText[charIndex] = scrambleTowardsTarget(displayText[charIndex], originalText[charIndex]);
            matrixTextElement.textContent = displayText.join("");
            if (displayText[charIndex] === originalText[charIndex]) {
                charIndex++;
            }
        } else {
            clearInterval(interval);
            setTimeout(() => {
                currentTextIndex = (currentTextIndex + 1) % texts.length;
                scrambleAndChangeText(); // Start the next text
            }, 500);
        }
    }, 5);
}

function scrambleTowardsTarget(currentChar, targetChar) {
    const startChar = 'A';
    const endChar = 'Z';
    const targetCode = targetChar.charCodeAt(0);

    if (currentChar === " ") {
        return targetChar.charCodeAt(0) < 77 ? startChar : endChar;
    }

    const currentCode = currentChar.charCodeAt(0);

    if (currentCode < targetCode) {
        return String.fromCharCode(currentCode + 1);
    } else if (currentCode > targetCode) {
        return String.fromCharCode(currentCode - 1);
    } else {
        return targetChar;
    }
}

// Initial call to start the text cycle
scrambleAndChangeText();

// Original light-follow handler: directly position the large light element under the cursor
document.addEventListener('mousemove', function(e) {
    const lightEffect = document.querySelector('.light-effect');
    if (lightEffect) {
        lightEffect.style.left = `${e.clientX}px`;
        lightEffect.style.top = `${e.clientY}px`;
    }
});

// Touch support: position on touchmove
document.addEventListener('touchmove', function(e) {
    const lightEffect = document.querySelector('.light-effect');
    if (!lightEffect) return;
    if (!e.touches || e.touches.length === 0) return;
    const t = e.touches[0];
    lightEffect.style.left = `${t.clientX}px`;
    lightEffect.style.top = `${t.clientY}px`;
}, { passive: true });

// Theme toggle: circular wipe animation from switch
// Light/dark toggle removed: site stays in dark mode permanently.

/* Sort project cards by date (newest first). This runs on DOMContentLoaded and
   reorders only the cards inside the #projects tab to keep Experience separate. */
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const projectsPane = document.getElementById('projects');
        if (!projectsPane) return;
        const cards = Array.from(projectsPane.querySelectorAll('.card'));
        if (!cards.length) return;

        function parseDateText(text) {
            if (!text) return new Date(0);
            const t = text.trim();
            // use the first part before any dash (handle ranges like 'May 2025 - Aug 2025')
            const first = t.split('-')[0].trim();
            // try parsing with a leading day so Date can understand '1 May 2025'
            const parsed = Date.parse('1 ' + first);
            if (!isNaN(parsed)) return new Date(parsed);
            // fallback: find 4-digit year
            const y = first.match(/(20\d{2}|19\d{2})/);
            if (y) return new Date(parseInt(y[0], 10), 0, 1);
            return new Date(0);
        }

        const mapped = cards.map(c => {
            const dateEl = c.querySelector('.card-date');
            const txt = dateEl ? dateEl.textContent || dateEl.innerText : '';
            return { el: c, date: parseDateText(txt) };
        });

        // sort newest first
        mapped.sort((a, b) => b.date - a.date);

        // append in order to the projects pane (appendChild moves existing nodes)
        mapped.forEach(m => projectsPane.appendChild(m.el));
    });
})();

/* Flipbook slideshow initialization */
(function() {
    const stage = document.getElementById('flipbookStage');
    const prevBtn = document.getElementById('flipPrev');
    const nextBtn = document.getElementById('flipNext');
    if (!stage || !prevBtn || !nextBtn) return;

    // load images from assets/self directory
    const images = [
        'assets/self/IMG_2210.jpeg',
        'assets/self/IMG_4104.jpeg',
        'assets/self/IMG_4115.jpeg',
        'assets/self/IMG_4118.jpeg',
        'assets/self/IMG_5010.jpeg',
        'assets/self/IMG_5577.jpeg'
    ];

    // shuffle array
    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    const ordered = shuffle(images.slice());
    const slides = [];
    let index = 0;
    let animating = false;

    ordered.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'flipbook-slide';
        const img = document.createElement('img');
        img.src = src;
        // reduce layout work and initial load pressure
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = `photo ${i+1}`;
        div.appendChild(img);
        stage.appendChild(div);
        slides.push(div);
    });

    // make first visible
    if (slides.length) slides[0].classList.add('active');

    function show(newIndex, dir) {
        if (animating || newIndex === index) return;
        animating = true;
        const curr = slides[index];
        const next = slides[newIndex];

        // prepare next
        next.classList.remove('before','after','active');
        next.style.opacity = '1';

        // We'll guard cleanup so it only runs once even if multiple events fire.
        let finished = false;
        function finishCleanup() {
            if (finished) return;
            finished = true;
            // remove any transitional classes left on the outgoing slide
            try {
                curr.classList.remove('before','after');
                curr.style.opacity = '';
            } catch (e) {}
            index = newIndex;
            animating = false;
        }

        // fallback timeout in case transitionend doesn't fire for any reason
        const fallback = setTimeout(() => {
            finishCleanup();
        }, 900);

        // listen for transitionend on both slides and clean up once either completes
        const onEnd = (ev) => {
            if (ev && ev.propertyName && !/transform|opacity/.test(ev.propertyName)) return;
            clearTimeout(fallback);
            // remove listeners from both elements
            curr.removeEventListener('transitionend', onEnd);
            next.removeEventListener('transitionend', onEnd);
            finishCleanup();
        };
        curr.addEventListener('transitionend', onEnd);
        next.addEventListener('transitionend', onEnd);

        if (dir === 'next') {
            next.classList.add('after');
            // force reflow
            void next.offsetWidth;
            // animate out the current and bring in the next
            curr.classList.add('before');
            curr.classList.remove('active');
            next.classList.remove('after');
            next.classList.add('active');
        } else {
            next.classList.add('before');
            void next.offsetWidth;
            curr.classList.add('after');
            curr.classList.remove('active');
            next.classList.remove('before');
            next.classList.add('active');
        }
    }

    prevBtn.addEventListener('click', () => {
        const nextIndex = (index - 1 + slides.length) % slides.length;
        show(nextIndex, 'prev');
    });
    nextBtn.addEventListener('click', () => {
        const nextIndex = (index + 1) % slides.length;
        show(nextIndex, 'next');
    });

})();

/* IntersectionObserver to lazy-activate project cards and defer loading of any
   heavy resources inside them (images with data-src). This reduces painting
   cost for offscreen cards. */
(function() {
    const root = document.querySelector('.right-container') || null;
    const cards = Array.from(document.querySelectorAll('.right-container .card'));
    if (!cards.length) return;

    const ioOptions = {
        root: root,
        rootMargin: '200px 0px 200px 0px', // preload a bit before visible
        threshold: 0.05
    };

    const onIntersect = (entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add('visible');

            // load any images that were deferred via data-src
            const imgs = el.querySelectorAll('img[data-src]');
            imgs.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.loading = 'lazy';
                img.decoding = 'async';
            });

            observer.unobserve(el);
        });
    };

    const observer = new IntersectionObserver(onIntersect, ioOptions);
    cards.forEach(c => {
        // if card already visible in viewport, mark visible immediately
        if (root) {
            const rect = c.getBoundingClientRect();
            const rootRect = root.getBoundingClientRect();
            if (rect.bottom >= rootRect.top && rect.top <= rootRect.bottom) {
                c.classList.add('visible');
                const imgs = c.querySelectorAll('img[data-src]');
                imgs.forEach(img => {
                    img.src = img.dataset.src; img.removeAttribute('data-src'); img.loading='lazy'; img.decoding='async';
                });
                return;
            }
        }
        observer.observe(c);
        // ensure cards start hidden for the entrance transition
        if (!c.classList.contains('visible')) c.classList.remove('visible');
    });
})();

/* Accordion behavior: collapse cards to show only the header/title. Clicking a
   header toggles that card open and closes any other open card. We wrap any
   existing details in a `.card-body` and animate explicit measured heights
   (handled in JS) so the transition is smooth and predictable. */
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const cards = Array.from(document.querySelectorAll('.right-container .card'));
        if (!cards.length) return;

        let openCard = null;

        cards.forEach(card => {
            const header = card.querySelector('.card-header');
            if (!header) return;

            // insert a simple chevron icon into the header if not present
            if (!header.querySelector('.card-icon')) {
                const icon = document.createElement('span');
                icon.className = 'card-icon';
                icon.setAttribute('aria-hidden', 'true');
                icon.textContent = '▾';
                // append after existing children (date typically at end)
                header.appendChild(icon);
            }

            // Wrap remaining children into a card-body if not already present
            if (!card.querySelector('.card-body')) {
                const body = document.createElement('div');
                body.className = 'card-body';
                // move all children except header into body
                while (card.children.length > 1) {
                    body.appendChild(card.children[1]);
                }
                card.appendChild(body);
            }

            const body = card.querySelector('.card-body');
            // ensure starting inline height is zero for the JS-driven animation
            body.style.height = '0px';
            body.style.overflow = 'hidden';

            // make header focusable for keyboard users
            header.tabIndex = 0;
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'false');

            function open() {
                if (openCard && openCard !== card) {
                    closeCard(openCard);
                }

                // measure content height
                const measured = body.scrollHeight;

                // set starting height (0) in case it isn't already
                body.style.height = body.style.height || '0px';

                // add the open class so any padding/margins applied by CSS are factored in
                card.classList.add('open');
                header.setAttribute('aria-expanded', 'true');

                // force a reflow and then animate to the measured height
                void body.offsetHeight;
                body.style.height = measured + 'px';

                // when transition completes, clear the fixed height so content can resize naturally
                const onEnd = (ev) => {
                    if (ev && ev.propertyName !== 'height') return;
                    body.style.height = 'auto';
                    body.removeEventListener('transitionend', onEnd);
                };
                body.addEventListener('transitionend', onEnd);

                openCard = card;
            }

            function closeCard(c) {
                const b = c.querySelector('.card-body');
                const h = c.querySelector('.card-header');

                // set explicit height to current measured height so transition starts from exact px value
                b.style.height = b.scrollHeight + 'px';
                // force reflow so the browser picks up the explicit height
                void b.offsetHeight;

                // remove open class to animate padding and other CSS-driven changes
                c.classList.remove('open');
                if (h) h.setAttribute('aria-expanded', 'false');

                // animate to zero height
                requestAnimationFrame(() => {
                    b.style.height = '0px';
                });

                // cleanup after transition — keep height at 0px when closed
                const onEnd = (ev) => {
                    if (ev && ev.propertyName !== 'height') return;
                    b.style.height = '0px';
                    b.removeEventListener('transitionend', onEnd);
                };
                b.addEventListener('transitionend', onEnd);

                if (openCard === c) openCard = null;
            }

            function toggle() {
                if (card.classList.contains('open')) {
                    closeCard(card);
                } else {
                    open();
                }
            }

            header.addEventListener('click', (e) => {
                // allow clicks on links inside header to behave normally
                if (e.target.closest('a')) return;
                toggle();
            });

            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                }
            });

            // clicking anywhere on the card (except links/buttons) should toggle it
            card.addEventListener('click', (e) => {
                // ignore clicks that originated from header (header already handles toggle)
                if (e.target.closest('.card-header')) return;
                // ignore clicks on anchors/buttons so links remain interactive
                if (e.target.closest('a') || e.target.closest('.card-button')) return;
                // toggle open/close for the card when body or other non-interactive areas are clicked
                toggle();
            });
        });
    });
})();

/* Particle drops disabled per user request (removed the moon/sun spawn on mouse/touch).
   If you want to re-enable later, we can restore a simplified, rate-limited spawner. */

// Scrolling performance helper: while the user is actively scrolling we add
// the `.is-scrolling` class to the root which the CSS uses to reduce
// expensive animations and shadows. This is lightweight and uses a short
// debounce to detect scroll end.
document.addEventListener('DOMContentLoaded', () => {
    const left = document.querySelector('.left-container');
    const right = document.querySelector('.right-container');
    if (!left && !right) return;

    let scrollTimer = null;
    function onScrollActivity() {
        if (!document.documentElement.classList.contains('is-scrolling')) {
            document.documentElement.classList.add('is-scrolling');
        }
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            document.documentElement.classList.remove('is-scrolling');
        }, 160);
    }

    [left, right, window].forEach((target) => {
        if (!target) return;
        target.addEventListener('scroll', onScrollActivity, { passive: true });
    });
    // Also detect wheel/trackpad movements on the page
    document.addEventListener('wheel', onScrollActivity, { passive: true });
});
