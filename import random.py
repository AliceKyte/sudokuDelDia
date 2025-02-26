import random

def is_valid(board, row, col, num):
    for i in range(9):
        if board[row][i] == num or board[i][col] == num:
            return False
    start_row, start_col = 3 * (row // 3), 3 * (col // 3)
    for i in range(start_row, start_row + 3):
        for j in range(start_col, start_col + 3):
            if board[i][j] == num:
                return False
    return True

def solve(board):
    empty_cell = find_empty(board)
    if not empty_cell:
        return True
    row, col = empty_cell
    for num in range(1, 10):
        if is_valid(board, row, col, num):
            board[row][col] = num
            if solve(board):
                return True
            board[row][col] = 0
    return False

def find_empty(board):
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                return (row, col)
    return None

def generate_sudoku(difficulty='medium'):
    board = [[0 for _ in range(9)] for _ in range(9)]
    solve(board)
    remove_numbers(board, difficulty)
    return board

def remove_numbers(board, difficulty):
    attempts = {'easy': 40, 'medium': 50, 'hard': 60}
    cells_to_remove = attempts.get(difficulty, 50)
    while cells_to_remove > 0:
        row, col = random.randint(0, 8), random.randint(0, 8)
        while board[row][col] == 0:
            row, col = random.randint(0, 8), random.randint(0, 8)
        backup = board[row][col]
        board[row][col] = 0
        copy_board = [row[:] for row in board]
        if solve(copy_board):
            cells_to_remove -= 1
        else:
            board[row][col] = backup

# Generar un Sudoku con dificultad aleatoria
difficulty = random.choice(['easy', 'medium', 'hard'])
sudoku = generate_sudoku(difficulty)
for row in sudoku:
    print(row)