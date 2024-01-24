import React from "react";
import { puzzles } from '../game/puzzles.js';
import Button from '@mui/material/Button';
import { generateBoardAsciiArt } from "../game/utils.jsx";
import { useNavigate } from "react-router-dom";

const puzzleButtonStyle = {
  'lineHeight': '9.5px',
  'letterSpacing': '1px',
  color: '#EEE',
};
export const MainMenu = () => {
  const navigate = useNavigate();
  const createPuzzleButton = (puzzle, i, type) => {
    const boardStateStr = localStorage.getItem(puzzle.id) || null;

    return <Button
      style={puzzleButtonStyle}
      key={puzzle.id}
      onClick={() => navigate(`/puzzles/${type}/${puzzle.id}`)}
    >
      <pre style={puzzleButtonStyle}>{generateBoardAsciiArt(puzzle, boardStateStr)}</pre>
    </Button>;
  };

  const miniButtons = puzzles.minis.map((p,i) => createPuzzleButton(p, i, 'minis'));
  const middlieButtons = puzzles.middlies.map((p,i) => createPuzzleButton(p, i, 'middlies'));
  const biggieButtons = puzzles.biggies.map((p,i) => createPuzzleButton(p, i, 'biggies'));

  return (
    <div className="flex flex-col justify-center items-center" style={{ width: "100%" }}>
      <h1 className="text-4xl font-bold mb-4 text-center md:text-left" style={{ color: 'white', marginTop: "50px" }}>slidecross</h1>
      <h4 className="text-xs mb-1 text-center md:text-left" style={{ color: 'white' }}>a puzzle game by <a href="https://twitter.com/mateomartori" style={{ color: 'white' }}>matthew martori</a></h4>
      <h4 className="text-xs mb-1 text-center md:text-left" style={{ color: 'white' }}>puzzles by alex tuchi</h4>
      <h4 className="text-xs mb-4 text-center md:text-left" style={{ color: 'white' }}><a href="mailto:slidecrossdev@gmail.com">email us!</a></h4>

      <h2 className="text-2xl text-center md:text-left mt-3" style={{ color: 'white' }}>smallies</h2>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-8">
        {miniButtons}
      </div>

      <h2 className="text-2xl text-center md:text-left mt-3" style={{ color: 'white' }}>middies</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {middlieButtons}
      </div>

      <h2 className="text-2xl text-center md:text-left mt-3" style={{ color: 'white' }}>biggies</h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">{biggieButtons}</div>
    </div>
  );
};
