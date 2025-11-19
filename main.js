// Core libraries
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', init);

// Global variables
let scene, camera, renderer, controls;
let currentObject, currentMaterial;
let primitives = [];
let currentObjectIndex = 0;
let isAnimating = false;
let animationFrameId = null;

// Performance monitoring variables
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

// Lighting variables for dynamic control
let ambientLight, directionalLight;
let currentLight = null; // For switchable light types
let shadowsEnabled = false;

// Environment helpers
let gridHelper = null;
let axesHelper = null;

// Post-processing
let composer = null;
let bloomPass = null;
let bokehPass = null;
let bloomEnabled = false;
let dofEnabled = false;

// Advanced features
let particleSystem = null;
let physicsEnabled = false;
let loadedModel = null;

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
  camera.position.y = -2; // Move camera down to make object appear higher
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
  
  // Add lights (store in global variables for dynamic control)
  ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  // Initialize post-processing composer
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Create bloom pass (disabled by default)
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // strength
    0.4, // radius
    0.85 // threshold
  );
  bloomPass.enabled = false;
  composer.addPass(bloomPass);

  // Create bokeh (DOF) pass (disabled by default)
  bokehPass = new BokehPass(scene, camera, {
    focus: 5.0,
    aperture: 0.025,
    maxblur: 0.01
  });
  bokehPass.enabled = false;
  composer.addPass(bokehPass);

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
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

  // Calculate FPS
  const currentTime = performance.now();
  frameCount++;

  if (currentTime >= lastFrameTime + 1000) {
    fps = Math.round((frameCount * 1000) / (currentTime - lastFrameTime));
    frameCount = 0;
    lastFrameTime = currentTime;

    // Update performance stats
    updatePerformanceStats();
  }

  // Rotate object
  currentObject.rotation.x += 0.01;
  currentObject.rotation.y += 0.01;

  // Update controls
  controls.update();

  // Render scene (use composer if effects are enabled)
  if (bloomEnabled || dofEnabled) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }

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
//slider setup
  const scaleSlider = document.getElementById('scale-slider');
const scaleValue = document.getElementById('scale-value');

// Material type selection
const materialType = document.getElementById('material-type');
if (materialType) {
  materialType.addEventListener('change', (e) => changeMaterial(e.target.value));
  console.log("Material type listener attached");
} else {
  console.log("Material type element not found");
}

// Color picker
const colorPicker = document.getElementById('color-picker');
if (colorPicker) {
  colorPicker.addEventListener('change', (e) => changeColor(e.target.value));
  console.log("Color picker listener attached");
} else {
  console.log("Color picker not found");
}

// Random color button
const randomizeColorBtn = document.getElementById('randomize-color');
if (randomizeColorBtn) {
  randomizeColorBtn.addEventListener('click', randomizeColor);
  console.log("Randomize color button listener attached");
} else {
  console.log("Randomize color button not found");
}

// Wireframe toggle
const wireframeToggle = document.getElementById('wireframe-toggle');
if (wireframeToggle) {
  wireframeToggle.addEventListener('change', (e) => setWireframe(e.target.checked));
  console.log("Wireframe toggle listener attached");
} else {
  console.log("Wireframe toggle not found");
}

