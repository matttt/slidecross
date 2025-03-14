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
import 'pixi.js/text-bitmap';
import { Application, Assets } from "pixi.js";
import app from "../game/App.js";
import Markdown from 'react-markdown'
// import rehypeRaw from 'rehype-raw'

import { isMobile } from 'react-device-detect';
import { puzzles } from '../game/puzzles.js';
import { useParams, useNavigate } from "react-router-dom";
import useKeypress from 'react-use-keypress';
import { TutorialCard } from "./TutorialCard.jsx";
import { MiniTutCard } from "./MiniTutCard.jsx";
import { PuzzleWinCard } from "./PuzzleWinCard.jsx";
import { parseBoardString } from "../game/utils.js";




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
      }} variant='contained' autoFocus>
        Shuffle
      </Button>
    </DialogActions>
  </Dialog>;

const ClueArea = ({ clue, onPreviousClue, onNextClue, resolution }) => {
  // const widthOffset = window.innerWidth > window.innerHeight ? 64 : 0;
  const widthOffset = 0;

  let clueCopy = clue;

  // const regex = /\[(.*?)\]/g // match anything between square brackets
  // const matches = clue.match(regex)
  // const references = []

  // if (matches) {
  //   for (let match of matches) {  
  //     const matchCopy = match.slice(1, -1) // remove square brackets

  //     const numLetterRegex = /^\d{1,4}[adAD]$/ // match a number followed by an A or D
  //     const numLetterMatch = matchCopy.match(numLetterRegex)

  //     if (!numLetterMatch) continue; 

  //     const formattedMatch = matchCopy.toUpperCase()

  //     clueCopy = clueCopy.replace(match, `<ins>${formattedMatch}</ins>`)
  //     references.push(formattedMatch)
  //   }
  // }

  let classes = 'flex items-center justify-between px-1 pb-safe-offset-2 pt-2 bg-[#D6E5F4]';

  if (isMobile) {
    classes += ' fixed bottom-0';
  }

  return (
    <div style={{ width: resolution - widthOffset }} className={classes}>
      <IconButton onClick={onPreviousClue} style={{ color: '#0D1821' }}  >
        <NavigateBeforeIcon />
      </IconButton>

      <Typography variant="h6" component="div" className="text-black text-center select-none">
        {/* <Markdown rehypePlugins={[rehypeRaw]}>{clueCopy}</Markdown> */}
        <Markdown>{clueCopy}</Markdown>
      </Typography>

      <IconButton onClick={onNextClue} style={{ color: '#0D1821' }}>
        <NavigateNextIcon />
      </IconButton>
    </div>
  );
};

const TopBar = ({ onBack, onUndo, openShuffleWarning, openTutorialCard, resolution }) => {
  // const [showTimer, setShowTimer] = useState(false);
  //const widthOffset = window.innerWidth > window.innerHeight ? 64 : 0;

  // const toggleTimer = () => {
  //   setShowTimer(!showTimer)
  // }

  return <div className="w-full mt-2 flex p-3 md:p-0">
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
    <span className="text-[#EEE] mt-1 font-bold text-2xl invisible md:visible">slidecross</span>
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
  const hasPlayed = localStorage.getItem('hasPlayed') || false;


  const { puzzleId, puzzleType } = useParams();
  const [clue, setClue] = useState('');
  const [isShuffleWarningOpen, setIsShuffleWarningOpen] = useState(false);
  const [isTutorialCardOpen, setIsTutorialCardOpen] = useState(false);
  const [isMiniTutCardOpen, setIsMiniTutCardOpen] = useState(!hasPlayed);
  const [isPuzzleWinCardOpen, setIsPuzzleWinCardOpen] = useState(false);
  // const puzzle = puzzles[puzzleType].find(p => p.id === puzzleId);

  const [puzzle, setPuzzle] = useState(puzzles[puzzleType].find(p => p.id === puzzleId));

  const min = Math.min(window.innerWidth, window.innerHeight)
  let resolution = (isMobile && min < 480) ? min : min * .75

  if (puzzle) {
    const puzzleGrid = parseBoardString(puzzle.boardDataStr);
    const puzzleSize = Math.max(puzzleGrid.length, puzzleGrid[0].length);


    const maxPuzzleSize = puzzleSize * 125;

    if (resolution > maxPuzzleSize) {
      resolution = maxPuzzleSize; 
    }      
  }


  useEffect(() => {
    setPuzzle(puzzles[puzzleType].find(p => p.id === puzzleId))
  }, [puzzleId, puzzleType])

  localStorage.setItem('hasPlayed', true); // for first play card (MiniTutCard)

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

  const handleCloseMiniTutCard = () => {
    setIsMiniTutCardOpen(false)
  }

  // const handleOpenMiniTutCard = () => {
  //   setIsMiniTutCardOpen(true)
  // }

  const handleClosePuzzleWinCard = () => {
    setIsPuzzleWinCardOpen(false)
  }

  const handleOpenPuzzleWinCard = () => {
    setIsPuzzleWinCardOpen(true)
  }

  const puzzleSolved = () => {
    handleOpenPuzzleWinCard()
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
    puzzleSolved,
    setOnShuffle,
    resolution
  };

  return (
    <div style={{ overflow: 'hidden', height: '100dvh' }}>
      <ShuffleWarning open={isShuffleWarningOpen} handleClose={handleCloseShuffleWarning} onShuffle={onShuffle} />
      <TutorialCard open={isTutorialCardOpen} handleClose={handleCloseTutorialCard} />
      <MiniTutCard open={isMiniTutCardOpen} handleClose={handleCloseMiniTutCard} openFullTutorial={handleOpenTutorialCard} />
      <PuzzleWinCard open={isPuzzleWinCardOpen} handleClose={handleClosePuzzleWinCard} puzzleId={puzzle.id} />

      <div className="flex flex-col items-center justify-center h-full">
        <TopBar onBack={() => navigate('/')} onUndo={onUndo} openShuffleWarning={handleOpenShuffleWarning} openTutorialCard={handleOpenTutorialCard} resolution={resolution} />
        <div className="grow"/>
        <Canvas {...puzzleProps} />
        {isMobile && <div class="grow"/>}
        {isMobile && <div class="grow"/>}
        <ClueArea clue={clue} onNextClue={onNextClue} onPreviousClue={onPreviousClue} resolution={resolution} />
       {!isMobile && <div class="grow"/>}
      </div>


    </div>
  );
};

