
class Color
{
	constructor(r, g, b, a)
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	equals(other)
	{
		return this.r == other.r && this.g == other.g && this.b == other.b && this.a == other.a;
	}
}

class PixelData
{
	constructor(width, height)
	{
		this.data = new Uint8ClampedArray(width*height*4);
		this.width = width;
		this.height = height;
	}
	static fromImageData(imageData) {
		var pixelData = new PixelData(imageData.width, imageData.height);
		pixelData.data = imageData.data;
		return pixelData;
	}

	getDataIndex(x, y)
	{
		x = Math.max(Math.min(Math.floor(x), this.width-1), 0);
		y = Math.max(Math.min(Math.floor(y), this.height-1), 0);
		return (y*this.width+x)*4;
	}

	getPixel(x, y)
	{
		var index = this.getDataIndex(x, y);
		return new Color(this.data[index+0], this.data[index+1], this.data[index+2], this.data[index+3]);
	}

	setPixel(x, y, color)
	{
		var index = this.getDataIndex(x, y);
		this.data[index+0] = color.r;
		this.data[index+1] = color.g;
		this.data[index+2] = color.b;
		this.data[index+3] = color.a;
	}

	toDataURL()
	{
		var destCanvas = document.createElement('canvas');
		var destContext = destCanvas.getContext('2d');
		var putPixelID = destContext.createImageData(1,1);
		var putPixelData  = putPixelID.data;

		destCanvas.width = this.width;
		destCanvas.height = this.height;

		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				var outputIndex = (y*this.width+x)*4;

				putPixelData[0]   = this.data[outputIndex+0];
				putPixelData[1]   = this.data[outputIndex+1];
				putPixelData[2]   = this.data[outputIndex+2];
				putPixelData[3]   = this.data[outputIndex+3];
				destContext.putImageData(putPixelID, x, y);
			}
		}

		return destCanvas.toDataURL('image/png');
	}
}

var image = new Image();
function onSourceLoad() {
	var image = document.getElementById("sourceImage");
	image.crossOrigin = "Anonymous";
	var sourceCanvas = document.createElement('canvas');
	sourceCanvas.width = image.width;
	sourceCanvas.height = image.height;

	var sourceContext = sourceCanvas.getContext('2d');
	sourceContext.drawImage(image, 0, 0);

	var pixelData = PixelData.fromImageData(sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height));

	var outputPixelData = processImage(pixelData, scale2X);
	return outputPixelData;
};

function processImage(sourcePixelData, processorFunction) {
	var sourceWidth = sourcePixelData.width;
	var sourceHeight = sourcePixelData.height;


	var outputWidth = sourceWidth*2;
	var outputHeight = sourceHeight*2;
	var outputPixelData = new PixelData(outputWidth, outputHeight);

	for (var x = 0; x < sourceWidth; x++) {
		for (var y = 0; y < sourceHeight; y++)
		{
			processorFunction(sourcePixelData, outputPixelData, x, y);
		}
	}

	return outputPixelData;
}

function scale2X(sourcePixelData, outputPixelData, x, y)
{
	var outputX = x*2;
	var outputY = y*2;
	var colorB = sourcePixelData.getPixel(x, y-1);
	var colorH = sourcePixelData.getPixel(x, y+1);
	var colorD = sourcePixelData.getPixel(x-1, y);
	var colorF = sourcePixelData.getPixel(x+1, y);

	var colorE = sourcePixelData.getPixel(x, y);

	if(!colorB.equals(colorH) && !colorD.equals(colorF))
	{
		outputPixelData.setPixel(outputX,   outputY,   colorD.equals(colorB) ? colorD : colorE);
		outputPixelData.setPixel(outputX+1, outputY,   colorB.equals(colorF) ? colorF : colorE);
		outputPixelData.setPixel(outputX,   outputY+1, colorD.equals(colorH) ? colorD : colorE);
		outputPixelData.setPixel(outputX+1, outputY+1, colorH.equals(colorF) ? colorF : colorE);
	}
	else
	{
		outputPixelData.setPixel(outputX,   outputY, colorE);
		outputPixelData.setPixel(outputX+1, outputY, colorE);
		outputPixelData.setPixel(outputX,   outputY+1, colorE);
		outputPixelData.setPixel(outputX+1, outputY+1, colorE);
	}
}

function nearestNeighbor(sourcePixelData, outputPixelData, x, y)
{
	var outputX = x*2;
	var outputY = y*2;
	var color = sourcePixelData.getPixel(x, y);
	outputPixelData.setPixel(outputX, outputY, color);
	outputPixelData.setPixel(outputX+1, outputY, color);
	outputPixelData.setPixel(outputX+1, outputY+1, color);
	outputPixelData.setPixel(outputX, outputY+1, color);
}
