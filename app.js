const boardEl = document.getElementById("board");
const newGameBtn = document.getElementById("newGameBtn");
const checkBtn = document.getElementById("checkBtn");
const msgEl = document.getElementById("msg");

let solution = null; // pełne poprawne sudoku 9x9
let puzzle = null;   // plansza z lukami 9x9 (0 = puste)

function randInt(n) { return Math.floor(Math.random() * n); }

function deepCopy(grid) {
  return grid.map(row => row.slice());
}

function isValid(grid, r, c, val) {
  // wiersz/kolumna
  for (let i = 0; i < 9; i++) {
    if (grid[r][i] === val) return false;
    if (grid[i][c] === val) return false;
  }
  // kwadrat 3x3
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let rr = br; rr < br + 3; rr++) {
    for (let cc = bc; cc < bc + 3; cc++) {
      if (grid[rr][cc] === val) return false;
    }
  }
  return true;
}

function findEmpty(grid) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return [r, c];
    }
  }
  return null;
}

function shuffledDigits() {
  const arr = [1,2,3,4,5,6,7,8,9];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Backtracking solver (generuje też losowe rozwiązanie)
function solve(grid) {
  const empty = findEmpty(grid);
  if (!empty) return true;

  const [r, c] = empty;
  const digits = shuffledDigits();

  for (const val of digits) {
    if (isValid(grid, r, c, val)) {
      grid[r][c] = val;
      if (solve(grid)) return true;
      grid[r][c] = 0;
    }
  }
  return false;
}

function generateSolvedGrid() {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(grid); // wypełnia losowo
  return grid;
}

// Usuń K pól (im więcej, tym trudniej). Zostawiamy bez gwarancji unikalności (na lab OK).
function makePuzzleFromSolution(sol, blanks = 45) {
  const g = deepCopy(sol);
  let removed = 0;
  while (removed < blanks) {
    const r = randInt(9);
    const c = randInt(9);
    if (g[r][c] !== 0) {
      g[r][c] = 0;
      removed++;
    }
  }
  return g;
}

function render() {
  boardEl.innerHTML = "";
  msgEl.textContent = "";

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      // grubsze linie siatki 3x3
      if (c === 2 || c === 5) cell.classList.add("bold-r");
      if (r === 2 || r === 5) cell.classList.add("bold-b");

      const val = puzzle[r][c];
      if (val !== 0) {
        cell.classList.add("given");
        cell.textContent = String(val);
      } else {
        const input = document.createElement("input");
        input.inputMode = "numeric";
        input.maxLength = 1;

        input.addEventListener("input", () => {
          // tylko 1-9
          input.value = input.value.replace(/[^1-9]/g, "");
        });

        input.addEventListener("blur", () => {
          const v = input.value ? Number(input.value) : 0;
          // walidacja w locie na podstawie rozwiązania
          if (v !== 0 && v !== solution[r][c]) {
            cell.classList.add("bad");
          } else {
            cell.classList.remove("bad");
          }
        });

        cell.appendChild(input);
      }

      boardEl.appendChild(cell);
    }
  }
}

function newGame() {
  solution = generateSolvedGrid();
  puzzle = makePuzzleFromSolution(solution, 45); // zmień np. 35/45/55
  render();
}

function checkAll() {
  let ok = true;

  // czytamy z DOM tylko puste pola
  const cells = boardEl.querySelectorAll(".cell");
  for (let i = 0; i < cells.length; i++) {
    const r = Math.floor(i / 9);
    const c = i % 9;
    const cell = cells[i];

    if (puzzle[r][c] === 0) {
      const inp = cell.querySelector("input");
      const v = inp.value ? Number(inp.value) : 0;

      if (v === 0 || v !== solution[r][c]) {
        ok = false;
        cell.classList.add("bad");
      } else {
        cell.classList.remove("bad");
      }
    }
  }

  msgEl.textContent = ok ? " Poprawnie!" : " Są błędy / puste pola.";
}

newGameBtn.addEventListener("click", newGame);
checkBtn.addEventListener("click", checkAll);

// start
newGame();
