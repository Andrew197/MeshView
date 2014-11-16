//-------------------------------------------------------------
//Global Variables
//-------------------------------------------------------------

//Download a wavefront OBJ using jQuery ajax calls
function obj_download(glContext, fileName, callback)
{
  var model = new Object();

  $.ajax(
  {
    url: fileName,
    cache: false,
    dataType: 'text',
    success: function(data) 
    {
      model = new obj_create(data);
      obj_bindBuffers(model, glContext);
      callback(model); 
    }
  });
}

function obj_create(objectData)
{
  var fileLines;

  var mesh_v = [];
  var mesh_vn = [];
  var mesh_vt = [];

   //container to hold the data
   //since I cannot "push" to a this.variable
   var modelData = {};
    modelData.mesh_v = [];
    modelData.mesh_vn = [];
    modelData.mesh_vt = [];
    modelData.tempIndices = {};
    modelData.indices = [];
    modelData.index = 0;

  // array of fileLines separated by the newline
  fileLines = objectData.split('\n');

  //take each line and store it in a data structure based on its type
  for(var i=0; i<fileLines.length; i++)
  {
    var line = fileLines[i].split(" ");

    switch(line[0])
    {
      case "v":
        addVertex(fileLines[i], mesh_v);
        break;

      case "vn":
        addVertNormal(fileLines[i], mesh_vn);
        break;

      case "vt":
        addTextureData(fileLines[i], mesh_vt);
        break;

      case "f":
        addFace(fileLines[i], mesh_v, mesh_vn, mesh_vt, modelData);
        break;
    }
  }
  this.vertexPositions = modelData.mesh_v;
  this.vertexNormals   = modelData.mesh_vn;
  this.textures        = modelData.mesh_vt;
  this.indices         = modelData.indices;
}

function addVertex(dataLine, mesh_v)
{
  dataLine = dataLine.slice(2);
  dataLine = dataLine.split(" ");
  mesh_v.push(dataLine[0],dataLine[1],dataLine[2]);
}

function addVertNormal(dataLine, mesh_vn)
{
  dataLine = dataLine.slice(3);
  dataLine = dataLine.split(" ");
  mesh_vn.push(dataLine[0],dataLine[1],dataLine[2]);
}

function addTextureData(dataLine, mesh_vt)
{
  dataLine = dataLine.slice(3);
  dataLine = dataLine.split(" ");
  mesh_vt.push(dataLine[0], dataLine[1]);
}

function addFace(dataLine, mesh_v, mesh_vn, mesh_vt, modelData)
{
  //get rid of the 'f '
  dataLine = dataLine.slice(2);

  //seperate the line into groups of indices
  dataLine = dataLine.split(" ");

  //for every group of indices...
  for(var i=0; i<dataLine.length; i++)
  {
      var face = dataLine[i].split('/');
      
      modelData.mesh_v.push    (mesh_v [(face[0]-1)*3], mesh_v  [(face[0]-1)*3+1],mesh_v[(face[0]-1)*3+2]);
      modelData.mesh_vt.push   (mesh_vt[(face[1]-1)*2], mesh_vt [(face[1]-1)*2+1]);
      modelData.mesh_vn.push   (mesh_vn[(face[2]-1)*3], mesh_vn [(face[2]-1)*3+1],mesh_vn[(face[2]-1)*3+2]);

      modelData.indices.push(modelData.index);
      modelData.index += 1;
    
  }
}

function obj_bindBuffers(model, glContext)
{
  model.normalBuffer  = glContext.createBuffer();
  model.textureBuffer = glContext.createBuffer();
  model.vertexBuffer  = glContext.createBuffer();
  model.indexBuffer   = glContext.createBuffer();

  //Set the size variables
  model.normalBufferLength  = model.vertexNormals.length;
  model.textureBufferLength = model.textures.length;
  model.vertexBufferLength  = model.vertexPositions.length;
  model.indexBufferLength   = model.indices.length;

  //Send the prepared buffer data
  glContext.bindBuffer(glContext.ARRAY_BUFFER, model.normalBuffer);
  glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(model.vertexNormals), glContext.STATIC_DRAW);

  glContext.bindBuffer(glContext.ARRAY_BUFFER, model.textureBuffer);
  glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(model.textures), glContext.STATIC_DRAW);

  glContext.bindBuffer(glContext.ARRAY_BUFFER, model.vertexBuffer);
  glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(model.vertexPositions), glContext.STATIC_DRAW);

  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), glContext.STATIC_DRAW);
}