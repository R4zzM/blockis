Blockis = function() {

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

  // Constants
  var SQUARE_SIDE_PIXLES = 20;
  var BLOCK_SPAWN_ROW    = 0;
  var BLOCK_SPAWN_COL    = 3;
  var TIME_BETWEEN_TICKS = 125; // millis

  Engine = function(aCtx) {

    var self = this;

    var ctx               = aCtx;
    var matrix            = null;
    var tetrimino         = null;
    var timer             = null;
    var started           = 0;
    var harddrop          = 0;
    var timerTickInterval = 0;

    this.handleKeyPress = function(event) {

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
            console.log("Counter clockwise rotation");
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
            console.log("Clockwise rotation");
            break;
            case 105:
            // i character. Harddrop
            harddrop = 1;
            self.startHarddrop();
            // matrix.harddrop(tetrimino);
            // tetrimino = nextTetrimino();
            // tetrimino.paint();
            console.log("Harddrop");
            break;
            case 106:
            // move left
            collision = matrix.leftSideCollisionCheck(tetrimino);
            if(!collision) {
              tetrimino.erase();
              tetrimino.moveLeft();
              tetrimino.paint();
            }
            console.log("Move left");
            break;
            case 107:
            // k character. softdrop.
            collision = matrix.bottomSideCollisionCheck(tetrimino);
            if(!collision) {
              tetrimino.erase();
              tetrimino.updateVerticalPos();
              tetrimino.paint();
            }
            console.log("Softdrop");
            break;
            case 108:
            // l character. move right.
            collision = matrix.rightSideCollisionCheck(tetrimino);
            if(!collision) {
              tetrimino.erase();
              tetrimino.moveRight();
              tetrimino.paint();
            }
            console.log("Move right");
            break;
            default:
            console.log("Unhandled keycode: %d", event.charCode);
          // do nothing
        }
      } else {
        switch (event.charCode) {
          case 0:
          self.start();
          break;
          default:
          console.log("Unhandled keycode: %d", event.charCode);
        }
      }
    };

    this.nextTetrimino = function() {
      var type = Math.round(Math.random() * 6) + 1;
      console.log("New Block! Type = %d", type);
      return new Tetrimino(type);
    };

    this.onTimerTick = function() {
      var collision = matrix.bottomSideCollisionCheck(tetrimino);
      if(collision) {
        matrix.lockdown(tetrimino);

        var nLinesRemoved = matrix.removeCompleteLines();
        if(nLinesRemoved) {
          console.log("Cleared %d lines! (timertick)", nLinesRemoved);
          matrix.paint();
        }

        if (harddrop) {
          self.stopHarddrop();
        }
        
        tetrimino = self.nextTetrimino();
        tetrimino.paint();

        // if the new tetrimino has spawned inside an existing one its gameover
        tetrimino.prerotateClockwise();
        var gameover = matrix.overlappingCollisionCheck(tetrimino);
        if(gameover) {
          console.log("Overlapping collision on blockspawn. Gameover!");
          self.stop();
        } else {
          tetrimino.revokeRotation();
        }
      } else {
        tetrimino.erase();
        tetrimino.updateVerticalPos();
        tetrimino.paint();
      }
    };

    this.init = function() {
      matrix = new Matrix();
      matrix.paint();
      document.onkeypress = self.handleKeyPress;
      console.log("Blockis: The game is ready to be started!");
    };

    this.start = function() {
      tetrimino = self.nextTetrimino();
      tetrimino.paint();
      timerTickInterval = TIME_BETWEEN_TICKS;
      timer = setInterval(self.onTimerTick, timerTickInterval);
      started = 1;
      console.log("Blockis: The game has started!");
    };

    this.stop = function() {
      clearInterval(timer);
      started = 0;
      console.log("Blockis: The game has stopped!");
    };

    this.changeTimerTickInterval = function(interval) {
      clearInterval(timer);
      timer = setInterval(self.onTimerTick, interval);
    };

    this.startHarddrop = function() {
      harddrop = 1;
      self.changeTimerTickInterval(1);
    };

    this.stopHarddrop = function() {
      harddrop = 0;
      self.changeTimerTickInterval(timerTickInterval);
    };
  };

  // A (virtual) block that the player is controlling
  Tetrimino = function(type) {

    this.offsetRow     = 0;
    this.offsetCol     = 3;
    this.lastOffsetRow = 0;
    this.lastOffsetCol = 3;

    this.type             = type;
    this.vblock           = this.getDataForType(this.type);
    this.prerotatedVblock = [[0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]];

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
      this.prerotatedVblock = [[0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]];
    };

    this.revokeRotation = function() {
      this.prerotatedVblock = [[0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]];
    };

    this.erase = function() {
      // Clear the old position.
      for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
          if(this.vblock[i][j] > 0) {
            context.drawImage(backgroundBlock, (this.offsetCol + j) * SQUARE_SIDE_PIXLES, (this.offsetRow + i) * SQUARE_SIDE_PIXLES);
          }
        }
      }
    };

    // Paint the block on screen.
    this.paint = function() {

      var i;
      var j;

      // Paint the new position
      for(i = 0; i < 4; i++) {
        for(j = 0; j < 4; j++) {
          if(this.vblock[i][j] > 0) {
            var blockType = this.vblock[i][j];
            context.drawImage(this.getImageForType(blockType), (this.offsetCol + j) * SQUARE_SIDE_PIXLES, (this.offsetRow + i) * SQUARE_SIDE_PIXLES);
          }
        }
      }
    };

    this.updateVerticalPos = function() {
      this.lastOffsetRow = this.offsetRow;
      this.offsetRow++;
    };

    this.moveLeft = function() {
      this.lastOffsetCol = this.offsetCol;
      this.offsetCol--;
    };

    this.moveRight = function() {
      this.lastOffsetCol = this.offsetCol;
      this.offsetCol++;
    };
  };

  Tetrimino.prototype = {
    i : [[0, 0, 0, 0],
         [0, 0, 0, 0],
         [1, 1, 1, 1],
         [0, 0, 0, 0]],

    t : [[0, 0, 0, 0],
         [0, 0, 2, 0],
         [0, 2, 2, 2],
         [0, 0, 0, 0]],

    j : [[0, 0, 0, 0],
         [0, 3, 0, 0],
         [0, 3, 3, 3],
         [0, 0, 0, 0]],

    l : [[0, 0, 0, 0],
         [0, 0, 0, 4],
         [0, 4, 4, 4],
         [0, 0, 0, 0]],

    o : [[0, 0, 0, 0],
         [0, 5, 5, 0],
         [0, 5, 5, 0],
         [0, 0, 0, 0]],

    s : [[0, 0, 0, 0],
         [0, 0, 6, 6],
         [0, 6, 6, 0],
         [0, 0, 0, 0]],

    z : [[0, 0, 0, 0],
         [0, 7, 7, 0],
         [0, 0, 7, 7],
         [0, 0, 0, 0]],

    getImageForType : function(type) {
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

    getDataForType : function(type) {
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
          // to detect errors
          return [[1, 1, 1, 1],
                  [1, 1, 1, 1],
                  [1, 1, 1, 1],
                  [1, 1, 1, 1]];
        }
      }
    };

  // The matrix in which the blocks falls down.
  Matrix = function() {

    var self = this;

    var matrix = [[8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
                  [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]];

    this.lockdown = function(tetrimino) {
      var row = tetrimino.offsetRow;
      var col = tetrimino.offsetCol;

      for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
          if(tetrimino.vblock[i][j] > 0) {
            matrix[row + i][col + j] = tetrimino.vblock[i][j];
          }
        }
      }
    };

    // vblock = virtual block. The 4x4 square that holds whatever block is in play.
    // pos_x === 0:leftmost (from the viewer) column in vblock
    // pos_y === 0: lowest row in vblock
    this.bottomSideCollisionCheck = function(tetrimino) {

      for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
          if(tetrimino.vblock[i][j] > 0 && matrix[tetrimino.offsetRow + i + 1][tetrimino.offsetCol + j] > 0) {
            return 1;
          }
        }
      }
      return 0;
    };

    this.rightSideCollisionCheck = function(tetrimino) {
      for(var row = 0; row < 4; row++) {
        for(var col = 0; col < 4; col++) {
          if(tetrimino.vblock[row][col] > 0 && matrix[tetrimino.offsetRow + row][tetrimino.offsetCol + col + 1] > 0) {
            return 1;
          }
        }
      }
      return 0;
    };

    this.leftSideCollisionCheck = function(tetrimino) {
      for(var row = 0; row < 4; row++) {
        for(var col = 0; col < 4; col++) {
          if(tetrimino.vblock[row][col] > 0 && matrix[tetrimino.offsetRow + row][tetrimino.offsetCol + col - 1] > 0) {
            return 1;
          }
        }
      }
      return 0;
    };

    this.overlappingCollisionCheck = function(tetrimino) {
      for(var row = 0; row < 4; row++) {
        for(var col = 0; col < 4; col++) {
          if(tetrimino.prerotatedVblock[row][col] > 0 && matrix[tetrimino.offsetRow + row][tetrimino.offsetCol + col] > 0) {
            return 1;
          }
        }
      }
      return 0;
    };

    this.removeCompleteLines = function() {
      var removeRow    = 0;
      var nRowsRemoved = 0;

      var row = 0;
      var col = 0;

      for(row = 0; row < matrix.length - 1; row++) {

        removeRow = 1;

        for( col = 1; col < 11; col++) {
          if(!matrix[row][col]) {
            removeRow = 0;
            break;
          }
        }

        if(removeRow) {
            // remove the row and move the rows above down one step.
            for(var i = row; i > 0; i--) {
              for(var j = 1; j < 11; j++) {
                matrix[i][j] = matrix[i - 1][j];
              }
            }
            // add a "clean" row on the top of the matrix
            matrix[0] = [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8];

            nRowsRemoved++;
        }
      }
      return nRowsRemoved;
    };

    this.paint = function() {
      for(var row = 0; row < matrix.length; row++) {
        for(var col = 0; col < matrix[row].length; col++) {
          if(matrix[row][col] === 0) {
            context.drawImage(backgroundBlock, col * SQUARE_SIDE_PIXLES, row * SQUARE_SIDE_PIXLES);
          } else if(matrix[row][col] === 1) {
            context.drawImage(iBlock, col * SQUARE_SIDE_PIXLES, row * SQUARE_SIDE_PIXLES);
          } else if(matrix[row][col] === 2) {
            context.drawImage(tBlock, col * SQUARE_SIDE_PIXLES, row * SQUARE_SIDE_PIXLES);
          } else if(matrix[row][col] === 3) {
            context.drawImage(jBlock, col * SQUARE_SIDE_PIXLES, row * SQUARE_SIDE_PIXLES);
          } else if(matrix[row][col] === 4) {
            context.drawImage(lBlock, col * SQUARE_SIDE_PIXLES, row * SQUARE_SIDE_PIXLES);
          } else if(matrix[row][col] === 5) {
            context.drawImage(oBlock, col * SQUARE_SIDE_PIXLES, row * SQUARE_SIDE_PIXLES);
          } else if(matrix[row][col] === 6) {
            context.drawImage(sBlock, col * SQUARE_SIDE_PIXLES, row * SQUARE_SIDE_PIXLES);
          } else if(matrix[row][col] === 7) {
            context.drawImage(zBlock, col * SQUARE_SIDE_PIXLES, row * SQUARE_SIDE_PIXLES);
          } else if(matrix[row][col] === 8) {
            context.drawImage(borderBlock, col * SQUARE_SIDE_PIXLES, row * SQUARE_SIDE_PIXLES);
          }
        }
      }
    };
  };

  this.init = function() {
    canvas = document.getElementById("blockis");
    context = canvas.getContext("2d");

    engine = new Engine(context);
    engine.init();
  };
};