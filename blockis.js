Blockis = function() {

  // Constants
  var SQUARE_SIDE_PIXLES = 20;
  var BLOCK_SPAWN_ROW    = 0;
  var BLOCK_SPAWN_COL    = 3;
  var TIME_BETWEEN_TICKS = 125; // millis

  Engine = function(aGraphics, aGameConfig) {

    var self = this;

    var gameConfig        = aGameConfig;
    var graphics          = aGraphics;
    var matrix            = null;
    var tetrimino         = null;
    var timer             = null;
    var started           = 0;
    var harddrop          = 0;
    var timerTickInterval = 0;

    // Public // 

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

    this.handleWindowResize = function() {
      graphics.scaleCanvas();
      if (matrix) {
        matrix.paint();
      }
      if (tetrimino) {
        tetrimino.paint();
      }
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
        
        tetrimino = nextTetrimino();
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
      // Set event handlers
      document.onkeypress = self.handleKeyPress;
      window.onresize = self.handleWindowResize;

      // Init the matrix
      matrix = new Matrix(graphics, gameConfig);
      matrix.paint();
      console.log("Blockis: The game is ready to be started!");
    };

    this.start = function() {
      tetrimino = nextTetrimino();
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

    // Private // 

    nextTetrimino = function() {
      var type = Math.round(Math.random() * 6) + 1;
      console.log("New Block! Type = %d", type);
      return new Tetrimino(type, graphics, gameConfig);
    };
  };

  // A (virtual) block that the player is controlling
  Tetrimino = function(aType, aGraphics, aGameConfig) {

    // Ugly !!! Fix!!!
    getVblockForType = function(type) {
      switch (type) {
        case gameConfig.TypeMap.i:
        return gameConfig.I.tetrimino.slice(0);
        case gameConfig.TypeMap.t:
        return gameConfig.T.tetrimino.slice(0);
        case gameConfig.TypeMap.j:
        return gameConfig.J.tetrimino.slice(0);
        case gameConfig.TypeMap.l:
        return gameConfig.L.tetrimino.slice(0);
        case gameConfig.TypeMap.o:
        return gameConfig.O.tetrimino.slice(0);
        case gameConfig.TypeMap.s:
        return gameConfig.S.tetrimino.slice(0);
        case gameConfig.TypeMap.z:
        return gameConfig.Z.tetrimino.slice(0);
        default:
          // to detect errors
          return [[1, 1, 1, 1],
                  [1, 1, 1, 1],
                  [1, 1, 1, 1],
                  [1, 1, 1, 1]];
        }
      };

    var graphics   = aGraphics;
    var gameConfig = aGameConfig;

    this.offsetRow     = 0;
    this.offsetCol     = 3;
    this.lastOffsetRow = 0;
    this.lastOffsetCol = 3;

    this.type             = aType;
    this.vblock           = getVblockForType(this.type);
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
      this.prerotatedVblock = 
      [[0, 0, 0, 0],
       [0, 0, 0, 0],
       [0, 0, 0, 0],
       [0, 0, 0, 0]];
    };

    this.revokeRotation = function() {
      this.prerotatedVblock = 
      [[0, 0, 0, 0],
       [0, 0, 0, 0],
       [0, 0, 0, 0],
       [0, 0, 0, 0]];
    };

    this.erase = function() {
      // Clear the old position.
      for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
          if(this.vblock[i][j] > 0) {
            graphics.eraseBlock(this.offsetCol + j, this.offsetRow + i);
          }
        }
      }
    };

    this.paint = function() {

      var i;
      var j;

      for(i = 0; i < 4; i++) {
        for(j = 0; j < 4; j++) {
          if(this.vblock[i][j] > 0) {
            var type  = this.vblock[i][j];
            var color = getColorForType(type);
            graphics.drawBlock(color, this.offsetCol + j, this.offsetRow + i);
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

    getColorForType = function(type) {
      switch (type) {
        case gameConfig.none:
        return "white";
        case gameConfig.TypeMap.i:
        return gameConfig.I.color;
        case gameConfig.TypeMap.j:
        return gameConfig.J.color;
        case gameConfig.TypeMap.o:
        return gameConfig.O.color;
        case gameConfig.TypeMap.t:
        return gameConfig.T.color;
        case gameConfig.TypeMap.l:
        return gameConfig.L.color;
        case gameConfig.TypeMap.s:
        return gameConfig.S.color;
        case gameConfig.TypeMap.z:
        return gameConfig.Z.color;
        case gameConfig.TypeMap.border:
        return gameConfig.Border.color;
        default:
        return null;
      }
    };
  };

  // The matrix in which the blocks falls down.
  Matrix = function(aGraphics, aGameConfig) {

    var self = this;

    var graphics   = aGraphics;
    var gameConfig = aGameConfig;

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
          if(matrix[row][col] == gameConfig.TypeMap.none) {
            graphics.eraseBlock(col, row);
          } else if(matrix[row][col] == gameConfig.TypeMap.i) {
            graphics.drawBlock(gameConfig.I.color, col, row);
          } else if(matrix[row][col] == gameConfig.TypeMap.j) {
            graphics.drawBlock(gameConfig.J.color, col, row);
          } else if(matrix[row][col] == gameConfig.TypeMap.t) {
            graphics.drawBlock(gameConfig.T.color, col, row);
          } else if(matrix[row][col] == gameConfig.TypeMap.o) {
            graphics.drawBlock(gameConfig.O.color, col, row);
          } else if(matrix[row][col] == gameConfig.TypeMap.l) {
            graphics.drawBlock(gameConfig.L.color, col, row);
          } else if(matrix[row][col] == gameConfig.TypeMap.s) {
            graphics.drawBlock(gameConfig.S.color, col, row);
          } else if(matrix[row][col] == gameConfig.TypeMap.z) {
            graphics.drawBlock(gameConfig.Z.color, col, row);
          } else if(matrix[row][col] == gameConfig.TypeMap.border) {
            // This one could be more efficient
            graphics.eraseBlock(col,row);
            graphics.drawBlock(gameConfig.Border.color, col, row);
          }
        }
      }
    };
  };

  Graphics = function() {

    var self = this;

    var canvas         = null;
    var ctx            = null;
    var xOffsetPx      = 0;
    var yOffsetPx      = 0;
    var blockSidePx    = 0;

    this.init = function(aCanvas) {
      canvas         = aCanvas;
      ctx            = canvas.getContext("2d");
      self.scaleCanvas();
    };

    this.drawBlock = function(color, posX, posY) {
      var x = xOffsetPx + (posX * blockSidePx);
      var y = yOffsetPx + (posY * blockSidePx);

      ctx.fillStyle = color;
      ctx.fillRect(x,y, blockSidePx - 1, blockSidePx - 1);

      ctx.strokeStyle = "black";
      ctx.lineWidth   = 1;

      // Draw many times to get darker color.
      for (var i = 0; i < 3; i++) {
        ctx.strokeRect(x + 1, y + 1, blockSidePx - 1*2, blockSidePx - 1*2);
      }
    };

    this.eraseBlock = function(posX, posY) {
      var x = xOffsetPx + (posX * blockSidePx);
      var y = yOffsetPx + (posY * blockSidePx);
      ctx.clearRect(x,y, blockSidePx, blockSidePx);
    };

    this.scaleCanvas = function() {

      var aspectRatio = 12 / 21; // width / height. obvioius, right?
      var newWidth    = window.innerWidth;
      var newHeight   = window.innerHeight;

      if (newWidth / newHeight >= aspectRatio) {
        // normal case on a widescreen, extra area on the sides
        // blockSidePx is calculated based on height of screen
        blockSidePx = Math.floor(newHeight / 21);
      } else {
        // normal case on a phone or similar, extra area on top and bottom
        // blockSidePx is calculated based on width of screen
        blockSidePx= Math.floor(newWidth / 12);
      }
      canvas.width   = newWidth;
      canvas.height  = newHeight;
      xOffsetPx      = Math.floor((newWidth - blockSidePx * 12) / 2);
      yOffsetPx      = Math.floor((newHeight - blockSidePx * 21) / 2);
      canvas.width   = newWidth - xOffsetPx;
      canvas.height  = newHeight - yOffsetPx;
      
    };

  };

  GameConfig = {
    // Touch this one and the game will behave *very* strange...
    TypeMap : {
      none   : 0,
      i      : 1,
      t      : 2,
      j      : 3,
      l      : 4,
      o      : 5,
      s      : 6,
      z      : 7,
      border : 8
    },

    I : {
      color     : "green",
      tetrimino : [[0, 0, 0, 0],
                   [0, 0, 0, 0],
                   [1, 1, 1, 1],
                   [0, 0, 0, 0]]
    },
    T : {
      color     : "blue",
      tetrimino : [[0, 0, 0, 0],
                   [0, 0, 2, 0],
                   [0, 2, 2, 2],
                   [0, 0, 0, 0]]
    },
    J : {
      color     : "orange",
      tetrimino : [[0, 0, 0, 0],
                   [0, 3, 0, 0],
                   [0, 3, 3, 3],
                   [0, 0, 0, 0]]
    },
    L : {
      color     : "red",
      tetrimino : [[0, 0, 0, 0],
                   [0, 0, 0, 4],
                   [0, 4, 4, 4],
                   [0, 0, 0, 0]]
    },
    O : {
      color     : "cyan",
      tetrimino : [[0, 0, 0, 0],
                   [0, 5, 5, 0],
                   [0, 5, 5, 0],
                   [0, 0, 0, 0]],
    },
    S : {
      color     : "purple",
      tetrimino : [[0, 0, 0, 0],
                   [0, 0, 6, 6],
                   [0, 6, 6, 0],
                   [0, 0, 0, 0]],
    },
    Z : {
      color     :"yellow",
      tetrimino : [[0, 0, 0, 0],
                   [0, 7, 7, 0],
                   [0, 0, 7, 7],
                   [0, 0, 0, 0]]
    },
    Border : {
      color     : "gray"
    }
  };

  this.init = function() {
    canvas = document.getElementById("blockis");

    graphics = new Graphics();
    graphics.init(canvas);
    engine = new Engine(graphics, GameConfig);
    engine.init();
  };
};