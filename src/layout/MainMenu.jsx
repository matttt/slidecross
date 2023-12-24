import React from "react";
import { puzzles } from '../game/puzzles.js';
import Button from '@mui/material/Button';
import { generateBoardAsciiArt } from "../game/utils.jsx";

const puzzleButtonStyle = {
  'lineHeight': '9.5px',
  'letterSpacing': '1px',
  color: '#EEE',
};
export const MainMenu = ({ onPuzzleSelect }) => {
  const createPuzzleButton = (puzzle, i) => {
    const boardStateStr = localStorage.getItem(puzzle.id) || null;

    return <Button
      style={puzzleButtonStyle}
      key={puzzle.id}
      onClick={() => onPuzzleSelect(puzzle)}
    >
      <pre style={puzzleButtonStyle}>{generateBoardAsciiArt(puzzle, boardStateStr)}</pre>
    </Button>;
  };

  const miniButtons = puzzles.minis.map(createPuzzleButton);
  const biggieButtons = puzzles.biggies.map(createPuzzleButton);

  return (
    <div className="flex flex-col justify-center items-center" style={{ width: "100%" }}>
      <h1 className="text-4xl font-bold mb-4 text-center md:text-left" style={{ color: 'white', marginTop: "50px" }}>slidecross</h1>
      <h4 className="text-xs mb-4 text-center md:text-left" style={{ color: 'white' }}>a puzzle game by <a href="https://twitter.com/mateomartori" style={{ color: 'white' }}>matthew martori</a></h4>

      <h2 className="text-2xl text-center md:text-left" style={{ color: 'white', marginTop: "50px" }}>minis</h2>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-8">
        {miniButtons}
      </div>

      <h2 className="text-2xl text-center md:text-left" style={{ color: 'white', marginTop: "50px" }}>biggies</h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">{biggieButtons}</div>
    </div>
  );
};
