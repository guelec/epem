import {OBJLoader} from './resources/threejs/r122/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from './resources/threejs/r122/examples/jsm/loaders/MTLLoader.js';
import {DDSLoader} from './resources/threejs/r122/examples/jsm/loaders/DDSLoader.js';
import {FBXLoader} from './resources/threejs/r122/examples/jsm/loaders/FBXLoader.js';
import {TransformControls} from './resources/threejs/r122/examples/jsm/controls/TransformControls.js';
import {DragControls} from './resources/threejs/r122/examples/jsm/controls/DragControls.js';

var container, scene, camera, renderer;

var t_control;      // Transform Control
var t_control_1;
var t_control_2;
var controls;

var drag_controls;
var group;

let enableSelection = false;
const objects = [];
const collidableObjects = [];
var collected = [];

var player = new THREE.Object3D();
player.name = "player";
var solar_panel = new THREE.Object3D();
solar_panel.name = "solar_panel";
var wind_mill = new THREE.Object3D();
var natural_gas = new THREE.Object3D();
var hydro = new THREE.Object3D();
var coal = new THREE.Object3D();
var biomass = new THREE.Object3D();

const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();
var control_target = player;
init();
animate();

function init() {

    // Setup
    container = document.getElementById('container');
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10));
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
    scene.add(coal);
    scene.add(natural_gas);
    scene.add(biomass);
    scene.add(hydro);
    scene.add(wind_mill);
    scene.add(solar_panel);

    //coal.on('pointerdown', function (ev) {
    //    console.log('pt down');
    //});




    controls = new THREE.PlayerControls(camera, control_target, collidableObjects, raycaster);
    controls.init();

    group = new THREE.Group();
    scene.add(group);

    //
    var arr = [solar_panel, wind_mill, biomass, natural_gas, coal, hydro];
    /*
     const transformControls1 = new TransformControls(
     camera,
     renderer.domElement,
     );
     transformControls1.addEventListener('change', () => renderer.render(scene, camera));
     transformControls1.setSpace('local');
     scene.add(transformControls1);
     transformControls1.attach(solar_panel);
     
     const transformControls2 = new TransformControls(
     camera,
     renderer.domElement,
     );
     transformControls2.addEventListener('change', () => renderer.render(scene, camera));
     transformControls2.setSpace('local');
     scene.add(transformControls2);
     transformControls2.attach(natural_gas);
     */


    
     {
     t_control = new TransformControls(camera, renderer.domElement);
     t_control.addEventListener('change', render);
     
     t_control.addEventListener('dragging-changed', function (event) {
     
     controls.enabled = !event.value;
     
     });
     scene.add(t_control);
     
     
     }
     /*
     {
     t_control_1 = new TransformControls(camera, renderer.domElement);
     t_control_1.addEventListener('change', render);
     
     t_control_1.addEventListener('dragging-changed', function (event) {
     
     controls.enabled = !event.value;
     
     });
     scene.add(t_control_1);
     t_control_1.attach(arr[1]);
     
     }
     */
    /*
     t_control.attach(solar_panel);
     t_control.attach(wind_mill);
     t_control.attach(biomass);
     t_control.attach(natural_gas);
     t_control.attach(coal);
     t_control.attach(hydro);
     */
    // scene.add(t_control);
    //

    //  onClick Part
    container.addEventListener('click', function (event) {
        var bounds = container.getBoundingClientRect();
        mouse.x = ((event.clientX - bounds.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - bounds.top) / container.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            //console.log(intersects[0].object.name);
            var objName = intersects[0].object.name;
            var check = objName[0] + objName[1] + objName[2] + objName[3];
            console.log(check);
            if (check == "Plan" || check == "Cyli")
            {
                t_control.position.set(solar_panel.position.x - 3, solar_panel.position.y, solar_panel.position.z);
                t_control.attach(solar_panel);
            }
            if (check == "wind")
            {
                t_control.attach(wind_mill);
            }
            if (check == "chim")
            {
                t_control.attach(biomass);
            }
            if (check == "Grou")
            {
                t_control.attach(hydro);
            }
            if (check == "pipe")
            {
                t_control.attach(natural_gas);
            }
            if (check == "Rock")
            {
                t_control.attach(coal);
            }

        }
    }, false);
    //



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
    loadObjWithTexture('objects/solar_panel/solar_panel.obj', 'objects/solar_panel/solar_panel.jpg'
            , -5, 0.5, 0, 0.005, 0.005, 0.005, solar_panel);
    loadObjWithTexture('objects/biomass/biomass.obj', 'objects/biomass/biomass.jpg'
            , 0, 0, 0, 0.005, 0.001, 0.005, biomass);
    loadObjWithMtl('objects/hydro/hydro.obj', 'objects/hydro/hydro.mtl'
            , 5, 0, 0, 0.005, 0.005, 0.005, hydro);
    loadObjWithTexture('objects/natural_gas/natural_gas.obj', 'objects/natural_gas/natural_gas.png'
            , 10, 0.25, 0, 0.5, 0.5, 0.5, natural_gas);
    loadObjWithTexture('objects/coal/coal.obj', 'objects/coal/coal.jpg'
            , -2, 0, 0, 0.2, 0.2, 0.2, coal);
    loadFbxWithTexture('objects/wind_mill/wind_mill.fbx', 'objects/solar_panel/solar_panel.jpg'
            , 0, 2, 0, 0.001, 0.001, 0.001, wind_mill);

    const fbxLoader = new FBXLoader();
    const objLoader = new OBJLoader();


    objLoader.load('objects/player/player.obj', (root) => {
        root.scale.set(.01, .01, .01);
        root.rotation.y = Math.PI * -1;
        player.position.z = 5;
        player.add(root);
        //scene.add(root);
    });
}

