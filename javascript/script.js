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

});


const texts = [
    "Software Engineering Student specializing in Full-Stack Development",
    "Experienced in Java, C#, .NET, SQL, and Cloud Technologies",
    "Building responsive web applications with React and JavaScript",
    "Designing and maintaining scalable backend systems",
    "Developing secure cloud integrations with Microsoft Azure",
    "Proficient in database management with MySQL and SQL Server",
    "Skilled in API design, identity management, and authentication",
    "Applying Agile principles to deliver efficient, maintainable code",
    "Version control and collaboration using Git and GitHub",
    "Focused on delivering reliable, high-performance software solutions"
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

document.addEventListener('mousemove', function(e) {
    const lightEffect = document.querySelector('.light-effect');
    lightEffect.style.left = `${e.clientX}px`;
    lightEffect.style.top = `${e.clientY}px`;
});
