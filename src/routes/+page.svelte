<script lang="ts">
let debug = false 

import * as THREE from 'three'
import { Vector3, Vector2 } from 'three'
//import Stats from 'three/examples/jsm/libs/stats.module'
//import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import TWEEN from '@tweenjs/tween.js'
//import { debounce } from 'lodash'

import {visibleHeightAtZDepth, visibleWidthAtZDepth, getRandomNumber} from '$lib/utils'

import { onMount } from 'svelte'

import '../style/main.scss'
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
//let stats;
let canvasContainer: HTMLElement;

const center = new Vector3(0,0,0)

const initialCameraPosition = new Vector3(getRandomNumber(-200, 200),getRandomNumber(-200, 200),getRandomNumber(-80, 80))
//if(debug) console.debug("initialCameraPosition", initialCameraPosition)

const primaryColor = new THREE.Color(0.98, 0.737, 0.776)
const backgroundColor = primaryColor.clone()
const edgeColor = new THREE.Color("hsl(0, 0%, 0%)")

let mouseX, mouseY = 0
let loadingTween

function init() {
  canvasContainer = document.getElementById( 'three' )!
  scene = new THREE.Scene()
  scene.background = backgroundColor

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor(scene.background, 1);
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  canvasContainer.appendChild( renderer.domElement );

  /*if(debug) {
    stats = new Stats();
    canvasContainer.appendChild( stats.dom );
    let gui = new GUI();
    gui.open();
  }*/

  let aspect = window.innerWidth / window.innerHeight
  camera = new THREE.PerspectiveCamera( 70, aspect, 1, 10000 );
  scene.add( camera );

  setupScene();

  // Controls
  /*let controls = new OrbitControls( camera, renderer.domElement );
  controls.damping = 0.1;
  controls.addEventListener( 'change', render );
  */

  document.addEventListener( 'mousemove', onDocumentMouseMove, false )
  window.addEventListener( 'resize', onWindowResize, false )

  if (window.DeviceOrientationEvent) {
    window.addEventListener('orientationchange', onOrientationChange, false)
  }
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

  const getHexagonVertex = (i: number, height: number, center: {x: number, y: number, z:number}, startAngle: number) => {
    let a = startAngle + (i * 2 * Math.PI / 6);
    return new Vector3(height*Math.cos(a) + center.x, height*Math.sin(a) + center.y, center.z);
  }

  [2.6, 1.6, -2.6, -1.1, 2.1, 0.9 ].map( (zF, i) => {
    //zF = 0 for debugging
    let geom = new THREE.BufferGeometry();
    let v1 = center.clone()
    let v2 = getHexagonVertex(0+i, sU, center, hexagonAngle);
    let v3 = getHexagonVertex(1+i, sU, center, hexagonAngle);

    let triangle = new THREE.Triangle( v1, v2, v3 );
    let normal = new Vector3()
    triangle.getNormal(normal)

    geom.setFromPoints([triangle.a, triangle.b, triangle.c]);
    //geom.vertices.push(triangle.a);
    //geom.vertices.push(triangle.b);
    //geom.vertices.push(triangle.c);
    // TODO: try to optimize using buffer geometry
    /*let vertices = new Float32Array( 
      [c.clone(), A, B]
     );*/ 
    // itemSize = 3 because there are 3 values (components) per vertex
    //geom.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    //TODO geom.faces.push( new THREE.Face3( 0, 1, 2, normal ) );
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
  
  let sphereGeometry = new THREE.SphereGeometry( logoCircleRadius, 64, 24, 24 );
  let zT = 0//sU*-0.4;
  let s = visibleHeightAtZDepth(zT, camera) / heightAtZZero;
  sphereGeometry.translate(0,0,zT)
  sphereGeometry.scale(s,s,1)
  
  let sphere = new THREE.Mesh( sphereGeometry, new THREE.MeshBasicMaterial( { color: edgeColor, side: THREE.DoubleSide } ) );
  scene.add( sphere );

}

function animate(time: number = 0) {
  requestAnimationFrame( animate );

  //const radius = baseCameraPosition.z;
  //const baseAngle = Math.PI*0.5;

  //const mouseTravelSquared = mousePos.distanceToSquared(lastMousePos)
  //const mouseTravel = mousePos.distanceTo(lastMousePos)
  //const mouseDelta = new Vector2().subVectors(lastMousePos, mousePos);

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

  /*if(debug) {
    stats.update();
  }*/

}

/*let angleX = 0
let angleY = 0
let angleXmod = 0
let angleYmod = 0*/

let lastMousePos = new Vector2(0, 0)
let mousePos = new Vector2(0, 0)

//let activity = 0;

function render() {
  renderer.render( scene, camera );
}


/*
// TODO:
function resize() {

  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;

  // We execute the same script as before
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  // TODO: update scaling of logo
  camera.updateProjectionMatrix()
  // setupScene() - 

}

let resizeDebounced = debounce(resize, 20)*/

function onOrientationChange() {
  //console.log(screen.orientation);
  // TODO: resize()
}

function onWindowResize() {
  //console.log("resize")
  let size = new Vector2();
  renderer.getSize(size);

  // Avoid resizing because of address bar on mobile by not resizing on vertical expansion 
  if(Math.abs(size.x - window.innerWidth) == 0 && Math.abs(size.y - window.innerHeight) < 100)  {
    return
  }

  //TODO: resizeDebounced()
 
}


function onDocumentMouseMove( event ) {
  mouseX = ( event.clientX - window.innerWidth/2 )
  mouseY = ( event.clientY - window.innerHeight/2 )
  mousePos.set(mouseX, mouseY)
}

/*function isScrolledIntoView(elem){
  let $elem = $(elem);
  let $window = $(window);

  let docViewTop = $window.scrollTop();
  let docViewBottom = docViewTop + $window.height();

  let elemTop = $elem.offset().top;
  let elemBottom = elemTop + $elem.height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}*/

let baseCameraPosition: THREE.Vector3;
let vh: number;

onMount(() => {

    baseCameraPosition = new Vector3(0,0,window.innerWidth/2) // Base camera distance of the viewport width
    
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);

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

})


</script>

<section id="about">
  
    <!--<header>
      <h1>About</h1>
    </header>-->

    <div class="text">
    
      <p>
      <em>Temporal studio</em> is Industrial Designer <em>Harvey Bewley</em> and Creative Programmer and Developer <em>Johan Bichel Lindegaard</em>.</p>
      <p>Combining significant experience working in art and technology, product design, medical design, interactive installations, and design research.</p> 


      <p>At our core, we are hands-on prototypers building objects that blur the boundaries of the digital and the physical.</p>
<p>We specialise in creative applications of new technologies, delivering projects that fall in the spaces between tangible objects and intangible digital worlds.</p>
    
  </div>
    <figure>
      <img src="https://media.giphy.com/media/dVd8vAqTsHXxFSfxYE/giphy.gif"
      alt="Workshop">
    </figure>
  </section>

  <section id="services">

  <section id="form-giving">
    <header><h3>
      Form-giving + Prototyping
    </h3></header>

    <div class="text">

      <p>
        From first sketch to final assembly we make decisions on form, ergonomics, texture, and material suitability.
      </p>
      
      <p>
        We therefore put enormous value on our ability to shape concepts and build ideas with our hands, moving fluidly between low-fi sketching and rapid prototyping. 
      </p>
      <p>
      We have access to laser cutting, 3D printing and machining - and a close network of talented fabricators and crafts people to work with along the way. 
      </p>
    </div>

    <figure>
      <img src="https://media.giphy.com/media/ehOr9caKsFfV92IMdl/giphy.gif"
      alt="Lathe">
    </figure>
  </section>

  <section id="electronics">
    
    <header><h3>Electronics + Assembly</h3></header>
    <div class="text"><p>
      We select physical electronic components, wiring, layouts and mounting fixtures,
      first and foremost for their functionality but also as a medium for expression and communication.
      Taking great care to utilise electronics and components as a tool in the design and form-giving process.
    </p></div>

    <figure>
      <img src="https://media.giphy.com/media/Mc1Escz79Edq7CNpeH/giphy.gif"
      alt="Soldering">
    </figure>
  </section>

  <section id="code">
    <header><h3>Programming + Software</h3></header>
    <div class="text">
      <p>
        Sketching with code is an inherent part of our process. Enabling rapid development with functional prototypes and interactive sketches.    
      </p>
        <p>We have particular experience developing for interactive and generative applications. Talking to sensors, creating dynamic interfaces and visualizing data.</p>
        <p>
        We are fluent in a number of languages and tools and write software for embedded microcontrollers, installations and web. Our favourite tools include 
        <em>c</em> / <em>arduino</em> / <em>teensy</em>, <br/>
        <em>c++</em> / <em>openframeworks</em>, <br/>
        <em>javascript</em> / <em>node.js</em>, <br/>
        and <em>python</em>. 
      </p>
    </div>
    <figure>
      <img src="https://media.giphy.com/media/MBHVblfkrOa4Gu2d6K/giphy.gif"
      alt="Lines and rotation">
    </figure>
  </section>

</section>