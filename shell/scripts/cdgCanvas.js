// https://jbum.com/cdg_revealed.html
/*
In the CD+G system, 16 color graphics are displayed on a raster field which is
300 x 216 pixels in size.  The middle 294 x 204 area is within the TV's
"safe area", and that is where the graphics are displayed.  The outer border is
set to a solid color.  The colors are stored in a 16 entry color lookup table.

Each color in the table is drawn from an RGB space of 4096 (4 bits each for
R,G and B) colors.

Since we are using a 16 color table, each pixel can be stored in 4 bits,
resulting in a total pixelmap size of 4 * 300 * 216 = 259200 bits = a little less
than 32K.
*/
var CDG_COMMAND             = 0x09

var CDG_INST_MEMORY_PRESET      = 1;
var CDG_INST_BORDER_PRESET      = 2;
var CDG_INST_TILE_BLOCK         = 6;
var CDG_INST_SCROLL_PRESET      = 20;
var CDG_INST_SCROLL_COPY        = 24;
var CDG_INST_DEF_TRANSP_COL     = 28;
var CDG_INST_LOAD_COL_TBL_0_7   = 30;
var CDG_INST_LOAD_COL_TBL_8_15  = 31;
var CDG_INST_TILE_BLOCK_XOR     = 38;

var CDG_MASK            = 0x3F

var CDG_FULL_WIDTH      = 300;
var CDG_FULL_HEIGHT     = 216;

var CDG_DISPLAY_WIDTH   = 288;
var CDG_DISPLAY_HEIGHT  = 192;

var CDG_TILE_WIDTH = 6;
var CDG_TILE_HEIGHT = 12;


var CDG_TILE_ROWS = CDG_FULL_WIDTH / CDG_TILE_HEIGHT;
var CDG_TILE_COLS  = CDG_FULL_HEIGHT / CDG_TILE_WIDTH;

var COLOUR_TABLE_SIZE       = 16

function CdgCanvas(cdg, canvas)
{
	this.cdg = cdg;
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
	this.ctx.imageSmoothingEnabled = true;
	this.curPos = 0;
	this.colorMap = new Uint32Array(16);
	this.colorMap.fill(0xffffffff);
// the surface as drawn using cdg is four bits per pixel, each being an index into a colormap
// to make scrolling easier, we're going to waste the top four bits of each pixel.
	this.cdgSurface = new Uint8ClampedArray(CDG_FULL_WIDTH * CDG_FULL_HEIGHT);
	this.resetInvalidation();

	this.borderColor  = false;
	this.clearColor  = false;
	this.hOffset = 0;
	this.vOffset = 0;
}

