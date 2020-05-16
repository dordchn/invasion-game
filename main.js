import keyboard from './keyboard.js';

const canvas = document.querySelector('canvas');
canvas.style.marginTop = 10;
canvas.height = document.body.offsetHeight - 20;
canvas.width = canvas.height;

const ctx = canvas.getContext('2d');

const GRID_SIZE = { width: 59, height: 60 };

const board = [];

/************************ init ************************/

for (let row = 0; row < GRID_SIZE.height; row++) {
  const rowData = [];
  for (let col = 0; col < GRID_SIZE.width; col++) {
    rowData.push({
      player: row < GRID_SIZE.height / 2 ? 0 : 1,
      checked: false,
    });
  }
  board.push(rowData);
}

const players = [
  {
    color: '#459ba8',
    base: { row: 0, col: (GRID_SIZE.width - 1) / 2, color: '#2a7681' },
    pawn: { row: 0, col: (GRID_SIZE.width - 1) / 2 },
  },
  {
    color: '#79c267',
    base: { row: GRID_SIZE.height - 1, col: (GRID_SIZE.width - 1) / 2, color: '#508e41' },
    pawn: { row: GRID_SIZE.height - 1, col: (GRID_SIZE.width - 1) / 2 },
  },
]

const cell = {
  width: canvas.width / GRID_SIZE.width,
  height: canvas.width / GRID_SIZE.height,
};

/************************ main ************************/
setInterval(() => {
  function tryMove(player, row, col) {
    const otherPawn = players[player ? 0 : 1].pawn;

    if (row >= 0 && row <= GRID_SIZE.height - 1 && // valid row
      col >= 0 && col <= GRID_SIZE.width - 1 && // valid col
      !(row == otherPawn.row && col == otherPawn.col)) { // empty cell
      players[player].pawn.row = row;
      players[player].pawn.col = col;
    }
  }

  // Move player 1
  if (keyboard.pressed['ArrowUp']) tryMove(0, players[0].pawn.row - 1, players[0].pawn.col);
  else if (keyboard.pressed['ArrowDown']) tryMove(0, players[0].pawn.row + 1, players[0].pawn.col)
  else if (keyboard.pressed['ArrowLeft']) tryMove(0, players[0].pawn.row, players[0].pawn.col - 1);
  else if (keyboard.pressed['ArrowRight']) tryMove(0, players[0].pawn.row, players[0].pawn.col + 1);

  // Move player 2
  if (keyboard.pressed['KeyW']) tryMove(1, players[1].pawn.row - 1, players[1].pawn.col);
  else if (keyboard.pressed['KeyS']) tryMove(1, players[1].pawn.row + 1, players[1].pawn.col);
  else if (keyboard.pressed['KeyA']) tryMove(1, players[1].pawn.row, players[1].pawn.col - 1);
  else if (keyboard.pressed['KeyD']) tryMove(1, players[1].pawn.row, players[1].pawn.col + 1);

  // Color player's cell
  board[players[0].pawn.row][players[0].pawn.col].player = 0;
  board[players[1].pawn.row][players[1].pawn.col].player = 1;

  // Recolor closed path
  updateColors();

  // Handle fail (respawn)
  [0, 1].forEach(i => {
    if (board[players[i].pawn.row][players[i].pawn.col].player != i) {
      players[i].pawn.col = players[i].base.col;
      players[i].pawn.row = players[i].base.row;
    }
  });

  draw();
}, 40);

/************************ Logic ************************/

function draw() {
  // Draw board
  for (let row = 0; row < GRID_SIZE.height; row++) {
    for (let col = 0; col < GRID_SIZE.width; col++) {
      ctx.beginPath();
      ctx.rect(col * cell.width, row * cell.height, cell.width, cell.height);
      ctx.fillStyle = players[board[row][col].player].color;
      ctx.fill();
    }
  }

  // Draw bases
  for (let player of players) {
    ctx.beginPath();
    ctx.rect(player.base.col * cell.width, player.base.row * cell.height, cell.width, cell.height);
    ctx.fillStyle = player.base.color;
    ctx.fill();
  }

  // Draw players
  for (let player of players) {
    ctx.beginPath();
    ctx.ellipse(
      player.pawn.col * cell.width + cell.width / 2,
      player.pawn.row * cell.height + cell.height / 2,
      cell.width * 0.4,
      cell.width * 0.4,
      0,
      0, 2 * Math.PI);
    ctx.fillStyle = player.base.color;
    ctx.fill();
  }
}

function updateColors() {
  function rec(row, col, player) {
    if (row < 0 || col < 0 || row > GRID_SIZE.height - 1 || col > GRID_SIZE.width - 1) return;
    if (board[row][col].checked) return;
    if (board[row][col].player != player) return;

    board[row][col].checked = true;
    rec(row - 1, col, player);
    rec(row + 1, col, player);
    rec(row, col - 1, player);
    rec(row, col + 1, player);
  }

  // Check still valid colors
  [0, 1].forEach(x => rec(players[x].base.row, players[x].base.col, x));

  for (let row = 0; row < GRID_SIZE.height; row++) {
    for (let col = 0; col < GRID_SIZE.width; col++) {
      if (board[row][col].checked) { // No change
        board[row][col].checked = false;
      } else {
        board[row][col].player = board[row][col].player ? 0 : 1;
      }
    }
  }
}