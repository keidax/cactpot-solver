import "./Square.css";

function Square({ value, onSquareInput } : { value:number, onSquareInput:any }) {
  return (
      <input className="number-input" type="number" onInput={onSquareInput} value={value} min={1} max={9}/>
  );
}

export default Square;
