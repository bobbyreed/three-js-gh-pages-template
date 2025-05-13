//core lirbaries
import * as THREE from 'three';

// Import addons (using the mapping from above)
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useState } from 'react';

const start = document.getElementById("start");
start.addEventListener("click", function() { startAnimation(entryAnimation); });
const stop = document.getElementById("stop");
stop.addEventListener("click", function() { stopAnimation(); });
const yRight = document.getElementById("yR");
yRight.addEventListener("click", function() { moveObject(.1); });
const yLeft = document.getElementById("yL");
yLeft.addEventListener("click", function() { moveObject(-.1)});
const switchObject = document.getElementById("object");
switchObject.addEventListener("click", function() { nextObject() });
const moreTransparent = document.getElementById("moreO");
stop.addEventListener("click", function() { Opacity(-.1) });
const lessTransparent = document.getElementById("lessO");
yRight.addEventListener("click", function() { Opacity(.1) });
const switchColor = document.getElementById("yL");
yLeft.addEventListener("click", function() { moveObject(-.1)});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();

//unused now but need for interactivity
  //const controls = new OrbitControls(camera, renderer.domElement);

//unused now but need for bringing in gltfs
  //const loader = new GLTFLoader();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const primitives = [];
var currentObject = 0;

primitives[0] = new THREE.BoxGeometry( 1, 1, 1 );
primitives[1] = new THREE.CapsuleGeometry( 1, 1, 1);
primitives[2] = new THREE.CircleGeometry( 1, 1, 1 );
primitives[3] = new THREE.ConeGeometry( 1, 1, 1);
primitives[4] = new THREE.CylinderGeometry( 1, 1, 1 );
primitives[5] = new THREE.DodecahedronGeometry( 1, 1, 1);
primitives[6] = new THREE.EdgesGeometry( 1, 1, 1 );
primitives[7] = new THREE.ExtrudeGeometry( 1, 1, 1);
primitives[8] = new THREE.IcosahedronGeometry( 1, 1, 1 );
primitives[9] = new THREE.LatheGeometry( 1, 1, 1);
primitives[10] = new THREE.OctahedronGeometry( 1, 1, 1 );
primitives[11] = new THREE.PlaneGeometry( 1, 1, 1);
primitives[12] = new THREE.PolyhedronGeometry( 1, 1, 1 );
primitives[13] = new THREE.RingGeometry( 1, 1, 1);
primitives[14] = new THREE.ShapeGeometry( 1, 1, 1 );
primitives[15] = new THREE.SphereGeometry( 1, 1, 1);
primitives[16] = new THREE.TetrahedronGeometry( 1, 1, 1);
primitives[17] = new THREE.TorusGeometry( 1, 1, 1 );
primitives[18] = new THREE.TorusKnotGeometry( 1, 1, 1);
primitives[19] = new THREE.TubeGeometry( 1, 1, 1 );
primitives[20] = new THREE.WireframeGeometry( 1, 1, 1);

const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
material.transparent(true);
material.opacity = 0.5;
const [primitive, setPrimitive] = useState(new THREE.Mesh( geometry, material ));
scene.add( primitive );

camera.position.z = 5;

var canAnimate = true;
function entryAnimation() {
  canAnimate = true;
  if(canAnimate){
    primitive.rotation.x += 0.01;
    primitive.rotation.y += 0.01;
    renderer.render( scene, camera );
  }
    
  }
  renderer.setAnimationLoop( entryAnimation );

function stopAnimation(){
  renderer.setAnimationLoop( canAnimate = false )
}

function startAnimation(animation){
  renderer.setAnimationLoop( animation )
}

function moveObject(move) {
  canAnimate = false;
  cube.rotation.y += move;
  renderer.render( scene, camera );
  renderer.setAnimationLoop( moveCamera );
}

function nextObject(){
  currentObject ++;
  setPrimitive()
  startAnimation(entryAnimation);
}

function Opacity(amount){
  material.opacity(amount);
}


