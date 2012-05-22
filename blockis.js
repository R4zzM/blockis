// Constants
var square_side_pixels = 20;
var BLOCK_SPAWN_ROW = 0;
var BLOCK_SPAWN_COL = 3;

var TIME_BETWEEN_TICKS = 125;
// millis

// Global
var canvas;
var context;
var matrix;
var tetrimino;
var timer;
var started = 0;
// 0 = not started. 1 = started

// handle keypresses

function handleKeyPress(event) {

	var collision;

	if(started) {
		switch (event.charCode) {
			case 100:
				// d character. rotate clockwise
				tetrimino.prerotateCounterClockwise();
				collision = matrix.overlappingCollisionCheck(tetrimino);
				if(!collision) {
					tetrimino.erase();
					tetrimino.confirmRotation();
					tetrimino.paint();
				} else {
					tetrimino.revokeRotation();
				}
				break;
			case 102:
				// f character. rotate clockwise
				tetrimino.prerotateClockwise();
				collision = matrix.overlappingCollisionCheck(tetrimino);
				if(!collision) {
					tetrimino.erase();
					tetrimino.confirmRotation();
					tetrimino.paint();
				} else {
					tetrimino.revokeRotation();
				}
				break;
			case 105:
				// i character. Harddrop
				harddrop();
				break;
			case 106:
				// move left
				collision = matrix.leftSideCollisionCheck(tetrimino);
				if(!collision) {
					tetrimino.erase();
					tetrimino.moveLeft();
					tetrimino.paint();
				}
				break;
			case 107:
				// k character. softdrop.
				collision = matrix.bottomSideCollisionCheck(tetrimino);
				if(!collision) {
					tetrimino.erase();
					tetrimino.updateVerticalPos();
					tetrimino.paint();
				}
				break;
			case 108:
				// l character. move right.
				collision = matrix.rightSideCollisionCheck(tetrimino);
				if(!collision) {
					tetrimino.erase();
					tetrimino.moveRight();
					tetrimino.paint();
				}
				break;
			default:
			// alert("Key: " + event.charCode);
		}
	}
}

document.onkeypress = handleKeyPress;

// Images
var borderBlock = new Image();
borderBlock.src = "img_border.png";

var backgroundBlock = new Image();
backgroundBlock.src = "img_background.png";

var iBlock = new Image();
iBlock.src = "img_I.png";

var tBlock = new Image();
tBlock.src = "img_T.png";

var lBlock = new Image();
lBlock.src = "img_L.png";

var jBlock = new Image();
jBlock.src = "img_J.png";

var oBlock = new Image();
oBlock.src = "img_O.png";

var sBlock = new Image();
sBlock.src = "img_S.png";

var zBlock = new Image();
zBlock.src = "img_Z.png";

// A (virtual) block that the player is controlling
function Tetrimino(type) {

	this.offset_row = 0;
	this.offset_col = 3;
	this.lastOffsetRow = 0;
	this.lastOffsetCol = 3;

	this.type = type;
	this.vblock = this.get_data_for_type(this.type);
	this.prerotatedVblock = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

	// tmp variable to rotate blocks
	this.prerotateClockwise = function() {
		for(var i = 0; i < 4; i++) {
			for(var j = 0; j < 4; j++) {
				this.prerotatedVblock[j][i] = this.vblock[4 - i - 1][j];
			}
		}
	};

	this.prerotateCounterClockwise = function() {
		for(var i = 0; i < 4; i++) {
			for(var j = 0; j < 4; j++) {
				this.prerotatedVblock[j][i] = this.vblock[i][4 - j - 1];
			}
		}
	};

	this.confirmRotation = function() {
		this.vblock = this.prerotatedVblock;
		this.prerotatedVblock = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
	};

	this.revokeRotation = function() {
		this.prerotatedVblock = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
	};

	this.erase = function() {
		// Clear the old position.
		for(var row = 0; row < 4; row++) {
			for(var col = 0; col < 4; col++) {
				if(this.vblock[row][col] > 0) {
					context.drawImage(backgroundBlock, (this.offset_col + col) * square_side_pixels, (this.offset_row + row) * square_side_pixels);
				}
			}
		}
	};

	// Paint the block on screen.
	this.paint = function() {

		var row;
		var col;

		// Paint the new position
		for( row = 0; row < 4; row++) {
			for( col = 0; col < 4; col++) {
				if(this.vblock[row][col] > 0) {
					var blockType = this.vblock[row][col];
					context.drawImage(this.get_image_for_type(blockType), (this.offset_col + col) * square_side_pixels, (this.offset_row + row) * square_side_pixels);
				}
			}
		}
	};

	this.updateVerticalPos = function() {
		this.lastOffsetRow = this.offset_row;
		this.offset_row++;
	};

	this.moveLeft = function() {
		this.lastOffsetCol = this.offset_col;
		this.offset_col--;
	};

	this.moveRight = function() {
		this.lastOffsetCol = this.offset_col;
		this.offset_col++;
	};
}

