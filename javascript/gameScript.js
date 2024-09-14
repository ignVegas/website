import * as THREE from 'three';

// Create the scene
const scene = new THREE.Scene();

// State to keep track of keys pressed
const keys = {};

// Handle keydown and keyup events to track pressed keys
window.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});
window.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a perspective camera
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(
    40,                       // Field of view
    aspectRatio,              // Aspect ratio
    0.1,                      // Near plane
    1000                      // Far plane
);

// Initialize camera position
camera.position.set(0, 0, 30); // Position the camera far enough to view the planet and the player
camera.lookAt(0, 0, 0);       // Look at the center of the scene

// Create lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Ambient light for overall brightness
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

// Load texture for planet surface
const textureLoader = new THREE.TextureLoader();
const planetTexture = textureLoader.load('assets/sky.png'); // Replace with your texture path
const grassTexture = textureLoader.load('assets/01.png'); // Grass patch texture

// Create a spherical planet with textured surface
const planetRadius = 20;
const planetGeometry = new THREE.SphereGeometry(planetRadius, 64, 64);
const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planet);

// Function to create terrain patches
function createPatch(texture, size, position) {
    const patchGeometry = new THREE.CircleGeometry(size, 32);
    const patchMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
    const patch = new THREE.Mesh(patchGeometry, patchMaterial);
    patch.position.copy(position);
    patch.rotation.x = Math.PI / 2; // Rotate to make it flat
    return patch;
}

// Add terrain patches
const grassPatch = createPatch(grassTexture, 8, new THREE.Vector3(10, planetRadius + 0.1, 0));
//planet.add(grassPatch);

// Create a player cube
const cubeSize = 0.5;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 'skyblue' });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Initialize cube properties
cube.position.set(0, planetRadius + cubeSize / 2, planetRadius * 2); // Start on top of the planet

// Create and position the compass indicators
const compassGroup = new THREE.Group(); // Group for compass indicators

function createTextSprite(text, color, fontsize) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set font size and style
    context.font = `${fontsize}px Arial`;
    
    // Measure the text size to set the canvas dimensions
    const textWidth = context.measureText(text).width;
    const textHeight = fontsize;
    
    // Set canvas size
    canvas.width = textWidth + 20; // Add some padding
    canvas.height = textHeight + 10; // Add some padding
    
    // Set background color and text color
    context.fillStyle = 'black'; // Background color
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color; // Text color
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw the text on the canvas
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Create a sprite material with the texture
    const material = new THREE.SpriteMaterial({ map: texture });
    
    // Create and return the sprite
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(canvas.width / 100, canvas.height / 100, 1); // Adjust sprite scale
    return sprite;
}


const topLabel = createTextSprite('Top', 'white', 4);
topLabel.position.set(0, planetRadius + 2, 0);
compassGroup.add(topLabel);

const bottomLabel = createTextSprite('Bottom', 'white', 4);
bottomLabel.position.set(0, -planetRadius - 2, 0);
compassGroup.add(bottomLabel);

const leftLabel = createTextSprite('Left', 'white', 4);
leftLabel.position.set(-planetRadius - 3, 0, 0);
compassGroup.add(leftLabel);

const rightLabel = createTextSprite('Right', 'white', 4);
rightLabel.position.set(planetRadius + 3, 0, 0);
compassGroup.add(rightLabel);

// Add the compass group to the planet
planet.add(compassGroup);

// Movement speed for rotating the planet
const rotationSpeed = 0.01;

function handleInput() {
    if (keys['ArrowLeft']) {
        planet.rotation.y -= rotationSpeed; // Rotate planet left
    }
    if (keys['ArrowRight']) {
        planet.rotation.y += rotationSpeed; // Rotate planet right
    }
    if (keys['ArrowUp']) {
        planet.rotation.x -= rotationSpeed; // Rotate planet up
    }
    if (keys['ArrowDown']) {
        planet.rotation.x += rotationSpeed; // Rotate planet down
    }
}

function constrainPlayerToSurface() {
    const direction = new THREE.Vector3().subVectors(cube.position, planet.position).normalize();
    cube.position.copy(planet.position).add(direction.multiplyScalar(planetRadius + cubeSize / 2));
}

function animate() {
    requestAnimationFrame(animate);

    handleInput(); // Handle player input to rotate the planet

    constrainPlayerToSurface(); // Ensure the player stays on the surface of the planet

    // Ensure the player remains in the center of the camera view
    camera.position.copy(cube.position).add(new THREE.Vector3(0, 10, 30));
    camera.lookAt(cube.position);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
