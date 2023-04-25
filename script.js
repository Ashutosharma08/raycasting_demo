import * as THREE from './three.module.js'
import {OrbitControls} from './OrbitControls.js'
import { PCDLoader } from './PCDLoader.js'

var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer({canvas:canvas});
renderer.setSize(canvas.clientWidth,canvas.clientHeight);

var width = window.screen.availWidth
var height = window.screen.availHeight

var camera = new THREE.PerspectiveCamera(1,width/height,1,50000000);
camera.position.set(0,0,1200);
var loader = new PCDLoader();

var controls = new OrbitControls(camera,renderer.domElement);
var points_geometry = undefined
var pts_arr = undefined
var load_pcd =  function(){
    loader.load('./tree_1.pcd',function(points){
        var buffer_geo = new THREE.BufferGeometry()
        pts_arr = new THREE.Float32BufferAttribute(points.geometry.attributes.position.array,3)
        buffer_geo.setAttribute('position',new THREE.Float32BufferAttribute(points.geometry.attributes.position.array,3))
        var pts_mat = new THREE.PointsMaterial({color: 0xff00ff})
        points_geometry = new THREE.Points(buffer_geo,pts_mat)
        points_geometry.geometry.center()
        points_geometry.geometry.rotateX(Math.PI * 1.5)
        scene.add(points_geometry)
    })

}

const sphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const spheres = []
var toggle = 0
for ( let i = 0; i < 1; i ++ ) {

    const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    scene.add( sphere );
    spheres.push( sphere );

}


let INTERSECTED;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let clock = new THREE.Clock()

raycaster.params.Points.threshold = 1;

function onPointerMove( event ) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
    pointer.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
}

document.addEventListener( 'mousemove', onPointerMove );

var intersection = null
var counter = 0
var spheresIndex = 0
var animate = function(){
    renderer.render(scene,camera)
    controls.update()
    requestAnimationFrame(animate)
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObject( points_geometry, true );
    intersection = ( intersects.length ) > 0 ? intersects[ 0 ] : null;
    if ( intersects.length > 0 ) {
        if ( INTERSECTED != intersects[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.color.setHex( 0xffffff );

        }

    } else {

        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;

    }
    if ( toggle > 0.02 && intersection !== null ) {
        console.log(pts_arr.array[intersection.index])
        console.log(pts_arr.array[intersection.index + 1])
        console.log(pts_arr.array[intersection.index + 2])
        spheres[ spheresIndex ].position.copy( intersection.point );
        spheres[ spheresIndex ].scale.set( 1, 1, 1 );
        spheresIndex = ( spheresIndex + 1 ) % spheres.length;

        toggle = 0;

    }

    for ( let i = 0; i < spheres.length; i ++ ) {

        const sphere = spheres[ i ];
        sphere.scale.multiplyScalar( 0.1 );
        sphere.scale.clampScalar( 0.01, 1 );

    }

    toggle += clock.getDelta();
    counter +=1
    if (counter == 10){
        points_geometry.material.color.setHex(Math.random() * 0xffffff)
        counter = 0
    }
}

load_pcd()
animate()