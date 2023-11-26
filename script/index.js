// ОБЪЯВЛЕНИЕ НЕОБХОДИМЫХ КОНСТАНТ
let game = null;
let player = null;

// Константы размеров игровой карты
const cols = 40;
const rows = 24;
// Константы размеро тайлов
const tileHeight = 640 / rows;
const tileWidth = 1024 / cols;

// Константы для числа игровых объектов
const enemyAmount = 10;
const healthAmount = 10;
const weapondAmount = 2;

// Константы для определения типа тайла
const wallCode = 0;
const floorCode = 1;
const playerCode = 2;
const enemyCode = 3;
const healthCode = 4;
const weapondCode = 5;
let tiles = ["tileW", "tile", "tileP", "tileE", "tileHP", "tileSW"];

// СОЗДАНИЕ КЛАССОВ

class Player {
  constructor(health, damage, coords) {
    this.health = health;
    this.damage = damage;
    this.coords = coords;
  }
}

class Enemy {
  constructor(health, damage, coords) {
    this.health = health;
    this.damage = damage;
    this.coords = coords;
  }
}

class Game {
  constructor() {
    this.map = [];
    this.enemies = [];
    this.canvas = null;
  }
}

function init() {
  game = new Game();
  game.canvas = document.querySelector(".field");

  startGame();
}

init();

function startGame() {
  createTileGrid();
  generateMap();
  generateRooms();
  generateTunnels();
  generateItems(healthAmount, healthCode);
  generateItems(weapondAmount, weapondCode);
  generatePlayer();
  generateEnemies(enemyAmount);
  addEventListener();
  drawMap(0, 0, cols, rows);
}

function generateMap() {
  for (let i = 0; i < rows; i++) {
    game.map.push([]);
    for (let k = 0; k < cols; k++) {
      game.map[i].push(0);
    }
  }
}

function createTileGrid() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let tile = document.createElement("div");
      tile.style.position = "absolute";
      tile.style.width = `${tileWidth}px`;
      tile.style.height = `${tileHeight}px`;
      tile.style.left = `${col * tileWidth}px`;
      tile.style.top = `${row * tileHeight}px`;
      tile.id = `${row}_${col}`;
      game.canvas.appendChild(tile);
    }
  }
}

function drawObject(x, y, tileName) {
  let tile = document.getElementById(`${y}_${x}`);
  tile.className = "";
  tile.innerHTML = "";
  tile.classList.add(tileName);
  if (tileName === "tileP") {
    showPlayerHealth();
  }
}

function drawMap(startX, startY, endX, endY) {
  for (let row = startY; row < endY; row++) {
    for (let col = startX; col < endX; col++) {
      let tileCode = game.map[row][col];
      let tileName = tiles[tileCode];
      drawObject(col, row, tileName);
    }
  }
}

function generateRoom(coordX, coordY) {
  let roomHeigth = getRandomInt(3, 8),
    roomWidth = getRandomInt(3, 8);
  for (
    let row = coordY;
    row < (coordY + roomHeigth < rows ? coordY + roomHeigth : rows);
    row++
  ) {
    for (
      let col = coordX;
      col < (coordX + roomWidth < cols ? coordX + roomWidth : cols);
      col++
    ) {
      if (
        game.map[row][col] !== undefined &&
        game.map[row][col] !== floorCode
      ) {
        game.map[row][col] = 1;
      }
    }
  }
}

function generateRooms() {
  let roomsAmount = getRandomInt(5, 10);
  for (let roomsCounter = 0; roomsCounter < roomsAmount; roomsCounter++) {
    let coordX = getRandomInt(0, cols),
      coordY = getRandomInt(0, rows);
    generateRoom(coordX, coordY);
  }
}

function generateTunnels() {
  let tunnelsAmount = getRandomInt(3, 5);
  // true - горизонтальное направление тунелей, false - вертикальное
  generateTunnel(tunnelsAmount, true);
  tunnelsAmount = getRandomInt(3, 5);
  generateTunnel(tunnelsAmount, false);
}

// ТРЕБУЕТ ОПТИМИЗАЦИИ=================================================================================================================
function generateTunnel(tunnelsAmount, horizontal) {
  for (
    let tunnelsCounter = 0;
    tunnelsCounter < tunnelsAmount;
    tunnelsCounter++
  ) {
    let coords = generateValidCoord();
    if (horizontal) {
      for (let coordX = 0; coordX < cols; coordX++) {
        game.map[coords.y][coordX] = 1;
      }
      continue;
    }
    for (let coordY = 0; coordY < rows; coordY++) {
      game.map[coordY][coords.x] = 1;
    }
  }
}

