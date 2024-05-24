// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Star geometry from obj file
const vertices = new Float32Array([
    1.225587, 0.000000, 0.000000,
    0.408529, 0.408529, 0.000000,
    0.408529, 0.000000, 0.408529,
    0.408529, 0.000000, -0.408529,
    0.408529, -0.408529, 0.000000,
    -1.225587, 0.000000, 0.000000,
    -0.408529, 0.408529, 0.000000,
    -0.408529, 0.000000, 0.408529,
    -0.408529, -0.408529, 0.000000,
    -0.408529, 0.000000, -0.408529,
    0.000000, 1.225587, 0.000000,
    0.000000, 0.408529, 0.408529,
    0.000000, 0.408529, -0.408529,
    0.000000, -1.225587, 0.000000,
    0.000000, -0.408529, -0.408529,
    0.000000, -0.408529, 0.408529,
    0.000000, 0.000000, 1.225587,
    0.000000, 0.000000, -1.225587]);

let indices = [
    2, 1, 4,
    1, 3, 5,
    3, 2, 12,
    1, 2, 3,
    4, 1, 5,
    2, 4, 13,
    5, 3, 16,
    12, 2, 11,
    3, 12, 17,
    4, 5, 15,
    2, 13, 11,
    13, 4, 18,
    5, 16, 14,
    16, 3, 17,
    12, 11, 7,
    17, 12, 8,
    15, 5, 14,
    4, 15, 18,
    11, 13, 7,
    13, 18, 10,
    14, 16, 9,
    16, 17, 8,
    12, 7, 8,
    15, 14, 9,
    18, 15, 10,
    7, 13, 10,
    9, 16, 8,
    8, 7, 6,
    15, 9, 10,
    7, 10, 6,
    9, 8, 6,
    10, 9, 6,
];
indices = indices.map(item => item - 1);
let colors = new Float32Array(vertices.length)
for (let i = 0; i < colors.length; i++) {
    colors[i] = Math.random();
}

// Create a geometry, add the vertices and colors, and define the faces using indices
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setIndex(indices);
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Define a material that uses the vertex colors
const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });

// Create a mesh with the geometry and material
const square = new THREE.Mesh(geometry, material);
scene.add(square);

camera.position.z = 3;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the star
    square.rotation.x += 0.01;
    square.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();
