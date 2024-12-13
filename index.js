// Utwórz element canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 300;
canvas.height = 600;
document.body.appendChild(canvas);

// Ustawienia gry
var blockSize = 25;
var boardWidth = canvas.width / blockSize;
var boardHeight = canvas.height / blockSize;
var board = [];
var currentBlock = null;
var dropInterval = 500;
var lastDropTime = Date.now();

// Inicjalizacja planszy
function initBoard() {
  for (var i = 0; i < boardHeight; i++) {
    var row = [];
    for (var j = 0; j < boardWidth; j++) {
      row.push(0);
    }
    board.push(row);
  }
}

// Rysowanie planszy
function drawBoard() {
  for (var i = 0; i < boardHeight; i++) {
    for (var j = 0; j < boardWidth; j++) {
      if (board[i][j] == 1) {
        ctx.fillStyle = "#eeeeee";
        ctx.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);
      }
    }
  }
}

// Losowanie nowego bloku
function generateBlock() {
  var blocks = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[0, 1], [0, 1], [1, 1]],
    [[0, 1], [1, 1], [1, 0]],
    [[1, 0], [1, 1], [0, 1]],
    [[1, 1, 1], [0, 1, 0]]
  ];
  var block = blocks[Math.floor(Math.random() * blocks.length)];
  currentBlock = {
    shape: block,
    x: Math.floor(boardWidth / 2) - Math.floor(block[0].length / 2),
    y: 0
  };
}

// Rysowanie bieżącego bloku
function drawBlock() {
  for (var i = 0; i < currentBlock.shape.length; i++) {
    for (var j = 0; j < currentBlock.shape[i].length; j++) {
      if (currentBlock.shape[i][j] == 1) {
        ctx.fillStyle = "#eeeeee";
        ctx.fillRect((currentBlock.x + j) * blockSize, (currentBlock.y + i) * blockSize, blockSize, blockSize);
      }
    }
  }
}

// Obsługa klawiszy
document.addEventListener("keydown", function (e) {
  if (e.keyCode == 37) {
    moveLeft();
  } else if (e.keyCode == 39) {
    moveRight();
  } else if (e.keyCode == 40) {
    dropBlock();
  } else if (e.keyCode == 38) {
    rotateBlock();
  }
});

// Sprawdzenie, czy ruch jest legalny
function isLegalMove(dx, dy) {
  for (var i = 0; i < currentBlock.shape.length; i++) {
    for (var j = 0; j < currentBlock.shape[i].length; j++) {
      if (currentBlock.shape[i][j] == 1) {
        var x = currentBlock.x + j + dx;
        var y = currentBlock.y + i + dy;
        if (x < 0 || x >= boardWidth || y >= boardHeight || (y >= 0 && board[y][x] == 1)) {
          return false;
        }
      }
    }
  }
  return true;
}

// Funkcja obracania bloku
function rotateBlock() {
  var newShape = [];
  for (var i = 0; i < currentBlock.shape[0].length; i++) {
    var newRow = [];
    for (var j = currentBlock.shape.length - 1; j >= 0; j--) {
      newRow.push(currentBlock.shape[j][i]);
    }
    newShape.push(newRow);
  }

  var newBlock = {
    shape: newShape,
    x: currentBlock.x,
    y: currentBlock.y
  };

  while (newBlock.x + newBlock.shape[0].length > boardWidth) {
    newBlock.x--;
  }

  if (!checkCollision(newBlock)) {
    currentBlock = newBlock;
  }
}

function checkCollision(block) {
  for (var i = 0; i < block.shape.length; i++) {
    for (var j = 0; j < block.shape[i].length; j++) {
      if (block.shape[i][j] == 1) {
        var x = block.x + j;
        var y = block.y + i;
        if (x < 0 || x >= boardWidth || y >= boardHeight || (y >= 0 && board[y][x] == 1)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Funkcja ruchu w lewo
function moveLeft() {
  if (isLegalMove(-1, 0)) {
    currentBlock.x--;
  }
}

// Funkcja ruchu w prawo
function moveRight() {
  if (isLegalMove(1, 0)) {
    currentBlock.x++;
  }
}

// Funkcja opadania bloku
function dropBlock() {
  if (isLegalMove(0, 1)) {
    currentBlock.y++;
  } else {
    freezeBlock();
    checkRows();
    generateBlock();
  }
}

// Aktualizacja planszy
function freezeBlock() {
  for (var i = 0; i < currentBlock.shape.length; i++) {
    for (var j = 0; j < currentBlock.shape[i].length; j++) {
      if (currentBlock.shape[i][j] == 1) {
        var x = currentBlock.x + j;
        var y = currentBlock.y + i;
        if (y >= 0) {
          board[y][x] = 1;
        }
      }
    }
  }
}

// Sprawdzenie, czy rząd jest pełny
function isFullRow(row) {
  for (var i = 0; i < boardWidth; i++) {
    if (board[row][i] == 0) {
      return false;
    }
  }
  return true;
}

// Usunięcie pełnych rzędów
function checkRows() {
  for (var i = boardHeight - 1; i >= 0; i--) {
    if (isFullRow(i)) {
      for (var j = i; j > 0; j--) {
        board[j] = board[j - 1].slice();
      }
      board[0] = new Array(boardWidth).fill(0);
      i++;
    }
  }
}

// Główna pętla gry
function gameLoop() {
  var now = Date.now();
  if (now - lastDropTime > dropInterval) {
    dropBlock();
    lastDropTime = now;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawBlock();
}

// Inicjalizacja gry
function init() {
  initBoard();
  generateBlock();
  setInterval(gameLoop, 16);
}

// Uruchomienie gry
init();
