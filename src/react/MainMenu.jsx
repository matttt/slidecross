import React from "react";
import { puzzles } from '../game/puzzles.js';
import Button from '@mui/material/Button';
import { generateBoardAsciiArt } from "../game/generateSVG.jsx";
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

  // where category matches a section name in game/puzzles.js
  const createPuzzleButtonArr = (category) => puzzles[category].map((p,i) => createPuzzleButton(p, i, category));

  // const tutorialButtons = puzzles.tutorial.map((p,i) => createPuzzleButton(p, i, 'tutorial'));
  // const threesButtons = puzzles.threes.map((p,i) => createPuzzleButton(p, i, 'threes'));
  // const foursButtons = puzzles.fours.map((p,i) => createPuzzleButton(p, i, 'fours'));
  // const fivesButtons = puzzles.fives.map((p,i) => createPuzzleButton(p, i, 'fives'));
  // const ninesButtons = puzzles.nines.map((p,i) => createPuzzleButton(p, i, 'nines'));
  // const fifteensButtons = puzzles.biggies.map((p,i) => createPuzzleButton(p, i, 'fifteensButtons'));

  return (
    <div className="flex flex-col justify-center items-center" style={{ width: "100%" }}>
      <h1 className="text-4xl font-bold mb-4 text-center md:text-left" style={{ color: 'white', marginTop: "50px" }}>slidecross</h1>      
      <h4 className="text-xs mb-1 text-center md:text-left" style={{ color: 'white' }}>a puzzle game by matthew martori</h4>
      <h4 className="text-xs mb-1 text-center md:text-left" style={{ color: 'white' }}>puzzles by alex tuchi</h4>
      <h4 className="text-xs mb-4 text-center md:text-left underline" style={{ color: 'white' }}><a href="mailto:slidecrossdev@gmail.com">email us!</a></h4>


      <h2 className="text-2xl text-center md:text-left mt-3" style={{ color: 'white' }}>3x3</h2>
      <div className="grid grid-cols-4 gap-1 md:grid-cols-4">
        {createPuzzleButtonArr`threes`}
      </div>

      <h2 className="text-2xl text-center md:text-left mt-3" style={{ color: 'white' }}>4x4</h2>
      <div className="grid grid-cols-4 gap-1 md:grid-cols-4">
      {createPuzzleButtonArr`fours`}
      </div>

      <h2 className="text-2xl text-center md:text-left mt-3" style={{ color: 'white' }}>5x5</h2>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
      {createPuzzleButtonArr`fives`}
      </div>

      <h2 className="text-2xl text-center md:text-left mt-3" style={{ color: 'white' }}>9x9</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {createPuzzleButtonArr`nines`}
      </div>

      <h2 className="text-2xl text-center md:text-left mt-3" style={{ color: 'white' }}>11x11</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
      {createPuzzleButtonArr`elevens`}
      </div>

      <h2 className="text-2xl text-center md:text-left mt-3" style={{ color: 'white' }}>15x15</h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 mb-10">{createPuzzleButtonArr`fifteens`}</div>

    
    </div>
  );
};