// Opacity slider
const opacitySlider = document.getElementById('opacity-slider');
if (opacitySlider) {
  opacitySlider.addEventListener('input', (e) => setOpacity(parseFloat(e.target.value)));
  console.log("Opacity slider listener attached");
} else {
  console.log("Opacity slider not found");
}

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

  // Object dropdown selection
  const objectSelect = document.getElementById('object-select');
  if (objectSelect) {
    objectSelect.addEventListener('change', (e) => changeObject(parseInt(e.target.value)));
    console.log("Object select dropdown listener attached");
  } else {
    console.log("Object select dropdown not found");
  }

  // Environment preset buttons
  const spacePreset = document.getElementById('preset-space');
  if (spacePreset) {
    spacePreset.addEventListener('click', () => setEnvironmentPreset('space'));
    console.log("Deep Space preset listener attached");
  }

  const planetPreset = document.getElementById('preset-planet');
  if (planetPreset) {
    planetPreset.addEventListener('click', () => setEnvironmentPreset('planet'));
    console.log("Alien Planet preset listener attached");
  }

  const techPreset = document.getElementById('preset-tech');
  if (techPreset) {
    techPreset.addEventListener('click', () => setEnvironmentPreset('tech'));
    console.log("Tech Lab preset listener attached");
  }

  // Ambient light slider
  const ambientSlider = document.getElementById('ambient-slider');
  if (ambientSlider) {
    ambientSlider.addEventListener('input', (e) => setAmbientLightIntensity(e.target.value));
    console.log("Ambient light slider listener attached");
  }

  // Camera zoom slider
  const zoomSlider = document.getElementById('zoom-slider');
  if (zoomSlider) {
    zoomSlider.addEventListener('input', (e) => setCameraZoom(e.target.value));
    console.log("Zoom slider listener attached");
  }

  // Camera position buttons
  const cameraTop = document.getElementById('camera-top');
  if (cameraTop) {
    cameraTop.addEventListener('click', () => setCameraPosition('top'));
    console.log("Camera top button listener attached");
  }

  const cameraFront = document.getElementById('camera-front');
  if (cameraFront) {
    cameraFront.addEventListener('click', () => setCameraPosition('front'));
    console.log("Camera front button listener attached");
  }

  const cameraLeft = document.getElementById('camera-left');
  if (cameraLeft) {
    cameraLeft.addEventListener('click', () => setCameraPosition('left'));
    console.log("Camera left button listener attached");
  }

  const cameraRight = document.getElementById('camera-right');
  if (cameraRight) {
    cameraRight.addEventListener('click', () => setCameraPosition('right'));
    console.log("Camera right button listener attached");
  }

  const cameraOrbit = document.getElementById('camera-orbit');
  if (cameraOrbit) {
    cameraOrbit.addEventListener('click', () => setCameraPosition('orbit'));
    console.log("Camera orbit button listener attached");
  }

  // Light type selection
  const lightType = document.getElementById('light-type');
  if (lightType) {
    lightType.addEventListener('change', (e) => changeLightType(e.target.value));
    console.log("Light type dropdown listener attached");
  }

  // Light intensity slider
  const lightIntensity = document.getElementById('light-intensity');
  if (lightIntensity) {
    lightIntensity.addEventListener('input', (e) => setLightIntensity(e.target.value));
    console.log("Light intensity slider listener attached");
  }

  // Shadow toggle
  const shadowToggle = document.getElementById('toggle-shadows');
  if (shadowToggle) {
    shadowToggle.addEventListener('click', toggleShadows);
    console.log("Shadow toggle button listener attached");
  }

  // Reset position button
  const resetButton = document.getElementById('reset-position');
  if (resetButton) {
    resetButton.addEventListener('click', resetPosition);
    console.log("Reset position button listener attached");
  }

  // Grid toggle
  const gridToggle = document.getElementById('toggle-grid');
  if (gridToggle) {
    gridToggle.addEventListener('click', toggleGrid);
    console.log("Grid toggle button listener attached");
  }

  // Axis helper toggle
  const axisToggle = document.getElementById('toggle-axis-helper');
  if (axisToggle) {
    axisToggle.addEventListener('click', toggleAxesHelper);
    console.log("Axis helper toggle button listener attached");
  }

  // Background selection
  const backgroundSelect = document.getElementById('background-select');
  if (backgroundSelect) {
    backgroundSelect.addEventListener('change', (e) => changeBackground(e.target.value));
    console.log("Background select dropdown listener attached");
  }

  // Screenshot button
  const screenshotButton = document.getElementById('screenshot');
  if (screenshotButton) {
    screenshotButton.addEventListener('click', takeScreenshot);
    console.log("Screenshot button listener attached");
  }

  // Bloom effect toggle
  const bloomToggle = document.getElementById('toggle-bloom');
  if (bloomToggle) {
    bloomToggle.addEventListener('click', toggleBloom);
    console.log("Bloom toggle button listener attached");
  }

  // Depth of Field toggle
  const dofToggle = document.getElementById('toggle-dof');
  if (dofToggle) {
    dofToggle.addEventListener('click', toggleDOF);
    console.log("DOF toggle button listener attached");
  }

  // Particle system button
  const particleButton = document.getElementById('add-particles');
  if (particleButton) {
    particleButton.addEventListener('click', addParticles);
    console.log("Add particles button listener attached");
  }

  // Model loading button
  const modelButton = document.getElementById('load-model');
  if (modelButton) {
    modelButton.addEventListener('click', loadModel);
    console.log("Load model button listener attached");
  }

  // Model file input handler
  const modelInput = document.getElementById('model-input');
  if (modelInput) {
    modelInput.addEventListener('change', handleModelFile);
    console.log("Model input file handler attached");
  }

  // Physics toggle button
  const physicsButton = document.getElementById('toggle-physics');
  if (physicsButton) {
    physicsButton.addEventListener('click', togglePhysics);
    console.log("Physics toggle button listener attached");
  }

  // Log all buttons to help diagnose issues
  const buttons = document.querySelectorAll('button');
  console.log(`Found ${buttons.length} buttons in the document`);
  buttons.forEach((btn, i) => {
    console.log(`Button ${i}: id='${btn.id}', text='${btn.textContent}'`);
  });
}

