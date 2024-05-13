// get the canvas element and the WebGL context
const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl');


// verify webgl availability
if (!gl) {
    alert("WebGL not supported.");
}

// program for vertex shader
const vsSource = `
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    attribute vec4 aVertexPosition;
    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;

// program for fragment shader
const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    
    void main(){
        gl_FragColor = uColor; // color of the pixel
    }
`;

// function for initializing the shader program and attaching the shaders to the program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource); // vertexShader setup
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource); // fragmentShader setup
    const shaderProgram = gl.createProgram(); // create a gl shader program
    gl.attachShader(shaderProgram, vertexShader); // attach vertexShader to shader program
    gl.attachShader(shaderProgram, fragmentShader); // attach fragmentShader to shader program
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to start the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occured during complilation of the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// initialize shader program for drawing
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        color: gl.getUniformLocation(shaderProgram, 'uColor'),
    },
};

// initialize the buffers
function initBuffers(gl) {
    // create a buffer for the position of the squares
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // create a position array for the square
    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0
    ];

    // pass the position array to the WebGL buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return { position: positionBuffer, };
}

const buffers = initBuffers(gl);

// function for drawing the scene
function drawScene(gl, programInfo, buffers) {
    if (resizeCanvasToDisplaySize(gl.canvas)) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // make the color black and fully opaque
    gl.clearDepth(1.0); // clear the scene
    gl.depthFunc(gl.LEQUAL); // obscure far objects with near objects
    gl.enable(gl.DEPTH_TEST); // enable depth testing
    

    // clear canvas before drawing
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = 45 * Math.PI / 180; // 45 degrees field of view
     // Perspective matrix
     const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
     const zNear = 0.1;
     const zFar = 100.0;

     const projectionMatrix = mat4.create();  // create projection matrix
     mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
 
     // Set drawing position to "identity" point, which is the center of the scene
     const modelViewMatrix = mat4.create();
     mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]); // Move back 6 units
 
     // Tell WebGL how to pull out the positions from the position buffer
     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
     gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
 
     // Tell WebGL to use our program when drawing
     gl.useProgram(programInfo.program);
 
     // Set the shader uniforms
     gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
     gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
     gl.uniform4f(programInfo.uniformLocations.color, 1.0, 0.0, 0.0, 1.0);  // Red color
 
     // Draw the square
     gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);  // 4 is the number of vertices in the square
}

function resizeCanvasToDisplaySize(canvas) {
    const width = canvas.clientWidth * window.devicePixelRatio;
    const height = canvas.clientHeight * window.devicePixelRatio;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true; // Indicates the canvas size was changed
    }
    return false; // Indicates no change was made
}

drawScene(gl, programInfo, buffers);