function generateItems(amount, tileCode) {
  for (let i = 0; i < amount; i++) {
    let coords = generateValidCoord();
    addObjToMap(coords, tileCode);
  }
}

function generatePlayer() {
  let coords = generateValidCoord();
  player = new Player(100, 15, coords);
  addObjToMap(coords, playerCode);
}

function generateEnemies(amount) {
  for (let i = 0; i < amount; i++) {
    let coords = generateValidCoord();
    let enemy = new Enemy(60, 10, coords);
    game.enemies.push(enemy);
    addObjToMap(coords, enemyCode);
  }
}

function addObjToMap(coord, tile) {
  game.map[coord.y][coord.x] = tile;
}

function removeObjFromMap(x, y) {
  game.map[y][x] = floorCode;
}

function addEventListener() {
  document.addEventListener("keydown", (e) => {
    let x = player.coords.x;
    let y = player.coords.y;
    let oldX = player.coords.x;
    let oldY = player.coords.y;
    switch (e.key) {
      case "w":
        y--;
        break;
      case "d":
        x++;
        break;
      case "s":
        y++;
        break;
      case "a":
        x--;
        break;
      case " ":
        playerAttack();
      default:
        return;
    }
    
    if (game.map[y][x] !== wallCode && game.map[y][x] !== enemyCode) {
      updateObjectPosition(
        x,
        y,
        player.coords.x,
        player.coords.y,
        player,
        playerCode
      );

      drawMap(0, 0, cols, rows);
    } else if (playerDangerZone) {
    }
  });
}

function updateObjectPosition(newX, newY, oldX, oldY, object, objectCode) {
  removeObjFromMap(oldX, oldY);
  game.map[newY][newX] = objectCode;
  object.coords = {
    x: newX,
    y: newY,
  };
}

function playerAttack() {
  // "Анимация" удара
  let dangerZoneArr = [];
  dangerZoneArr.push(
    document.getElementById(`${player.coords.y}_${player.coords.x + 1}`)
  );
  dangerZoneArr.push(
    document.getElementById(`${player.coords.y}_${player.coords.x - 1}`)
  );
  dangerZoneArr.push(
    document.getElementById(`${player.coords.y + 1}_${player.coords.x}`)
  );
  dangerZoneArr.push(
    document.getElementById(`${player.coords.y - 1}_${player.coords.x}`)
  );
  dangerZoneArr.forEach((tile) => {
    tile.innerHTML = "+";
    tile.style.color = "yellow";
    tile.style.fontSize = "30px";
    tile.style.textAlign = "center";
    setTimeout(() => (tile.innerHTML = ""), 100);
  });
  // Нанесение урона
  if (matchingCoords()) {
    let enemy = game.enemies.find(matchingEnemyCoords);
    fightEnemy(enemy);
  }
}

function matchingEnemyCoords(enemy) {
  return (
    (player.coords.x + 1 == enemy.coords.x &&
      player.coords.y == enemy.coords.y) ||
    (player.coords.x - 1 == enemy.coords.x &&
      player.coords.y == enemy.coords.y) ||
    (player.coords.x == enemy.coords.x &&
      player.coords.y + 1 == enemy.coords.y) ||
    (player.coords.x == enemy.coords.x && player.coords.y - 1 == enemy.coords.y)
  );
}
function matchingCoords() {
  return (
    game.map[player.coords.y][player.coords.x + 1] === enemyCode ||
    game.map[player.coords.y][player.coords.x - 1] === enemyCode ||
    game.map[player.coords.y + 1][player.coords.x] === enemyCode ||
    game.map[player.coords.y - 1][player.coords.x] === enemyCode);
}

function fightEnemy(enemy) {
  if (enemy.health - player.damage <= 0) {
    removeObjFromMap(enemy.coords.x, enemy.coords.y);
    drawMap(0, 0, cols, rows);
  }
  enemy.health -= player.damage;
}

function showPlayerHealth() {
  let playerTile = document.getElementById(
    `${player.coords.y}_${player.coords.x}`
  );
  playerTile.innerHTML = `<div class='health' style='width:${player.health}%'></div>`;
}

function playerDangerZone() {}
// Генерация случайных координат пола
function generateValidCoord() {
  let x, y;
  let turns = 0,
    limit = 100;
  do {
    x = getRandomInt(0, cols);
    y = getRandomInt(0, rows);
    turns++;
  } while (game.map[y][x] != floorCode && turns < limit);
  return { x: x, y: y };
}

// Генерация случайного числа в промежутке
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
