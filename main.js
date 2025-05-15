// Core libraries
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';

// Initialize core Three.js components
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Append renderer to viewport
const viewport = document.getElementById('viewport') || document.body;
viewport.appendChild(renderer.domElement);

// Add stats for performance monitoring
const stats = new Stats();
const statsContainer = document.getElementById('performance-stats');
statsContainer.appendChild(stats.dom);

// Initialize orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Configure camera initial position
camera.position.z = 5;

// Set up basic lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Set up grid and axes helpers
const gridHelper = new THREE.GridHelper(10, 10);
gridHelper.visible = false;
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
axesHelper.visible = false;
scene.add(axesHelper);

// Post-processing effects setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Bloom pass
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
bloomPass.enabled = false;
composer.addPass(bloomPass);

// Depth of Field pass
const bokehPass = new BokehPass(scene, camera, {
  focus: 5,
  aperture: 0.025,
  maxblur: 0.01
});
bokehPass.enabled = false;
composer.addPass(bokehPass);

// Initialize all primitive geometries
const primitives = [];
primitives[0] = new THREE.BoxGeometry(1, 1, 1);
primitives[1] = new THREE.SphereGeometry(0.7, 32, 16);
primitives[2] = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
primitives[3] = new THREE.ConeGeometry(0.7, 1, 32);
primitives[4] = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
primitives[5] = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16);
primitives[6] = new THREE.DodecahedronGeometry(0.7, 0);
primitives[7] = new THREE.OctahedronGeometry(0.7, 0);
primitives[8] = new THREE.TetrahedronGeometry(0.7, 0);
primitives[9] = new THREE.IcosahedronGeometry(0.7, 0);
primitives[10] = new THREE.PlaneGeometry(1, 1);
primitives[11] = new THREE.RingGeometry(0.3, 0.7, 32);
primitives[12] = new THREE.CircleGeometry(0.7, 32);
primitives[13] = new THREE.CapsuleGeometry(0.5, 0.5, 4, 8);
primitives[14] = new THREE.TubeGeometry(
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.5, -0.5, -0.5),
    new THREE.Vector3(0.5, 0.5, 0.5)
  ]),
  64, 0.2, 8, false
);
primitives[15] = new THREE.ShapeGeometry(
  new THREE.Shape().moveTo(0, 0).lineTo(0, 1).lineTo(1, 1).lineTo(1, 0).closePath()
);
primitives[16] = new THREE.ExtrudeGeometry(
  new THREE.Shape().moveTo(0, 0).lineTo(0, 0.5).lineTo(0.5, 0.5).lineTo(0.5, 0).closePath(),
  { depth: 0.5, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 }
);
primitives[17] = new THREE.LatheGeometry(
  [new THREE.Vector2(0, 0), new THREE.Vector2(0.5, 0.5), new THREE.Vector2(0, 1)],
  12
);
primitives[18] = new THREE.PolyhedronGeometry(
  [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1],
  [0, 2, 1, 0, 3, 2, 0, 1, 3, 1, 2, 3],
  0.7
);
primitives[19] = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
primitives[20] = new THREE.WireframeGeometry(new THREE.SphereGeometry(0.7, 16, 8));

// Create the material and initialize colors
let currentMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  transparent: true,
  opacity: 0.5,
  metalness: 0.2,
  roughness: 0.8
});

// Create the current object
let currentObjectIndex = 0;
let currentObject = new THREE.Mesh(primitives[currentObjectIndex], currentMaterial);
currentObject.castShadow = true;
currentObject.receiveShadow = true;
scene.add(currentObject);

// Update UI to reflect current state
updateObjectInfoDisplay();

// Animation state
let isAnimating = false;
let animationFrameId = null;

