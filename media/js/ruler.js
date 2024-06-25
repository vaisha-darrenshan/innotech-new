var holder = document.querySelector('.measure');
var threshold = 10;
var data, width, height;
var worker;
var canvas, ctx;
var inputX, inputY;
var body = document.body;


var lineColor = [0, 0, 1];
var colorThreshold = [0.65, 0.35, 0.39];

const offsetLeft1 = holder.parentElement.parentElement.offsetLeft
const offsetLeft2 = holder.offsetLeft

const offsetTop = holder.parentElement.parentElement.offsetTop



// prefetch header images for the Dimensions canvas


function storeInputPos (e) {
  e.preventDefault();

  if (window.ruler_freestyle_activated || window.resizingRulerBox || window.draggingRulerBox)
    return false

  inputX = e.pageX - holder.parentElement.parentElement.offsetLeft - holder.offsetLeft;
  inputY = e.pageY - holder.parentElement.parentElement.offsetTop;

  /* 
  const rect = holder.getBoundingClientRect()

  inputX = e.clientX - rect.left;
  inputY = e.clientY - rect.top;
  */

  /* console.log(
    'storeInputPos\n',
    '\ninputX\n',
    inputX,
    '\ninputY\n',
    inputY,
    '\ne.pageX\n',
    e.pageX,
    '\ne.pageY\n',
    e.pageY,
    '\ne.clientX\n',
    e.clientX,
    '\ne.clientY\n',
    e.clientY,
    '\nholder.offsetTop\n',
    holder.offsetTop,
    '\nholder.scrollTop\n',
    holder.scrollTop,
    '\nholder.clientTop\n',
    holder.clientTop,
    '\nholder.getBoundingClientRect()\n',
    holder.getBoundingClientRect()
  ) */

  if (e.target.classList && !e.target.classList.contains('buy-button')) {
    sendToWorker(e);
  } else {
    removeDimensions()
  }
}

function sendToWorker (event) {
  console.log('sendToWorker', event, inputX, inputY)
  worker.postMessage({ 
    type: 'position', 
    x: inputX, 
    y: inputY
  });
}

function removeDimensions () {
  var dimensions = holder.querySelector('.fn-dimensions');
  if (dimensions)
    holder.removeChild(dimensions);
}

//
// showDimensions
// =============
//  
// renders the visualisation of the measured distances
//

