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
    }
    window.addEventListener('scroll', scheduleIndicatorUpdate, { passive: true });

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

/* Particle drop spawner: spawns small moon/sun PNGs at the cursor in dark-mode
   - uses a simple pool to avoid excessive DOM churn
   - rate-limited and capped for performance
   - respects prefers-reduced-motion
*/
(function() {
    const ASSETS = { night: 'assets/moon.png', day: 'assets/sun.png' };
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return; // do nothing for reduced-motion users

    const spriteLayer = document.createElement('div');
    spriteLayer.className = 'sprite-layer';
    document.body.appendChild(spriteLayer);

    const POOL_SIZE = 60;
    const MAX_ACTIVE = 40;
    // spawn at most once every 0.75s (user requested faster interval)
    const SPAWN_INTERVAL = 750; // ms
    const pool = [];
    let active = 0;
    let lastSpawn = 0;

    for (let i = 0; i < POOL_SIZE; i++) {
        const img = document.createElement('img');
        img.className = 'sprite';
        img.style.display = 'none';
        img.dataset.inUse = 'false';
        spriteLayer.appendChild(img);
        pool.push(img);
    }

    function getFromPool() {
        for (let i = 0; i < pool.length; i++) {
            if (pool[i].dataset.inUse === 'false') return pool[i];
        }
        return null;
    }

    function spawn(x, y, mode) {
        if (active >= MAX_ACTIVE) return;
        const now = Date.now();
        if (now - lastSpawn < SPAWN_INTERVAL) return;
        lastSpawn = now;
        const el = getFromPool();
        if (!el) return;

        el.dataset.inUse = 'true';
        active++;
        el.style.display = '';
        el.src = (mode === 'day') ? ASSETS.day : ASSETS.night;

        const size = 24 + Math.round(Math.random() * 28); // 24-52px
        el.style.width = size + 'px';
        el.style.height = size + 'px';

    // random initial rotation and a separate rotational delta so each drop falls at a different angle
    const rot = (Math.random() * 360) - 180; // -180..180deg
    const extraRot = (Math.random() * 180) - 90; // -90..90deg
        const dist = 80 + Math.random() * 160; // fall distance
    // random scale, allow optional horizontal flip for variety
    const scaleVal = 0.9 + Math.random() * 0.4;
    const flip = Math.random() < 0.25 ? -1 : 1; // 25% chance to flip horizontally
    const scale = `${flip * scaleVal}`;

        el.style.left = (x - size / 2) + 'px';
        el.style.top = (y - size / 2) + 'px';
        el.style.opacity = '1';
        el.style.transition = 'none';
    el.style.transform = `translateY(0px) rotate(${rot}deg) scale(${scale})`;

        // Force reflow then animate to final transform + fade
        void el.offsetWidth;
        requestAnimationFrame(() => {
            el.style.transition = 'transform 1000ms cubic-bezier(.2,.7,.1,1), opacity 1000ms linear';
            el.style.transform = `translateY(${dist}px) rotate(${rot + extraRot}deg) scale(${scale})`;
            el.style.opacity = '0';
        });

        // cleanup after animation
        setTimeout(() => {
            el.style.transition = 'none';
            el.style.display = 'none';
            el.dataset.inUse = 'false';
            active = Math.max(0, active - 1);
        }, 1100);
    }

    // mouse & touch handlers (dark-mode only, per your request)
    let lastMoveTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastMoveTime < 30) return; // tiny throttle
        lastMoveTime = now;
        // Light mode removed — always spawn night sprites
        if (now - lastSpawn >= SPAWN_INTERVAL) {
            spawn(e.clientX, e.clientY, 'night');
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        const t = e.touches[0];
        const now = Date.now();
        // Light mode removed — always spawn night sprites
        if (now - lastSpawn >= SPAWN_INTERVAL) {
            spawn(t.clientX, t.clientY, 'night');
        }
    }, { passive: true });

})();
