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
    // Make a hexagon
    // Triangle 1
    0.25, 0.43, 0,
    0.25, -0.43, 0,
    0.5, 0, 0,
    // Triangle 2
    -0.25, 0.43, 0,
    -0.25, -0.43, 0,
    -0.5, 0, 0,
    // Triangle 3
    0.25, 0.43, 0,
    -0.25, 0.43, 0,
    -0.25, -0.43, 0,
    // Triangle 4
    -0.25, -0.43, 0,
    0.25, -0.43, 0,
    0.25, 0.43, 0
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
    mat3 matrixY;
    // column order
    matrixY[0] = vec3(cos(uTimeVert), 0.0, sin(uTimeVert)); // first column
    matrixY[1] = vec3(0.0, 1.0, 0.0); // second column
    matrixY[2] = vec3(-sin(uTimeVert), 0.0, cos(uTimeVert));
    vec3 translation = vec3(0.5*sin(uTimeVert), 0.5*cos(uTimeVert), 0);
    //vec3 transformedP = a_position;
    vec3 transformedP = matrixY * a_position + translation;
    gl_Position = vec4(transformedP, 1.0);
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
        float colorR = abs(cos(uTimeFrag  * 2.0));
        float pixelCordX = gl_FragCoord.x/screenSize.x;
        float pixelCordY = gl_FragCoord.y/screenSize.y;
        vec2 cord = vec2(pixelCordX, pixelCordY);
        mat2 matrix;
        float timeNew = uTimeFrag;
        matrix[0] = vec2(cos(timeNew), sin(timeNew));
        matrix[1] = vec2(-sin(timeNew), cos(timeNew));
        cord = matrix * cord;
        float colorG = abs(sin(cord.x * 30.0));
        float colorB = abs(cos(cord.y * 30.0));
        gl_FragColor = vec4(colorR, colorG, colorB, 1.0);  // Red color
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