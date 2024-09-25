const field = document.getElementById("App");
const resultDisplay = document.querySelector(".result");
const mobileButtonTop = document.querySelector(".top");
const mobileButtonRight = document.querySelector(".right");
const mobileButtonBottom = document.querySelector(".bottom");
const mobileButtonLeft = document.querySelector(".left");
const boostButton = document.querySelector(".boost");
const fieldLength = 50;
let snakePosition = (fieldLength * fieldLength) / 2;
let currentSnakeHeadCell;
let direction = "right";
let snakeBody = [];
let cellsArray = [];
let initEatPointInterval;
let pointToEatObj = {
  x: Math.floor(Math.random() * fieldLength),
  y: Math.floor(Math.random() * fieldLength),
};
let pointToEatEl;
let moveSnakeSpeed = 300;
let moveSnakeInterval;
let isBoosted = false;

const disableContextMenu = (event) => {
  event.preventDefault(); 
};

mobileButtonTop.addEventListener("contextmenu", disableContextMenu);
mobileButtonRight.addEventListener("contextmenu", disableContextMenu);
mobileButtonBottom.addEventListener("contextmenu", disableContextMenu);
mobileButtonLeft.addEventListener("contextmenu", disableContextMenu);
boostButton.addEventListener("contextmenu", disableContextMenu);

const buildFieldGrid = () => {
  field.style.cssText = `
    margin: 0 auto;
    width: 80%;
    aspect-ratio: 1 / 1;
    display: grid;
    grid-template-columns: repeat(${fieldLength}, 1fr);
    grid-template-rows: repeat(${fieldLength}, 1fr);
    border: 1px solid black;
  `;
  const fieldWith = field.offsetWidth;
  const cellWidth = fieldWith / fieldLength;

  let x = 0;
  let y = 0;

  for (let i = 0; i < fieldLength * fieldLength; i++) {
    const cell = document.createElement("div");

    cell.setAttribute("data-x", x);
    cell.setAttribute("data-y", y);

    if (x === fieldLength - 1) {
      x = 0;
      y++;
    } else {
      x++;
    }

    cell.classList.add("cell");
    cell.style.width = `${cellWidth}px`;
    cell.style.height = `${cellWidth}px`;
    field.appendChild(cell);
  }

  cellsArray = Array.from(field.querySelectorAll(".cell"));
};

const initSnake = () => {
  const startCoordinate = fieldLength / 2 - 1;
  const startCell = cellsArray.find(
    (cell) =>
      cell.getAttribute("data-x") === startCoordinate.toString() &&
      cell.getAttribute("data-y") === startCoordinate.toString()
  );

  currentSnakeHeadCell = startCell;
  startSnakeMove(moveSnakeSpeed);
};

const moveSnake = () => {
  const currentX = +currentSnakeHeadCell.getAttribute("data-x");
  const currentY = +currentSnakeHeadCell.getAttribute("data-y");
  let nextX = currentX;
  let nextY = currentY;

  switch (direction) {
    case "right":
      nextX = currentX + 1;
      break;

    case "left":
      nextX = currentX - 1;
      break;

    case "bottom":
      nextY = currentY + 1;
      break;

    case "top":
      nextY = currentY - 1;
      break;

    default:
      break;
  }

  if (nextX >= fieldLength) {
    nextX = 0;
  } else if (nextX < 0) {
    nextX = fieldLength - 1;
  }

  if (nextY >= fieldLength) {
    nextY = 0;
  } else if (nextY < 0) {
    nextY = fieldLength - 1;
  }

  if (isSnakeEatsItSelf(nextX, nextY, snakeBody)) {
    restartGame();
  }

  snakeBody.forEach((cell) => cell.classList.remove("snake"));

  const nextCell = cellsArray.find(
    (cell) =>
      cell.getAttribute("data-x") === nextX.toString() &&
      cell.getAttribute("data-y") === nextY.toString()
  );

  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }

  snakeBody[0] = nextCell;
  currentSnakeHeadCell = nextCell;

  snakeBody.forEach((cell) => cell.classList.add("snake"));

  checkIfEat();
};

const growSnake = () => {
  const lastCell = snakeBody[snakeBody.length - 1];

  snakeBody.push(lastCell);
};

