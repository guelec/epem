import {OBJLoader} from './resources/threejs/r122/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from './resources/threejs/r122/examples/jsm/loaders/MTLLoader.js';
import {DDSLoader} from './resources/threejs/r122/examples/jsm/loaders/DDSLoader.js';
import {FBXLoader} from './resources/threejs/r122/examples/jsm/loaders/FBXLoader.js';
import {DragControls} from './resources/threejs/r122/examples/jsm/controls/DragControls.js';

var container, scene, camera, renderer;

var controls;
var drag_controls;
var group;

var sphere;
let enableSelection = false;
const objects = [];
const collidableObjects = [];
var collected = [];

var player = new THREE.Object3D();
var solar_panel = new THREE.Object3D();
var wind_mill = new THREE.Object3D();


const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();
var control_target = player;
init();
animate();

function init() {

    // Setup
    container = document.getElementById('container');
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);

    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    //
    {
        const planeSize = 2000;

        const loader = new THREE.TextureLoader();
        const texture = loader.load('ground_6.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 8;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }

    {
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);
        scene.add(light);
        scene.add(light.target);
    }

    //
    // Add Objects To the Scene HERE

    /*
     const mtlLoader = new MTLLoader();
     // adding player to scene
     mtlLoader.load('objects/player/player.mtl', function (materials) {
     materials.preload();
     const objLoaderExample = new OBJLoader();
     objLoaderExample.setMaterials(materials);
     objLoaderExample.load('objects/player/player.obj', (root) => {
     root.rotation.y = Math.PI * -1;
     player.scale.set(0.009, 0.009, 0.009);
     player.add(root);
     //scene.add(root);
     });
     });
     */

    /*
     objectLoader('obj/trash/bottle1.mtl', 'obj/trash/bottle1.obj', 0, 5, 0, true);
     objectLoader('obj/trash/bottle2.mtl', 'obj/trash/bottle2.obj', -5, 5, 0, true);
     objectLoader('obj/trash/bottle3.mtl', 'obj/trash/bottle3.obj', -10, 5, 0, true);
     
     objectLoader('obj/trash/trash_bag.mtl', 'obj/trash/trash_bag.obj', 0, 10, 0, true);
     objectLoader('obj/trash/trash_can.mtl', 'obj/trash/trash_can.obj', -5, 10, 0, true);
     objectLoader('obj/trash/trash_can_wlid.mtl', 'obj/trash/trash_can_wlid.obj', -10, 10, 0, true);
     
     objectLoader('obj/trash/trash_dumpster.mtl', 'obj/trash/trash_dumpster.obj', 0, 15, 0, );
     objectLoader('obj/trash/trash_dumpster_open.mtl', 'obj/trash/trash_dumpster_open.obj', -5, 15, 0);
     objectLoader('obj/character/character.mtl', 'obj/character/character.obj', -10, 15, 0, true);
     
     objectLoader('obj/vehicle/truck.mtl', 'obj/vehicle/truck.obj', -20, 15, 0, true);
     */
    /////////////
    
    resourceLoader();

    /////////////
    ////
    ////
    //
    // Create a material



    //
    player.position.x = 0;
    //player.rotation.y += Math.PI * 0.5;
    scene.add(player);

    controls = new THREE.PlayerControls(camera, control_target, collidableObjects, raycaster);
    controls.init();

    group = new THREE.Group();
    scene.add(group);

    drag_controls = new DragControls(objects, camera, renderer.domElement);
    controls.addEventListener('drag', render);

    // Events
    controls.addEventListener('change', render, false);
    window.addEventListener('resize', onWindowResize, false);

    // Final touches
    container.appendChild(renderer.domElement);
    document.body.appendChild(container);

    // Drag Control
    document.addEventListener('oncontextmenu', onClick, false);
    //document.addEventListener('onmouseup', onRelease, false);

    // SPOTLIGHT



}

function animate() {
    //raycaster.set(player.position, new THREE.Vector3(0, 0, 1));
    //console.log(player.position);
    //const intersects = raycaster.intersectObjects(scene.children, true);





    /*if(intersects.length > 0){
     for(let i = 0; i< intersects.length; i++){
     if(intersects[i].distance < 0.5){
     console.log("we hit something");
     break;
     }
     else{
     //console.log("object is far away")
     };
     }
     
     //intersects[0].object.material.color.set( 0xff0000 );
     }
     else{
     console.log("no collision")
     }*/

    //console.log(intersects.length);
    //controls.update();
    requestAnimationFrame(animate);
    render();

}