const Canvas = memo(({ pixiApp, puzzle, boardStateStr, boardStateMeta, setOnUndo, setOnNextClue, setOnPreviousClue, setOnBoardKeyPress, setOnShuffle, setClue, puzzleSolved, pixiConfig, resolution }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let pixiApp, view, tickerStopTimeout, mouseDown, mouseUp;

    const init = async () => {
      // let ratio = 1;


      const pixiConfig = {
        width: resolution,
        height: resolution,
        // antialias: true,
        backgroundColor: 0xF0F4EF,
        resolution: 3,
        autoDensity: true,
      };

      view = canvasRef.current;
      await Promise.all([
        Assets.load('/fonts/Nunito-Bold.ttf'),
        Assets.load('/fonts/Nunito-ExtraBoldItalic.ttf'),
        Assets.load('/fonts/Nunito-ExtraLight.ttf'),
        Assets.load('/fonts/Nunito-Italic.ttf')
      ])

      pixiApp = new Application();

      await pixiApp.init({ canvas: view, ...pixiConfig });

      const puzzleInput = {
        pixiApp,
        puzzle,
        boardStateStr,
        boardStateMeta,
        setClue,
        puzzleSolved,
        resolution
      };

      const appMethods = await app(puzzleInput)

      const {
        onUndo,
        onNextClue,
        onKeyPress,
        onPreviousClue,
        onShuffle
      } = appMethods;

      setOnUndo(() => onUndo);
      setOnShuffle(() => onShuffle);
      setOnNextClue(() => onNextClue);
      setOnPreviousClue(() => onPreviousClue);
      setOnBoardKeyPress(() => onKeyPress);

      mouseDown = () => {
        if (tickerStopTimeout) clearTimeout(tickerStopTimeout);
        pixiApp.ticker.start();
      }
      view.addEventListener("mousedown", mouseDown, false);
      view.addEventListener("touchstart", mouseDown, false);

      mouseUp = () => {
        if (tickerStopTimeout) clearTimeout(tickerStopTimeout);
        // tickerStopTimeout = setTimeout(() => pixiApp.ticker.stop(), 500);
      }
      view.addEventListener("mouseup", mouseUp, false);
      view.addEventListener("touchend", mouseUp, false);
    }

    init();
    
    return () => {
      console.log('happening in cleanup', pixiApp, canvasRef)
      if (pixiApp) {
        pixiApp.destroy(false, { children: true, texture: true, baseTexture: true });
      }
      if (tickerStopTimeout) clearTimeout(tickerStopTimeout);
      view?.removeEventListener("mousedown", mouseDown, false);
      view?.removeEventListener("mouseup", mouseUp, false);
      view?.removeEventListener("touchstart", mouseDown, false);
      view?.removeEventListener("touchend", mouseUp, false);
    };

    // eslint-disable-next-line
  }, [puzzle.id]);
  return <canvas ref={canvasRef} style={{height: resolution}} key={puzzle.id}></canvas>;
}, (a, b) => {
  return a.puzzle.id === b.puzzle.id
});

