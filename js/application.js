// Paper.js is installed into the global scope
paper.install(window);

window.onload = function() {
  // Attach Paper.js to the canvas
  paper.setup('paper');

  var drawButton = document.getElementById('draw');
  drawButton.addEventListener('click', function() {
    try { drawHandler(); } catch(e) { alert('Cannot convert, try with another URL/file.') }
  });

  // Trigger the drawing with default values
  drawButton.click();
}

// Cross multiplication used to scale initial values.
function xmult(a, b, c) {
  // a --> b
  // c --> ??
  return (c * b) / a;
}

function drawHandler() {
  // Select URL or File
  var url = document.getElementById('url').value || URL.createObjectURL(document.getElementById('image').files[0]);
  var imageToDraw = new Image();

  // Prevent tainting the canvas on CORS-enabled served images
  imageToDraw.crossOrigin = 'Anonymous';
  imageToDraw.src = url;
  imageToDraw.onload = function() { draw(imageToDraw); }
}

function draw(imgElem) {
  // Wipe out the canvas
  project.clear();

  // Image and triangle scales, the default values were hand-picked. Different values
  // are scaled based on these using cross multiplication.
  var imageScale = parseFloat(document.getElementById('imgscale').value) || 50;
  var triangleScale = parseFloat(document.getElementById('triscale').value) || 31;

  // Our base image is hidden and resized a given number of times smaller.
  var baseImage = new Raster(imgElem);
  baseImage.visible = false;
  baseImage.position = view.center;
  baseImage.size = new Size(baseImage.size.width / imageScale, baseImage.size.height / imageScale);

  var up = true;
  for (var y = 0; y < baseImage.height; y++) {
    for(var x = 0; x < baseImage.width; x++) {
      // For every pixel in the image, a triangle is created.
      var color = baseImage.getPixel(x, y);
      var triangle = new Path.RegularPolygon(
        new Point(x * xmult(31, 26, triangleScale),
                  y * xmult(31, 45, triangleScale) + xmult(31, 57, triangleScale)),
        3,
        triangleScale);

      // Triangle orientation is swapped
      up = !up;
      triangle.rotate(up? 0:180);
      triangle.fillColor = color;
      triangle.strokeColor = color;

      // Put a border if the corresponding checkbox is checked.
      if(document.getElementById('borders').checked) {
        triangle.strokeColor.brightness *= .7;
      }

      // First and last triangles are cut in half to create a rectangular image.
      if(x == 0 || x == baseImage.width - 1) {
        var borderRectangle = new Path.Rectangle(
          new Point((x * xmult(31, 26, triangleScale)) - (x == 0? xmult(31, 27, triangleScale):xmult(31, -1, triangleScale)),
                    (y * xmult(31, 45, triangleScale)) + xmult(31, 25, triangleScale)),
          new Size(xmult(31, 26, triangleScale), xmult(31, 50, triangleScale)));
        borderRectangle.fillColor = 'white';
        borderRectangle.fillColor.alpha = .3;
        triangle.subtract(borderRectangle);
        triangle.visible = false;
        borderRectangle.visible = false;
      }
    }
  }

  // Uncomment this if you want a border around the resulting image
  // var p = new Path.Rectangle(project.activeLayer.bounds);
  // p.strokeColor = 'black';

  // Center everything
  project.activeLayer.position = view.center;
}
