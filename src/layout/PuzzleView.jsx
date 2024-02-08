import React, { memo, useEffect, useRef, useState } from "react";
import Typography from '@mui/material/Typography';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import UndoIcon from '@mui/icons-material/Undo';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CasinoIcon from '@mui/icons-material/Casino';
import IconButton from '@mui/material/IconButton';
// import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Application } from "pixi.js";
import app from "../game/App.js";
import Div100vh from 'react-div-100vh'
import Markdown from 'react-markdown'
import { isMobile } from 'react-device-detect';
import { puzzles } from '../game/puzzles.js';
import { useParams, useNavigate } from "react-router-dom";
import useKeypress from 'react-use-keypress';
import { parseBoardString } from "../game/utils.jsx";
import { TutorialCard } from "./TutorialCard.jsx";


const min = Math.min(window.innerWidth, window.innerHeight)
export const resolution = isMobile ? min : min * .75

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


const ShuffleWarning = ({ open, handleClose, onShuffle }) =>
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="shuffle-warning-title"
    aria-describedby="shuffle-warning-description"
  >
    <DialogTitle id="shuffle-warning-title">{"Shuffle Puzzle?"}</DialogTitle>
    <DialogContent>
      <DialogContentText id="shuffle-warning-description">
        Shuffling the puzzle will reset your progress. Are you sure you want to continue?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancel</Button>
      <Button onClick={() => {
        // Add your shuffle logic here
        handleClose();
        onShuffle();
      }} autoFocus>
        Shuffle
      </Button>
    </DialogActions>
  </Dialog>;

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

const TopBar = ({ onBack, onUndo, openShuffleWarning, openTutorialCard }) => {
  // const [showTimer, setShowTimer] = useState(false);
  const widthOffset = window.innerWidth > window.innerHeight ? 64 : 0;

  // const toggleTimer = () => {
  //   setShowTimer(!showTimer)
  // }

  return <div style={{ width: resolution - widthOffset }} className="w-full top-2 fixed flex p-3 md:p-0">
    <IconButton onClick={onBack} color="primary" style={{ color: '#EEE', left: isMobile ? '' : '-10px' }} className="left-[-3]">
      <KeyboardBackspaceIcon />
    </IconButton>
    {/* below button hidden for spacing */}
    <IconButton color="primary" style={{ color: '#EEE', }} className="invisible">
      <KeyboardBackspaceIcon />
    </IconButton>
    {/* below button hidden for spacing */}
    <IconButton color="primary" style={{ color: '#EEE', }} className="invisible">
      <KeyboardBackspaceIcon />
    </IconButton>
    {/* spacer */}
    <div className="grow">

    </div>
    {/* <IconButton className="" onClick={toggleTimer} color="primary" style={{ color: '#EEE' }}>
      <AccessTimeIcon />
    </IconButton> */}
    <div className="grow">

    </div>
    <IconButton className="right-0" onClick={openTutorialCard} color="primary" style={{ color: '#EEE', right: isMobile ? '' : '-10px' }}>
      <HelpOutlineIcon />
    </IconButton>
    <IconButton className="right-0" onClick={openShuffleWarning} color="primary" style={{ color: '#EEE', right: isMobile ? '' : '-10px' }}>
      <CasinoIcon />
    </IconButton>
    <IconButton className="right-0" onClick={onUndo} color="primary" style={{ color: '#EEE', right: isMobile ? '' : '-10px' }}>
      <UndoIcon />
    </IconButton>
  </div>
}

export const PuzzleView = () => {
  const navigate = useNavigate();

  const { puzzleId, puzzleType } = useParams();
  const [clue, setClue] = useState('');
  const [isShuffleWarningOpen, setIsShuffleWarningOpen] = useState(false);
  const [isTutorialCardOpen, setIsTutorialCardOpen] = useState(false);
  const puzzle = puzzles[puzzleType].find(p => p.id === puzzleId);

  const [onUndo, setOnUndo] = useState(() => () => null);
  const [onShuffle, setOnShuffle] = useState(() => () => null);
  const [onNextClue, setOnNextClue] = useState(() => () => null);
  const [onPreviousClue, setOnPreviousClue] = useState(() => () => null);
  const [onBoardKeyPress, setOnBoardKeyPress] = useState(() => () => null);

  useKeypress(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Tab', 'Enter'], (event) => {
    onBoardKeyPress(event.key)
  });

  const handleOpenShuffleWarning = () => {
    setIsShuffleWarningOpen(true);
  };

  const handleCloseShuffleWarning = () => {
    setIsShuffleWarningOpen(false);
  };

  const handleCloseTutorialCard = () => {
    setIsTutorialCardOpen(false)
  }

  const handleOpenTutorialCard = () => {
    setIsTutorialCardOpen(true)
  }


  const meta = JSON.parse(localStorage.getItem(puzzle.id + '_meta')) || null;

  const puzzleProps = {
    app,
    puzzle,
    boardStateStr: localStorage.getItem(puzzle.id) || null,
    boardStateMeta: meta || null,
    setOnUndo,
    setOnNextClue,
    setOnPreviousClue,
    setOnBoardKeyPress,
    setClue,
    setOnShuffle
  };

  return (
    <Div100vh style={{ overflow: 'hidden' }}>
      <ShuffleWarning open={isShuffleWarningOpen} handleClose={handleCloseShuffleWarning} onShuffle={onShuffle} />
      <TutorialCard open={isTutorialCardOpen} handleClose={handleCloseTutorialCard} />

      <div className="flex flex-col items-center justify-center h-screen">
        <TopBar onBack={() => navigate('/')} onUndo={onUndo} openShuffleWarning={handleOpenShuffleWarning} openTutorialCard={handleOpenTutorialCard} />
        <Canvas {...puzzleProps} />
        <ClueArea clue={clue} onNextClue={onNextClue} onPreviousClue={onPreviousClue} />
      </div>

    </Div100vh>
  );
};

const Canvas = memo(({ app, puzzle, boardStateStr, boardStateMeta, setOnUndo, setOnNextClue, setOnPreviousClue, setOnBoardKeyPress, setOnShuffle, setClue, pixiConfig }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let ratio = 1;

    if (puzzle) {
      const boardGrid = parseBoardString(puzzle.boardDataStr)

      const rows = boardGrid.length;
      const cols = boardGrid[0].length;
      ratio = rows / cols
    }

    const pixiConfig = {
      width: resolution,
      height: resolution * ratio - 38,
      // antialias: true,
      backgroundColor: 0xF0F4EF,
      resolution: 3,
      autoDensity: true,
    };

    const view = canvasRef.current;
    const puzzleInput = {
      app: new Application({ view, ...pixiConfig }),
      puzzle,
      boardStateStr,
      boardStateMeta,
      setClue
    };

    const { onUndo, onNextClue, onKeyPress, onPreviousClue, onShuffle } = app(puzzleInput);
    setOnUndo(() => onUndo);
    setOnShuffle(() => onShuffle);
    setOnNextClue(() => onNextClue);
    setOnPreviousClue(() => onPreviousClue);
    setOnBoardKeyPress(() => onKeyPress);

    // eslint-disable-next-line
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}, (a, b) => true);

