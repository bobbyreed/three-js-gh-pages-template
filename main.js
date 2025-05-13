//core lirbaries
import * as THREE from 'three';

// Import addons (using the mapping from above)
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const stop = document.getElementById("stop");
stop.addEventListener("click", function() { stopAnimation(); });
const yRight = document.getElementById("yR");
yRight.addEventListener("click", function() { moveCamera(1); });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
const loader = new GLTFLoader();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

var canAnimate = true;
function entryAnimation() {
  if(canAnimate){
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
  }
    
  }
  renderer.setAnimationLoop( entryAnimation );

function stopAnimation(){
  renderer.setAnimationLoop( canAnimate = false )
}

function moveCamera(move) {
  canAnimate = false;
  controls.camera.position.y += move;
  renderer.render( scene, camera );
  renderer.setAnimationLoop( moveCamera );
}



