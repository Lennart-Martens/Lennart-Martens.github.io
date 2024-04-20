// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const nWidth = width / Math.max(width, height) * 10;
const nHeight = height / Math.max(width, height) * 10;
scene.add(camera);

camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create shapes
const torus = new THREE.TorusGeometry(0.8, 0.2, 16, 100);
const torus2 = new THREE.TorusGeometry(0.8, 0.2, 16, 100);
const sphere  = new THREE.SphereGeometry(0.2, 16, 16);
const sphere2 = new THREE.SphereGeometry(0.2, 16, 16);
const center = new THREE.SphereGeometry(0.2, 16, 16);

// Define materials
const black = new THREE.MeshBasicMaterial({ color: 0x000000 });
const red = new THREE.LineBasicMaterial({ color: 0xff0000 });
const green = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const blue = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const magenta = new THREE.MeshBasicMaterial({ color: 0xff00ff });
const cyan = new THREE.MeshBasicMaterial({ color: 0x00ffff });

// Create meshes and add to scene
const torusMesh = new THREE.Mesh(torus, green);
const torusMesh2 = new THREE.Mesh(torus2, blue);
const sphereMesh = new THREE.Mesh(sphere, magenta);
const sphereMesh2 = new THREE.Mesh(sphere2, cyan);
const centerMesh = new THREE.Mesh(center, black);
scene.add(torusMesh);
scene.add(torusMesh2);
scene.add(sphereMesh);
scene.add(sphereMesh2);
scene.add(centerMesh);

// Create and add edge geometries
const torusGeometry = new THREE.EdgesGeometry(torus);
const torusGeometry2 = new THREE.EdgesGeometry(torus2);
const centerGeometry = new THREE.EdgesGeometry(center);
const torusEdges = new THREE.LineSegments(torusGeometry, red);
const torusEdges2 = new THREE.LineSegments(torusGeometry2, red);
const centerEdges = new THREE.LineSegments(centerGeometry, red);
scene.add(torusEdges);
scene.add(torusEdges2);
scene.add(centerEdges);

// Make groups
const group = new THREE.Group();
const group2 = new THREE.Group();
scene.add(group);
scene.add(group2);

// Add elements to groups
group.add(torusMesh);
group.add(torusMesh2);
group.add(torusEdges);
group.add(torusEdges2);
group.scale.set(2, 2, 2);
group2.add(sphereMesh);
group2.add(sphereMesh2);

// Adjust rotations
group.rotation.x = 1.5;
torusMesh.rotation.y = -0.7;
torusEdges.rotation.y = -0.7;
torusMesh2.rotation.y = 0.7;
torusEdges2.rotation.y = 0.7;
centerMesh.rotation.z = 0.1;

// Adjust positions
torusMesh.position.set(0, 0.3, 0);
torusEdges.position.set(0, 0.3, 0);
torusMesh2.position.set(-0, -0.3, 0);
torusEdges2.position.set(-0, -0.3, 0);
sphereMesh.position.set(2.8, 0, 0.6);
sphereMesh2.position.set(-2.8, 0, -0.6);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate groups
    group.rotation.z += 0.01;
    group2.rotation.y += 0.02;
    group2.rotation.z += 0.002;

    // Rotate individual elements
    torusMesh.rotation.z -= 0.015;
    torusEdges.rotation.z -= 0.015;
    torusMesh2.rotation.z -= 0.015;
    torusEdges2.rotation.z -= 0.015;

    renderer.render(scene, camera);
}

animate();