// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dynamic canvas size based on window size
function resizeCanvas() {
    canvas.width = 1280;
    canvas.height = 720;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize

// Load platform images
const platformImages = [
    new Image(),
    new Image(),
    new Image()
];
platformImages[1].src = 'assets/background.jpg'; // Replace with your image path
platformImages[2].src = 'assets/floor.png'; // Replace with your image path

let imagesLoaded = 0;
platformImages.forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === platformImages.length) {
            gameLoop(); // Start the game loop when images are loaded
        }
    };
    img.onerror = () => {
        console.error('Failed to load image: ' + img.src);
    };
});

// Define platforms (one continuous scene)
const platforms = [
    { x: 0, y: canvas.height - 10, width: 5000, height: 10, imageIndex: 2 }, // Extend platform width for continuous scene
    //{ x: 250, y: 100, width: 100, height: 10, imageIndex: 1 }
];

// Define player object
const player = {
    x: 50,
    y: canvas.height - 150,
    width: canvas.width * 0.05,
    height: canvas.height * 0.09,
    speed: canvas.width * 0.00125,
    dx: 0,
    dy: 0,
    gravity: canvas.height * 0.0003,
    isJumping: false,
    jumpStrength: canvas.height * 0.015,
};

// Load background image
const backgroundImage = new Image();
backgroundImage.src = 'assets/background.jpg'; // Replace with your image path

let backgroundImageLoaded = false;
backgroundImage.onload = () => {
    backgroundImageLoaded = true;
};
backgroundImage.onerror = () => {
    console.error('Failed to load background image.');
};

// Function to draw the background
function drawBackground() {
    if (backgroundImageLoaded) {
        const backgroundWidth = backgroundImage.width;
        const backgroundHeight = backgroundImage.height;

        // Calculate the starting X position for the background
        const startX = Math.max(0, camera.x);
        const endX = Math.min(camera.maxX + canvas.width, backgroundWidth);

        // Draw the background image
        ctx.drawImage(backgroundImage, startX, 0, endX - startX, backgroundHeight, 0, 0, endX - startX, canvas.height);

        // Optional: If you need to handle the case where the image extends beyond the viewport
        if (camera.x + canvas.width > backgroundWidth) {
            const overflowWidth = (camera.x + canvas.width) - backgroundWidth;
            ctx.drawImage(backgroundImage, 0, 0, overflowWidth, backgroundHeight, endX - startX, 0, overflowWidth, canvas.height);
        }
    }
}

// Define camera object
const camera = {
    x: 0, // Camera's x position
    width: canvas.width, // Viewport width
    maxX: 5000 - canvas.width // Maximum x position for the camera to follow the player
};

// Define keys
const keys = {
    right: false,
    left: false,
    up: false,
};

// Handle keydown events
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keys.right = true;
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keys.left = true;
    }
    if ((e.code === 'Space' || e.code === 'KeyW') && !player.isJumping) {
        keys.up = true;
        player.isJumping = true;
        player.dy = -player.jumpStrength;
    }
});

// Handle keyup events
window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keys.right = false;
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keys.left = false;
    }
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        keys.up = false;
    }
});

// Function to check if the player is colliding with a platform
function checkPlatformCollision() {
    platforms.forEach(platform => {
        // Check if the player is overlapping the platform
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            // Handle collision
            if (player.dy > 0 && player.y + player.height <= platform.y + player.dy) {
                // Falling down, stop player on the platform
                player.y = platform.y - player.height;
                player.dy = 0;
                player.isJumping = false;
            } else if (player.dy < 0 && player.y >= platform.y + platform.height) {
                // Jumping up, stop player from going through the platform
                player.y = platform.y + platform.height;
                player.dy = 0;
            }
        }
    });
}