// Add these functions after the existing functions

function changeMaterial(materialType) {
  console.log(`Changing material to ${materialType}`);
  
  // Save current color and opacity
  const currentColor = currentMaterial.color.getHex();
  const currentOpacity = currentMaterial.opacity;
  const currentWireframe = currentMaterial.wireframe || false;
  
  // Create new material based on type
  switch (materialType) {
    case 'basic':
      currentMaterial = new THREE.MeshBasicMaterial({
        color: currentColor,
        transparent: true,
        opacity: currentOpacity,
        wireframe: currentWireframe
      });
      break;
    case 'phong':
      currentMaterial = new THREE.MeshPhongMaterial({
        color: currentColor,
        transparent: true,
        opacity: currentOpacity,
        wireframe: currentWireframe,
        shininess: 30
      });
      break;
    case 'standard':
      currentMaterial = new THREE.MeshStandardMaterial({
        color: currentColor,
        transparent: true,
        opacity: currentOpacity,
        wireframe: currentWireframe,
        metalness: 0.2,
        roughness: 0.8
      });
      break;
    case 'lambert':
      currentMaterial = new THREE.MeshLambertMaterial({
        color: currentColor,
        transparent: true,
        opacity: currentOpacity,
        wireframe: currentWireframe
      });
      break;
    case 'toon':
      currentMaterial = new THREE.MeshToonMaterial({
        color: currentColor,
        transparent: true,
        opacity: currentOpacity,
        wireframe: currentWireframe
      });
      break;
  }
  
  // Apply to current object
  if (currentObject) {
    currentObject.material = currentMaterial;
    
    // Render to show changes if not animating
    if (!isAnimating) {
      renderer.render(scene, camera);
    }
  }
}

function changeColor(color) {
  console.log(`Changing color to ${color}`);
  if (currentMaterial) {
    currentMaterial.color.set(color);
    
    // Render to show changes if not animating
    if (!isAnimating) {
      renderer.render(scene, camera);
    }
  }
}

function setWireframe(enabled) {
  console.log(`Setting wireframe to ${enabled}`);
  if (currentMaterial) {
    currentMaterial.wireframe = enabled;
    
    // Render to show changes if not animating
    if (!isAnimating) {
      renderer.render(scene, camera);
    }
  }
}

function randomizeColor() {
  const randomColor = Math.floor(Math.random() * 0xffffff);
  const hexColor = '#' + randomColor.toString(16).padStart(6, '0');
  console.log(`Randomizing color to ${hexColor}`);
  
  // Update color picker element to show the new color
  const colorPicker = document.getElementById('color-picker');
  if (colorPicker) {
    colorPicker.value = hexColor;
  }
  
  // Apply the color to the material
  changeColor(randomColor);
}

function setOpacity(value) {
  console.log(`Setting opacity to ${value}`);
  if (currentMaterial) {
    currentMaterial.opacity = value;

    // Update the display value
    const opacityValue = document.getElementById('opacity-value');
    if (opacityValue) {
      opacityValue.textContent = value.toFixed(1);
    }

    // Render to show changes if not animating
    if (!isAnimating) {
      renderer.render(scene, camera);
    }
  }
}