function loadObjWithTexture(obj_url, tex_url, p_x, p_y, p_z, s_x, s_y, s_z, obj)
{
    const objLoader = new OBJLoader();
    var textureLoader = new THREE.TextureLoader();

    var map = textureLoader.load(tex_url);
    var material = new THREE.MeshPhongMaterial({map: map});

    objLoader.load(obj_url, function (object) {

        if (tex_url != "") {
            object.traverse(function (node) {

                //if (node.isMesh)
                node.material = material;

            });
        }
        object.position.set(p_x, p_y, p_z);
        object.scale.set(s_x, s_y, s_z);
        objects.push(object);
        obj.add(object);
//        scene.add(object);
    });
}

function loadFbxWithTexture(fbx_url, tex_url, p_x, p_y, p_z, s_x, s_y, s_z, obj)
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
        object.position.set(p_x, p_y, p_z);
        object.scale.set(s_x, s_y, s_z);
        objects.push(object);
        obj.add(object);
//        scene.add(object);
    });
}

function loadObjWithMtl(obj_url, mtl_url, p_x, p_y, p_z, s_x, s_y, s_z, obj)
{
    const mtlLoader = new MTLLoader();
    mtlLoader.load(mtl_url, function (materials) {
        materials.preload();
        const objLoaderExample = new OBJLoader();
        objLoaderExample.setMaterials(materials);
        objLoaderExample.load(obj_url, (root) => {
            root.position.set(p_x, p_y, p_z);
            root.scale.set(s_x, s_y, s_z);
            objects.push(root);
            obj.add(root);
//            scene.add(root);
        });
    });
}

/*
 function click(ev) {
 
 console.log("click");
 
 var transformControls = scene.getObjectByName("transformControls", true);
 var objControlled = scene.getObjectByName("objControlled", true);
 
 if (transformControls === undefined || transformControls === null) {
 transformControls = new THREE.TransformControls(camera, renderer.domElement);
 transformControls.addEventListener('change', render);
 transformControls.name = "transformControls";
 
 scene.add(transformControls);
 
 }
 
 if (objControlled === undefined || objControlled === null) {
 
 try {
 transformControls.attach(ev.data.target);
 ev.data.target.name = "objControlled";
 } catch (err) {
 console.log(err);
 }
 
 } else {
 
 try {
 transformControls.detach(objControlled);
 objControlled.name = "oldControlled";
 
 transformControls.attach(ev.data.target);
 ev.data.target.name = "objControlled";
 } catch (err) {
 console.log(err);
 }
 }
 }
 * 
 */