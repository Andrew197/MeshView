//-------------------------------------------------------------
//Global Variables
//-------------------------------------------------------------
//html elements and context
var gl;
var canvas;

//shaders
var shaderProgram;
var loadedShaders = 0;

//textures
var diffuseTexture;

//matrices
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

//tumble variables
var rotationAngle = 0;
var vrotationAngle = 0;
var prevTime = 0;
var rotSpeed = 0.05;
var vrotSpeed = 0.05;
var scale = 1.0;

//keyboard control
var currentlyPressedKeys = {};

//-------------------------------------------------------------
//Initialization
//-------------------------------------------------------------
window.addEventListener('resize', resizeCanvas);

//a little jQuery magic to get things rolling
$(document).ready(function() 
{
    //get a WebGL context and the OBJ filename in the edit box
    initGL();
    submitOBJ();

});

function initGL() 
{
    try 
    {
        //find the canvas in the HTML page.
        canvas = document.getElementById("glCanvas");
        
        //this sends us to experimental mode if standard webGL isn't supported
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        //set the dimensions of the canvas viewport to match the browser's current size
        gl.viewportWidth  = canvas.width;
        gl.viewportHeight = canvas.height;


    }

    //error handling
    catch (e)    { alert("Sorry, WebGL is not supported on your device."); }
    if    (!gl)  { alert("Model Viewer Cannon Continue.");                 }
}

function submitOBJ()
{
    //get the OBJ's filename from the input box, then download it
    var OBJURL = "tmp.jpg";
    obj_download(gl, OBJURL, setupCallback);

    //reset scale when loading a new model
    scale = 1.0;
}

function setupCallback(loadedOBJ) 
{ 
    object = loadedOBJ; 

    //create event listeners for the keyboard controls
    document.onkeydown = keyPressed;
    document.onkeyup   = keyReleased;

    canvas.onmousedown = mousePressed;
    document.onmouseup = mouseReleased;
    document.onmousemove = mouseDragged;

    //set up basic GL parameters we need
    gl.clearColor(0.0, 0.5, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    resizeCanvas();

    //set up the shaders
    initShaders();

}


function initShaders()
{
    downloadShaders('phong.vert', 'phong.frag', function (shaderText) 
    {
        //define the shaders
        var vertexShader =   gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        //compile vertex shader from source
        gl.shaderSource(vertexShader, shaderText[0]);
        gl.compileShader(vertexShader);

        //compile frag shader from source
        gl.shaderSource(fragmentShader, shaderText[1]);
        gl.compileShader(fragmentShader);

        //create the shader program
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        //verify that the shader is valid GLSL
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) alert("GLSL Shaders Failed to Link");
        else
        {
            gl.useProgram(shaderProgram);

            //attributes
            shaderProgram.attrib_vPos = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            gl.enableVertexAttribArray(shaderProgram.attrib_vPos);

            shaderProgram.attrib_vNorm = gl.getAttribLocation(shaderProgram, "aVertexNormal");
            gl.enableVertexAttribArray(shaderProgram.attrib_vNorm);

            shaderProgram.attrib_texCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");
            gl.enableVertexAttribArray(shaderProgram.attrib_texCoord);

            //uniforms
            shaderProgram.pMatrixUniform  = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
            shaderProgram.nMatrixUniform  = gl.getUniformLocation(shaderProgram, "uNMatrix");
            shaderProgram.samplerUniform  = gl.getUniformLocation(shaderProgram, "uSampler");
            shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");

            initTextures();
        }
    });
}

//-------------------------------------------------------------
//File Loading
//-------------------------------------------------------------
function loadFile(url, callback) 
{
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onreadystatechange = function() 
    {
        if (request.readyState == 4) //4 = DONE
        {
            //200 = HTTP OK CODE
            if (request.status == 200) callback(request.responseText)
            else errorCallback(url);
        }
    };
    request.send(null);    
}

function downloadShaders(vShader, fShader, callback) 
{
    var programSrc = [];

    //asynchronously download the shaders
    loadFile(vShader, loadingDone);
    loadFile(fShader, loadingDone);

    //this callback is called after each file is loaded
    function loadingDone(text) 
    {
        programSrc[loadedShaders] = text;
        loadedShaders++;

        // When all files have downloaded
        if (loadedShaders == 2) 
            {
                //reset the file count to zero, for re-loading shaders later
                loadedShaders = 0;

                //send the fetched GLSL source code to initShaders
                callback(programSrc);
            }
    }
    
}
//-------------------------------------------------------------
//Uniform Updates
//-------------------------------------------------------------

function setUniforms() 
{
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,  false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

    gl.uniform3f(shaderProgram.pointLightingLocationUniform, 0, 0, 0);

}

