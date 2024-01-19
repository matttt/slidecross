import React, { memo, useEffect, useRef, useState } from "react";
import Typography from '@mui/material/Typography';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import UndoIcon from '@mui/icons-material/Undo';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import IconButton from '@mui/material/IconButton';
import { Application } from "pixi.js";
import app from "../game/App.js";
import Div100vh from 'react-div-100vh'
import Markdown from 'react-markdown'
import { isMobile } from 'react-device-detect';
import { puzzles } from '../game/puzzles.js';
import {useParams, useNavigate} from "react-router-dom";



const min = Math.min(window.innerWidth, window.innerHeight)
export const resolution = isMobile ? min : min * .75

const pixiConfig = {
  width: resolution,
  height: resolution,
  // antialias: true,
  backgroundColor: 0xF0F4EF,
  resolution: 3,
  autoDensity: true,
};

// const backButtonStyle = {
//   position: "absolute",
//   top: "10px",
//   left: "10px",
//   background: "none",
//   border: "none",
//   padding: "10px",
//   // borderRadius: "5px",
//   // boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
//   cursor: "pointer",
//   color: "#EEE",
// };

const ClueArea = ({ clue, onPreviousClue, onNextClue }) => {
  const widthOffset = window.innerWidth > window.innerHeight ? 64 : 0;

  return (
    <div style={{ width: resolution - widthOffset }} className="flex items-center fixed justify-between bottom-0 px-1 pb-safe-offset-2 pt-2 bg-[#D6E5F4]">
      <IconButton onClick={onPreviousClue} style={{ color: '#0D1821' }}  >
        <NavigateBeforeIcon />
      </IconButton>

      <Typography variant="h6" component="div" className="text-black text-center select-none">
        <Markdown>{clue}</Markdown>
      </Typography>

      <IconButton onClick={onNextClue} style={{ color: '#0D1821' }}>
        <NavigateNextIcon />
      </IconButton>
    </div>
  );
};

const TopBar = ({ onBack, onUndo }) => {
  const widthOffset = window.innerWidth > window.innerHeight ? 64 : 0;

  return <div style={{ width: resolution - widthOffset }} className="w-full top-2 fixed flex p-3 md:p-0">
    <IconButton onClick={onBack} color="primary" style={{ color: '#EEE', left: isMobile ? '' : '-10px' }} className="left-[-3]">
      <KeyboardBackspaceIcon />
    </IconButton>
    {/* spacer */}
    <div className="grow"></div>
    <IconButton className="right-0" onClick={onUndo} color="primary" style={{ color: '#EEE', right: isMobile ? '' : '-10px' }}>
      <UndoIcon />
    </IconButton>
  </div>
}

export const PuzzleView = () => {
  const navigate = useNavigate();

  const {puzzleId, puzzleType} = useParams();
  const [clue, setClue] = useState('');
  const puzzle = puzzles[puzzleType].find(p => p.id === puzzleId);

  const [onUndo, setOnUndo] = useState(() => () => null);
  const [onNextClue, setOnNextClue] = useState(() => () => null);
  const [onPreviousClue, setOnPreviousClue] = useState(() => () => null);

  const puzzleProps = {
    app,
    puzzle,
    boardStateStr: localStorage.getItem(puzzle.id) || null,
    pixiConfig,
    setOnUndo,
    setOnNextClue,
    setOnPreviousClue,
    setClue,
  };

  return (
    <Div100vh style={{ overflow: 'hidden' }}>

      <div className="flex flex-col items-center justify-center h-screen">
        <TopBar onBack={() => navigate('/')} onUndo={onUndo} />
        <Canvas {...puzzleProps} />
        <ClueArea clue={clue} onNextClue={onNextClue} onPreviousClue={onPreviousClue} />
      </div>

    </Div100vh>
  );
};

const Canvas = memo(({ app, puzzle, boardStateStr, setOnUndo, setOnNextClue, setOnPreviousClue, setClue, pixiConfig, }) => {
  const canvasRef = useRef(null);

  useEffect(() => {

    const view = canvasRef.current;
    const puzzleInput = {
      app: new Application({ view, ...pixiConfig }),
      puzzle,
      boardStateStr,
      setClue
    };

    const { onUndo, onNextClue, onPreviousClue } = app(puzzleInput);
    setOnUndo(() => onUndo);
    setOnNextClue(() => onNextClue);
    setOnPreviousClue(() => onPreviousClue);

    // eslint-disable-next-line
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}, (a, b) => true);

