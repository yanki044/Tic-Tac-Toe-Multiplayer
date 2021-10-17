const X_CLASS = "x";
const CIRCLE_CLASS = "circle";
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
const cellElements = document.querySelectorAll("[data-cell]");
const board = document.getElementById("board");
const winningMessageElement = document.getElementById("winningMessage");
const winningMessageTextElement = document.querySelector(
  "[data-winning-message-text"
);
const restartButton = document.getElementById("restartButton");

const cell0 = document.getElementById("cell0");
const cell1 = document.getElementById("cell1");
const cell2 = document.getElementById("cell2");
const cell3 = document.getElementById("cell3");
const cell4 = document.getElementById("cell4");
const cell5 = document.getElementById("cell5");
const cell6 = document.getElementById("cell6");
const cell7 = document.getElementById("cell7");
const cell8 = document.getElementById("cell8");

let clientId;
let circleTurn;

let ws = new WebSocket("ws://localhost:9090");

ws.onmessage = (message) => {
  //message.data
  const response = JSON.parse(message.data);

  //connect
  if (response.method === "connect") {
    clientId = response.clientId;
    console.log("Client id set successfully " + clientId);
  }


  //disable player from clicking while player2's turn
  if (response.method === "disablePlayer") {
    let disablePlayer = response.clientId;
    console.log("Client id DISABLED " + disablePlayer);
    if (disablePlayer === clientId) {
      cellElements.forEach((cell) => {
        if (
          !cell.classList.contains(X_CLASS) &&
          !cell.classList.contains(CIRCLE_CLASS)
        ) {
          cell.style.cursor = "no-drop";
          cell.style.pointerEvents = "none";
        }
      });
    } else {
      cellElements.forEach((cell) => {
        if (
          !cell.classList.contains(X_CLASS) &&
          !cell.classList.contains(CIRCLE_CLASS)
        ) {
          cell.style.cursor = "pointer";
          cell.style.pointerEvents = "all";
        }
      });
    }
  }

  //update cell to player 2
  if (response.method === "update") {
    let cell = document.getElementById(response.cell);
    let currentClass = response.currentClass;
    console.log(`CLIENT RECEIVING: cell: ${cell}`);
    console.log(`CLIENT RECEIVING: currentClass: ${currentClass}`);
    cell.classList.add(currentClass);

    // PlaceMark
    cellElements.forEach((cell) => {
      if (
        cell.classList.contains(X_CLASS) ||
        cell.classList.contains(CIRCLE_CLASS)
      ) {
        cell.style.cursor = "no-drop";
        cell.style.pointerEvents = "none";
      }
    });

    //check win
    if (checkWin(currentClass)) {
      console.log("game won");
      endGame(false);
    } else if (isDraw()) {
      endGame(true);
    } else {
      swapTurns();
      setBoardHoverClass();
    }

    console.log("SWITICHING TURNS");
  }

  if (response.method === "restart") {
    startGame();
  }
};

//start game
startGame();

//restart game
restartButton.addEventListener("click", sendRestart);

function sendRestart() {
  const payLoad = {
    method: "restart",
  };

  ws.send(JSON.stringify(payLoad));
}


function startGame() {
  console.log("start game");
  circleTurn = false;
  cellElements.forEach((cell) => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(CIRCLE_CLASS);
    cell.removeEventListener("click", handleClick);
    cell.addEventListener("click", handleClick, { once: true });
    cell.style.cursor = "pointer";
    cell.style.pointerEvents = "all";
  });
  setBoardHoverClass();
  winningMessageElement.classList.remove("show");
}

//player clicks on board
function handleClick(e) {
  const cell = e.target;
  const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS;
  placeMark(cell, currentClass);
  console.log(`cell: ${cell.id}`);
  console.log(`currentClass: ${currentClass}`);

  let payLoad = {
    method: "update",
    cell: cell.id,
    currentClass: currentClass,
  };
  ws.send(JSON.stringify(payLoad));

  payLoad = {
    method: "disablePlayer",
    clientId: clientId,
  };

  ws.send(JSON.stringify(payLoad));
}

function endGame(draw) {
  if (draw) {
    winningMessageTextElement.innerText = "Draw!";
  } else {
    winningMessageTextElement.innerText = `${circleTurn ? "O's" : "X's"} Wins!`;
  }
  winningMessageElement.classList.add("show");
}

function isDraw() {
  return [...cellElements].every((cell) => {
    return (
      cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    );
  });
}

function placeMark(cell, currentClass) {
  cell.classList.add(currentClass);
}

function swapTurns() {
  circleTurn = !circleTurn;
}

function setBoardHoverClass() {
  board.classList.remove(X_CLASS);
  board.classList.remove(CIRCLE_CLASS);
  if (circleTurn) {
    board.classList.add(CIRCLE_CLASS);
  } else {
    board.classList.add(X_CLASS);
  }
}

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some((combination) => {
    return combination.every((index) => {
      return cellElements[index].classList.contains(currentClass);
    });
  });
}