Tetrimino.prototype = {
	i : [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
	t : [[0, 0, 0, 0], [0, 0, 2, 0], [0, 2, 2, 2], [0, 0, 0, 0]],
	j : [[0, 0, 0, 0], [0, 3, 0, 0], [0, 3, 3, 3], [0, 0, 0, 0]],
	l : [[0, 0, 0, 0], [0, 0, 0, 4], [0, 4, 4, 4], [0, 0, 0, 0]],
	o : [[0, 0, 0, 0], [0, 5, 5, 0], [0, 5, 5, 0], [0, 0, 0, 0]],
	s : [[0, 0, 0, 0], [0, 0, 6, 6], [0, 6, 6, 0], [0, 0, 0, 0]],
	z : [[0, 0, 0, 0], [0, 7, 7, 0], [0, 0, 7, 7], [0, 0, 0, 0]],

	get_image_for_type : function(type) {
		switch (type) {
			case 0:
				return backgroundBlock;
			case 1:
				return iBlock;
			case 2:
				return tBlock;
			case 3:
				return jBlock;
			case 4:
				return lBlock;
			case 5:
				return oBlock;
			case 6:
				return sBlock;
			case 7:
				return zBlock;
			case 8:
				return borderBlock;
			default:
				return null;
		}
	},

	get_data_for_type : function(type) {
		switch (type) {
			case 1:
				return this.i.slice(0);
			case 2:
				return this.t.slice(0);
			case 3:
				return this.j.slice(0);
			case 4:
				return this.l.slice(0);
			case 5:
				return this.o.slice(0);
			case 6:
				return this.s.slice(0);
			case 7:
				return this.z.slice(0);
			default:
				return [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]];
		}
	}
};

