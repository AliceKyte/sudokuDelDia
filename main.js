const parentGrid = document.getElementById("actual-grid");
const dataCells = new Array(9).fill(null).map(() => [])

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
        box1.classList.add("interact");
        box1.tabIndex = 1;
        box1.addEventListener("click", () => {
            if (box1.tabIndex) {
                box1.classList.add("active");
            }
        });
        box1.addEventListener("blur", () => box1.classList.remove("active"));
        // end

        subGrid.appendChild(box1);
        dataCells[y][x] = box1;
    }

    parentGrid.appendChild(subGrid);
}

for (let i = 0; i < 9; i++) {
    genCell(i)
}

document.querySelectorAll("#tecladoNumerico input").forEach((numero) => {
    numero.addEventListener("mousedown", () => {
        const box = document.querySelector(".active");
        if (box) {
            box.innerHTML = numero.value;
        }
    })
});

dataCells[2][1].innerHTML = 4;
dataCells[2][1].tabIndex = 0;
dataCells[2][1].classList.remove("interact");
