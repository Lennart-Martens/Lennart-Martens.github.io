import * as THREE from 'three';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';

let camera, scene, renderer, controls;
let object, target;
let postScene, postCamera, postMaterial;

init();
animate();

function init() {

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
	camera.position.x = 5;
	camera.position.y = 5;
	camera.position.z = 5;

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	camera.lookAt(controls.target);

	// Create a render target with depth texture
	setupRenderTarget();
	// Our scene
	setupScene();
	// Setup post-processing step
	setupPost();
	onWindowResize();
	window.addEventListener('resize', onWindowResize);
}

// this is the render target, which is a 2D image that we want to render to
// instead of render 3D geometries directly to the screen, we render the result into
// this target, which is saved as a texture in the memory. This is also usually refered
// as framebuffer in many other context.
function setupRenderTarget() {

	if (target) target.dispose();

	target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
	target.texture.minFilter = THREE.NearestFilter;
	target.texture.magFilter = THREE.NearestFilter;
	target.stencilBuffer = false;
	// Three js support specifying the target as a depth texture, in this case, only
	// the depth information is retained in this texutre, all color information is discarded.
	target.depthTexture = new THREE.DepthTexture();
	target.depthTexture.format = THREE.DepthFormat;
	target.depthTexture.type = THREE.UnsignedIntType;
}

function setupPost() {

	// Setup post processing stage
	postCamera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1);
	postMaterial = new THREE.ShaderMaterial({
		vertexShader: `
		varying vec2 vUv;  // uv coordinates.
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
		fragmentShader: `
			#include <packing>
			varying vec2 vUv;
			uniform sampler2D tDepth;
			uniform float cameraNear;
			uniform float cameraFar;

			float readDepth( sampler2D depthSampler, vec2 coord ) {
				float fragCoordZ = texture2D( depthSampler, coord ).x;
				// convert z buffer value to actual z distance of fragments from the camera 
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				// maps the viewZ to [0,1] based on the orthogonal camera specifiction.
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			}
			void main() {
				float depth = readDepth( tDepth, vUv ); //[0, 1]
				gl_FragColor.rgb = 1.0 - vec3( depth );
				gl_FragColor.a = 1.0;
			}`,
		uniforms: {
			cameraNear: { value: camera.near },
			cameraFar: { value: camera.far },
			tDepth: { value: null }
		}
	});
	const postPlane = new THREE.PlaneGeometry(2, 2);
	const postQuad = new THREE.Mesh(postPlane, postMaterial);
	postScene = new THREE.Scene();
	postScene.add(postQuad);
}

function setupScene() {
	scene = new THREE.Scene();
	
	const headphoneTexture = new THREE.TextureLoader().load('models/headphone.png');
	const headphoneMaterial = new THREE.MeshStandardMaterial({ map: headphoneTexture, metalness: 0.8 });

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
		const scale = 8.0 / maxDimension;
		object.scale.set(scale, scale, scale);
		object.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

		// Add the model to the scene
		scene.add(object);
		render();
	}, onProgress, onError);
}

function onWindowResize() {

	const aspect = window.innerWidth / window.innerHeight;
	camera.aspect = aspect;
	camera.updateProjectionMatrix();

	const dpr = renderer.getPixelRatio();
	target.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

	requestAnimationFrame(animate);

	// render scene into target texture instead of screen.
	renderer.setRenderTarget(target);
	renderer.render(scene, camera);

	// render the texture to the quad
	postMaterial.uniforms.tDepth.value = target.depthTexture;

	// disable the rendering target, since now we are rendering to the screen
	renderer.setRenderTarget(null);
	renderer.render(postScene, postCamera);

	controls.update(); // required because damping is enabled
}