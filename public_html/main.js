import {OBJLoader} from './resources/threejs/r122/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from './resources/threejs/r122/examples/jsm/loaders/MTLLoader.js';
import {DDSLoader} from './resources/threejs/r122/examples/jsm/loaders/DDSLoader.js';
import {FBXLoader} from './resources/threejs/r122/examples/jsm/loaders/FBXLoader.js';
import {TransformControls} from './resources/threejs/r122/examples/jsm/controls/TransformControls.js';
import {DragControls} from './resources/threejs/r122/examples/jsm/controls/DragControls.js';

var container, scene, camera, renderer;

var t_control;      // Transform Control
var controls;

var drag_controls;
var group;
var range;

var spotLight;
var spotLightTarget = new THREE.Object3D;
var shadeType = "Lambert";

let enableSelection = false;
const objects = [];
const collidableObjects = [];
var collected = [];

var player = new THREE.Object3D();
player.name = "player";
var solar_panel = new THREE.Object3D();
solar_panel.eff = 30;
solar_panel.cost = 14;
solar_panel.emis = 40;
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

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);

    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    //
    {
        const planeSize = 40;

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
        const intensity = 0.5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);
        scene.add(light);
        scene.add(light.target);
    }

    {
        spotLight = new THREE.SpotLight(0xffffff, 0);
        spotLight.position.set(0, 0, 0);
        spotLight.angle = Math.PI / 30;
        spotLight.penumbra = 0.1;
        spotLight.decay = 2;
        spotLight.distance = 600;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 50;
        spotLight.shadow.mapSize.height = 50;
        spotLight.shadow.camera.near = 10;
        spotLight.shadow.camera.far = 200;
        spotLight.shadow.focus = 2;
        scene.add(spotLight);

        var targetObject = spotLightTarget;
        scene.add(targetObject);

        targetObject = solar_panel;
        spotLight.target = targetObject;
    }

    resourceLoaderLambert();
    playerLoader();

    player.position.x = 0;
    scene.add(player);
    scene.add(coal);
    scene.add(natural_gas);
    scene.add(biomass);
    scene.add(hydro);
    scene.add(wind_mill);
    scene.add(solar_panel);

    controls = new THREE.PlayerControls(camera, control_target, collidableObjects, raycaster);
    controls.init();

    group = new THREE.Group();
    scene.add(group);

    {
        t_control = new TransformControls(camera, renderer.domElement);
        t_control.addEventListener('change', render);

        t_control.addEventListener('dragging-changed', function (event) {

            controls.enabled = !event.value;

        });
        scene.add(t_control);


    }

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
                swal("Solar Panel", "A panel designed to absorb the sun's rays as a source of energy for generating electricity or heating.\n\
Efficiency : 30%\n\
Cost : 14 Units\n\
CO2 Emission : 40 Units");
                t_control.position.set(solar_panel.position.x - 7, solar_panel.position.y, solar_panel.position.z);
                t_control.attach(solar_panel);
            }
            if (check == "wind")
            {
                swal("Wind Turbine", "A wind turbine, or wind energy converter, is a device that converts the wind's kinetic energy into electrical energy.\n\
Efficiency : 90%\n\
Cost : 12 Units\n\
CO2 Emission : 2 Units");
                spotLight.target = wind_mill;
                t_control.position.set(wind_mill.position.x, wind_mill.position.y, wind_mill.position.z);
                t_control.attach(wind_mill);
            }
            if (check == "chim")
            {
                swal("Biomass", "Biomass is plant or animal material used as fuel to produce electricity or heat.\n\
Efficiency : 45%\n\
Cost : 14 Units\n\
CO2 Emission : 4 Units");
                spotLight.target = biomass;
                t_control.position.set(biomass.position.x + 3, biomass.position.y, biomass.position.z);
                t_control.attach(biomass);
            }
            if (check == "Grou")
            {
                swal("Hydroelectric Energy", "Hydroelectric energy, also called hydroelectric power or hydroelectricity, is a form of energy that harnesses the power of water in motion—such as water flowing over a waterfall—to generate electricity..\n\
Efficiency : 60%\n\
Cost : 10 Units\n\
CO2 Emission : 2 Units");
                spotLight.target = hydro;
                t_control.position.set(hydro.position.x + 8, hydro.position.y, hydro.position.z);
                t_control.attach(hydro);
            }
            if (check == "pipe")
            {
                swal("Natural Gas", "Natural gas power plant is a thermal power station which burns natural gas to generate electricity. \n\
Efficiency : 40%\n\
Cost : 10 Units\n\
CO2 Emission : 20 Units");
                spotLight.target = natural_gas;
                t_control.position.set(natural_gas.position.x + 13, natural_gas.position.y, natural_gas.position.z);
                t_control.attach(natural_gas);
            }
            if (check == "Rock")
            {
                swal("Coal", "Coal-fired plants produce electricity by burning coal in a boiler to produce steam. \n\
Efficiency : 30%\n\
Cost : 14 Units\n\
CO2 Emission : 40 Units");
                spotLight.target = coal;
                t_control.position.set(coal.position.x - 3, coal.position.y, coal.position.z);
                t_control.attach(coal);
            }

        }
    }, false);
    drag_controls = new DragControls(objects, camera, renderer.domElement);
    controls.addEventListener('drag', render);
    controls.addEventListener('change', render, false);
    window.addEventListener('resize', onWindowResize, false);
    container.appendChild(renderer.domElement);
    document.body.appendChild(container);
    document.addEventListener('oncontextmenu', onClick, false);
}

