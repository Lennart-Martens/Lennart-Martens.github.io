// Importing OrbitControls (make sure the path matches the version you are using)
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';

let camera, scene, renderer;
let object;
init();

function init() {

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20);
	camera.position.z = 2.5;

	// scene
	scene = new THREE.Scene();

	const ambientLight = new THREE.AmbientLight(0xcccccc, 3.2);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
	directionalLight.position.set(1, 1, 0).normalize();
	scene.add(directionalLight);

	const envMaploader = new THREE.CubeTextureLoader();
	const environmentMap = envMaploader.load([
		'textures/Bridge/posx.jpg', 'textures/Bridge/negx.jpg',
		'textures/Bridge/posy.jpg', 'textures/Bridge/negy.jpg',
		'textures/Bridge/posz.jpg', 'textures/Bridge/negz.jpg'
	]);
	scene.environment = environmentMap;
	scene.background = environmentMap;

	const headphoneTexture = new THREE.TextureLoader().load('models/headphone.png');
	const headphoneMaterial = new THREE.MeshMatcapMaterial({ map: headphoneTexture });

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
				child.material = headphoneMaterial; // Apply the material to each mesh
			}
		});

		// Calculate the bounding box to get model size and center
		const boundingBox = new THREE.Box3().setFromObject(object);
		// Center the model
		const center = boundingBox.getCenter(new THREE.Vector3());
		// Scale the model to a unit scale and center it to (0,0,0)
		const size = boundingBox.getSize(new THREE.Vector3());
		const maxDimension = Math.max(size.x, size.y, size.z);
		const scale = 1.0 / maxDimension;
		object.scale.set(scale, scale, scale);
		object.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

		// Add the model to the scene
		scene.add(object);
		render();
	}, onProgress, onError);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render);
	window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
	renderer.render(scene, camera);
}
