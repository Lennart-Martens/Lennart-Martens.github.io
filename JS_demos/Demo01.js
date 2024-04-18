// Grab the canvas
const canvas = document.getElementById('canvas');

// Set canvas to fill window and update context
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
  
// Initial resize
resizeCanvas();

// Get the WebGL context
const gl = canvas.getContext('webgl');

// If we don't have a GL context, WebGL is not supported
if (!gl) {
    alert('WebGL not supported');
}

// Define the vertices for the triangle
const vertices = new Float32Array([
    // A hexagon, scaled for a 16:9 screen
    // Triangle 1
    0.1125, 0.345, 0,
    0.1125, -0.345, 0,
    0.225, 0, 0,
    // Triangle 2
    -0.1125, 0.345, 0,
    -0.1125, -0.345, 0,
    -0.225, 0, 0,
    // Triangle 3
    0.1125, 0.345, 0,
    -0.1125, 0.345, 0,
    -0.1125, -0.345, 0,
    // Triangle 4
    -0.1125, -0.345, 0,
    0.1125, -0.345, 0,
    0.1125, 0.345, 0
]);

// Create a buffer and put the vertices in it
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

/// Define the vertex shader
const vsSource = `
attribute vec3 a_position;
uniform float uTimeVert;
void main() {
    mat4 matrixT;
    // column order
    matrixT[0] = vec4(cos(uTimeVert), 0.0, sin(uTimeVert), 0);
    matrixT[1] = vec4(0.0, 1.0, 0.0, 0);
    matrixT[2] = vec4(-sin(uTimeVert), 0.0, cos(uTimeVert), 0);
    matrixT[3] = vec4(0.5*sin(uTimeVert), 0.5*cos(uTimeVert), 0, 1);
    vec4 position = vec4(a_position, 1.0);
    gl_Position = matrixT * position;
}
`;

// Define the fragment shader
// gl_FragCoord.x and gl_FragCoord.y give the pixel coordinates
// gl_FragCoord.z is the depth value, and gl_FragCoord.w is 1.0/w where w is the clip-space w-coordinate
const fsSource = `
    precision mediump float;
    uniform float uTimeFrag;
    uniform vec2 screenSize; // screen resolution.
    void main() {
        // RGB values circle the color wheel every two cycles
        float colorR = sin(uTimeFrag*0.6)+0.5;
        float colorG = sin(uTimeFrag*0.6+1.333*3.14)+0.5;
        float colorB = sin(uTimeFrag*0.6+0.667*3.14)+0.5;
        gl_FragColor = vec4(colorR, colorG, colorB, 1.0);
    }
`;

// Create and compile the vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    const errorMsg = gl.getShaderInfoLog(vertexShader);
    console.error("Vertex shader compilation failed: " + errorMsg);
}

// Create and compile the fragment shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    const errorMsg = gl.getShaderInfoLog(fragmentShader);
    console.error("Fragment shader compilation failed: " + errorMsg);
}

// Create the shader program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// Use the program
gl.useProgram(program);

// Get the location of the attribute
const positionLocation = gl.getAttribLocation(program, "a_position");
const uTimeVLocation = gl.getUniformLocation(program, "uTimeVert");
const uTimeFLocation = gl.getUniformLocation(program, "uTimeFrag");
const screenSizeLocation = gl.getUniformLocation(program, "screenSize");
const screenWidth = canvas.width; // Assuming 'canvas' is your WebGL canvas
const screenHeight = canvas.height;

// Enable the attribute
gl.enableVertexAttribArray(positionLocation);

// Tell the attribute how to get data out of the buffer
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

// Function to update time uniform
function render() {
    const currentTime = performance.now() * 0.001; // Current time in seconds

    // Set the time uniform
    gl.uniform1f(uTimeVLocation, currentTime);
    gl.uniform1f(uTimeFLocation, currentTime);
    gl.uniform2f(screenSizeLocation, screenWidth, screenHeight);

    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3);

    // Loop the render function to animate
    requestAnimationFrame(render);
}
  
// Listen for window resize events
window.addEventListener("resize", resizeCanvas);

// Start the rendering loop
render();