// Update player and camera
function updatePlayer() {
    // Horizontal movement
    if (keys.right) {
        player.dx = player.speed;
    } else if (keys.left) {
        player.dx = -player.speed;
    } else {
        player.dx = 0;
    }

    // Apply gravity
    if (player.y + player.height < canvas.height) {
        player.dy += player.gravity;
    }

    // Move the player horizontally
    player.x += player.dx;

    // Move the player vertically
    player.y += player.dy;

    // Check collisions
    checkPlatformCollision();

    // Update camera to follow the player
    // Make sure camera follows player but does not exceed maxX
    camera.x = Math.max(0, Math.min(player.x - camera.width / 2, camera.maxX));

    // Ensure player stays within the canvas boundaries
    let minX = camera.x;
    let maxX = camera.x + camera.width - player.width;

    // Clamp player's x position to the scene boundaries
    player.x = Math.max(minX, Math.min(maxX, player.x));
}

// Define player images
const playerImages = {
    right: [
        new Image(), // Image 1 for moving right
        new Image()  // Image 2 for moving right
    ],
    left: [
        new Image(), // Image 1 for moving left
        new Image()  // Image 2 for moving left
    ]
};

// Load images
playerImages.right[0].src = 'assets/RightFaceStep1.png'; // Replace with your image path
playerImages.right[1].src = 'assets/RightFaceStep2.png'; // Replace with your image path
playerImages.left[0].src = 'assets/LeftFaceStep1.png'; // Replace with your image path
playerImages.left[1].src = 'assets/LeftFaceStep2.png'; // Replace with your image path

let playerDirection = 'right'; // Default direction
let playerImageIndex = 0;
let frameCount = 0;
const framesPerImage = 35; // Change image every 15 frames

// Function to draw the player
function drawPlayer() {
    if (player.dx > 0) {
        // Moving right
        playerDirection = 'right';
    } else if (player.dx < 0) {
        // Moving left
        playerDirection = 'left';
    }

    // Draw the player image
    ctx.drawImage(
        playerImages[playerDirection][playerImageIndex],
        player.x - camera.x,
        player.y,
        player.width,
        player.height
    );
}

// Function to draw the platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        const img = platformImages[platform.imageIndex];
        // Check if image is loaded
        if (img.complete) {
            // Calculate platform drawing coordinates
            const drawX = platform.x - camera.x;
            const drawY = platform.y;
            // Draw the image
            ctx.drawImage(img, drawX, drawY, platform.width, platform.height);
        } else {
            console.warn('Platform image not loaded');
        }
    });
}

// Function to clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Reference to the project description paragraph
const projectDescription = document.getElementById('projectDescription');
const projectList = document.getElementById('projectList');
// Function to update the project card content based on player position
function updateProjectCard() {
    // Function to set the project details
    function setProjectDetails(title, listItems) {
        projectDescription.textContent = title;
        projectList.innerHTML = listItems.map(item => `<li>${item}</li>`).join('');
    }

    // Function to reset the project card when player is not in any specified range
    function resetProjectDetails() {
        projectDescription.textContent = "Head over to a door to view the project!";
        projectList.innerHTML = '';
    }

    // Check player position and update project details accordingly
    if (player.x >= 1050 && player.x <= 1200) {
        setProjectDetails("Visual Sorter", [
            "Sorting Algorithms Visualization",
            "Bubble Sort, Merge Sort, Quick Sort",
            "Real-Time Sorting Demonstration"
        ]);
    } else if (player.x >= 1625 && player.x <= 1780) {
        setProjectDetails("Krypton", [
            "A C++ Project that interacts with a JVM process using Read and Write Memory",
            "Uses indexes and arrays to get locations of certain floats and values to change them",
            "Using Windows API/Krypton API"
        ]);
    } else if (player.x >= 2650 && player.x <= 2800) {
        setProjectDetails("Medieval Munchers", [
            "A 2D Game built fully in java, preset dungeon generation using arrays a txt file which is read to generate",
            "Monsters with randomized movement until player is in range. Inventory and key binding",
            "Uses Java Swing and much more advanced features"
        ]);
    } else {
        // Reset the project card if the player is outside all ranges
        resetProjectDetails();
    }
}

// Main game loop
function gameLoop() {
    clearCanvas();
    drawBackground();
    drawPlatforms();
    drawPlayer();
    updatePlayer();

    updateProjectCard();

    frameCount++;
    if (frameCount % framesPerImage === 0) {
        playerImageIndex = (playerImageIndex + 1) % playerImages[playerDirection].length;
    }

    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();