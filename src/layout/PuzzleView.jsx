import React, { memo, useEffect, useRef, useState } from "react";
import Typography from '@mui/material/Typography';
import useSound from 'use-sound';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import UndoIcon from '@mui/icons-material/Undo';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import IconButton from '@mui/material/IconButton';
import jingle from './sounds/jingle.mp3';
import { Application } from "pixi.js";
import app from "../game/App.js";
import Div100vh from 'react-div-100vh'


export const resolution = Math.min(window.innerWidth, window.innerHeight)
const pixiConfig = {
  width: resolution,
  height: resolution,
  // antialias: true,
  backgroundColor: 0xFFFFFF,
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


export const PuzzleView = ({ puzzle, onBack }) => {

  const [clue, setClue] = useState('');

  const [onUndo, setOnUndo] = useState(() => () => null);
  const [onNextClue, setOnNextClue] = useState(() => () => null);
  const [onPreviousClue, setOnPreviousClue] = useState(() => () => null);

  const [playJingle] = useSound(jingle);
  const sounds = { playJingle };

  const puzzleProps = {
    app,
    puzzle,
    sounds,
    boardStateStr: localStorage.getItem(puzzle.id) || null,
    pixiConfig,
    setOnUndo,
    setOnNextClue,
    setOnPreviousClue,
    setClue,
  };


  const ClueArea = ({ clue }) => {
    const widthOffset = window.innerWidth>window.innerHeight?64:0;

    return (
      <div style={{ width: resolution-widthOffset, height: '4rem', backgroundColor: '#DDEBFC' }} className="flex items-center fixed justify-between bottom-0 px-1 py-2">
        <IconButton onClick={onPreviousClue} style={{ color: '#000' }} >
          <NavigateBeforeIcon />
        </IconButton>

        <Typography variant="h6" component="div" className="text-[#000] select-none">
          {clue}
        </Typography>

        <IconButton onClick={onNextClue} style={{ color: '#000' }}>
          <NavigateNextIcon />
        </IconButton>
      </div>
    );
  };

  return (
    <Div100vh style={{overflow: 'hidden'}}>
      <div className="absolute top-2 left-2">

        <IconButton onClick={onBack} color="primary" style={{ color: '#EEE' }}>
          <KeyboardBackspaceIcon />
        </IconButton>
      </div>

      <div className="absolute top-2 right-2">

        <IconButton onClick={onUndo} color="primary" className="absolute top-2 right-2" style={{ color: '#EEE' }}>
          <UndoIcon />
        </IconButton>
      </div>
      <div className="flex flex-col items-center justify-center h-screen">
        <Canvas {...puzzleProps} />
        <ClueArea clue={clue} />
      </div>
    </Div100vh>
  );
};

const Canvas = memo(({ app, puzzle, sounds, boardStateStr, setOnUndo, setOnNextClue, setOnPreviousClue, setClue, pixiConfig, }) => {
  const canvasRef = useRef(null);

  useEffect(() => {

    const view = canvasRef.current;
    const puzzleInput = {
      app: new Application({ view, ...pixiConfig }),
      puzzle,
      sounds,
      boardStateStr,
      setClue
    };

    const {
      onUndo, onNextClue, onPreviousClue } = app(puzzleInput);
    setOnUndo(() => onUndo);
    setOnNextClue(() => onNextClue);
    setOnPreviousClue(() => onPreviousClue);

    // eslint-disable-next-line
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}, (a, b) => true);