function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {

    spotLight.position.set(solar_panel.position.x, solar_panel.position.y + 150, solar_panel.position.z);
    spotLight.target = spotLightTarget;
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

document.addEventListener('keyup', function (event) {
    switch (event.keyCode)
    {
        case 86:
        {
            if (shadeType == "Lambert")
                shadeType = "Toon";
            else
                shadeType = "Lambert";
        }
    }
});

document.addEventListener('keydown', function (event) {

    // add to collect datas
    switch (event.keyCode)
    {
        case 71: // G
            findBestOption(30);
            break;
        case 72: // H
            findBestOption(60);
            break;
        case 86: // V
        {
            if (shadeType == "Lambert")
                resourceLoaderToon();
            if (shadeType == "Toon")
                resourceLoaderLambert();
            break;
        }
        case 76: // L
        {
            console.log("L");
            if (spotLight.intensity === 1)
                spotLight.intensity = 0;
            else if (spotLight.intensity === 0)
                spotLight.intensity = 1;
            break;
        }
        case 66: // B
            console.log("B")
            t_control.setMode("translate");
            break;

        case 78: // N
            t_control.setMode("rotate");
            break;

        case 77: // M
            t_control.setMode("scale");
            break;
    }

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

function resourceLoaderToon()
{
    loadObjWithTextureToon('objects/solar_panel/solar_panel.obj', 'objects/solar_panel/solar_panel.jpg'
            , -4, 0.5, 0, 0.005, 0.005, 0.005, solar_panel);
    loadObjWithTextureToon('objects/biomass/biomass.obj', 'objects/biomass/biomass.jpg'
            , 0, 0, 0, 0.005, 0.001, 0.005, biomass);
    loadObjWithMtl('objects/hydro/hydro.obj', 'objects/hydro/hydro.mtl'
            , 8, 0, 0, 0.005, 0.005, 0.005, hydro);
    loadObjWithTextureToon('objects/natural_gas/natural_gas.obj', 'objects/natural_gas/natural_gas.png'
            , 13, 0.25, 0, 0.5, 0.5, 0.5, natural_gas);
    loadObjWithTextureToon('objects/coal/coal.obj', 'objects/coal/coal.jpg'
            , -2, 0, 0, 0.2, 0.2, 0.2, coal);
    loadFbxWithTextureToon('objects/wind_mill/wind_mill.fbx', 'objects/solar_panel/solar_panel.jpg'
            , 0, 2, 0, 0.001, 0.001, 0.001, wind_mill);

}

function resourceLoaderLambert()
{
    loadObjWithTextureLambert('objects/solar_panel/solar_panel.obj', 'objects/solar_panel/solar_panel.jpg'
            , -4, 0.5, 0, 0.005, 0.005, 0.005, solar_panel);
    loadObjWithTextureLambert('objects/biomass/biomass.obj', 'objects/biomass/biomass.jpg'
            , 0, 0, 0, 0.005, 0.001, 0.005, biomass);
    loadObjWithMtl('objects/hydro/hydro.obj', 'objects/hydro/hydro.mtl'
            , 8, 0, 0, 0.005, 0.005, 0.005, hydro);
    loadObjWithTextureLambert('objects/natural_gas/natural_gas.obj', 'objects/natural_gas/natural_gas.png'
            , 13, 0.25, 0, 0.5, 0.5, 0.5, natural_gas);
    loadObjWithTextureLambert('objects/coal/coal.obj', 'objects/coal/coal.jpg'
            , -2, 0, 0, 0.2, 0.2, 0.2, coal);
    loadFbxWithTextureLambert('objects/wind_mill/wind_mill.fbx', 'objects/solar_panel/solar_panel.jpg'
            , 0, 2, 0, 0.001, 0.001, 0.001, wind_mill);

}

function loadObjWithTextureToon(obj_url, tex_url, p_x, p_y, p_z, s_x, s_y, s_z, obj)
{
    const objLoader = new OBJLoader();
    var textureLoader = new THREE.TextureLoader();

    var map = textureLoader.load(tex_url);
    var material = new THREE.MeshToonMaterial({map: map});

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

function loadFbxWithTextureToon(fbx_url, tex_url, p_x, p_y, p_z, s_x, s_y, s_z, obj)
{
    const fbxLoader = new FBXLoader();
    var textureLoader = new THREE.TextureLoader();

    var map = textureLoader.load(tex_url);
    var material = new THREE.MeshToonMaterial({map: map});

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

function loadObjWithTextureLambert(obj_url, tex_url, p_x, p_y, p_z, s_x, s_y, s_z, obj)
{
    const objLoader = new OBJLoader();
    var textureLoader = new THREE.TextureLoader();

    var map = textureLoader.load(tex_url);
    var material = new THREE.MeshLambertMaterial({map: map});

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

function loadFbxWithTextureLambert(fbx_url, tex_url, p_x, p_y, p_z, s_x, s_y, s_z, obj)
{
    const fbxLoader = new FBXLoader();
    var textureLoader = new THREE.TextureLoader();

    var map = textureLoader.load(tex_url);
    var material = new THREE.MeshLambertMaterial({map: map});

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

function playerLoader()
{
    var objLoader = new OBJLoader();
    objLoader.load('objects/player/player.obj', (root) => {
        root.scale.set(.01, .01, .01);
        root.rotation.y = Math.PI * -1;
        player.position.z = 5;
        player.add(root);
        //scene.add(root);
    });
}
