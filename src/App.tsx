import React from 'react';
import './App.css';
import Square from './Square';

function App() {
    return (
        <div className="App">
        <header className="App-header">
        <Board/>
        </header>
        </div>
    );
}

function Board() {
    const [squares, setSquares] = React.useState<number[]>(Array(9).fill(null));

    function handleInput(i:number, event:any) {
        if (event.nativeEvent.data) {
            const nextSquares = squares.slice();
            nextSquares[i] = Number(event.nativeEvent.data);
            setSquares(nextSquares);
            findBestLine(nextSquares);
        }
    }

    return (
        <>
        <div className="board-row">
        <Square value={squares[0]} onSquareInput={(event: InputEvent) => handleInput(0, event)} />
        <Square value={squares[1]} onSquareInput={(event: InputEvent) => handleInput(1, event)} />
        <Square value={squares[2]} onSquareInput={(event: InputEvent) => handleInput(2, event)} />
        </div>
        <div className="board-row">
        <Square value={squares[3]} onSquareInput={(event: InputEvent) => handleInput(3, event)} />
        <Square value={squares[4]} onSquareInput={(event: InputEvent) => handleInput(4, event)} />
        <Square value={squares[5]} onSquareInput={(event: InputEvent) => handleInput(5, event)} />
        </div>
        <div className="board-row">
        <Square value={squares[6]} onSquareInput={(event: InputEvent) => handleInput(6, event)} />
        <Square value={squares[7]} onSquareInput={(event: InputEvent) => handleInput(7, event)} />
        <Square value={squares[8]} onSquareInput={(event: InputEvent) => handleInput(8, event)} />
        </div>
        </>
    )
}

function findBestLine(squares: (number|null)[]) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    const unknowns = unknownNumbers(squares);

    const expectedPayouts = lines.map((line) => {
        let lineNumbers = [];
        for (const index of line) {
            const square = squares[index];
            if(square){
                lineNumbers.push(square);
            }
        }

        return expectedValueOfLine(lineNumbers, unknowns);
    });

    console.log(expectedPayouts);
}

function expectedValueOfLine(knownNumbers: number[], unknownNumbers: number[]) {
    const payouts: Record<number,number> = {
        6: 10000,
        7: 36,
        8: 720,
        9: 360,
        10: 80,
        11: 252,
        12: 108,
        13: 72,
        14: 54,
        15: 180,
        16: 72,
        17: 180,
        18: 119,
        19: 36,
        20: 306,
        21: 1080,
        22: 144,
        23: 1800,
        24: 3600
    };

    const knownSum = knownNumbers.reduce((sum, elem) => sum + elem, 0);
    const unknownCombos = findAllComboSums(unknownNumbers, 3 - knownNumbers.length);

    const comboCount = unknownCombos.length;
    const comboTotalSum = unknownCombos.reduce((acc, combo) => {
        const sum = combo + knownSum;
        if (sum in payouts) {
            return acc + payouts[sum];
        } else {
            throw new Error("unknown combo " + sum);
        }
    }, 0);

    return comboTotalSum/comboCount;
}

function unknownNumbers(squares: (number|null)[]) : number[] {
    let remainingNumbers = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (const num of squares) {
        remainingNumbers[num || 0] = null;
    }

    return remainingNumbers.filter((num : number | null): num is number => num !== null);
}

function findAllComboSums(numbers: number[], count: number): number[] {
    if (count === 0) {
        return [0]
    }

    let result: number[] = [];

    for (let i = 0; i < numbers.length; i++) {
        const thisNumber = numbers[i];
        const otherNumbers = numbers.slice(i+1);

        const midSums = findAllComboSums(otherNumbers, count-1).map((other) => other + thisNumber);
        result.push(...midSums);
    }
    return result;
}

export default App;
