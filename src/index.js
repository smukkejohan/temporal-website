import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/scrollspy';

import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader'

require('./3d/logo_distortedthinwall.stl')
require('./3d/logo_distortedsurfaces.stl')
require('./3d/cylinder_cutout_logo.stl')

var container, stats;
var camera, scene, renderer;

function init() {

  container = document.getElementById( 'container' );
  scene = new THREE.Scene();
  scene.background = new THREE.Color( "pink" );
  
  var aspect = window.innerWidth / window.innerHeight;
  const scaleFactor = (window.innerWidth*0.01)

  var frustumSize = 1000;

  //camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
  camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 8000 );
  
  //Vector3 {x: 621.1727658528029, y: 618.494835847818, z: 619.7649013879068}
  camera.position.set( 220, 220, 220 );
  camera.lookAt(0,0,0);

  scene.add( camera );

  scene.add( new THREE.AmbientLight( 'white' ) );
  var light = new THREE.SpotLight( 0xffffff, 1.5 );
  light.position.set( 500, 500, 1500 );
  light.angle = Math.PI * 0.2;
  light.castShadow = true;
  light.shadow.camera.near = 200;
  light.shadow.camera.far = 2000;
  light.shadow.bias = - 0.000222;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  //scene.add( light );

  /*var planeGeometry = new THREE.PlaneBufferGeometry( 2000, 2000 );
  planeGeometry.rotateX( - Math.PI / 2 );
  var planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );

  var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.position.y = - 200;
  plane.receiveShadow = true;
  scene.add( plane );
*/

  // size 
  // 2/3 
  const sphereRadius = (2/2) * 10 * scaleFactor;
  const cubeLength = 3 * 10 * scaleFactor;

  var geometryCube = new THREE.BoxGeometry( cubeLength, cubeLength, cubeLength );
  var material = new THREE.MeshBasicMaterial( {color: "red", wireframe: true, wireframeLinewidth: 8} );
  var cube = new THREE.Mesh( geometryCube, material );

  var edges = new THREE.EdgesGeometry( geometryCube, 4 );
  var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: "black" } ) );

  //scene.add( line );

  var geometryCylinder = new THREE.CylinderGeometry( sphereRadius, sphereRadius, cubeLength*0.1, 60, 1, false, 240*Math.PI/180, 120*Math.PI/180 );
  var material = new THREE.MeshBasicMaterial( {color: "black", wireframe: false} );
  material.flatShading = true;
  var backgroundObj = new THREE.Mesh( geometryCylinder, material );

  backgroundObj.lookAt( camera.getWorldPosition() )
  backgroundObj.rotateOnAxis(new THREE.Vector3(1,0,0), 90*Math.PI/180)
  backgroundObj.translateY(- cubeLength*2.5)

  scene.add( backgroundObj );

  var geometryCylinder = new THREE.CylinderGeometry( sphereRadius, sphereRadius, cubeLength*2, 60, 1, false, 240*Math.PI/180, 120*Math.PI/180  );
    
  var material = new THREE.MeshBasicMaterial( {color: "black", wireframe: false} );
  var cylinder = new THREE.Mesh( geometryCylinder, material );

  cylinder.lookAt( camera.getWorldPosition() )
  cylinder.rotateOnAxis(new THREE.Vector3(1,0,0), 90*Math.PI/180)

  var edges = new THREE.EdgesGeometry( geometryCylinder, 4 );
  var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: "black" } ) );

  line.lookAt( camera.getWorldPosition() )
  line.rotateOnAxis(new THREE.Vector3(1,0,0), 90*Math.PI/180)
  //scene.add( line );

  //scene.add( cylinder );


  var loader = new STLLoader();
				loader.load('./3d/cylinder_cutout_logo.stl', function ( geometry ) {
          
          var material = new THREE.MeshPhongMaterial( { color: 'pink', wireframe: true} );
          material.flatShading = true
          var mesh = new THREE.Mesh( geometry, material );
          
          mesh.rotation.set( 270*Math.PI/180, 0, 0 );
          mesh.scale.set( scaleFactor, scaleFactor, scaleFactor );
          mesh.position.set( 0, 0, 0 );
          
          var edges = new THREE.EdgesGeometry( geometry, 4 );
          var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: "black" } ) );

          line.rotation.set( 270*Math.PI/180, 0, 0 );
          line.scale.set( scaleFactor, scaleFactor, scaleFactor );
          line.position.set( 0, 0, 0 );

          scene.add( line );

					scene.add( mesh );
				} );

  /*var helper = new THREE.GridHelper( 2000, 100 );
  helper.position.y = - 199;
  helper.material.opacity = 0.25;
  helper.material.transparent = true;
  scene.add( helper );*/

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  container.appendChild( renderer.domElement );

  stats = new Stats();
  container.appendChild( stats.dom );

  var gui = new GUI();

  gui.open();

  // Controls
  var controls = new OrbitControls( camera, renderer.domElement );
  controls.damping = 0.2;
  controls.addEventListener( 'change', render );
};

function animate() {
  requestAnimationFrame( animate );
  render();
  stats.update();
}

function render() {
  renderer.render( scene, camera );
}

require('./style/main.scss');

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

function toggleLogos() {

  let headerBrand = $("header h1")
  let navBrand = $(".navbar-brand")

  let scrollTop = $(window).scrollTop();
  let vh = $(window).height();

  //if(scrollTop > vh) {
  //} 

  if( headerBrand.css("display") === "none" ) {
      navBrand.css('opacity', 1)
  } else {

      var elTop = headerBrand.offset().top;
      var elHeight = headerBrand.height()
      var elBottom = elTop + headerBrand.height();

      //console.log(elTop, scrollTop) 
      navBrand.css('opacity', scale(elBottom - scrollTop, 0, elHeight, 1, 0));
  }

  navBrand.css('transition', "opacity 0.2s ease-in-out");
}


$( document ).ready(function() {

  init();
  animate();

  toggleLogos();

  $(window).scroll(function(){
    toggleLogos();
  });

  $(window).resize(function(){
    toggleLogos();
  });

});