function showDimensions (dimensions) {
  console.log('show dimensions from ruler wtf!', dimensions)

  if (!dimensions) {
    return;
  }

  console.log('show dimensions from ruler wtf!', dimensions)

  var newDimensions = body.querySelector('.fn-dimensions') || document.createElement('div');
  var xAxis = body.querySelector('.x.fn-axis') || document.createElement('div');
  var yAxis = body.querySelector('.y.fn-axis') || document.createElement('div');
  var tooltip = body.querySelector('.fn-tooltip') || document.createElement('div');

  newDimensions.className = 'fn-dimensions';

  newDimensions.style.webkitTransform = `translate(${dimensions.x}px, ${dimensions.y}px)`
  newDimensions.style.MozTransform = `translate(${dimensions.x}px, ${dimensions.y}px)`
  newDimensions.style.msTransform = `translate(${dimensions.x}px, ${dimensions.y}px)`
  newDimensions.style.OTransform = `translate(${dimensions.x}px, ${dimensions.y}px)`

  console.log(
    'hihi',
    Math.abs(dimensions.backgroundColor[0] - lineColor[0]),
    Math.abs(dimensions.backgroundColor[0] - lineColor[0]) <= colorThreshold[0],
    Math.abs(dimensions.backgroundColor[1] - lineColor[1]),
    Math.abs(dimensions.backgroundColor[1] - lineColor[1]) <= colorThreshold[1],
    Math.abs(dimensions.backgroundColor[2] - lineColor[2]),
    Math.abs(dimensions.backgroundColor[2] - lineColor[2]) <= colorThreshold[2],
    dimensions.backgroundColor,
    lineColor
  )

  if (Math.abs(dimensions.backgroundColor[0] - lineColor[0]) <= colorThreshold[0] &&
      Math.abs(dimensions.backgroundColor[1] - lineColor[1]) <= colorThreshold[1] &&
      Math.abs(dimensions.backgroundColor[2] - lineColor[2]) <= colorThreshold[2]) {
    newDimensions.className += ' altColor';
    console.log('altColor?')
  }

  var measureWidth = dimensions.left + dimensions.right;
  var measureHeight = dimensions.top + dimensions.bottom;

  xAxis.className = 'x fn-axis';
  xAxis.style.width = measureWidth + "px";

  yAxis.className = 'y fn-axis';
  yAxis.style.height = measureHeight + "px";

  xAxis.style.webkitTransform = `translateX(${-dimensions.left}px)`
  xAxis.style.MozTransform = `translateX(${-dimensions.left}px)`
  xAxis.style.msTransform = `translateX(${-dimensions.left}px)`
  xAxis.style.OTransform = `translateX(${-dimensions.left}px)`

  yAxis.style.webkitTransform = `translateY(${-dimensions.top}px)`
  yAxis.style.MozTransform = `translateY(${-dimensions.top}px)`
  yAxis.style.msTransform = `translateY(${-dimensions.top}px)`
  yAxis.style.OTransform = `translateY(${-dimensions.top}px)`

  tooltip.className = 'fn-tooltip';

  //console.log(dimensions)

  // add +1 on both axis because of the pixel below the mouse pointer
  tooltip.textContent = (measureWidth+1) +" × "+ (measureHeight+1);

  if(dimensions.y < 45)
    tooltip.classList.add('bottom');

  if(dimensions.x > 900)
    tooltip.classList.add('left');


  if (!body.querySelector('.fn-dimensions')) {
    newDimensions.appendChild(xAxis);
    newDimensions.appendChild(yAxis);
    newDimensions.appendChild(tooltip);
    holder.appendChild(newDimensions);
  }
}


//
// drawCanvas
// ----------
//  
// responsible to draw the objects onto the canvas
//

function drawCanvas () {
  // console.log('drawCanvas!')
  canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');
  var image = document.getElementById('rulerImg');

  // adjust the canvas size to the image size
  width = canvas.width = holder.clientWidth;
  height = canvas.height = holder.clientHeight;
  
  // draw the background
  ctx.drawImage(image, 0, 0, image.width, image.height);

  // read out the image data from the canvas
  var imgData = ctx.getImageData(0, 0, width, height).data;
  // console.log('imgData', imgData, image, image.width, image.height)
  worker = new Worker("demo-build/worker.js");
  worker.onmessage = receiveMessage;
  worker.postMessage({ 
    type: 'imgData',
    imgData: imgData,
    imgDataBuffer: imgData.buffer,  
    width: width,
    height: height,
    threshold: threshold
  }, [imgData.buffer]);

  holder.onmousemove = storeInputPos;
  holder.ontouchmove = storeInputPos;

  holder.onmouseleave = removeDimensions;

  //worker.postMessage({ type: 'debug' });
}

window.drawCanvas = drawCanvas

function receiveMessage (event) {
  // console.log('receiveMessage', event.data)
  switch (event.data.type) {
    case 'distances': 
      showDimensions(event.data.distances);
      break;
    case 'debug':
      debugCanvas(event.data.data);
      break;
  }
}

function debugCanvas (binaries) {
  var imgData = ctx.createImageData(width, height);

  for(var i=0, x=0, l=imgData.data.length; i<l; i+=4, x++){
    var gray = binaries[x];
    imgData.data[i]   = gray;
    imgData.data[i+1] = gray;
    imgData.data[i+2] = gray;
    imgData.data[i+3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);
  
  document.body.appendChild(canvas);
}

var checkExist = setInterval(function() {
  if (document.getElementById('rulerImg')) {
    drawCanvas();
    clearInterval(checkExist);
  }
}, 1000);