CdgCanvas.prototype = {
	start : function()
	{
		this.lastOffset = 0;
		this.startTime = Date.now();
		this.curPos = 0;
	},

	pause : function()
	{
		this.pauseTime = Date.now(0);
	},

	resume : function()
	{
		var pausedTime = Date.now() - this.pauseTime;
		this.startTime += pausedTime;
		this.lastDraw += pausedTime;
	},

	draw : function()
	{
		var update;

//		this.invalidateAll();

	// always constrain to inside border
		var xAdjust = this.invalidateBorder ? 0 : 6;
		var yAdjust = this.invalidateBorder ? 0 : 12;
//		xAdjust -= this.hOffset
//		yAdjust -= this.vOffset
		var startX = Math.max(this.invalid.xStart, xAdjust);
		var startY = Math.max(this.invalid.yStart, yAdjust);
		var stopX = Math.min(this.invalid.xStop, CDG_FULL_WIDTH - xAdjust);
		var stopY = Math.min(this.invalid.yStop, CDG_FULL_HEIGHT - yAdjust);
		var width = stopX - startX;
		var height = stopY - startY;

		this.invalidateBorder  = false;

		if (width <= 0 || height <= 0) return;

		update = new Uint8ClampedArray(width * height * 4);
		var idx = 0;
		for (var row = 0; row < height; row++)
			for (var col = 0; col < width; col++)
			{
				var pos = (startY + row) * CDG_FULL_WIDTH + (startX + col);
				var idx = (row * width + col) * 4;
				var color = this.colorMap[this.cdgSurface[pos]];
//				var color = 0x77777777;

				update[idx] = (color >>> 24) & 0xff;      // R
				update[idx + 1] = (color >>> 16) & 0xff;  // G
				update[idx + 2] = (color >>> 8) & 0xff;   // B
				update[idx + 3] = (color & 0xff);         // A
			}


		var imageData = new ImageData(update, width, height);
		this.ctx.putImageData(imageData, startX - this.hOffset, startY - this.vOffset);

	// if we must draw the border, do that now
//		if (this.drawBorder || this.hOffset || this.vOffset)
		if (true)
		{
			hUpdate = new Uint8ClampedArray(CDG_FULL_WIDTH * CDG_TILE_HEIGHT * 4)
			vUpdate = new Uint8ClampedArray(CDG_FULL_HEIGHT * CDG_TILE_WIDTH * 4)
			var color = this.colorMap[this.borderColor];

			for (var idx = 0; idx < hUpdate.length;  idx += 4)
			{
				hUpdate[idx] = (color >>> 24) & 0xff;      // R
				hUpdate[idx + 1] = (color >>> 16) & 0xff;  // G
				hUpdate[idx + 2] = (color >>> 8) & 0xff;   // B
				hUpdate[idx + 3] = (color & 0xff);         // A
			}

			for (var idx = 0; idx < vUpdate.length;  idx += 4)
			{
				vUpdate[idx] = (color >>> 24) & 0xff;      // R
				vUpdate[idx + 1] = (color >>> 16) & 0xff;  // G
				vUpdate[idx + 2] = (color >>> 8) & 0xff;   // B
				vUpdate[idx + 3] = (color & 0xff);         // A
			}

			var hImageData = new ImageData(hUpdate, CDG_FULL_WIDTH, CDG_TILE_HEIGHT);
			var vImageData = new ImageData(vUpdate, CDG_TILE_WIDTH, CDG_FULL_HEIGHT);

			this.ctx.putImageData(hImageData, 0, 0);
			this.ctx.putImageData(hImageData, 0, CDG_FULL_HEIGHT - CDG_TILE_HEIGHT);

			this.ctx.putImageData(vImageData, 0, 0);
			this.ctx.putImageData(hImageData, CDG_FULL_WIDTH - CDG_TILE_HEIGHT, 0);
		}
	},

	invalidateAll : function(border)
	{
		this.invalidateRect(0, 0, CDG_FULL_WIDTH, CDG_FULL_HEIGHT);
		this.invalidateBorder = border;
	},

	invalidateRect : function(xStart, yStart, xStop, yStop)
	{
		if (xStart < this.invalid.xStart) this.invalid.xStart = xStart;
		if (yStart < this.invalid.yStart) this.invalid.yStart = yStart;
		if (xStop > this.invalid.xStop) this.invalid.xStop = xStop;
		if (yStop > this.invalid.yStop) this.invalid.yStop = yStop;
	},

	resetInvalidation : function()
	{
		this.invalid = {
			xStart: CDG_FULL_WIDTH,
			yStart: CDG_FULL_HEIGHT,
			xStop: 0,
			yStop: 0,
		};
	},

	xlatColor : function(index)
	{
		return this.colorMap(index);
	},

	setTransparent : function(index)
	{
		this.colorMap[index] =  0;
		this.invalidateAll(true);
	},

/*
***
Load Color Table Lo   [colors 0 thru 7]  (subCode.instruction==30)
Load Color Table High [colors 8 thru 15] (subCode.instruction==31)
***

These commands are used to load in the colors for the color table.  The colors
are specified using 4 bits each for R, G and B, resulting in 4096 possible
colors.  The only different between the two instructions is whether the low
part or the high part of the color table is loaded.

In these instruction, the 16 byte data field is interpreted as follows.

typedef struct {
	short colorSpec[8];  // AND with 0x3F3F to clear P and Q channel
} CDG_LoadCLUT;

Each colorSpec value can be converted to RGB using the following diagram:

    [---high byte---]   [---low byte----]
     7 6 5 4 3 2 1 0     7 6 5 4 3 2 1 0
     X X r r r r g g     X X g g b b b b

Note that P and Q channel bits need to be masked off (they are marked
here with Xs.

The Load CLUT commands are often used in CD+G to provide the illusion of
animation through the use of color cyling.
*/
	setColors : function(offset, data)
	{
		function expand(bits)
		{
			return bits * 16
		}

		for (var pos = 0; pos < 16; pos += 2)
		{
			var index = offset + pos / 2;
			var highByte = data[pos] & CDG_MASK;
			var lowByte = data[pos + 1] & CDG_MASK;

			var red4 = highByte >> 2;
			var green4 = ((highByte & 0x3) << 2) + (lowByte >> 4);
			var blue4 = lowByte & 0xf;

			var red = expand(red4);
			var green = expand(green4);
			var blue = expand(blue4);

			var rgba = (red << 24) + (green << 16) + (blue << 8) + (0xff);
			this.colorMap[index] =  rgba;
		}

		this.invalidateAll(true);
	},

/*
***
Tile Block Normal (subCode.instruction==6)
Tile Block XOR (subCode.instruction==38)
***

These commands load a 12 x 6 tile of pixels from the subCode.data area.  I recall
that in the original CD+G spec, the tile is refered to as a "font", but I think
the word tile is more appropriate, because the tile can (and does) contain any
graphical image, not just text. Larger images are built by using multiple tiles.
The XOR variant is a special case of the same command, the difference is
described below.

The tile is stored using 1-bit graphics.  The structure contains two colors which
are to be used when rendering the tile.  The tile is extracted from 16 bytes of
subCode.data[] in the following manner:

typedef struct {
	char	color0;				// Only lower 4 bits are used, mask with 0x0F
	char	color1;				// Only lower 4 bits are used, mask with 0x0F
	char	row;				// Only lower 5 bits are used, mask with 0x1F
	char	column;				// Only lower 6 bits are used, mask with 0x3F
	char	tilePixels[12];		// Only lower 6 bits of each byte are used
} CDG_Tile;

color0, color1 describe the two colors (from the color table) which are to be
used when rendering the tile.  Color0 is used for 0 bits, Color1 is used for 1
bits.

Row and Column describe the position of the tile in tile coordinate space.  To
convert to pixels, multiply row by 12, and column by 6.

tilePixels[] contains the actual bit values for the tile, six pixels per byte.
The uppermost valid bit of each byte (0x20) contains the left-most pixel of each
scanline of the tile.

In the normal instruction, the corresponding colors from the color table are
simply copied to the screen.

In the XOR variant, the color values are combined with the color values that are
already onscreen using the XOR operator.  Since CD+G only allows a maximum of 16
colors, we are XORing the pixel values (0-15) themselves, which correspond to
indexes into a color lookup table.  We are not XORing the actual R,G,B values.
*/
	updateTile : function(data, xor)
	{
		var color0 = data[0] & 0x0f;
		var color1 = data[1] & 0x0f;

		var row = data[2] & 0x1f;
		var col = data[3] & 0x3f;

		var x = col * CDG_TILE_WIDTH;
		var y = row * CDG_TILE_HEIGHT;

		var tile = row * CDG_TILE_COLS + col;
		var pos = y * CDG_FULL_WIDTH + x;

		var pixels = data.slice(4);

	// run through each tile row. pos is the byte offset into the cdg surface
	// increment the pos by the width of the screen on each iteration
		for (var idx = 0; idx < 12; idx++, pos += CDG_FULL_WIDTH)
		{
		// unrole the inner loop
			var byte = pixels[idx];

			var pixel = xor ? this.cdgSurface[pos] : 0;
			this.cdgSurface[pos] = pixel ^ (byte & 0x20 ? color1 : color0);

			pixel = xor ? this.cdgSurface[pos + 1] : 0;
			this.cdgSurface[pos + 1] = pixel ^ (byte & 0x10 ? color1 : color0);

			pixel = xor ? this.cdgSurface[pos + 2] : 0;
			this.cdgSurface[pos + 2] = pixel ^ (byte & 0x08 ? color1 : color0);

			pixel = xor ? this.cdgSurface[pos + 3] : 0;
			this.cdgSurface[pos + 3] = pixel ^ (byte & 0x04 ? color1 : color0);

			pixel = xor ? this.cdgSurface[pos + 4] : 0;
			this.cdgSurface[pos + 4] = pixel ^ (byte & 0x02 ? color1 : color0);

			pixel = xor ? this.cdgSurface[pos + 5] : 0;
			this.cdgSurface[pos + 5] = pixel ^ (byte & 0x01 ? color1 : color0);
		}

		this.invalidateRect(x, y, x + CDG_TILE_WIDTH, y + CDG_TILE_HEIGHT);
	},

	clearAll : function(color)
	{
		if (this.clearColor === color) return;
		this.clearColor = color;
		this.borderColor = color;
		this.cdgSurface.fill(color);
		this.invalidateAll(true);
		this.drawBorder = true;
	},

	clearBorder : function(color)
	{
	//! actually set the pixels
		this.borderColor = color;
		this.drawBorder = true;
		this.invalidateAll(true);
	},

	vScroll : function(pixels, clear)
	{
	// Vertical scrolling is easiest, it is just a simple memory move.
		var length = CDG_FULL_WIDTH *  Math.abs(pixels);
		var replace = new Uint8ClampedArray(length);
		var up = pixels < 0;
		var bottom = CDG_FULL_WIDTH * CDG_FULL_HEIGHT;
		var start = up ? 0 : bottom - length;
		var stop = start + length;

	// if we're rotating, grab the content, otherwise fill it
		if (clear === false) replace = this.cdgSurface.slice(start, stop);
		else replace.fill(clear);

		if (up)
		{
			this.cdgSurface.copyWithin(0, length);
			this.cdgSurface.set(replace, bottom - length);
		}
		else
		{
			this.cdgSurface.copyWithin(length, 0);
			this.cdgSurface.set(replace, 0, bottom - length);
		}
	},

	hScroll : function(pixels, clear)
	{
		var length = Math.abs(pixels);
		var replace = new Uint8ClampedArray(length);
		var right = CDG_FULL_WIDTH;
		var left = pixels < 0;
		var start = left ? 0 : right - length
		var stop = start + length;

	// for horizontal scrolling we have to run a loop across all pixel rows. Much less fun.
		for (var row = 0, pos = 0; row < CDG_FULL_HEIGHT; row++, pos += CDG_FULL_WIDTH)
		{
			if (clear === false) replace = this.cdgSurface.slice(pos + start, pos + stop);
			else replace.fill(clear);

			if (left)
			{
				this.cdgSurface.copyWithin(pos + 0, pos + length, pos + right);
				this.cdgSurface.set(replace, pos + right - length);
			}
			else
			{
				this.cdgSurface.copyWithin(pos + length, pos, pos + right - length);
				this.cdgSurface.set(replace, pos, length);
			}
		}
	},

/*
***
Scroll Preset (subCode.instruction==20)
Scroll Copy (subCode.instruction==24)
***

In these instruction, the 16 byte data field is interepreted as follows.

 typedef struct {
	char	color;				// Only lower 4 bits are used, mask with 0x0F
	char	hScroll;			// Only lower 6 bits are used, mask with 0x3F
	char	vScroll;			// Only lower 6 bits are used, mask with 0x3F
 } CDG_Scroll;

This command is used to scroll all the pixels on the screen horizontally and/or
vertically.

The color refers to a fill color to use for the new area uncovered by the
scrolling action.  It is only used in the Scroll Preset command.  In the Scroll
Copy command the screen is "rotated" around.  For example, in scrolling to the
left, pixels uncovered on the right are filled in by the pixels being scrolled
off the screen on the left.

The hScroll field is a compound field. It can be divided into two fields like so:

  SCmd = (hScroll & 0x30) >> 4;
  HOffset = (hScroll & 0x07);

	SCmd is a scrolliing instruction, which is either 0, 1 or 2.
		0 means don't scroll
		1 means scroll 6 pixels to the right,
		2 means scroll 6 pixels to the left.

	HOffset is a horizontal offset which is used for offsetting the graphic
	display by amounts less than 6 pixels. It can assume values from 0 to 5.

Similarly, the vScroll field is a compound field. It can be divided into two
fields like so:

  SCmd = (vScroll & 0x30) >> 4;
  VOffset = (vScroll & 0x0F);

	SCmd is a scrolliing instruction, which is either 0, 1 or 2.
		0 means don't scroll
		1 means scroll 12 pixels down,
		2 means scroll 12 pixels up.

	VOffset is a vertical offset which is used for offsetting the graphic
	display by amounts less than 12 pixels. It can assume values from 0 to 11.

Smooth horizontal and vertical scrolling in all directions can be done by
combining scroll commands.  For example, here is a smooth horizontal scroll to
the left:

	SCmd			HScroll
    ===             =======
	0				1
	0				2
	0				3
	0				4
	0				5
	0				6
	2				0
	(repeat)

You can create the effect of an infinite panorama by continually loading in new
tiles into the border area and scrolling them into view.
*/

	scroll : function(data, preset)
	{
		var color = data[0] & 0x0f;
		var hScroll = data[1] & 0x3f;
		var vScroll = data[2] & 0x3f;
		var hSCmd = (hScroll & 0x30) >> 4;
		var hOffset = hScroll & 0x07;
		var vSCmd = (vScroll & 0x30) >> 4;
		var vOffset = vScroll & 0x0f;
		var pixels;
		if (hSCmd !== 0)
		{
			var tiles = 0;
			if (hSCmd === 2) tiles = -1;
			else if (hSCmd === 1) tiles = 1;

			pixels = CDG_TILE_WIDTH * tiles;
			this.hScroll(pixels, preset ? color : false);
		}
		if (vSCmd !== 0)
		{
			var tiles = 0;
			if (vSCmd === 2) tiles = -1;
			else if (vSCmd === 1) tiles = 1;

			pixels = CDG_TILE_HEIGHT * tiles;
			this.vScroll(pixels, preset ? color : false);
		}

		if (this.hOffset != hOffset)
		{
			this.hOffset = hOffset;
			this.invalidateAll(true);
			this.scrolled = true;
		}
		if (this.vOffset != vOffset)
		{
			this.vOffset = vOffset;
			this.invalidateAll(true);
			this.scrolled = true;
		}
	},

	executePacket : function(packet)
	{
		if (packet.command !== CDG_COMMAND) return;

		switch(packet.instruction)
		{
			case CDG_INST_MEMORY_PRESET:
				this.clearAll(packet.data[0] & 0x0f);
				break;
			case CDG_INST_BORDER_PRESET:
				this.clearBorder(packet.data[0] & 0x0f);
				break;
			case CDG_INST_TILE_BLOCK:
				this.updateTile(packet.data, false);
				break;
			case CDG_INST_SCROLL_PRESET:
				this.scroll(packet.data, true);
				break;
			case CDG_INST_SCROLL_COPY:
				this.scroll(packet.data, false);
				break;
			case CDG_INST_DEF_TRANSP_COL:
				this.setTransparent(packet.data[0] & 0x0F);
				break;
			case CDG_INST_LOAD_COL_TBL_0_7:
				this.setColors(0, packet.data);
				break;
			case CDG_INST_LOAD_COL_TBL_8_15:
				this.setColors(8, packet.data);
				break;
			case CDG_INST_TILE_BLOCK_XOR:
				this.updateTile(packet.data, true);
				break;
		}

		if (packet.instruction !== CDG_INST_MEMORY_PRESET) this.clearColor = false;
	},

	updateSurface : function(timeOffset)
	{
		var total = Math.floor((timeOffset) * (300 / 1000));
		var count = total - this.curPos;
		var packets = this.cdg.getPackets(this.curPos, count);
		if (packets.length === 0) return false;

		this.curPos = total;

		packets.each(function(packet)
		{
			this.executePacket(packet);
		}, this);

		this.draw();
		return true;
	}
};

module.exports = CdgCanvas;