// The matrix in which the blocks falls down.
function Matrix() {
	this.matrix = [[8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8], [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]];

	this.lockdown = function(tetrimino) {
		var row = tetrimino.offset_row;
		var col = tetrimino.offset_col;

		for(var i = 0; i < 4; i++) {
			for(var j = 0; j < 4; j++) {
				if(tetrimino.vblock[i][j] > 0) {
					this.matrix[row + i][col + j] += tetrimino.vblock[i][j];
				}
			}
		}
	};

	// vblock = virtual block. The 4x4 square that holds whatever block is in play.
	// pos_x === 0:leftmost (from the viewer) column in vblock
	// pos_y === 0: lowest row in vblock
	this.bottomSideCollisionCheck = function(tetrimino) {

		for(var row = 0; row < 4; row++) {
			for(var col = 0; col < 4; col++) {
				if(tetrimino.vblock[row][col] > 0 && this.matrix[tetrimino.offset_row + row + 1][tetrimino.offset_col + col] > 0) {
					// true
					return 1;
				}
			}
		}
		// false
		return 0;
	};

	this.rightSideCollisionCheck = function(tetrimino) {
		for(var row = 0; row < 4; row++) {
			for(var col = 0; col < 4; col++) {
				if(tetrimino.vblock[row][col] > 0 && this.matrix[tetrimino.offset_row + row][tetrimino.offset_col + col + 1] > 0) {
					// true
					return 1;
				}
			}
		}
		return 0;
	};

	this.leftSideCollisionCheck = function(tetrimino) {
		for(var row = 0; row < 4; row++) {
			for(var col = 0; col < 4; col++) {
				if(tetrimino.vblock[row][col] > 0 && this.matrix[tetrimino.offset_row + row][tetrimino.offset_col + col - 1] > 0) {
					// true
					return 1;
				}
			}
		}
		return 0;
	};

	this.overlappingCollisionCheck = function(prerotatedTetrimino) {
		for(var row = 0; row < 4; row++) {
			for(var col = 0; col < 4; col++) {
				if(tetrimino.prerotatedVblock[row][col] > 0 && this.matrix[tetrimino.offset_row + row][tetrimino.offset_col + col] > 0) {
					// true
					return 1;
				}
			}
		}
		return 0;
	};

	this.removeCompleteLines = function() {
		var removeRow = 0;
		var nRowsRemoved = 0;

		var row = 0;
		var col = 0;

		for( row = 0; row < this.matrix.length - 1; row++) {

			removeRow = 1;

			for( col = 1; col < 11; col++) {
				if(!this.matrix[row][col]) {
					removeRow = 0;
					break;
				}
			}

			if(removeRow) {
				// remove the row and move the rows above down one step.

				for(var i = row; i > 0; i--) {
					for(var j = 1; j < 11; j++) {
						this.matrix[i][j] = this.matrix[i - 1][j];
					}
				}
				// add a "clean" row on the top of the matrix
				this.matrix[0] = [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8];

				nRowsRemoved++;
			}

		}

		return nRowsRemoved;
	};

	this.paint = function() {
		for(var row = 0; row < this.matrix.length; row++) {
			for(var col = 0; col < this.matrix[row].length; col++) {
				if(this.matrix[row][col] === 0) {
					context.drawImage(backgroundBlock, col * square_side_pixels, row * square_side_pixels);
				} else if(this.matrix[row][col] === 1) {
					context.drawImage(iBlock, col * square_side_pixels, row * square_side_pixels);
				} else if(this.matrix[row][col] === 2) {
					context.drawImage(tBlock, col * square_side_pixels, row * square_side_pixels);
				} else if(this.matrix[row][col] === 3) {
					context.drawImage(jBlock, col * square_side_pixels, row * square_side_pixels);
				} else if(this.matrix[row][col] === 4) {
					context.drawImage(lBlock, col * square_side_pixels, row * square_side_pixels);
				} else if(this.matrix[row][col] === 5) {
					context.drawImage(oBlock, col * square_side_pixels, row * square_side_pixels);
				} else if(this.matrix[row][col] === 6) {
					context.drawImage(sBlock, col * square_side_pixels, row * square_side_pixels);
				} else if(this.matrix[row][col] === 7) {
					context.drawImage(zBlock, col * square_side_pixels, row * square_side_pixels);
				} else if(this.matrix[row][col] === 8) {
					context.drawImage(borderBlock, col * square_side_pixels, row * square_side_pixels);
				}
			}
		}
	};
}

function nextTetrimino() {
	var type = Math.round(Math.random() * 6) + 1;
	return new Tetrimino(type);
}

function onTimerTick() {
	var retval = matrix.bottomSideCollisionCheck(tetrimino);
	if(retval) {
		matrix.lockdown(tetrimino);

		var nLinesRemoved = matrix.removeCompleteLines();
		if(nLinesRemoved) {
			console.log("Cleared %d lines! (timertick)", nLinesRemoved);
			matrix.paint();	
		}
		

		tetrimino = nextTetrimino();
		tetrimino.paint();

		// if the new tetrimino has spawned inside an existing one its gameover
		tetrimino.prerotateClockwise();
		var gameover = matrix.overlappingCollisionCheck(tetrimino);
		if(gameover) {
			console.log("Overlapping collision on blockspawn. Gameover!");
			stop();
		} else {
			tetrimino.revokeRotation();
		}
	}
	tetrimino.erase();
	tetrimino.updateVerticalPos();
	tetrimino.paint();
}

function harddrop() {

	tetrimino.erase();

	for(var i = 0; i < matrix.matrix.length; i++) {
		var retval = matrix.bottomSideCollisionCheck(tetrimino);
		if(retval) {
			tetrimino.paint();
			matrix.lockdown(tetrimino);

			var nLinesRemoved = matrix.removeCompleteLines();
			if(nLinesRemoved) {
				console.log("Cleared %d lines (harddrop).", nLinesRemoved);
				matrix.paint();
			}
			break;
		}
		tetrimino.updateVerticalPos();
	}
	tetrimino = nextTetrimino();
	tetrimino.paint();
}

function start() {
	tetrimino = nextTetrimino();
	tetrimino.paint();
	timer = setInterval(onTimerTick, TIME_BETWEEN_TICKS);
	started = 1;
	console.log("The game has started!");
}

function stop() {
	clearInterval(timer);
	started = 0;
	console.log("The game has stopped!");
}

function init() {
	canvas = document.getElementById("tetris");
	context = canvas.getContext("2d");

	matrix = new Matrix();
	matrix.paint();

	start();
}
