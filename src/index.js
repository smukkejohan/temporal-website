//import 'bootstrap/js/dist/util'
//import 'bootstrap/js/dist/collapse'
//import 'bootstrap/js/dist/scrollspy'

import * as THREE from 'three'
import { Vector3, Vector2 } from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import TWEEN from '@tweenjs/tween.js'

import {visibleHeightAtZDepth, visibleWidthAtZDepth, getRandomArbitrary} from './lib'

import './style/main.scss'
import style from './style/_variables.scss'

var camera, scene, renderer, canvasContainer, stats
const center = new Vector3(0,0,0)

const initialCameraPosition = new Vector3(getRandomArbitrary(-200, 200),getRandomArbitrary(-200, 200),getRandomArbitrary(-80, 80))
if(debug) console.debug("initialCameraPosition", initialCameraPosition)

const baseCameraPosition = new Vector3(0,0,window.innerWidth/2) // Base camera distance of the viewport width

const primaryColor = new THREE.Color(style.backgroundcolor)
const backgroundColor = primaryColor.clone()
const edgeColor = new THREE.Color("hsl(0, 0%, 0%)")

var debug = false 

var mouseX = 0
var mouseY = 0
var targetX = 0
var targetY = 0

var loadingTween



function init() {

  canvasContainer = document.getElementById( 'three' )
  scene = new THREE.Scene()
  scene.background = backgroundColor

  renderer = new THREE.WebGLRenderer( { antialias: true } );

  renderer.setClearColor(scene.background, 1);
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  canvasContainer.appendChild( renderer.domElement );


  if(debug) {
    stats = new Stats();
    canvasContainer.appendChild( stats.dom );
  
    var gui = new GUI();
    gui.open();
  }


  var aspect = window.innerWidth / window.innerHeight
  camera = new THREE.PerspectiveCamera( 70, aspect, 1, 10000 );
  scene.add( camera );

  setupScene();

  // Controls
  var controls = new OrbitControls( camera, renderer.domElement );
  controls.damping = 0.1;
  controls.addEventListener( 'change', render );

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );
}

function setupScene() {

  camera.position.copy( baseCameraPosition );
  camera.lookAt(center);

  // TODO: increase relative size of logo on smaller display
  const sU = (window.innerWidth*0.06) // base scale unit, height of triangle at z 0  
  // if(window.innerWidth > 200)
  const hexagonAngle = Math.PI/6;
  const logoCircleRadius = sU*0.4;
  
  const widthAtZZero = visibleWidthAtZDepth(0, camera); 
  const heightAtZZero = visibleHeightAtZDepth(0, camera); 

  const lineWidthScale = 1.032; 

  const getHexagonVertex = (i, height, center, startAngle) => {
    let a = startAngle + (i * 2 * Math.PI / 6);
    return new Vector3(height*Math.cos(a) + center.x, height*Math.sin(a) + center.y, center.z);
  }

  [2.6, 1.6, -2.6, -1.1, 2.1, 0.9 ].map( (zF, i) => {
    //zF = 0 for debugging
    let geom = new THREE.Geometry();
    let v1 = center.clone()
    let v2 = getHexagonVertex(0+i, sU, center, hexagonAngle);
    let v3 = getHexagonVertex(1+i, sU, center, hexagonAngle);

    let triangle = new THREE.Triangle( v1, v2, v3 );
    let normal = new Vector3()
    triangle.getNormal(normal)

    geom.vertices.push(triangle.a);
    geom.vertices.push(triangle.b);
    geom.vertices.push(triangle.c);
    // TODO: try to optimize using buffer geometry
    /*var vertices = new Float32Array( 
      [c.clone(), A, B]
     );*/ 
    // itemSize = 3 because there are 3 values (components) per vertex
    //geom.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    geom.faces.push( new THREE.Face3( 0, 1, 2, normal ) );
    let bgGeom = geom.clone() // clone before any transformations
    
    if(i==2 || i==3) {
      const s = (lineWidthScale-1)*1.4;
      let edgeCenter = v2.clone().lerp(v3, 0.5)
      let newCenter = v1.clone().lerp(edgeCenter,s)
 
      let matrix = new THREE.Matrix4()
      matrix.setPosition(newCenter)
      matrix.scale(new Vector3( 1-s, 1-s, 1))
      geom.applyMatrix4( matrix )
    }

    let zT = sU*zF;
    let sW = visibleWidthAtZDepth(zT, camera) / widthAtZZero;
    let sH = visibleHeightAtZDepth(zT, camera) / heightAtZZero;

    geom.translate(0,0,zT)
    geom.scale(sW,sH,1)

    let mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: primaryColor })
    let mesh = new THREE.Mesh( geom, mat)
    scene.add(mesh)

    let bgZT = zT - sU*0.1
    let bgSW = visibleWidthAtZDepth(bgZT, camera) / widthAtZZero * lineWidthScale;
    let bgSH = visibleHeightAtZDepth(bgZT, camera) / heightAtZZero * lineWidthScale;

    bgGeom.translate(0,0,bgZT)
    bgGeom.scale(bgSW,bgSH,1)
    
    bgGeom.translate(0,0,-sU*0.1)
    bgGeom.scale(lineWidthScale, lineWidthScale, 1)
    let bgmat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: edgeColor })
    let bgMesh = new THREE.Mesh( bgGeom, bgmat);

    scene.add(bgMesh)
    return geom; 
  }) 
  
  var sphereGeometry = new THREE.SphereBufferGeometry( logoCircleRadius, 64, 24, 24 );
  let zT = 0//sU*-0.4;
  let s = visibleHeightAtZDepth(zT, camera) / heightAtZZero;
  sphereGeometry.translate(0,0,zT)
  sphereGeometry.scale(s,s,1)
  
  var sphere = new THREE.Mesh( sphereGeometry, new THREE.MeshBasicMaterial( { color: edgeColor, side: THREE.DoubleSide } ) );
  scene.add( sphere );

}