//-------------------------------------------------------------
//Textures
//-------------------------------------------------------------
function initTextures() 
{
    //create a texture and image
    diffuseTexture       = gl.createTexture();
    diffuseTexture.image = new Image();

    //once the texture loads, process it.
    diffuseTexture.image.onload = function() 
    {
        //unpack the texture data
        gl.pixelStorei     (gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture     (gl.TEXTURE_2D, diffuseTexture);
        gl.texImage2D      (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, diffuseTexture.image);
        
        //texture filtering
        gl.texParameteri   (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri   (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

        //make mipmaps
        gl.generateMipmap  (gl.TEXTURE_2D);
    }
    //set the filename of the image we're using
    diffuseTexture.image.src = "metal.jpg";

    //start the display loop
    display();
}

//-------------------------------------------------------------
//User Controls
//-------------------------------------------------------------
var mouseDown = false;
var pMouseX = null;
var pMouseY = null;

function mousePressed(event) 
{
    mouseDown = true;
    pMouseX = event.clientX;
    pMouseY = event.clientY;
}

function mouseReleased(event) { mouseDown = false; }

function degToRad(degrees) { return degrees * Math.PI / 180; }

function mouseDragged(event) 
{
    if (!mouseDown) return;

    var mouseX = event.clientX;
    var mouseY = event.clientY;

    var tempX = Math.abs(mouseX - pMouseX);
    var tempY = Math.abs(mouseY - pMouseY);
    if (tempX > tempY) tempY = 0;
    else tempX = 0;

    if (mouseX > pMouseX && rotSpeed < 0.1 && tempX > 20) rotSpeed += 0.01;
    else if (mouseX < pMouseX && rotSpeed < 0.1 && tempX > 20) rotSpeed -= 0.01;

    if (mouseY > pMouseY && vrotSpeed < 0.1 && tempY > 20) vrotSpeed += 0.01;
    else if (mouseY < pMouseY && vrotSpeed > -0.1 && tempY > 20) vrotSpeed -= 0.01;

}

function rotation() 
{
    //calculate time
    var timeNow = new Date().getTime();
    if (prevTime != 0) 
    {
        //how much time has passed
        var elapsedTime = timeNow - prevTime;

        rotationAngle  += rotSpeed  * elapsedTime;
        vrotationAngle += vrotSpeed * elapsedTime;

        //clip rotation at the poles, to prevent the user feeling lost
        if (vrotationAngle >  90) vrotationAngle =  90;
        if (vrotationAngle < -90) vrotationAngle = -90;
    }
    prevTime = timeNow;

    //horizontal rotation
    if      (rotSpeed  > 0)  rotSpeed  *= 0.96;
    else if (rotSpeed  < 0)  rotSpeed  *= 0.96;

    //vertical rotation
    if      (vrotSpeed > 0)  vrotSpeed *= 0.96;
    else if (vrotSpeed < 0)  vrotSpeed *= 0.96;
}

function keyReleased(event) { currentlyPressedKeys[event.keyCode] = false; }
function keyPressed (event) { currentlyPressedKeys[event.keyCode] = true;  }

function keyboardInput() 
{
    // Left arrow
    if (currentlyPressedKeys[37] && rotSpeed > -0.1) rotSpeed -= 0.01;
    
    //right arrow
    if (currentlyPressedKeys[39] && rotSpeed < 0.1) rotSpeed += 0.01;

    //up arrow
    if (currentlyPressedKeys[38] && vrotSpeed > -0.1) vrotSpeed -= 0.01;

    //down arrow
    if (currentlyPressedKeys[40] && vrotSpeed < 0.1) vrotSpeed += 0.01;

    //plus and minus
    if (currentlyPressedKeys[187]) scale += 0.1;
    if (currentlyPressedKeys[189] && scale > 0.3) scale -= 0.1;

}

//-------------------------------------------------------------
//Render Functions
//-------------------------------------------------------------
function drawScene() 
{
    //set the viewport to match the current window's dimensions
    gl.viewport(0, 0, canvas.width, canvas.height);

    //set up a perspective based on the current window dimensions
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 2000.0, pMatrix);

    //boilerplate GL clearing
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //move the object down the Z axis so we can see it
    mat4.identity (mvMatrix);
    mat4.translate(mvMatrix, [0, 0, -20]);

    //rotate the object based on the unser's inputs
    mat4.rotate(mvMatrix, (rotationAngle  * Math.PI / 180), [0, 1, 0]);
    mat4.rotate(mvMatrix, (vrotationAngle * Math.PI / 180), [1, 0, 0]);

    //scale the object based on the user's inputs
    mat4.scale(mvMatrix, [scale, scale, scale]);

    //bind the textures and buffers to use
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, diffuseTexture);
    bindBuffers();

    //update uniforms
    setUniforms();

    

    //draw the object
    gl.drawElements(gl.TRIANGLES, object.indexBufferLength, gl.UNSIGNED_SHORT, 0);


}

function bindBuffers()
{
    //set up all of the attrib pointers
    gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.attrib_vPos,  3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, object.textureBuffer);
    gl.vertexAttribPointer(shaderProgram.attrib_texCoord,    2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, object.normalBuffer);
    gl.vertexAttribPointer(shaderProgram.attrib_vNorm,    3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
}

function display() 
{
    requestAnimFrame(display);    //Google's free refresh function calls display every frame
    keyboardInput();              //keyboard control handling
    rotation();                   //tumble motion
    drawScene();                  //draw the scene
}

function resizeCanvas() 
{
    //if the size of the window changes, update the viewport size to match
   if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) 
   {
        canvas.width      = canvas.clientWidth;
        canvas.height     = canvas.clientHeight;
        gl.viewportWidth  = canvas.width;
        gl.viewportHeight = canvas.height;
   }
}

