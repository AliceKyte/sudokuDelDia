function generarSudoku{
    let sudoku = Array.from({length: 9}, () => Array.from({length: 9}, () => 0));

    function esValido(fila, columna, numero){
        for(let i = 0; i < 9; i++){
            if(sudoku[fila][i] == numero || sudoku[i][columna] == numero){
                return false;
            }
        }

        let filaInicio = Math.floor(fila / 3) * 3;
        let columnaInicio = Math.floor(columna / 3) * 3;

        for(let i = filaInicio; i < filaInicio + 3; i++){
            for(let j = columnaInicio; j < columnaInicio + 3; j++){
                if(sudoku[i][j] == numero){
                    return false;
                }
            }
        }

        return true;
    }

    function resolverSudoku (fila = 0, columna = 0){
        
    }
}