import React from 'react';
import './App.css';
import Square from './Square';

function App() {
    return (
        <div className="App">
        <header className="App-header">
        <h2>Mini Cactpot Solver</h2>
        <p/>
        <Board/>
        <hr/>
        <p>
            Instructions:
            <br/>
            Fill out digits on the mini cactpot board.
            <br/>
            The numbers for each line show the expected value in MGP.
            <br/>
            The highest expected payout will be highlighted in green.
        </p>
        </header>
        </div>
    );
}

const LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

function LineValue({value, isBest}: {value:number, isBest:boolean}) {
    return (
            <span style={{
                color: isBest ? "lime" : "white",
            }}>
                {value.toFixed(0)}
            </span>
    )
}

function Board() {
    const [squares, setSquares] = React.useState<(number|null)[]>(Array(9).fill(null));

    function handleInput(squareIndex:number, newValue:number|null) {
        // The board can't have duplicate numbers, so replace any instances of the new number
        // with null.
        let nextSquares = squares.map((num) => {
            if (newValue !== null && num === newValue) {
                return null
            } else {
                return num
            }
        })

        nextSquares[squareIndex] = newValue;
        setSquares(nextSquares);
    }

    const payouts = linePayouts(squares);
    const isBest = bestPayouts(payouts);

    return (
      <>
      <table className="board-table">
        <tbody>
          <tr>
            <td className="cell-rotated-right">
              <div className="number-diagonal">
                <LineValue value={payouts[6]} isBest={isBest[6]} />
              </div>
            </td>
            <td className="cell-rotated-center">
              <div className="number-vertical">
                <LineValue value={payouts[3]} isBest={isBest[3]} />
              </div>
            </td>
            <td className="cell-rotated-center">
              <div className="number-vertical">
                <LineValue value={payouts[4]} isBest={isBest[4]} />
              </div>
            </td>
            <td className="cell-rotated-center">
              <div className="number-vertical">
                <LineValue value={payouts[5]} isBest={isBest[5]} />
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="number-horizontal">
                <LineValue value={payouts[0]} isBest={isBest[0]} />
              </div>
            </td>
            <Square value={squares[0]} onSquareInput={(v) => handleInput(0, v)} />
            <Square value={squares[1]} onSquareInput={(v) => handleInput(1, v)} />
            <Square value={squares[2]} onSquareInput={(v) => handleInput(2, v)} />
          </tr>
          <tr>
            <td>
              <div className="number-horizontal">
                <LineValue value={payouts[1]} isBest={isBest[1]} />
              </div>
            </td>
            <Square value={squares[3]} onSquareInput={(v) => handleInput(3, v)} />
            <Square value={squares[4]} onSquareInput={(v) => handleInput(4, v)} />
            <Square value={squares[5]} onSquareInput={(v) => handleInput(5, v)} />
          </tr>
          <tr>
            <td>
              <div className="number-horizontal">
                <LineValue value={payouts[2]} isBest={isBest[2]} />
              </div>
            </td>
            <Square value={squares[6]} onSquareInput={(v) => handleInput(6, v)} />
            <Square value={squares[7]} onSquareInput={(v) => handleInput(7, v)} />
            <Square value={squares[8]} onSquareInput={(v) => handleInput(8, v)} />
          </tr>
          <tr>
            <td className="cell-rotated-right">
              <div className="number-other-diagonal">
                <LineValue value={payouts[7]} isBest={isBest[7]} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </>
    )
}

function linePayouts(squares: (number|null)[]): number[] {
    const unknowns = unknownNumbers(squares);

    const expectedPayouts = LINES.map((line) => {
        let lineNumbers = [];
        for (const index of line) {
            const square = squares[index];
            if(square){
                lineNumbers.push(square);
            }
        }

        return expectedValueOfLine(lineNumbers, unknowns);
    });

    return expectedPayouts;
}

function bestPayouts(payouts: number[]): boolean[] {
    const max = Math.max(...payouts);
    return payouts.map((num) => Math.abs(max-num) < 0.1);
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
