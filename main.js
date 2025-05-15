// Core libraries
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', init);

// Global variables
let scene, camera, renderer, controls;
let currentObject, currentMaterial;
let primitives = [];
let currentObjectIndex = 0;
let isAnimating = false;
let animationFrameId = null;

function init() {
  console.log("Initializing Three.js application...");
  
  // Initialize the 3D scene
  initScene();
  
  // Create primitive geometries
  createPrimitives();
  
  // Create the initial object
  createInitialObject();
  
  // Set up event listeners for UI controls
  setupEventListeners();
  
  // Initial render
  renderer.render(scene, camera);
  
  // Start animation by default
  startAnimation();
  
  console.log("Initialization complete");
}

function initScene() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);
  
  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  camera.position.y = -1; // Move camera down to make object appear higher
  camera.lookAt(0, 0, 0); // Keep looking at the center
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Find viewport container and append renderer
  const viewport = document.getElementById('viewport');
  if (viewport) {
    viewport.appendChild(renderer.domElement);
    console.log("Renderer added to viewport");
  } else {
    document.body.appendChild(renderer.domElement);
    console.log("Viewport not found, renderer added to body");
  }
  
  // Add orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function createPrimitives() {
  // Create all primitive geometries
  primitives = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.7, 32, 16),
    new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
    new THREE.ConeGeometry(0.7, 1, 32),
    new THREE.TorusGeometry(0.5, 0.2, 16, 100),
    new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16),
    new THREE.DodecahedronGeometry(0.7, 0),
    new THREE.OctahedronGeometry(0.7, 0),
    new THREE.TetrahedronGeometry(0.7, 0),
    new THREE.IcosahedronGeometry(0.7, 0)
  ];
  
  console.log(`Created ${primitives.length} primitive geometries`);
}

function createInitialObject() {
  // Create material
  currentMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.75
  });
  
  // Create mesh with first primitive
  currentObject = new THREE.Mesh(primitives[currentObjectIndex], currentMaterial);
  scene.add(currentObject);
  
  // Update object info display
  updateObjectInfoDisplay();
  
  console.log("Created initial object");
}

function updateObjectInfoDisplay() {
  const objectNames = [
    'Cube', 'Sphere', 'Cylinder', 'Cone', 'Torus', 
    'Torus Knot', 'Dodecahedron', 'Octahedron', 'Tetrahedron', 'Icosahedron'
  ];
  
  const nameElement = document.getElementById('current-object-name');
  if (nameElement) {
    nameElement.textContent = objectNames[currentObjectIndex];
  }
  
  const objectSelect = document.getElementById('object-select');
  if (objectSelect && objectSelect.value !== currentObjectIndex.toString()) {
    objectSelect.value = currentObjectIndex.toString();
  }
}

function animate() {
  if (!isAnimating) return;
  
  // Rotate object
  currentObject.rotation.x += 0.01;
  currentObject.rotation.y += 0.01;
  
  // Update controls
  controls.update();
  
  // Render scene
  renderer.render(scene, camera);
  
  // Continue animation loop
  animationFrameId = requestAnimationFrame(animate);
}

function startAnimation() {
  console.log("Starting animation");
  isAnimating = true;
  animate();
}

function stopAnimation() {
  console.log("Stopping animation");
  isAnimating = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function changeObject(index) {
  // Remove current object
  scene.remove(currentObject);
  
  // Update index with boundary checks
  currentObjectIndex = index;
  if (currentObjectIndex < 0) currentObjectIndex = primitives.length - 1;
  if (currentObjectIndex >= primitives.length) currentObjectIndex = 0;
  
  // Create new object
  currentObject = new THREE.Mesh(primitives[currentObjectIndex], currentMaterial);
  scene.add(currentObject);
  
  // Update UI
  updateObjectInfoDisplay();
  
  console.log(`Changed to object ${currentObjectIndex}`);
}

function setupEventListeners() {
  // Debug which elements are found
  console.log("Setting up event listeners");
  const scaleSlider = document.getElementById('scale-slider');
const scaleValue = document.getElementById('scale-value');

if (scaleSlider && scaleValue) {
  scaleSlider.addEventListener('input', function() {
    const value = parseFloat(this.value);
    scaleValue.textContent = value.toFixed(1);
    
    // Update the 3D object
    currentObject.scale.set(value, value, value);
    
    // Render to show changes if not animating
    if (!isAnimating) {
      renderer.render(scene, camera);
    }
  });
  console.log("Scale slider listener attached");
}
  // Basic animation controls
  const startButton = document.getElementById('start-animation');
  if (startButton) {
    startButton.addEventListener('click', startAnimation);
    console.log("Start button listener attached");
  } else {
    console.log("Start button not found");
  }
  
  const stopButton = document.getElementById('stop-animation');
  if (stopButton) {
    stopButton.addEventListener('click', stopAnimation);
    console.log("Stop button listener attached");
  } else {
    console.log("Stop button not found");
  }
  
  // Object selection
  const nextButton = document.getElementById('next-object');
  if (nextButton) {
    nextButton.addEventListener('click', () => changeObject(currentObjectIndex + 1));
    console.log("Next object button listener attached");
  } else {
    console.log("Next object button not found");
  }
  
  const prevButton = document.getElementById('prev-object');
  if (prevButton) {
    prevButton.addEventListener('click', () => changeObject(currentObjectIndex - 1));
    console.log("Previous object button listener attached");
  } else {
    console.log("Previous object button not found");
  }
  
  // Log all buttons to help diagnose issues
  const buttons = document.querySelectorAll('button');
  console.log(`Found ${buttons.length} buttons in the document`);
  buttons.forEach((btn, i) => {
    console.log(`Button ${i}: id='${btn.id}', text='${btn.textContent}'`);
  });
}