// Default animation function
function animate() {
  if (!isAnimating) return;
  
  stats.begin();
  
  currentObject.rotation.x += 0.01;
  currentObject.rotation.y += 0.01;
  
  controls.update();
  
  // Use composer for post-processing if any effect is enabled
  if (bloomPass.enabled || bokehPass.enabled) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
  
  stats.end();
  
  animationFrameId = requestAnimationFrame(animate);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Utility Functions
function updateObjectInfoDisplay() {
  const objectNames = [
    'Cube', 'Sphere', 'Cylinder', 'Cone', 'Torus', 
    'Torus Knot', 'Dodecahedron', 'Octahedron', 'Tetrahedron', 'Icosahedron',
    'Plane', 'Ring', 'Circle', 'Capsule', 'Tube',
    'Shape', 'Extrude', 'Lathe', 'Polyhedron', 'Edges',
    'Wireframe'
  ];
  
  document.getElementById('current-object-name').textContent = objectNames[currentObjectIndex];
  
  // Also update the select dropdown
  const objectSelect = document.getElementById('object-select');
  if (objectSelect && objectSelect.value !== currentObjectIndex.toString()) {
    objectSelect.value = currentObjectIndex.toString();
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
  currentObject.castShadow = true;
  currentObject.receiveShadow = true;
  scene.add(currentObject);
  
  // Update UI
  updateObjectInfoDisplay();
}

function changeMaterial(materialType) {
  // Save current color and opacity
  const currentColor = currentMaterial.color.getHex();
  const currentOpacity = currentMaterial.opacity;
  const currentWireframe = currentMaterial.wireframe;
  
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
  
  // Apply material to current object
  currentObject.material = currentMaterial;
}

function changeColor(color) {
  currentMaterial.color.set(color);
}

function setWireframe(enabled) {
  currentMaterial.wireframe = enabled;
}

function setOpacity(value) {
  currentMaterial.opacity = value;
  document.getElementById('opacity-value').textContent = value.toFixed(1);
}

function setScale(value) {
  currentObject.scale.set(value, value, value);
  document.getElementById('scale-value').textContent = value.toFixed(1);
}

function startAnimation() {
  if (!isAnimating) {
    isAnimating = true;
    animate();
  }
}

function stopAnimation() {
  isAnimating = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function resetObjectPosition() {
  currentObject.position.set(0, 0, 0);
  currentObject.rotation.set(0, 0, 0);
  currentObject.scale.set(1, 1, 1);
  
  // Reset UI sliders
  document.getElementById('scale-slider').value = 1;
  document.getElementById('scale-value').textContent = '1.0';
  
  // Render a frame to show the reset
  renderer.render(scene, camera);
}

function toggleGrid() {
  gridHelper.visible = !gridHelper.visible;
  renderer.render(scene, camera);
}

function toggleAxes() {
  axesHelper.visible = !axesHelper.visible;
  renderer.render(scene, camera);
}

function toggleBloom() {
  bloomPass.enabled = !bloomPass.enabled;
  
  // If bloom is enabled, make sure we use the composer
  if (isAnimating || bloomPass.enabled) {
    renderer.render(scene, camera);
    composer.render();
  }
}

function toggleDepthOfField() {
  bokehPass.enabled = !bokehPass.enabled;
  
  // If DoF is enabled, make sure we use the composer
  if (isAnimating || bokehPass.enabled) {
    renderer.render(scene, camera);
    composer.render();
  }
}

function setLightType(type) {
  // Remove current light
  scene.remove(directionalLight);
  
  // Create new light based on type
  switch (type) {
    case 'ambient':
      ambientLight.intensity = parseFloat(document.getElementById('light-intensity').value);
      break;
    case 'directional':
      directionalLight = new THREE.DirectionalLight(0xffffff, 
        parseFloat(document.getElementById('light-intensity').value));
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      break;
    case 'point':
      directionalLight = new THREE.PointLight(0xffffff, 
        parseFloat(document.getElementById('light-intensity').value));
      directionalLight.position.set(2, 2, 2);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      break;
    case 'spot':
      directionalLight = new THREE.SpotLight(0xffffff, 
        parseFloat(document.getElementById('light-intensity').value));
      directionalLight.position.set(2, 5, 2);
      directionalLight.angle = Math.PI / 6;
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      break;
  }
  
  // Render to show changes
  renderer.render(scene, camera);
}

function setLightIntensity(value) {
  ambientLight.intensity = value;
  
  if (directionalLight) {
    directionalLight.intensity = value;
  }
  
  document.getElementById('intensity-value').textContent = value.toFixed(1);
  renderer.render(scene, camera);
}

function toggleShadows() {
  renderer.shadowMap.enabled = !renderer.shadowMap.enabled;
  
  if (directionalLight) {
    directionalLight.castShadow = renderer.shadowMap.enabled;
  }
  
  currentObject.castShadow = renderer.shadowMap.enabled;
  currentObject.receiveShadow = renderer.shadowMap.enabled;
  
  renderer.render(scene, camera);
}

function setCameraPosition(position) {
  // Reset orbit controls
  controls.reset();
  
  // Set camera based on position name
  switch (position) {
    case 'top':
      camera.position.set(0, 5, 0);
      camera.lookAt(0, 0, 0);
      break;
    case 'front':
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      break;
    case 'left':
      camera.position.set(-5, 0, 0);
      camera.lookAt(0, 0, 0);
      break;
    case 'right':
      camera.position.set(5, 0, 0);
      camera.lookAt(0, 0, 0);
      break;
  }
  
  renderer.render(scene, camera);
}

function toggleOrbitControls() {
  controls.enabled = !controls.enabled;
}

function setZoom(value) {
  camera.position.z = value;
  document.getElementById('zoom-value').textContent = value.toFixed(1);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function takeScreenshot() {
  // Render a frame
  if (bloomPass.enabled || bokehPass.enabled) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
  
  // Create a download link
  const link = document.createElement('a');
  link.download = 'three-js-screenshot.png';
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
}

function randomizeColor() {
  const randomColor = Math.random() * 0xffffff;
  currentMaterial.color.setHex(randomColor);
  document.getElementById('color-picker').value = '#' + randomColor.toString(16).padStart(6, '0');
  renderer.render(scene, camera);
}

function setBackgroundType(type) {
  switch (type) {
    case 'solid':
      scene.background = new THREE.Color(0x000000);
      break;
    case 'gradient':
      // Create a simple gradient using a shader material on a plane behind everything
      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      
      const fragmentShader = `
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(vUv.x * 0.2, vUv.y * 0.4, 0.5, 1.0);
        }
      `;
      
      const bgGeometry = new THREE.PlaneGeometry(100, 100);
      const bgMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.BackSide
      });
      
      const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
      bgMesh.position.z = -10;
      bgMesh.name = 'background';
      
      // Remove any existing background mesh
      const existingBg = scene.getObjectByName('background');
      if (existingBg) scene.remove(existingBg);
      
      scene.add(bgMesh);
      scene.background = null;
      break;
    case 'skybox':
      const cubeTextureLoader = new THREE.CubeTextureLoader();
      cubeTextureLoader.setPath('https://threejs.org/examples/textures/cube/Park3Med/');
      
      const textureCube = cubeTextureLoader.load([
        'px.jpg', 'nx.jpg',
        'py.jpg', 'ny.jpg',
        'pz.jpg', 'nz.jpg'
      ]);
      
      scene.background = textureCube;
      
      // Remove any existing background mesh
      const existingBgMesh = scene.getObjectByName('background');
      if (existingBgMesh) scene.remove(existingBgMesh);
      break;
  }
  
  renderer.render(scene, camera);
}

function loadModel() {
  document.getElementById('model-input').click();
}

// Set up GLTF loader for 3D models
const gltfLoader = new GLTFLoader();

function handleModelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const contents = e.target.result;
    
    // Remove current object
    scene.remove(currentObject);
    
    // Load the model
    const objectUrl = URL.createObjectURL(file);
    
    gltfLoader.load(objectUrl, function(gltf) {
      currentObject = gltf.scene;
      currentObject.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
      currentObject.position.set(0, 0, 0);
      
      // Apply some material adjustments if needed
      currentObject.traverse(function(child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      scene.add(currentObject);
      renderer.render(scene, camera);
      
      // Clean up the URL
      URL.revokeObjectURL(objectUrl);
      
      // Update UI
      document.getElementById('current-object-name').textContent = file.name;
    });
  };
  
  reader.readAsArrayBuffer(file);
}

// Event Listeners
document.getElementById('start-animation').addEventListener('click', startAnimation);
document.getElementById('stop-animation').addEventListener('click', stopAnimation);
document.getElementById('reset-position').addEventListener('click', resetObjectPosition);

document.getElementById('next-object').addEventListener('click', () => changeObject(currentObjectIndex + 1));
document.getElementById('prev-object').addEventListener('click', () => changeObject(currentObjectIndex - 1));
document.getElementById('object-select').addEventListener('change', (e) => changeObject(parseInt(e.target.value)));

document.getElementById('material-type').addEventListener('change', (e) => changeMaterial(e.target.value));
document.getElementById('color-picker').addEventListener('change', (e) => changeColor(e.target.value));
document.getElementById('randomize-color').addEventListener('click', randomizeColor);

document.getElementById('wireframe-toggle').addEventListener('change', (e) => setWireframe(e.target.checked));
document.getElementById('opacity-slider').addEventListener('input', (e) => setOpacity(parseFloat(e.target.value)));
document.getElementById('scale-slider').addEventListener('input', (e) => setScale(parseFloat(e.target.value)));

document.getElementById('toggle-grid').addEventListener('click', toggleGrid);
document.getElementById('toggle-axis-helper').addEventListener('click', toggleAxes);
document.getElementById('background-select').addEventListener('change', (e) => setBackgroundType(e.target.value));

document.getElementById('toggle-bloom').addEventListener('click', toggleBloom);
document.getElementById('toggle-dof').addEventListener('click', toggleDepthOfField);
document.getElementById('screenshot').addEventListener('click', takeScreenshot);

document.getElementById('zoom-slider').addEventListener('input', (e) => setZoom(parseFloat(e.target.value)));
document.getElementById('camera-top').addEventListener('click', () => setCameraPosition('top'));
document.getElementById('camera-front').addEventListener('click', () => setCameraPosition('front'));
document.getElementById('camera-left').addEventListener('click', () => setCameraPosition('left'));
document.getElementById('camera-right').addEventListener('click', () => setCameraPosition('right'));
document.getElementById('camera-orbit').addEventListener('click', toggleOrbitControls);

document.getElementById('light-type').addEventListener('change', (e) => setLightType(e.target.value));
document.getElementById('light-intensity').addEventListener('input', (e) => setLightIntensity(parseFloat(e.target.value)));
document.getElementById('toggle-shadows').addEventListener('click', toggleShadows);

document.getElementById('load-model').addEventListener('click', loadModel);
document.getElementById('model-input').addEventListener('change', handleModelUpload);

// Initialize with a single render
renderer.render(scene, camera);