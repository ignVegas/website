document.addEventListener('DOMContentLoaded', function () {
    const checkbox = document.querySelector('.hamburger input');
    const dropdownOverlay = document.getElementById('dropdownOverlay');
    const logoLink = document.getElementById('logoLink');
    const menuStyle = document.querySelector('.menu-style');

    checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
            logoLink.classList.add('logo-link-expanded');
            dropdownOverlay.classList.add('active');
            menuStyle.classList.add('active');
        } else {
            logoLink.classList.remove('logo-link-expanded');
            dropdownOverlay.classList.remove('active');
            menuStyle.classList.remove('active');
        }
    });


    // JavaScript function to redirect when clicking on a card
    function redirectToUrl(url) {
        window.location.href = url;
    }

});


const texts = [
    "Software Engineer Major @ UWGB",
    "Gamer, Coder, Creator",
    "Problem Solver Extraordinaire",
    "Tech Enthusiast & Developer",
    "Music Enthusiast",
    "Animal Lover",
    "Anime and Manga Enthusiast",
    "Biggest Dexter Fan",
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