const handleKeyDown = (event) => {
  switch (event.key) {
    case "ArrowUp":
    case "w":
      if (direction !== "bottom") direction = "top";
      break;

    case "ArrowDown":
    case "s":
      if (direction !== "top") direction = "bottom";
      break;

    case "ArrowLeft":
    case "a":
      if (direction !== "right") direction = "left";
      break;

    case "ArrowRight":
    case "d":
      if (direction !== "left") direction = "right";
      break;

    default:
      return;
  }

  if (!isBoosted) {
    isBoosted = true;
    clearInterval(moveSnakeInterval);
    changeSnakeSpeed(true);
  }
};

const handleKeyUp = (event) => {
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d",
    ].includes(event.key)
  ) {
    isBoosted = false;
    clearInterval(moveSnakeInterval);
    changeSnakeSpeed(false);
  }
};

const initPointToEat = () => {
  const eat = cellsArray.find(
    (cell) =>
      cell.getAttribute("data-x") === pointToEatObj.x.toString() &&
      cell.getAttribute("data-y") === pointToEatObj.y.toString()
  );

  eat.classList.add("eat");
  pointToEatEl = eat;
};

const reInitPointToEat = () => {
  clearInterval(initEatPointInterval);
  pointToEatEl.classList.remove("eat");
  pointToEatObj.x = Math.floor(Math.random() * fieldLength);
  pointToEatObj.y = Math.floor(Math.random() * fieldLength);
  initPointToEat();
  reInitPointToEatInterval();
};

const checkIfEat = () => {
  const snakeX = currentSnakeHeadCell.getAttribute("data-x");
  const snakeY = currentSnakeHeadCell.getAttribute("data-y");

  if (
    snakeX === pointToEatObj.x.toString() &&
    snakeY === pointToEatObj.y.toString()
  ) {
    eatAnimation(currentSnakeHeadCell);
    reInitPointToEat();
    growSnake();
  }
};

const isSnakeEatsItSelf = (nextX, nextY, snakeBody) => {
  return !!snakeBody.find(
    (cell) =>
      cell.getAttribute("data-x") === nextX.toString() &&
      cell.getAttribute("data-y") === nextY.toString()
  );
};

const eatAnimation = (cell) => {
  cell.classList.add("to-eat");
  setTimeout(() => {
    cell.classList.remove("to-eat");
  }, 200);
};

const startSnakeMove = (speed) => {
  clearInterval(moveSnakeInterval);
  moveSnakeInterval = setInterval(() => {
    moveSnake();
  }, speed);
};

const changeSnakeSpeed = (boost) => {
  clearInterval(moveSnakeInterval);

  if (boost) {
    startSnakeMove(moveSnakeSpeed / 3);
  } else {
    startSnakeMove(moveSnakeSpeed);
  }
};
const reInitPointToEatInterval = () => {
  initEatPointInterval = setInterval(() => {
    reInitPointToEat();
  }, 10000);
};

const handleMobileButtonTop = () => {
  if (direction !== "bottom") direction = "top";
};

const handleMobileButtonRight = () => {
  if (direction !== "left") direction = "right";
};

const handleMobileButtonBottom = () => {
  if (direction !== "top") direction = "bottom";
};

const handleMobileButtonLeft = () => {
  if (direction !== "right") direction = "left";
};

const handleBoostStart = () => {
  isBoosted = true;
  clearInterval(moveSnakeInterval);
  changeSnakeSpeed(true);
};

const handleBoostEnd = () => {
  isBoosted = false;
  clearInterval(moveSnakeInterval);
  changeSnakeSpeed(false);
};

boostButton.addEventListener("touchstart", handleBoostStart);
boostButton.addEventListener("touchend", handleBoostEnd);

const restartGame = () => {
  clearInterval(moveSnakeInterval);
  clearInterval(initEatPointInterval);

  resultDisplay.textContent = `You scored ${snakeBody.length} points`;
  field.textContent = "";
  field.classList.add("restart");

  setTimeout(() => {
    initGame();
    field.classList.remove("restart");
    resultDisplay.textContent = "";
  }, 5000);
};

const initGame = () => {
  clearInterval(moveSnakeInterval);
  clearInterval(initEatPointInterval);

  snakeBody = [];
  resultDisplay.textContent = "";
  field.textContent = "";

  buildFieldGrid();
  initSnake();
  initPointToEat();
  reInitPointToEatInterval();
};

mobileButtonTop.addEventListener("touchstart", handleMobileButtonTop);
mobileButtonRight.addEventListener("touchstart", handleMobileButtonRight);
mobileButtonBottom.addEventListener("touchstart", handleMobileButtonBottom);
mobileButtonLeft.addEventListener("touchstart", handleMobileButtonLeft);

window.addEventListener("resize", initGame);
window.addEventListener("orientationchange", initGame);

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

initGame();
