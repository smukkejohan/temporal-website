import 'bootstrap/js/dist/util'
import 'bootstrap/js/dist/collapse'
import 'bootstrap/js/dist/scrollspy'

import glslify from 'glslify'
import path from 'path'

import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer.js';


import * as THREE from 'three'
import { Vector3 } from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader'
//import NURBSUtils from 'three/examples/jsm/curves/NURBSUtils'
//import NURBSCurve from 'three/examples/jsm/curves/NURBSCurve'


//import {MeshLine, MeshLineMaterial} from 'three.meshline'

require('./3d/logo_distortedthinwall.stl')
require('./3d/logo_distortedsurfaces.stl')
require('./3d/cylinder_cutout_logo.stl')

const volumeFiles = ['./3d/v1.stl', /*'./3d/welded2_3.stl',*/ './3d/v2.stl', './3d/v3.stl', './3d/v4.stl', './3d/v5.stl' ]
/*volumeFiles.forEach(function(_p) {
  require(_p)
})*/

require('./3d/welded2_3.stl')
require('./3d/v1.stl')
require('./3d/v2.stl')
require('./3d/v3.stl')
require('./3d/v4.stl')
require('./3d/v5.stl')

require('./style/main.scss');

import fragmentShader from './wire.frag'
import vertexShader from './wire.vert'

var canvasContainer, stats;
var camera, scene, renderer;

const clock = new THREE.Clock();


function init() {

  canvasContainer = document.getElementById( 'container' )
  scene = new THREE.Scene()
  scene.background = new THREE.Color( "pink" )
  
  var aspect = window.innerWidth / window.innerHeight

  var frustumSize = 1000;

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
  //camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 8000 );
  
  //Vector3 {x: 621.1727658528029, y: 618.494835847818, z: 619.7649013879068}
  camera.position.set( 220, 220, 220 );
  camera.lookAt(0,0,0);

  scene.add( camera );

  //renderer = new SVGRenderer();
  renderer = new THREE.WebGLRenderer( { antialias: true } );

  // Enable Alpha to Coverage for alpha cutouts + depth test
  const gl = renderer.getContext();
  gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);

  renderer.setClearColor(scene.background, 1);
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  canvasContainer.appendChild( renderer.domElement );
  
  stats = new Stats();
  canvasContainer.appendChild( stats.dom );

  var gui = new GUI();
  gui.open();

  // Controls
  var controls = new OrbitControls( camera, renderer.domElement );
  controls.damping = 0.2;
  controls.addEventListener( 'change', render );

}

function setupAttributes( geometry ) {
  var vectors = [
    new THREE.Vector3( 1, 0, 0 ),
    new THREE.Vector3( 0, 1, 0 ),
    new THREE.Vector3( 0, 0, 1 )
  ];

  var position = geometry.attributes.position;
  var centers = new Float32Array( position.count * 3 );

  for ( var i = 0, l = position.count; i < l; i ++ ) {
    vectors[ i % 3 ].toArray( centers, i * 3 );
  }

  geometry.setAttribute( 'center', new THREE.BufferAttribute( centers, 3 ) );
}




/*

    angle = 1.7320508075688767
    h = angle * 0.5 # height of a triangle

    @vertices.push new THREE.Vector3(0,   0,      1)
    @vertices.push new THREE.Vector3(0,   1,      1)
    @vertices.push new THREE.Vector3(-h,  0.5,    1)
    @vertices.push new THREE.Vector3(-h,  -0.5,   1)
    @vertices.push new THREE.Vector3(0,   -1,     1)
    @vertices.push new THREE.Vector3(h,   -0.5,   1)
    @vertices.push new THREE.Vector3(h,   0.5,    1)
    @vertices.map (vertex) -> vertex.multiply new THREE.Vector3(radius, radius, radius * depth)

    @faces.push new THREE.Face3 0, 1, 2
    @faces.push new THREE.Face3 0, 2, 3
    @faces.push new THREE.Face3 0, 3, 4
    @faces.push new THREE.Face3 0, 4, 5
    @faces.push new THREE.Face3 0, 5, 6
    @faces.push new THREE.Face3 0, 6, 1

*/

