// ОБЪЯВЛЕНИЕ НЕОБХОДИМЫХ КОНСТАНТ
let game = null;
let player = null;

// Константы размеров игровой карты
const cols = 40;
const rows = 24;
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

// СОЗДАНИЕ КЛАССОВ

class Player {
  constructor(health, damage) {
    this.health = health;
    this.damage = damage;
  }
}

class Enemy {
  constructor(health, damage) {
    this.health = health;
    this.damage = damage;
  }
}

class Game {
  constructor() {
    this.map = [];
    this.enemy = [];
    this.canvas = null;
    // this.context = null;
  }
}

function init() {
  game = new Game();
  game.canvas = document.querySelector(".field");
  // game.context = game.canvas.getContext("2d");

  startGame();
}

init();

function startGame() {
  generateMap();
  generateRooms();
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

function drawObject(x, y, tileName) {
  let tile = document.createElement("div");
  tile.classList.add(tileName);
  tile.style.position = "absolute";
  tile.style.width = `${tileWidth}px`;
  tile.style.height = `${tileHeight}px`;
  tile.style.left = `${x * tileWidth}px`;
  tile.style.top = `${y * tileHeight}px`;
  game.canvas.appendChild(tile);
}

function drawMap(startX, startY, endX, endY) {
  let tiles = ["tileW", "tile", "tileP", "tileE", "tileHP", "tileSW"];
  for (let row = startY; row < endY; row++) {
    for (let col = startX; col < endX; col++) {
      let tileCode = game.map[row][col];
      let tileName = tiles[tileCode];
      drawObject(col, row, tileName);
    }
  }
}

function generateRoom(coordX, coordY) {
  let roomHeigth = getRandomInt(3, 8);
  let roomWidth = getRandomInt(3, 8);
  for (let row = coordY; row < (coordY + roomHeigth < rows ? coordY + roomHeigth : rows); row++) {
    for (let col = coordX; col < (coordX + roomWidth < cols ? coordX + roomWidth : cols); col++) {
      if (game.map[row][col] !== undefined && game.map[row][col] !== 1) {
        game.map[row][col] = 1;
      }
    }
  }
}

function generateRooms() {
  let roomsAmount = getRandomInt(5, 10);
  for (let roomsCounter = 0; roomsCounter < roomsAmount; roomsCounter++) {
    let coordX = getRandomInt(0, cols);
    let coordY = getRandomInt(0, rows);
    console.log(coordX, coordY)
    generateRoom(coordX, coordY);
  }
}

console.log(game.map)

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