function animate(time) {
  requestAnimationFrame( animate );

  const radius = baseCameraPosition.z;
  const baseAngle = Math.PI*0.5;

  const mouseTravelSquared = mousePos.distanceToSquared(lastMousePos)
  //const mouseTravel = mousePos.distanceTo(lastMousePos)
  const mouseDelta = new Vector2().subVectors(lastMousePos, mousePos);

  TWEEN.update(time)

  // TODO: if no controlled animation is running and not using orbit controls:

  // mouseDeltaActivity 
  /*activity = (activity + (mouseTravelSquared*0.0001)) * 0.88 // use time delta to smooth speed with framerate
  const aX = activity * Math.PI + baseAngle; // map activity to a usefull normalized range -1 to 1 
  camera.position.set(Math.cos(aX) * radius, baseCameraPosition.y, baseCameraPosition.z - (2 * activity));
  */

  //const angle = time * 2.5 * Math.PI / 180; // rotate continuesly with time

  // rotate 180 from center to edge on x and y
  /*
  const aX = (mouseX / (window.innerWidth)) * Math.PI + baseAngle;
  const aY = (mouseY / (window.innerHeight)) * Math.PI + baseAngle;
  camera.position.set(Math.cos(aX) * radius, Math.cos(aY) * radius, (Math.sin(aX) * Math.sin(aY)) * radius);
  */
  // 

  camera.lookAt(center);

  lastMousePos.set(mousePos.x, mousePos.y)

  render();

  if(debug) {
    stats.update();
  }

}

var angleX = 0
var angleY = 0
var angleXmod = 0
var angleYmod = 0

var lastMousePos = new Vector2(0, 0)
var mousePos = new Vector2(0, 0)

var activity = 0;

function render() {
  renderer.render( scene, camera );
}

function onWindowResize() {
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  // TODO: update scaling of logo
  camera.updateProjectionMatrix()
  // setupScene() - 

}

function onDocumentMouseMove( event ) {
  mouseX = ( event.clientX - window.innerWidth/2 )
  mouseY = ( event.clientY - window.innerHeight/2 )
  mousePos.set(mouseX, mouseY)
}


$( document ).ready(function() {
  init();

  // Load with a slight zoom animation
  camera.position.copy(initialCameraPosition)
  
  const p = baseCameraPosition.toArray()
  loadingTween = new TWEEN.Tween(camera.position).to({
    x: p[0],
    y: p[1],
    z: p[2]
  }, 2000)

  loadingTween.start()

  animate();
});


function isScrolledIntoView(elem){
  var $elem = $(elem);
  var $window = $(window);

  var docViewTop = $window.scrollTop();
  var docViewBottom = docViewTop + $window.height();

  var elemTop = $elem.offset().top;
  var elemBottom = elemTop + $elem.height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function scale(num, in_min, in_max, out_min, out_max) {
  if(num < in_min) num = in_min;
  if(num > in_max) num = in_max;

  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
