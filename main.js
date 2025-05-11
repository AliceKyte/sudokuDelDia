const parentGrid = document.getElementById("actual-grid");
const dataCells = new Array(9).fill(null).map(() => [])
import { generateSudoku } from "./claude.js"

const EASY = "easy"
const NORMAL = "normal"
const HARD = "hard"

const DIFFICULTY = {
    [EASY]: 50,
    [NORMAL]: 35,
    [HARD]: 23,
};

const sudoku = generateSudoku(DIFFICULTY[NORMAL])

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
        } else {
            box1.innerHTML = cellValue;
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

document.querySelectorAll("#tecladoNumerico .numeros input ").forEach((numero) => {
    numero.addEventListener("mousedown", () => {
        const box = document.querySelector(".active");
        if (box) {
            box.innerHTML = numero.value;
        }
    })
});

// Añadir evento de teclado para los números
document.addEventListener("keydown", (event) => {
    const box = document.querySelector(".active");
    if (box && event.key >= 1 && event.key <= 9) {
        box.innerHTML = event.key;
    }
});

// Añadir evento de teclado para borrar números
document.addEventListener("keydown", (event) => {
    const box = document.querySelector(".active");
    if (box && event.key === "Backspace") {
        box.innerHTML = "";
    }
});

document.getElementById('borrar').addEventListener('mousedown', () => {
    const box = document.querySelector(".active");
    if (box) {
        box.innerHTML = "";
    }
});
