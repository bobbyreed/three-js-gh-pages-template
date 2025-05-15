//core libraries
import * as THREE from 'three';

// Get all UI elements
const start = document.getElementById("start");
start.addEventListener("click", function() { startAnimation(entryAnimation); });

const stop = document.getElementById("stop");
stop.addEventListener("click", function() { stopAnimation(); });

const yRight = document.getElementById("yR");
yRight.addEventListener("click", function() { moveObject(0.1); });

const yLeft = document.getElementById("yL");
yLeft.addEventListener("click", function() { moveObject(-0.1); });

const switchObject = document.getElementById("object");
switchObject.addEventListener("click", function() { nextObject(); });

const moreTransparent = document.getElementById("oMore");
moreTransparent.addEventListener("click", function() { changeOpacity(-0.1); });

const lessTransparent = document.getElementById("oLess");
lessTransparent.addEventListener("click", function() { changeOpacity(0.1); });

const switchColor = document.getElementById("color");
switchColor.addEventListener("click", function() { changeColor(); });

// Set up Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create all primitives with proper parameters
const primitives = [];
let currentObject = 0;

// Basic primitives
primitives[0] = new THREE.BoxGeometry(1, 1, 1);
primitives[1] = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
primitives[2] = new THREE.CircleGeometry(1, 32);
primitives[3] = new THREE.ConeGeometry(1, 2, 32);
primitives[4] = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
primitives[5] = new THREE.DodecahedronGeometry(1);
primitives[6] = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2, 1.2, 1.2));

// Create a simple shape for ExtrudeGeometry
const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(0, 1);
shape.lineTo(1, 1);
shape.lineTo(1, 0);
shape.lineTo(0, 0);
primitives[7] = new THREE.ExtrudeGeometry(shape, {
  depth: 0.5,
  bevelEnabled: true,
  bevelThickness: 0.1,
  bevelSize: 0.1,
  bevelSegments: 3
});

primitives[8] = new THREE.IcosahedronGeometry(1);

// Create points for LatheGeometry
const points = [];
for (let i = 0; i < 10; i++) {
  points.push(new THREE.Vector2(Math.sin(i * 0.2) * 0.5 + 0.5, (i - 5) * 0.2));
}
primitives[9] = new THREE.LatheGeometry(points, 12);

primitives[10] = new THREE.OctahedronGeometry(1);
primitives[11] = new THREE.PlaneGeometry(1.5, 1.5);

// Create vertices and indices for PolyhedronGeometry
const vertices = [
  1, 1, 1,   -1, 1, 1,   -1, -1, 1,   1, -1, 1,
  1, 1, -1,  -1, 1, -1,  -1, -1, -1,  1, -1, -1
];
const indices = [
  0, 1, 2,   0, 2, 3,   0, 4, 7,   0, 7, 3,
  1, 5, 6,   1, 6, 2,   4, 5, 6,   4, 6, 7
];
primitives[12] = new THREE.PolyhedronGeometry(vertices, indices, 1, 2);

primitives[13] = new THREE.RingGeometry(0.3, 1, 16);

// Create shape for ShapeGeometry
const heartShape = new THREE.Shape();
const x = 0, y = 0;
heartShape.moveTo(x, y + 0.5);
heartShape.bezierCurveTo(x, y + 0.5, x - 0.5, y, x, y - 0.5);
heartShape.bezierCurveTo(x + 0.5, y, x, y + 0.5, x, y + 0.5);
primitives[14] = new THREE.ShapeGeometry(heartShape);

primitives[15] = new THREE.SphereGeometry(1, 32, 16);
primitives[16] = new THREE.TetrahedronGeometry(1);
primitives[17] = new THREE.TorusGeometry(0.7, 0.3, 16, 100);
primitives[18] = new THREE.TorusKnotGeometry(0.7, 0.2, 100, 16);

// Create path for TubeGeometry
const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(-0.5, 0.5, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0.5, -0.5, 0),
  new THREE.Vector3(1, 0, 0)
]);
primitives[19] = new THREE.TubeGeometry(path, 20, 0.2, 8, false);

// WireframeGeometry needs a base geometry
primitives[20] = new THREE.WireframeGeometry(new THREE.SphereGeometry(1, 8, 4));

// Create material with proper properties
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
material.transparent = true;  // Fixed: changed from function call to property assignment
material.opacity = 0.5;

// Create initial primitive mesh
let primitive = new THREE.Mesh(primitives[currentObject], material);
scene.add(primitive);

// Position camera
camera.position.z = 5;

// Animation state
let canAnimate = true;

// Available colors for color switching
let colors = [0x00ff00, 0xff0000, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
let currentColor = 0;

// Animation function
function entryAnimation() {
  if (canAnimate) {
    primitive.rotation.x += 0.01;
    primitive.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
}

// Stop animation
function stopAnimation() {
  canAnimate = false;
}

// Start animation
function startAnimation(animation) {
  canAnimate = true;
  renderer.setAnimationLoop(entryAnimation);
}

// Move object rotation
function moveObject(move) {
  primitive.rotation.y += move;
  renderer.render(scene, camera);
}

// Switch to next primitive
function nextObject() {
  currentObject = (currentObject + 1) % primitives.length;
  // Remove current primitive
  scene.remove(primitive);
  // Create new primitive with the next geometry
  primitive = new THREE.Mesh(primitives[currentObject], material);
  scene.add(primitive);
}

// Change opacity
function changeOpacity(amount) {
  material.opacity += amount;
  // Clamp opacity between 0 and 1
  material.opacity = Math.max(0, Math.min(1, material.opacity));
}

// Change color
function changeColor() {
  currentColor = (currentColor + 1) % colors.length;
  material.color.set(colors[currentColor]);
}

// Start the animation loop
renderer.setAnimationLoop(entryAnimation);