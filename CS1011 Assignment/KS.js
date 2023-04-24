function Kaleido(canvas) {
	var angle60 = Math.PI / 3;		// 60 degrees in raidans
	var angle120 = angle60 * 2;		// 120 degrees in radians
	var angle180 = Math.PI;			// 180 degrees in radians

	var sprinklesWidth = 890;
	var sprinklesHeight = 678;
	var sprinklesX = sprinklesY = 0;
	var sprinklesDX = sprinklesDY = 1;

	var sprinkesCanvas = sprinklesContext = null;
	var mirrorCanvas = mirrorContext = null;

	var kaleidoSize = 300;	// Diameter
	var kaleidoHalf = Math.floor(kaleidoSize/2);

	var destCanvas = canvas;	// Canvas to draw to
	var destContext = null;		// Context to draw to
	var destA = 0;	// Angle

	var reMirror = true;		// Flag denoting whether mirror canvas needs to be redrawn

	var advanceCount = 0;

	// KaleidoCanvas it a temporary canvas for creating mirror segments
	var kaleidoCanvas = createCanvas(kaleidoSize, kaleidoSize);
	var kaleidoContext = (kaleidoCanvas) ? kaleidoCanvas.getContext('2d') : null;

	// Get the context of the destination canvas
	if ((destCanvas) && (destCanvas.getContext)) {
		destContext = destCanvas.getContext('2d');
		
		// Create canvases for sprinkles and mirror
		sprinklesCanvas = createCanvas(sprinklesWidth, sprinklesHeight);
		if (sprinklesCanvas) sprinklesContext = sprinklesCanvas.getContext('2d');

		mirrorCanvas = createCanvas(sprinklesWidth, sprinklesHeight);
		if (mirrorCanvas) mirrorContext = mirrorCanvas.getContext('2d');
	}

	function createCanvas(width, height) {
		tempCanvas = document.createElement('canvas');
		if (tempCanvas) {
			tempCanvas.width = width;
			tempCanvas.height = height;
		}
		return tempCanvas;
	}

	// Draws a random triangle at (x, y) in the sprinkles canvas
	this.triangle = function(x, y) {
		if (sprinklesContext == null) return;
		var angle = Math.random()*2*Math.PI;
		sprinklesContext.fillStyle = 'rgb('+Math.floor(Math.random()*256)+','+Math.floor(Math.random()*256)+','+Math.floor(Math.random()*256)+')';
		sprinklesContext.save();
		sprinklesContext.translate(x, y);
		sprinklesContext.rotate(angle);

		// 30% chance of a triangle.  70% chance of a triangular hole
		if (Math.random() > 0.3) sprinklesContext.globalCompositeOperation = 'destination-out';

		sprinklesContext.beginPath();
		sprinklesContext.moveTo(0, Math.floor(Math.random()*15)-12);
		sprinklesContext.lineTo(Math.floor(Math.random()*15)-12, Math.floor(Math.random()*15)+2);
		sprinklesContext.lineTo(Math.floor(Math.random()*15)+2, Math.floor(Math.random()*15)+2);
		sprinklesContext.fill();
		sprinklesContext.restore();
		reMirror = true;	// Sprinkles canvas has changed, so will need to be remirrored
	}
	
	// Draws a random triangle at a random location
	this.randomTriangle = function() {
		if (sprinklesContext == null) return;
		var x = Math.floor(Math.random()*(sprinklesCanvas.width - 30))+15;
		var y = Math.floor(Math.random()*(sprinklesCanvas.height - 30))+15;
		this.triangle(x, y);
	}

	this.sprinkles = function() {
		if (sprinklesContext == null) return;
		var number = sprinklesWidth * sprinklesHeight / 200;
		for (var i=0; i<number; i++) {
			this.randomTriangle();
		}

		if (reMirror) reMirrorCanvas();		// If the canvas has changed, remirror it
	}
	
	// This function creates a new mirror image of the sprinkles canvas
	function reMirrorCanvas() {
		if (mirrorContext) {
			mirrorContext.save();
			mirrorContext.clearRect(0, 0, sprinklesWidth, sprinklesHeight);
			mirrorContext.translate(sprinklesWidth, 0);
			mirrorContext.scale(-1, 1);
			mirrorContext.drawImage(sprinklesCanvas, 0, 0);
			mirrorContext.restore();
		}

		reMirror = false;		// Reset remirror flag because we have done it
	}
	
	this.draw = function() {
		advanceCount++;
		if (advanceCount > 1) return;
		destContext.clearRect(0, 0, destCanvas.width, destCanvas.height);

		var x1 = kaleidoHalf * Math.cos(destA);
		var y1 = kaleidoHalf * Math.sin(destA);
	
		var x2 = kaleidoHalf * Math.cos(destA + angle120);
		var y2 = kaleidoHalf * Math.sin(destA + angle120);
	
		var x3 = kaleidoHalf * Math.cos(destA - angle120);
		var y3 = kaleidoHalf * Math.sin(destA - angle120);

		// Build clip
		kaleidoContext.clearRect(0, 0, kaleidoSize, kaleidoSize);
		kaleidoContext.save();
		kaleidoContext.translate(kaleidoHalf, kaleidoHalf);
		kaleidoContext.beginPath();
		kaleidoContext.moveTo(x1, y1);
		kaleidoContext.lineTo(x2, y2);
		kaleidoContext.lineTo(x3, y3);
		kaleidoContext.clip();

		// Centre triangle
		kaleidoContext.rotate(-destA);
		kaleidoContext.drawImage(sprinklesCanvas, sprinklesX, sprinklesY, kaleidoSize, kaleidoSize, -kaleidoHalf, -kaleidoHalf, kaleidoSize, kaleidoSize);

		destContext.save();
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, 100, 100, kaleidoSize, kaleidoSize);

		// Triangle -120 degrees
		kaleidoContext.clearRect(-kaleidoHalf, -kaleidoHalf, kaleidoSize, kaleidoSize);
		kaleidoContext.rotate(-angle120);
		kaleidoContext.drawImage(sprinklesCanvas, sprinklesX, sprinklesY, kaleidoSize, kaleidoSize, -kaleidoHalf, -kaleidoHalf, kaleidoSize, kaleidoSize);
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoHalf * Math.cos(destA)) + (kaleidoHalf * Math.cos(destA + angle60)) + 100, (kaleidoHalf * Math.sin(destA)) + (kaleidoHalf * Math.sin(destA + angle60)) + 100, kaleidoSize, kaleidoSize);
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoHalf * Math.cos(destA + angle120)) + (kaleidoHalf * Math.cos(destA + angle180)) + 100, (kaleidoHalf * Math.sin(destA + angle120)) + (kaleidoHalf * Math.sin(destA + angle180)) + 100, kaleidoSize, kaleidoSize);
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoHalf * Math.cos(destA - angle120)) + (kaleidoHalf * Math.cos(destA - angle60)) + 100, (kaleidoHalf * Math.sin(destA - angle120)) + (kaleidoHalf * Math.sin(destA - angle60)) + 100, kaleidoSize, kaleidoSize);

		// Triangle +120 degrees
		kaleidoContext.clearRect(-kaleidoHalf, -kaleidoHalf, kaleidoSize, kaleidoSize);
		kaleidoContext.rotate(-angle120);
		kaleidoContext.drawImage(sprinklesCanvas, sprinklesX, sprinklesY, kaleidoSize, kaleidoSize, -kaleidoHalf, -kaleidoHalf, kaleidoSize, kaleidoSize);
		kaleidoContext.restore();
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoHalf * Math.cos(destA)) + (kaleidoHalf * Math.cos(destA - angle60)) + 100, (kaleidoHalf * Math.sin(destA)) + (kaleidoHalf * Math.sin(destA - angle60)) + 100, kaleidoSize, kaleidoSize);
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoHalf * Math.cos(destA + angle120)) + (kaleidoHalf * Math.cos(destA + angle60)) + 100, (kaleidoHalf * Math.sin(destA + angle120)) + (kaleidoHalf * Math.sin(destA + angle60)) + 100, kaleidoSize, kaleidoSize);
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoHalf * Math.cos(destA - angle120)) + (kaleidoHalf * Math.cos(destA - angle120 - angle60)) + 100, (kaleidoHalf * Math.sin(destA - angle120)) + (kaleidoHalf * Math.sin(destA - angle180)) + 100, kaleidoSize, kaleidoSize);


		// Mirrored triangle
		var x1 = kaleidoHalf * Math.cos(destA + angle60);
		var y1 = kaleidoHalf * Math.sin(destA + angle60);
	
		var x2 = kaleidoHalf * Math.cos(destA + angle180);
		var y2 = kaleidoHalf * Math.sin(destA + angle180);
	
		var x3 = kaleidoHalf * Math.cos(destA - angle60);
		var y3 = kaleidoHalf * Math.sin(destA - angle60);

		// Build clip
		kaleidoContext.clearRect(0, 0, kaleidoSize, kaleidoSize);
		kaleidoContext.save();
		kaleidoContext.translate(kaleidoHalf, kaleidoHalf);
		kaleidoContext.beginPath();
		kaleidoContext.moveTo(x1, y1);
		kaleidoContext.lineTo(x2, y2);
		kaleidoContext.lineTo(x3, y3);
		kaleidoContext.clip();

		// First triangle
		kaleidoContext.rotate(destA * 3);
		kaleidoContext.drawImage(mirrorCanvas, sprinklesWidth - kaleidoSize - sprinklesX, sprinklesY, kaleidoSize, kaleidoSize, -kaleidoHalf, -kaleidoHalf, kaleidoSize, kaleidoSize);
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoHalf * Math.cos(destA - angle120)) + (kaleidoHalf * Math.cos(destA + angle120)) + 100, (kaleidoHalf * Math.sin(destA - angle120)) + (kaleidoHalf * Math.sin(destA + angle120)) + 100, kaleidoSize, kaleidoSize);
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoSize * Math.cos(destA)) + 100, (kaleidoSize * Math.sin(destA)) + 100, kaleidoSize, kaleidoSize);

		// Second triangle
		kaleidoContext.clearRect(-kaleidoHalf, -kaleidoHalf, kaleidoSize, kaleidoSize);
		kaleidoContext.rotate(angle120);
		kaleidoContext.drawImage(mirrorCanvas, sprinklesWidth - kaleidoSize - sprinklesX, sprinklesY, kaleidoSize, kaleidoSize, -kaleidoHalf, -kaleidoHalf, kaleidoSize, kaleidoSize);
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoHalf * Math.cos(destA)) + (kaleidoHalf * Math.cos(destA + angle120)) + 100, (kaleidoHalf * Math.sin(destA)) + (kaleidoHalf * Math.sin(destA + angle120)) + 100, kaleidoSize, kaleidoSize);
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoSize * Math.cos(destA - angle120)) + 100, (kaleidoSize * Math.sin(destA - angle120)) + 100, kaleidoSize, kaleidoSize);


		// Third triangle
		kaleidoContext.clearRect(-kaleidoHalf, -kaleidoHalf, kaleidoSize, kaleidoSize);
		kaleidoContext.rotate(angle120);
		kaleidoContext.drawImage(mirrorCanvas, sprinklesWidth - kaleidoSize - sprinklesX, sprinklesY, kaleidoSize, kaleidoSize, -kaleidoHalf, -kaleidoHalf, kaleidoSize, kaleidoSize);
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoHalf * Math.cos(destA)) + (kaleidoHalf * Math.cos(destA - angle120)) + 100, (kaleidoHalf * Math.sin(destA)) + (kaleidoHalf * Math.sin(destA - angle120)) + 100, kaleidoSize, kaleidoSize);
		destContext.drawImage(kaleidoCanvas, 0, 0, kaleidoSize, kaleidoSize, (kaleidoSize * Math.cos(destA + angle120)) + 100, (kaleidoSize * Math.sin(destA + angle120)) + 100, kaleidoSize, kaleidoSize);


		kaleidoContext.restore();
		destContext.restore();

		destA += (0.01 * advanceCount);
		advanceCount = 0;
		if (destA > (Math.PI * 2)) destA -= (Math.PI * 2);

		sprinklesX += sprinklesDX;
		sprinklesY += sprinklesDY;

		if (sprinklesX <= 0) sprinklesDX = Math.abs(sprinklesDX);
		if (sprinklesY <= 0) sprinklesDY = Math.abs(sprinklesDY);
		if (sprinklesX >= sprinklesWidth - kaleidoSize) sprinklesDX = -Math.abs(sprinklesDX);
		if (sprinklesY >= sprinklesHeight - kaleidoSize) sprinklesDY = -Math.abs(sprinklesDY);
	}
}


var kaleido = null;

function kaleidoscope(intervals) {


	var canvas = document.getElementById('cnv');
	kaleido = new Kaleido(canvas);
	kaleido.sprinkles();
	setInterval(function() { kaleido.draw(); }, intervals);
}