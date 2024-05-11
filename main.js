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
        gl_Position = uModelViewMatrix * uProjectionMatrix * aVertexPosition
    }
`;

// program for fragment shader
const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    
    void main(){
        gl_FragColor = uColor;
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
}