function render() {
    // Render Scene
    /*
     if ( drag_controls.enabled )
     controls.enabled = false;
     else
     controls.enabled = true;
     
     */

    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function objectLoader(mtlUrl, objUrl, x, z, y = 0.0, draggable = false, rotation = - 1) {

    //if we wanna use obj outside and they aren't static, we can add it to a list or smth.

    const mtlLoader = new MTLLoader();
    mtlLoader.load(mtlUrl, function (materials) {
        materials.preload();
        const objLoaderExample = new OBJLoader();
        objLoaderExample.setMaterials(materials);
        objLoaderExample.load(objUrl, (root) => {

            root.rotation.y = Math.PI * rotation;

            root.position.x = x;
            root.position.y = y;
            root.position.z = z;
            collidableObjects.push(root);
            if (draggable)
                objects.push(root);
            scene.add(root);
        });
    });

}


document.addEventListener('keydown', function (event) {

    // add to collect datas


    /*
     if (event.keyCode == 70) {
     if (control_target == player)
     {
     control_target = truck;
     player.visible = false;
     player.position.x = truck.position.x;
     player.position.y = truck.position.y;
     player.position.z = truck.position.z;
     } else
     {
     control_target = player;
     player.visible = true;
     player.position.x = truck.position.x - 10;
     player.position.y = truck.position.y;
     player.position.z = truck.position.z;
     }
     
     controls = new THREE.PlayerControls(camera, control_target);
     }
     */
}, true);


function onRelease(event)
{
    drag_controls.enabled = false;
    controls.enabled = true;
}

function onClick(event) {

    event.preventDefault();
    controls.enabled = false;

    if (enableSelection === true) {

        const draggableObjects = drag_controls.getObjects();
        draggableObjects.length = 0;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersections = raycaster.intersectObjects(objects, true);

        if (intersections.length > 0) {

            const object = intersections[ 0 ].object;

            if (group.children.includes(object) === true) {

                object.material.emissive.set(0x000000);
                scene.attach(object);

            } else {

                object.material.emissive.set(0xaaaaaa);
                group.attach(object);

            }

            drag_controls.transformGroup = true;
            draggableObjects.push(group);

        }

        if (group.children.length === 0) {

            drag_controls.transformGroup = false;
            draggableObjects.push(...objects);

        }

    }
    render();

}

function resourceLoader()
{
    loadObjWithTexture('objects/solar_panel/solar_panel.obj','objects/solar_panel/solar_panel.jpg' );
    loadFbxWithTexture('objects/wind_mill/wind_mill.fbx','objects/solar_panel/solar_panel.jpg' );
    
    const fbxLoader = new FBXLoader();
    const objLoader = new OBJLoader();

    /*
    // LOAD WIND MILL
    fbxLoader.load('objects/wind_mill/wind_mill.fbx', function (object) {
        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        object.scale.set(0.001, 0.001, 0.001);
        object.position.set(0, 2, 0);
        scene.add(object);
    });
*/


/*
    // LOAD SOLAR PANEL
    var map = textureLoader.load('objects/solar_panel/solar_panel.jpg');
    var material = new THREE.MeshPhongMaterial({map: map});

    objLoader.load('objects/solar_panel/solar_panel.obj', function (object) {

        // For any meshes in the model, add our material.
        object.traverse(function (node) {

            //if (node.isMesh)
                node.material = material;

        });
        object.scale.set(0.01, 0.01, 0.01);
        scene.add(object);
    });
*/    
    
    /*
    objLoader.load('objects/solar_panel/solar_panel.obj', (root) => {
        root.scale.set(.01, .01, .01);
        root.position.y = 1;
        scene.add(root);
    });
    */

/*
    var map = textureLoader.load('objects/solar_panel/solar_panel.jpg');
    var material = new THREE.MeshPhongMaterial({map: map});

    objLoader.load('objects/player/player.obj', function (object) {

        // For any meshes in the model, add our material.
        object.traverse(function (node) {

            if (node.isMesh)
                node.material = material;

        });

        scene.add(object);
    });
*/    
    
    objLoader.load('objects/player/player.obj', (root) => {
        root.scale.set(.01, .01, .01);
        root.rotation.y = Math.PI * -1;
        player.add(root);
        //scene.add(root);
    });
}

function loadObjWithTexture(obj_url, tex_url)
{
    const objLoader = new OBJLoader();
    var textureLoader = new THREE.TextureLoader();
    
    var map = textureLoader.load(tex_url);
    var material = new THREE.MeshPhongMaterial({map: map});

    objLoader.load(obj_url, function (object) {

        // For any meshes in the model, add our material.
        object.traverse(function (node) {

            //if (node.isMesh)
                node.material = material;

        });
        object.scale.set(0.01, 0.01, 0.01);
        scene.add(object);
    });
}

function loadFbxWithTexture(fbx_url, tex_url)
{
    const fbxLoader = new FBXLoader();
    var textureLoader = new THREE.TextureLoader();
    
    var map = textureLoader.load(tex_url);
    var material = new THREE.MeshPhongMaterial({map: map});

    fbxLoader.load(fbx_url, function (object) {

        // For any meshes in the model, add our material.
        object.traverse(function (node) {

            //if (node.isMesh)
                node.material = material;

        });
        object.scale.set(0.01, 0.01, 0.01);
        scene.add(object);
    });
}