import * as THREE from 'three';

import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { ShadowMapViewer } from 'https://threejs.org/examples/jsm/utils/ShadowMapViewer.js';
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';

const viewDepthMap = true;

let camera, scene, renderer, clock;
let dirLight, spotLight;
let dirLightShadowMapViewer, spotLightShadowMapViewer;
let object, group, group1;

init();
animate();

function init() {
	initScene();
	initShadowMapViewers();
	initMisc();

	document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize);
}

function initScene() {
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0, 15, 35);

	scene = new THREE.Scene();

	// Lights
	scene.add(new THREE.AmbientLight(0x404040, 3));

	spotLight = new THREE.SpotLight(0xffffff, 500);
	spotLight.name = 'Spot Light';
	spotLight.angle = Math.PI / 5;
	spotLight.penumbra = 0.3;
	spotLight.position.set(10, 15, 5);
	spotLight.castShadow = true;
	spotLight.shadow.camera.near = 8;
	spotLight.shadow.camera.far = 30;
	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;
	scene.add(spotLight);

	scene.add(new THREE.CameraHelper(spotLight.shadow.camera));

	dirLight = new THREE.DirectionalLight(0xffffff, 3);
	dirLight.name = 'Dir. Light';
	dirLight.position.set(0, 10, 0);
	dirLight.castShadow = true;
	dirLight.shadow.camera.near = 1;
	dirLight.shadow.camera.far = 10;
	dirLight.shadow.camera.right = 15;
	dirLight.shadow.camera.left = - 15;
	dirLight.shadow.camera.top = 15;
	dirLight.shadow.camera.bottom = - 15;
	dirLight.shadow.mapSize.width = 1024;
	dirLight.shadow.mapSize.height = 1024;
	scene.add(dirLight);

	scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

	// Geometry	
	let material = new THREE.MeshPhongMaterial({
		color: 0xff0000,
		shininess: 150,
		specular: 0x222222
	});
	
	group = new THREE.Group();
	const loader = new OBJLoader();
	// model
	function onProgress(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;
			//console.log('model ' + percentComplete.toFixed(2) + '% downloaded');
		}
	}
	function onError() { }
	loader.load('models/headphones.obj', function (object) {
		// attach material
		object.traverse(function (child) {
			if (child.isMesh) {
				child.material = material; // Apply the material to each mesh
			}
		});
		// Add the model to the group
		object.castShadow = true;
		object.receiveShadow = true;
		group.add(object);
		group.position.set(0.0, 5.0, 0.0);
		group.scale.set(1.5, 1.5, 1.5);
		scene.add(group);
		render();
	}, onProgress, onError);

	group1 = new THREE.Group();
	const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
	for (let x = -3; x <= 3; x++)
		for (let y = -3; y <= 3; y++)
			for (let z = -3; z <= 3; z++) {
				const cube = new THREE.Mesh(boxGeometry, material);
				cube.position.set(x, y, z);
				cube.castShadow = true;
				cube.receiveShadow = true;
				group1.add(cube)
			}
	group1.scale.set(0.5, 0.5, 0.5);
	group1.position.set(10, 3, 10);
	scene.add(group1);

	const geometry = new THREE.BoxGeometry(10, 0.15, 10);
	material = new THREE.MeshPhongMaterial({
		color: 0xa0adaf,
		shininess: 150,
		specular: 0x111111
	});

	const ground = new THREE.Mesh(geometry, material);
	ground.scale.multiplyScalar(3);
	ground.castShadow = false;
	ground.receiveShadow = true;
	scene.add(ground);
}

function initShadowMapViewers() {
	dirLightShadowMapViewer = new ShadowMapViewer(dirLight);
	spotLightShadowMapViewer = new ShadowMapViewer(spotLight);
	resizeShadowMapViewers();
}

function initMisc() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	// Mouse control
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 2, 0);
	controls.update();

	clock = new THREE.Clock();
}

function resizeShadowMapViewers() {
	const size = window.innerWidth * 0.15;

	dirLightShadowMapViewer.position.x = 10;
	dirLightShadowMapViewer.position.y = 10;
	dirLightShadowMapViewer.size.width = size;
	dirLightShadowMapViewer.size.height = size;
	dirLightShadowMapViewer.update();

	spotLightShadowMapViewer.size.set(size, size);
	spotLightShadowMapViewer.position.set(size + 20, 10);
	spotLightShadowMapViewer.update();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	resizeShadowMapViewers();
	dirLightShadowMapViewer.updateForWindowResize();
	spotLightShadowMapViewer.updateForWindowResize();
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function renderScene() {
	renderer.render(scene, camera);
}

function renderShadowMapViewers() {
	dirLightShadowMapViewer.render(renderer);
	spotLightShadowMapViewer.render(renderer);
}

function render() {
	const delta = clock.getDelta();

	renderScene();
	if (viewDepthMap)
		renderShadowMapViewers();

	group.rotation.x += 0.25 * delta;
	group.rotation.y += 2.0 * delta;
	group.rotation.z += 1.0 * delta;

	//group.rotation.x = 0.4;
	//group.rotation.y = 0.45;
	//group.rotation.z = 0.3;

	group1.rotation.x += 0.05 * delta;
	group1.rotation.y += 0.5 * delta;
	group1.rotation.z += 0.25 * delta;
}
