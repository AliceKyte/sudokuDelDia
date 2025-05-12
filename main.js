const parentGrid = document.getElementById("actual-grid");
const dataCells = new Array(9).fill(null).map(() => [])
import { generateSudoku, seed } from "./claude.js"

const EASY = "easy"
const NORMAL = "normal"
const HARD = "hard"
var timerdiv = document.getElementById('timer');

var sec = 0;
var min = 0;
var hrs = 0;
var t;
const DIFFICULTY = {
    [EASY]: 50,
    [NORMAL]: 35,
    [HARD]: 23,
};

const PERSISTENT_KEY = "SUDOKU_STATE_" + seed;
const sudoku = generateSudoku(DIFFICULTY[NORMAL]);
const initial = JSON.parse(localStorage.getItem(PERSISTENT_KEY));

function genCell(preffix) {
    const subGrid = document.createElement("div");
    subGrid.classList.add("grid-container");

    for (let i = 0; i < 9; i++) {
        const compensarX = (preffix * 3) % 9;
        const x = (i % 3) + compensarX;

        const compensarY = Math.floor(preffix / 3) * 3;
        const y = Math.floor(i / 3) + compensarY;

        const box1 = document.createElement("div");
        box1.classList.add("grid-item");
        box1.id = `box_${x}_${y}`;

        // start
        const cellValue = sudoku.puzzle[y][x];

        if (cellValue == 0) {
            box1.classList.add("interact");
            box1.tabIndex = 1;
            box1.addEventListener("click", () => {
                if (box1.tabIndex) {
                    box1.classList.add("active");
                }
            });
            box1.addEventListener("blur", () => box1.classList.remove("active"));

            if (initial && initial[y][x]) box1.innerHTML = initial[y][x];
        } else {
            box1.innerHTML = cellValue;
            box1.classList.add("disable");
        }
        // end

        subGrid.appendChild(box1);
        dataCells[y][x] = box1;
    }

    parentGrid.appendChild(subGrid);
}

for (let i = 0; i < 9; i++) {
    genCell(i)
}

function isValid() {
    const state = new Array(9).fill(null).map(() => [])
    let valid = true;

    for (let y in sudoku.solution) {
        const row = sudoku.solution[y]

        for (let x in row) {
            const val = sudoku.solution[y][x]
            const curr = dataCells[y][x].innerHTML
            state[y][x] = curr;

            if (val != curr) valid = false;
        }
    }

    localStorage.setItem(PERSISTENT_KEY, JSON.stringify(state))

    return valid;
}

function dispatchChange() {
    if (isValid()) {
          clearTimeout(t);
        alert("GANASTE (ahora es verdà)")
    }
}
function tick() {
  sec++;
  if (sec >= 60) {
    sec = 0;
    min++;
    if (min >= 60) {
      min = 0;
      hrs++;
    }
  }
}
function add() {
  tick();
  timerdiv.innerHTML = (hrs > 9 ? hrs : '0' + hrs) + ':' + (min > 9 ? min : '0' + min) + ':' + (sec > 9 ? sec : '0' + sec);
  timer();
}
function timer() {
    t = setTimeout(add, 1000);
}
document.querySelectorAll("#tecladoNumerico .numeros input ").forEach((numero) => {
    numero.addEventListener("mousedown", () => {
        const box = document.querySelector(".active");
        if (box) {
            box.innerHTML = numero.value;
            dispatchChange();
            if(!t) {
            timer();
        }
        }
    })
});

// Añadir evento de teclado para los números
document.addEventListener("keydown", (event) => {
    const box = document.querySelector(".active");
    if (box && event.key >= 1 && event.key <= 9) {
        box.innerHTML = event.key;
        dispatchChange();
        if(!t) {
            timer();
        }
    }
});

// Añadir evento de teclado para borrar números
document.addEventListener("keydown", (event) => {
    const box = document.querySelector(".active");
    if (box && event.key === "Backspace") {
        box.innerHTML = "";
        dispatchChange()
    }
});

document.getElementById('borrar').addEventListener('mousedown', () => {
    const box = document.querySelector(".active");
    if (box) {
        box.innerHTML = "";
        dispatchChange()
    }
});