function updatePerformanceStats() {
  // Update FPS
  const fpsElement = document.querySelector('#fps-counter span');
  if (fpsElement) {
    fpsElement.textContent = fps;
  }

  // Update vertex count
  const verticesElement = document.querySelector('#vertices-counter span');
  if (verticesElement && currentObject) {
    const geometry = currentObject.geometry;
    const vertexCount = geometry.attributes.position ? geometry.attributes.position.count : 0;
    verticesElement.textContent = vertexCount.toLocaleString();
  }

  // Update memory usage (if available)
  const memoryElement = document.querySelector('#memory-usage span');
  if (memoryElement && performance.memory) {
    const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
    memoryElement.textContent = `${memoryMB} MB`;
  }

  // Update object count
  const objectsElement = document.querySelector('#rendered-objects span');
  if (objectsElement) {
    let count = 0;
    scene.traverse((obj) => {
      if (obj.isMesh || obj.isLight) count++;
    });
    objectsElement.textContent = count;
  }
}

function setEnvironmentPreset(preset) {
  console.log(`Setting environment preset: ${preset}`);

  switch (preset) {
    case 'space':
      // Deep Space: Dark background with blue tint, minimal lighting
      scene.background = new THREE.Color(0x000a1f);
      ambientLight.color.setHex(0x1a1a3f);
      ambientLight.intensity = 0.3;
      directionalLight.color.setHex(0x88aaff);
      directionalLight.intensity = 0.7;
      scene.fog = new THREE.Fog(0x000a1f, 10, 50);
      break;

    case 'planet':
      // Alien Planet: Purple/green atmosphere
      scene.background = new THREE.Color(0x4a1a4a);
      ambientLight.color.setHex(0x663366);
      ambientLight.intensity = 0.5;
      directionalLight.color.setHex(0x88ff88);
      directionalLight.intensity = 1.2;
      scene.fog = new THREE.Fog(0x4a1a4a, 15, 60);
      break;

    case 'tech':
      // Tech Lab: Bright cyan/white, clinical lighting
      scene.background = new THREE.Color(0x1a2a3a);
      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = 0.6;
      directionalLight.color.setHex(0x4fc3f7);
      directionalLight.intensity = 1.5;
      scene.fog = null;
      break;
  }

  // Render to show changes if not animating
  if (!isAnimating) {
    renderer.render(scene, camera);
  }
}

function setAmbientLightIntensity(value) {
  console.log(`Setting ambient light intensity to ${value}`);
  if (ambientLight) {
    ambientLight.intensity = parseFloat(value);

    // Render to show changes if not animating
    if (!isAnimating) {
      renderer.render(scene, camera);
    }
  }
}

function setCameraZoom(value) {
  console.log(`Setting camera zoom to ${value}`);
  camera.position.z = parseFloat(value);

  // Update zoom value display
  const zoomValue = document.getElementById('zoom-value');
  if (zoomValue) {
    zoomValue.textContent = parseFloat(value).toFixed(1);
  }

  // Render to show changes if not animating
  if (!isAnimating) {
    renderer.render(scene, camera);
  }
}

function setCameraPosition(position) {
  console.log(`Setting camera to ${position} view`);

  switch (position) {
    case 'top':
      camera.position.set(0, 10, 0);
      camera.lookAt(0, 0, 0);
      break;
    case 'front':
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);
      break;
    case 'left':
      camera.position.set(-10, 0, 0);
      camera.lookAt(0, 0, 0);
      break;
    case 'right':
      camera.position.set(10, 0, 0);
      camera.lookAt(0, 0, 0);
      break;
    case 'orbit':
      camera.position.set(0, -2, 5);
      camera.lookAt(0, 0, 0);
      break;
  }

  // Reset orbit controls target
  controls.target.set(0, 0, 0);
  controls.update();

  // Render to show changes if not animating
  if (!isAnimating) {
    renderer.render(scene, camera);
  }
}

function toggleOrbitControls() {
  controls.enabled = !controls.enabled;
  console.log(`Orbit controls ${controls.enabled ? 'enabled' : 'disabled'}`);
}

function changeLightType(type) {
  console.log(`Changing light type to ${type}`);

  // Remove current dynamic light if it exists
  if (currentLight) {
    scene.remove(currentLight);
    currentLight = null;
  }

  // Create new light based on type
  switch (type) {
    case 'ambient':
      currentLight = new THREE.AmbientLight(0xffffff, 0.5);
      break;
    case 'directional':
      currentLight = new THREE.DirectionalLight(0xffffff, 1);
      currentLight.position.set(5, 5, 5);
      if (shadowsEnabled) {
        currentLight.castShadow = true;
        currentLight.shadow.mapSize.width = 1024;
        currentLight.shadow.mapSize.height = 1024;
      }
      break;
    case 'point':
      currentLight = new THREE.PointLight(0xffffff, 1, 100);
      currentLight.position.set(3, 3, 3);
      if (shadowsEnabled) {
        currentLight.castShadow = true;
      }
      break;
    case 'spot':
      currentLight = new THREE.SpotLight(0xffffff, 1);
      currentLight.position.set(5, 5, 5);
      currentLight.angle = Math.PI / 6;
      currentLight.penumbra = 0.1;
      if (shadowsEnabled) {
        currentLight.castShadow = true;
      }
      break;
  }

  // Add new light to scene
  if (currentLight) {
    scene.add(currentLight);
  }

  // Render to show changes if not animating
  if (!isAnimating) {
    renderer.render(scene, camera);
  }
}

