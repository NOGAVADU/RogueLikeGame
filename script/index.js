// ОБЪЯВЛЕНИЕ НЕОБХОДИМЫХ КОНСТАНТ
let game = null;
let player = null;

// Константы размеров игровой карты
const cols = 40;
const rows = 24;
// Константы размеров тайлов
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
//======================================================================================================

function init() {
  game = new Game();
  game.canvas = document.querySelector(".field");

  startGame();
}

init();

//===================================================================================================
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
  if (tileName === "tileE") {
    showEnemyHealth();
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
// ГЕНЕРАЦИЯ КОМНАТ======================================================================================
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
// ГЕНЕРАЦИЯ ТУННЕЛЕЙ================================================================================================================
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

// ГЕНЕРАЦИЯ ИГРОВЫХ ОБЪЕКТОВ================================================================================
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
// Добавление/Удаление объектов и игрового пространства
function addObjToMap(coord, tile) {
  game.map[coord.y][coord.x] = tile;
}

function removeObjFromMap(x, y) {
  game.map[y][x] = floorCode;
}
// ПРОСЛУШИВАНИЕ СОБЫТИЙ========================================================================
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
        break;
      default:
        return;
    }

    if (game.map[y][x] !== wallCode && game.map[y][x] !== enemyCode) {
      if (game.map[y][x] === healthCode){
        player.health = 100;
      }
      if (game.map[y][x] == weapondCode){
        player.damage *= 2;
      }
      updateObjectPosition(
        x,
        y,
        player.coords.x,
        player.coords.y,
        player,
        playerCode
      );
    }
    let enemy = game.enemies.find(matchingEnemyCoords);
    enemy !== undefined ? enemyAtack(enemy) : "";
    enemiesMoving();
    drawMap(0, 0, cols, rows);
  });
}
// ПЕРЕМЕЩЕНИЕ ОБЪЕКТОВ ПО КАРТЕ================================================
function updateObjectPosition(newX, newY, oldX, oldY, object, objectCode) {
  if (0 <= newX && newX <= cols - 1 && 0 <= newY && newY <= rows - 1) {
    if (objectCode === enemyCode) {
      if (
        game.map[newY][newX] !== wallCode &&
        game.map[newY][newX] !== enemyCode &&
        game.map[newY][newX] !== playerCode &&
        game.map[newY][newX] !== weapondCode &&
        game.map[newY][newX] !== healthCode
      ) {
        removeObjFromMap(oldX, oldY);
        game.map[newY][newX] = objectCode;
        object.coords = {
          x: newX,
          y: newY,
        };
      }
    } else {
      removeObjFromMap(oldX, oldY);
      game.map[newY][newX] = objectCode;
      object.coords = {
        x: newX,
        y: newY,
      };
    }
  }
}

// CЛУЧАЙНОЕ ПЕРЕМЕЩЕНИЕ ПРОТИВНИКОВ=========================================
function enemiesMoving() {
  const enemies = game.enemies;
  enemies.forEach((enemy) => {
    // вертикальное или горизонтальное направление
    let dirXY = Math.random() <= 0.5 ? true : false;
    // Вперед или назад
    let dir = Math.random() <= 0.5 ? 1 : -1;
    if (dirXY) {
      updateObjectPosition(
        enemy.coords.x + dir,
        enemy.coords.y,
        enemy.coords.x,
        enemy.coords.y,
        enemy,
        enemyCode
      );
    } else {
      updateObjectPosition(
        enemy.coords.x,
        enemy.coords.y + dir,
        enemy.coords.x,
        enemy.coords.y,
        enemy,
        enemyCode
      );
    }
  });
}

// АТАКА ПЕРСОНАЖЕМ ПРОТИВНИКА================================================
function playerAttack() {
  let enemies = game.enemies.filter(matchingEnemyCoords);
  enemies.forEach((enemy) => {
    if (enemy.health - player.damage <= 0) {
      let enemyIndex = game.enemies.indexOf(enemy);
      game.enemies.splice(enemyIndex, 1);
      if (game.enemies.length == 0){
        playerWin()
      }
      removeObjFromMap(enemy.coords.x, enemy.coords.y);
    }
    enemy.health -= player.damage;
    drawMap(0, 0, cols, rows);
  })
}

// АТАКА ПРОТИВНИКОМ ПЕРСОНАЖА=============================================
function enemyAtack(enemy) {
  if (matchingEnemyCoords(enemy)) {
    if (player.health - enemy.damage <= 0) {
      gameOver();
    }
    player.health -= enemy.damage;
    drawMap(0, 0, cols, rows);
  }
}
// Проверка, что противник и персонаж находятся рядом
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
// Провекра в массиве на то, что клетки по близости являются противником
function matchingCoords() {
  return (
    game.map[player.coords.y][player.coords.x + 1] === enemyCode ||
    game.map[player.coords.y][player.coords.x - 1] === enemyCode ||
    game.map[player.coords.y + 1][player.coords.x] === enemyCode ||
    game.map[player.coords.y - 1][player.coords.x] === enemyCode
  );
}

// Функция для отрисовки ХП бара у персонажа
function showPlayerHealth() {
  let playerTile = document.getElementById(
    `${player.coords.y}_${player.coords.x}`
  );
  playerTile.innerHTML = `<div class='health' style='width:${player.health}%'></div>`;
}
// Фукция для отрисовки ХП бара у противников
function showEnemyHealth() {
  let enemies = game.enemies;
  enemies.forEach((enemy) => {
    let enemyTile = document.getElementById(
      `${enemy.coords.y}_${enemy.coords.x}`
    );
    enemyTile.innerHTML = `<div class='health' style='width:${
      (enemy.health * 100) / 60
    }%'></div>`;
  });
}

// Победа и проигрыш
function playerWin() {
  alert("YOU WIN!");
}

function gameOver() {
  alert("GAME OVER!");
  removeObjFromMap(player.coords.x, player.coords.y);
  drawMap(0, 0, cols, rows);
  player = null;
}

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
