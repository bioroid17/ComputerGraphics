"use strict";

var gl;

var figure = [];

var TORSO_HEIGHT        = 2.0;
var TORSO_WIDTH         = 5.0;
var UPPER_ARM_HEIGHT    = 5.0;
var UPPER_ARM_WIDTH     = 0.8;
var LOWER_ARM_HEIGHT    = 3.0;
var LOWER_ARM_WIDTH     = 0.5;

var theta = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const TORSO             = 0;
const HEAD              = 1;
const LEFT_UPPER_ARM    = 2;
const RIGHT_UPPER_ARM   = 3;
const LEFT_UPPER_LEG    = 4;
const RIGHT_UPPER_LEG   = 5;
const LEFT_LOWER_ARM    = 6;
const RIGHT_LOWER_ARM   = 7;
const LEFT_LOWER_LEG    = 8;
const RIGHT_LOWER_LEG   = 9;

// 변환 행렬 용
var modelViewMatrix;
var modelViewMatrixLoc;

// 투사 행렬
var projectionMatrix;
var projectionMatrixLoc;

// 조명 벡터 및 행렬
var lightPosition;
var lightPositionLoc;
var ambientProduct;
var ambientProductLoc;
var diffuseProduct;
var diffuseProductLoc;
var specularProduct;
var specularProductLoc;
var materialShininess;
var materialShininessLoc;

var stack = [];

window.onload = function init()
{
    var numNodes = 3;
    for(var i=0; i < numNodes; i++){
        figure[i] = createNode(null, null, null, null)
    }

    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var vertices = [
        vec2(-1.,  -1.),
        vec2(0,   1.),
        vec2( 1.,  -1.),
    ];

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1., 1., 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var eye = vec3(0, 0, -5);
    var at = vec3(0, 0, 0);
    var up = vec3(0, 1, 0);
    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    // ortho: left, right, bottom, top, near, far
    projectionMatrix = ortho(-1, 1, -1, 1, -2, 2);
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    
    lightPosition = vec4(-1.0, -1.0, -1.0, 0.0);   // directional light
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");

    var lightAmbient = vec4(0.2, 0.2, 0.8, 1.0);        // La
    var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);        // Ld
    var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);       // Ls

    var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);     // ka
    var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);     // kd
    var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);    // ks

    materialShininess = 50.0;  // a shininess for specular term
    materialShininessLoc = gl.getUniformLocation(program, "materialShininess");


    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );


    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    modelViewMatrix = rotate(theta[TORSO], 0, 1, 0);
    torso();

    // modelViewMatrix = mult(modelViewMatrix, translate(0.0, TORSO_HEIGHT, 0.0));
    // modelViewMatrix = mult(modelViewMatrix, rotate(theta[LOWER_ARM], 0, 0, 1));
    // lowerArm();

    // modelViewMatrix = mult(modelViewMatrix, translate(0.0, LOWER_ARM_HEIGHT, 0.0));
    // modelViewMatrix = mult(modelViewMatrix, rotate(theta[UPPER_ARM], 0, 0, 1));
    // upperArm();

    requestAnimationFrame(render);
}

function torso(){
    var instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*TORSO_HEIGHT, 0.0));
    instanceMatrix = mult(instanceMatrix, scalem(TORSO_WIDTH, TORSO_HEIGHT, TORSO_WIDTH));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i = 0; i < 6; i++){
        gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    }
}
function head(){
}
function leftUpperArm(){
}
function rightUpperArm(){
}
function leftUpperLeg(){
}
function rightUpperLeg(){
}
function leftLowerArm(){
}
function rightLowerArm(){
}
function leftLowerLeg(){
}
function rightLowerLeg(){
}

function createNode(transform, render, sibling, child){
    var node = {
        transform:transform,
        render:render,
        sibling:sibling,
        child:child,
    }
    return node;
}

function initNodes(id){
    var m = mat4();
    switch(id){
        case TORSO:
            m = rotate(theta[TORSO], 0, 1, 0);
            figure[TORSO] = createNode(m, torso, null, HEAD);
            break;
        case HEAD:
            m = rotate(theta[HEAD], 0, 1, 0);
            figure[TORSO] = createNode(m, head, LEFT_UPPER_ARM, null);
            break;
        case LEFT_UPPER_ARM:
            m = rotate(theta[LEFT_UPPER_ARM], 0, 1, 0);
            figure[TORSO] = createNode(m, leftUpperArm, RIGHT_UPPER_ARM, LEFT_LOWER_ARM);
            break;
        case RIGHT_UPPER_ARM:
            m = rotate(theta[RIGHT_UPPER_ARM], 0, 1, 0);
            figure[TORSO] = createNode(m, rightUpperArm, LEFT_UPPER_LEG, RIGHT_LOWER_ARM);
            break;
        case LEFT_UPPER_LEG:
            m = rotate(theta[LEFT_UPPER_LEG], 0, 1, 0);
            figure[TORSO] = createNode(m, leftUpperLeg, RIGHT_UPPER_LEG, LEFT_LOWER_LEG);
            break;
        case RIGHT_UPPER_LEG:
            m = rotate(theta[RIGHT_UPPER_LEG], 0, 1, 0);
            figure[TORSO] = createNode(m, rightUpperLeg, null, RIGHT_LOWER_LEG);
            break;
        case LEFT_LOWER_ARM:
            m = rotate(theta[LEFT_LOWER_ARM], 0, 1, 0);
            figure[TORSO] = createNode(m, leftLowerArm, RIGHT_LOWER_ARM, null);
            break;
        case RIGHT_LOWER_ARM:
            m = rotate(theta[RIGHT_LOWER_ARM], 0, 1, 0);
            figure[TORSO] = createNode(m, rightLowerArm, LEFT_LOWER_LEG, null);
            break;
        case LEFT_LOWER_LEG:
            m = rotate(theta[LEFT_LOWER_LEG], 0, 1, 0);
            figure[TORSO] = createNode(m, leftLowerLeg, RIGHT_LOWER_LEG, null);
            break;
        case RIGHT_LOWER_LEG:
            m = rotate(theta[RIGHT_LOWER_LEG], 0, 1, 0);
            figure[TORSO] = createNode(m, rightLowerLeg, null, null);
            break;
    }
}

function traverse(id){
    if (id == null){
        return;
    }

    stack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, figure[id].transform);

    figure[id].render();

    if (figure[id].child != null){
        traverse(figure[id].child);
    }

    modelViewMatrix = stack.pop();
    
    if (figure[id].sibling != null){
        traverse(figure[id].sibling);
    }
}