function setLightIntensity(value) {
  console.log(`Setting light intensity to ${value}`);

  // Update intensity value display
  const intensityValue = document.getElementById('intensity-value');
  if (intensityValue) {
    intensityValue.textContent = parseFloat(value).toFixed(1);
  }

  // Update the current light's intensity
  if (currentLight && currentLight.intensity !== undefined) {
    currentLight.intensity = parseFloat(value);
  }

  // Also update the main directional light
  if (directionalLight) {
    directionalLight.intensity = parseFloat(value);
  }

  // Render to show changes if not animating
  if (!isAnimating) {
    renderer.render(scene, camera);
  }
}

function toggleShadows() {
  shadowsEnabled = !shadowsEnabled;
  console.log(`Shadows ${shadowsEnabled ? 'enabled' : 'disabled'}`);

  // Enable/disable shadow rendering
  renderer.shadowMap.enabled = shadowsEnabled;

  // Update current light shadows
  if (currentLight && currentLight.castShadow !== undefined) {
    currentLight.castShadow = shadowsEnabled;
  }

  // Update directional light shadows
  if (directionalLight) {
    directionalLight.castShadow = shadowsEnabled;
  }

  // Update object to receive shadows
  if (currentObject) {
    currentObject.castShadow = shadowsEnabled;
    currentObject.receiveShadow = shadowsEnabled;
  }

  // Render to show changes if not animating
  if (!isAnimating) {
    renderer.render(scene, camera);
  }
}

function resetPosition() {
  console.log("Resetting object and camera positions");

  // Reset object rotation and scale
  if (currentObject) {
    currentObject.rotation.set(0, 0, 0);
    currentObject.scale.set(1, 1, 1);
    currentObject.position.set(0, 0, 0);
  }

  // Reset camera position
  camera.position.set(0, -2, 5);
  camera.lookAt(0, 0, 0);

  // Reset controls
  controls.target.set(0, 0, 0);
  controls.update();

  // Reset scale slider
  const scaleSlider = document.getElementById('scale-slider');
  const scaleValue = document.getElementById('scale-value');
  if (scaleSlider) scaleSlider.value = 1;
  if (scaleValue) scaleValue.textContent = '1.0';

  // Render to show changes
  if (!isAnimating) {
    renderer.render(scene, camera);
  }
}

function toggleGrid() {
  if (gridHelper) {
    scene.remove(gridHelper);
    gridHelper = null;
    console.log("Grid helper removed");
  } else {
    gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
    scene.add(gridHelper);
    console.log("Grid helper added");
  }

  // Render to show changes if not animating
  if (!isAnimating) {
    renderer.render(scene, camera);
  }
}

function toggleAxesHelper() {
  if (axesHelper) {
    scene.remove(axesHelper);
    axesHelper = null;
    console.log("Axes helper removed");
  } else {
    axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    console.log("Axes helper added");
  }

  // Render to show changes if not animating
  if (!isAnimating) {
    renderer.render(scene, camera);
  }
}

function changeBackground(type) {
  console.log(`Changing background to ${type}`);

  switch (type) {
    case 'solid':
      scene.background = new THREE.Color(0x111111);
      break;
    case 'gradient':
      // Create a gradient using CSS on the canvas container
      const canvas = renderer.domElement;
      canvas.style.background = 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
      scene.background = null;
      break;
    case 'skybox':
      // Simple color skybox (in a real implementation, you'd load cube textures)
      scene.background = new THREE.Color(0x87ceeb);
      break;
  }

  // Render to show changes if not animating
  if (!isAnimating) {
    renderer.render(scene, camera);
  }
}

