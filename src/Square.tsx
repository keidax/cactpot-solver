import React from 'react';
import "./Square.css";

function Square({ value, onSquareInput } : { value:number|null, onSquareInput: (newValue: number|null) => void }) {
    let visibleValue = "";
    if (typeof value === "number") {
        visibleValue = value.toString();
    }

    function onSquareChange(event: React.ChangeEvent<HTMLInputElement>) {
        const number = Number(event.target.value.slice(-1));
        if (number >= 1 && number <= 9) {
            onSquareInput(number);
        } else {
            onSquareInput(null);
        }
    }

    return (
        <td>
            <input className="number-input" type="text" onChange={onSquareChange} value={visibleValue}/>
        </td>
    );
}

export default Square;