/*
A vertex(x - gs, y - sqrt(3) * gs);
B vertex(x + gs, y - sqrt(3) * gs);
C vertex(x + 2 * gs, y);
D vertex(x + gs, y + sqrt(3) * gs);
E vertex(x - gs, y + sqrt(3) * gs);
F vertex(x - 2 * gs, y);


  for(int i=0;i<6;i++){
    float angle = i * 2 * PI / 6;
    vertex(x + gs*cos(angle),y + gs*sin(angle));
  }


*/


const visibleHeightAtZDepth = ( depth, camera ) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z;
  if ( depth < cameraOffset ) depth -= cameraOffset;
  else depth += cameraOffset;

  // vertical fov in radians
  const vFOV = camera.fov * Math.PI / 180; 

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
};

const visibleWidthAtZDepth = ( depth, camera ) => {
  const height = visibleHeightAtZDepth( depth, camera );
  return height * camera.aspect;
};


function setupScene2() {

  camera.position.set( 0, 0, 100 );
  camera.lookAt(0,0,0);
  const sU = (window.innerWidth*0.01) // base scale unit, height of triangle at z 0  

  var angle = Math.PI/6;
  var center = new Vector3(0,0,0);

  const getHexCoord = (i, height, startAngle) => {
    let a = startAngle + (i * 2 * Math.PI / 6);
    return new Vector3(height*Math.cos(a),height*Math.sin(a));
  }

  const zWidthAtZero = visibleHeightAtZDepth(0, camera); 
  const lineWidthScale = 1.02; // 1.05

  var triangles = [1.2, 0.8, -1.8, -0.9, 1.8, 0.5 ].map( (zF, i) => {
    //zF = 0 for debugging
    let geom = new THREE.Geometry();
    let v1 = center.clone()
    let v2 = getHexCoord(0+i, sU, angle); //new Vector3(-sU,-sU/2, 0);
    let v3 = getHexCoord(1+i, sU, angle); //new Vector3(0, -sU, 0);
    let triangle = new THREE.Triangle( v1, v2, v3 );
    let normal = triangle.normal();

    geom.vertices.push(triangle.a);
    geom.vertices.push(triangle.b);
    geom.vertices.push(triangle.c);
    /*var vertices = new Float32Array( 
      [c.clone(), A, B]
     );*/
    
    // itemSize = 3 because there are 3 values (components) per vertex
    //geom.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    geom.faces.push( new THREE.Face3( 0, 1, 2, normal ) );

    let bgGeom = geom.clone() // clone before any transformations
    
    if(i==3 || i==2) {
      //triangle.a = triangle.a.sub( new Vector3(0, sU*lineWidthScale, 0))
      //geom.applyMatrix( new THREE.Matrix4().setTranslation( 0, 10, 0 ) );

      let v3Target = v2.clone()
      let edgeCenter = v2.clone().lerp(v3, 0.5)
      let v2Target = v3.clone()

      let d1 = edgeCenter.distanceToSquared(v1)
      let d2 = v2.distanceToSquared(v3)

      let newCenter = v1.clone().lerp(edgeCenter,(lineWidthScale-1)*2)
      //console.log(d1, d2)
      //v1.lerp(edgeCenter, -(1-lineWidthScale))
      //v2.lerp(v2Target, -(1-lineWidthScale) * (d1/d2) /**0.5*/ )
      //v3.lerp(v3Target, -(1-lineWidthScale) * (d1/d2))
      /*
      if(i==3) {
        v2.lerp(v2Target, -(1-lineWidthScale) * (d1/d2) ) //*0.5
        v3.lerp(v3Target, -(1-lineWidthScale) * (d1/d2))
      } else {
        v2.lerp(v2Target, - (1-lineWidthScale) * (d1/d2) )
        v3.lerp(v3Target, -(1-lineWidthScale) * (d1/d2) )  //*0.5
      }
      */
      //C.subVectors( B, A ).multiplyScalar( 1 + ( len / C.length() ) ).add( A );
 
      let matrix = new THREE.Matrix4()
      matrix.setPosition(newCenter)
      matrix.scale(new Vector3( 1-(lineWidthScale-1)*2, 1-(lineWidthScale-1)*2, 1))
      //geom.applyMatrix4( matrix )
      //geom.scale(0.9,0.9,1)
      geom.applyMatrix4( matrix )

      //geom.translate( ,0,0 ); // three.js r.72

      //geom.tr
      // scale theese triangles in the right direction to crate the missing line
    }

    let zT = sU*zF;
    let s = visibleHeightAtZDepth(zT, camera) / zWidthAtZero;
    geom.translate(0,0,zT)
    geom.scale(s,s,1)

    let mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'pink' })
    //if(i==3 || i==2) { mat.color.setColorName("blue")}
    let mesh = new THREE.Mesh( geom, mat)
    scene.add(mesh)

    let bgZT = zT - sU*0.1
    let bgS = visibleHeightAtZDepth(bgZT, camera) / zWidthAtZero * lineWidthScale;
    bgGeom.translate(0,0,bgZT)
    bgGeom.scale(bgS,bgS,1)
    
    bgGeom.translate(0,0,-sU*0.1)
    bgGeom.scale(lineWidthScale, lineWidthScale, 1)
    let bgmat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'black' })
    let bgMesh = new THREE.Mesh( bgGeom, bgmat);

    scene.add(bgMesh)
    return geom; 

  }) 

  const circleRadius = sU*0.4;
  var sphereGeometry = new THREE.SphereBufferGeometry( circleRadius, 64, 64 );
  
  let zT = sU*-0.4;
  let s = visibleHeightAtZDepth(zT, camera) / zWidthAtZero;
  sphereGeometry.translate(0,0,zT)
  sphereGeometry.scale(s,s,1)
  
  var sphere = new THREE.Mesh( sphereGeometry, new THREE.MeshBasicMaterial( { color: "black", side: THREE.DoubleSide } ) );
  scene.add( sphere );

}



