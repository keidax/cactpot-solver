import "./Square.css";

function Square({ value, onSquareInput } : { value:number, onSquareInput:any }) {
  return (
      <td>
          <input className="number-input" type="number" onInput={onSquareInput} value={value} min={1} max={9}/>
      </td>
  );
}

export default Square;