function takeScreenshot() {
  console.log("Taking screenshot");

  // Force a render to capture current state
  if (bloomEnabled || dofEnabled) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }

  // Get the canvas data as a data URL
  const dataURL = renderer.domElement.toDataURL('image/png');

  // Create a temporary link element to trigger download
  const link = document.createElement('a');
  link.download = `threejs-screenshot-${Date.now()}.png`;
  link.href = dataURL;
  link.click();

  console.log("Screenshot saved");
}

function toggleBloom() {
  bloomEnabled = !bloomEnabled;
  bloomPass.enabled = bloomEnabled;
  console.log(`Bloom effect ${bloomEnabled ? 'enabled' : 'disabled'}`);

  // Render to show changes if not animating
  if (!isAnimating) {
    if (bloomEnabled || dofEnabled) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }
}

function toggleDOF() {
  dofEnabled = !dofEnabled;
  bokehPass.enabled = dofEnabled;
  console.log(`Depth of Field effect ${dofEnabled ? 'enabled' : 'disabled'}`);

  // Render to show changes if not animating
  if (!isAnimating) {
    if (bloomEnabled || dofEnabled) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }
}

function addParticles() {
  // If particle system already exists, remove it
  if (particleSystem) {
    scene.remove(particleSystem);
    console.log("Removed existing particle system");
  }

  // Create particle geometry
  const particleCount = 1000;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    // Random positions in a sphere
    const radius = Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);

    // Random colors
    colors[i] = Math.random();
    colors[i + 1] = Math.random();
    colors[i + 2] = Math.random();
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Create particle material
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  // Create particle system
  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  console.log("Added particle system");

  // Render to show changes if not animating
  if (!isAnimating) {
    if (bloomEnabled || dofEnabled) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }
}

function loadModel() {
  console.log("Opening file picker for 3D model");

  const fileInput = document.getElementById('model-input');
  if (!fileInput) {
    console.error("File input not found");
    return;
  }

  // Trigger file picker
  fileInput.click();
}

function handleModelFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  console.log(`Loading model: ${file.name}`);

  // Remove previously loaded model
  if (loadedModel) {
    scene.remove(loadedModel);
    loadedModel = null;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const contents = e.target.result;
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'gltf' || extension === 'glb') {
      const loader = new GLTFLoader();
      loader.parse(contents, '', (gltf) => {
        loadedModel = gltf.scene;
        loadedModel.position.set(3, 0, 0); // Position to the side of main object
        scene.add(loadedModel);
        console.log("GLTF model loaded successfully");

        // Render to show changes
        if (!isAnimating) {
          if (bloomEnabled || dofEnabled) {
            composer.render();
          } else {
            renderer.render(scene, camera);
          }
        }
      }, (error) => {
        console.error("Error loading GLTF model:", error);
      });
    } else if (extension === 'obj') {
      const loader = new OBJLoader();
      try {
        loadedModel = loader.parse(contents);
        loadedModel.position.set(3, 0, 0); // Position to the side of main object
        scene.add(loadedModel);
        console.log("OBJ model loaded successfully");

        // Render to show changes
        if (!isAnimating) {
          if (bloomEnabled || dofEnabled) {
            composer.render();
          } else {
            renderer.render(scene, camera);
          }
        }
      } catch (error) {
        console.error("Error loading OBJ model:", error);
      }
    } else {
      console.error("Unsupported file format");
    }
  };

  if (extension === 'glb') {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
}

function togglePhysics() {
  physicsEnabled = !physicsEnabled;
  console.log(`Physics ${physicsEnabled ? 'enabled' : 'disabled'}`);

  if (physicsEnabled) {
    console.log("Note: Full physics simulation requires a physics engine like Cannon.js or Ammo.js");
    console.log("For now, applying simple gravity effect to current object");

    // Simple gravity simulation (placeholder)
    let velocity = 0;
    const gravity = -0.001;

    const physicsInterval = setInterval(() => {
      if (!physicsEnabled) {
        clearInterval(physicsInterval);
        return;
      }

      velocity += gravity;
      currentObject.position.y += velocity;

      // Bounce on ground
      if (currentObject.position.y < -2) {
        currentObject.position.y = -2;
        velocity = -velocity * 0.8; // Damping
      }

      // Render to show changes if not animating
      if (!isAnimating) {
        if (bloomEnabled || dofEnabled) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      }
    }, 16); // ~60 FPS
  }
}