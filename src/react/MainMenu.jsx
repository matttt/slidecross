import React, { useEffect } from "react";
import {Assets} from 'pixi.js';
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

  useEffect(() => {
    Assets.backgroundLoad('/fonts/Nunito-Bold.ttf');
    Assets.backgroundLoad('/fonts/Nunito-ExtraBoldItalic.ttf');
    Assets.backgroundLoad('/fonts/Nunito-ExtraLight.ttf');
    Assets.backgroundLoad('/fonts/Nunito-Italic.ttf');
  }, []);

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

  const createPuzzleHeader = n => (
    <h2 className="text-2xl text-center text-white md:text-left mt-3">{n}x{n}</h2>
  )

  // where category matches a section name in game/puzzles.js
  const createPuzzleButtonArr = (category) => puzzles[category].map((p, i) => createPuzzleButton(p, i, category));

  // const tutorialButtons = puzzles.tutorial.map((p,i) => createPuzzleButton(p, i, 'tutorial'));
  // const threesButtons = puzzles.threes.map((p,i) => createPuzzleButton(p, i, 'threes'));
  // const foursButtons = puzzles.fours.map((p,i) => createPuzzleButton(p, i, 'fours'));
  // const fivesButtons = puzzles.fives.map((p,i) => createPuzzleButton(p, i, 'fives'));
  // const ninesButtons = puzzles.nines.map((p,i) => createPuzzleButton(p, i, 'nines'));
  // const fifteensButtons = puzzles.biggies.map((p,i) => createPuzzleButton(p, i, 'fifteensButtons'));

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <h1 className="text-4xl font-bold mb-4 mt-12 text-center text-white md:text-left">slidecross</h1>
      <h4 className="text-xs mb-1 text-center text-white md:text-left">a puzzle game by matthew martori</h4>
      <h4 className="text-xs mb-1 text-center text-white md:text-left">puzzles by alex tuchi</h4>
      <h4 className="text-xs mb-1 text-center text-white md:text-left underline"><a href="mailto:slidecrossdev@gmail.com">email us!</a></h4>
      <h4 className="text-xs mb-4 text-center text-white md:text-left underline"><a href="https://github.com/matttt/slidecross">see the code</a></h4>


      {createPuzzleHeader(3)}
      <div className="grid grid-cols-4 gap-1 md:grid-cols-4">
        {createPuzzleButtonArr`threes`}
      </div>

      {createPuzzleHeader(4)}
      <div className="grid grid-cols-4 gap-1 md:grid-cols-4">
        {createPuzzleButtonArr`fours`}
      </div>

      {createPuzzleHeader(5)}
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
        {createPuzzleButtonArr`fives`}
      </div>

      {createPuzzleHeader(9)}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {createPuzzleButtonArr`nines`}
      </div>

      {createPuzzleHeader(11)}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
        {createPuzzleButtonArr`elevens`}
      </div>

      {createPuzzleHeader(15)}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 mb-10">{createPuzzleButtonArr`fifteens`}</div>

      {/* <h4 className="text-xs mt-4 text-center md:text-left" style={{ color: 'white' }}>slidecross © 2023 by Matthew Martori is licensed under CC BY-NC-SA 4.0 </h4> */}



    </div>
  );
};