function setupScene() {
  const scaleFactor = (window.innerWidth*0.01)

  // size 
  // 2/3 
  const sphereRadius = 10 * scaleFactor;
  const cubeLength = 3 * 10 * scaleFactor;

  var geometryCube = new THREE.BoxBufferGeometry( cubeLength, cubeLength, cubeLength );
  var material = new THREE.MeshBasicMaterial( {color: "pink", wireframe: false} );
  var cube = new THREE.Mesh( geometryCube, material );

  var outlineCube = new THREE.BoxBufferGeometry( cubeLength*1.05, cubeLength*1.05, cubeLength*1.05 );
  var cubeEdges = new THREE.EdgesGeometry( outlineCube, 4 );
  var cubeOutline = new THREE.LineSegments( cubeEdges, new THREE.LineBasicMaterial( { color: "black", linewidth: 8 } ) );

  scene.add( cube );
  scene.add( cubeOutline );

  // Create our custom wireframe shader material
const shaderMaterial = new THREE.ShaderMaterial({
  
  extensions: {
    // needed for anti-alias smoothstep, aastep()
    derivatives: true
  },
  transparent: true,
  side: THREE.DoubleSide,
  uniforms: { // some parameters for the shader
    widthFactor: { value: 8 },
  },
  // use glslify here to bring in the GLSL code
  fragmentShader: fragmentShader.toString() ,
  vertexShader: vertexShader.toString(), // glslify
});


//geometryCube.deleteAttribute( 'normal' );
//geometryCube.deleteAttribute( 'uv' );
//setupAttributes( geometryCube );

// add the mesh with an empty geometry for now, we will change it later
const mesh = new THREE.Mesh(geometryCube, shaderMaterial);
//scene.add(mesh);

  var geometryCylinder = new THREE.CylinderGeometry( sphereRadius, sphereRadius, cubeLength*0.1, 60, 1, false, 240*Math.PI/180, 120*Math.PI/180 );
  var material = new THREE.MeshBasicMaterial( {color: "black", wireframe: false, /*side: THREE.DoubleSide*/  } ); // invert ?
  material.flatShading = true;
  var backgroundObj = new THREE.Mesh( geometryCylinder, material );
  backgroundObj.lookAt( camera.getWorldPosition(new Vector3()) )
  backgroundObj.rotateOnAxis(new THREE.Vector3(1,0,0), 90*Math.PI/180)
  backgroundObj.translateY(- cubeLength*2.5)
  //scene.add( backgroundObj );

  var geometryCylinder = new THREE.CylinderGeometry( sphereRadius, sphereRadius, cubeLength*2, 60, 1, false, 240*Math.PI/180, 120*Math.PI/180  );
    
  var material = new THREE.MeshBasicMaterial( {color: "black", wireframe: false} );
  var cylinder = new THREE.Mesh( geometryCylinder, material );

  cylinder.lookAt( camera.getWorldPosition(new Vector3()) )
  cylinder.rotateOnAxis(new THREE.Vector3(1,0,0), 90*Math.PI/180)

  var edges = new THREE.EdgesGeometry( geometryCylinder, 4 );
  var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: "black" } ) );

  line.lookAt( camera.getWorldPosition(new Vector3()) )
  line.rotateOnAxis(new THREE.Vector3(1,0,0), 90*Math.PI/180)
  //scene.add( line );

  //scene.add( cylinder );
  

  const geometries = volumeFiles.map( function(_p, _i) {
    const loader = new STLLoader();
    loader.load(_p, geometry => { 
       
      console.log("Geometry loaded for: ", _p)
      let material = new THREE.MeshPhongMaterial( { color: 'black', wireframe: false} );
      material.flatShading = true

      let mesh = new THREE.Mesh( geometry, material );    
      mesh.rotation.set( 270*Math.PI/180, 0, 0 );
      mesh.scale.set( scaleFactor, scaleFactor, scaleFactor );
      mesh.position.set( 0, 0, 0 );
            
      let edges = new THREE.EdgesGeometry( geometry, 4 );
      let line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: "black", linewidth: 5 }) );
      line.rotation.set( 270*Math.PI/180, 0, 0 );
      line.scale.set( scaleFactor, scaleFactor, scaleFactor );
      line.position.set( 0, 0, 0 );
      
     
      //console.log(geometry)

      // var line = new MeshLine();
      //console.log(line)
      //line.setGeometry( new THREE.Geometry().fromBufferGeometry(edges) );

      //if(_i != 2) {
      //}
      //scene.add( mesh );

      /*let dotMaterial = new THREE.PointsMaterial( { size: 5, sizeAttenuation: false } );
      let dot = new THREE.Points( edges, dotMaterial );

      console.log(dot)

      dot.rotation.set( 270*Math.PI/180, 0, 0 );
      dot.scale.set( scaleFactor, scaleFactor, scaleFactor );
      dot.position.set( 0, 0, 0 );

      scene.add( dot );
*/

      /*let lineMaterial = new MeshLineMaterial( {
        color: "black",
        lineWidth: 1*/
        /*map: THREE.ImageUtils.loadTexture( 'assets/stroke.png' ),
        useMap: true,
        color: new THREE.Color( colors[ 3 ] ),
        opacity: .5,
        resolution: resolution,
        sizeAttenuation: false,
        lineWidth: 10,
        near: camera.near,
        far: camera.far,
        depthWrite: false,
        depthTest: false,
        transparent: true*/
      //});

      //let lineMesh = new THREE.Mesh( line.geometry, lineMaterial ); // this syntax could definitely be improved!

      //lineMesh.rotation.set( 270*Math.PI/180, 0, 0 );
      //lineMesh.scale.set( scaleFactor, scaleFactor, scaleFactor );
      //lineMesh.position.set( 0, 0, 0 );

      //scene.add( lineMesh );

      // 
      //scene.add( line );
      
      return {
        geometry: geometry,
        mesh: mesh,
        line: line
      }
    })
  })


}


/*
      const loader = new STLLoader();

				loader.load('./3d/v1.stl', function ( geometry ) {
          
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

        */
  




function animate() {
  requestAnimationFrame( animate );

    // orbit the camera and update shader time
    const time = clock.getElapsedTime();
    const radius = 4;
    const angle = time * 2.5 * Math.PI / 180;
    //camera.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    //camera.lookAt(new THREE.Vector3());
    //mesh.material.uniforms.time.value = time;


  render();
  stats.update();
}

function render() {
  renderer.render( scene, camera );
}


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
  setupScene2();
  animate();

  toggleLogos();

  $(window).scroll(function(){
    toggleLogos();
  });

  $(window).resize(function(){
    toggleLogos();
  });

});