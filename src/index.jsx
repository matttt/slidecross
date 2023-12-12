import React, { memo, useState } from "react";
import { createRoot } from 'react-dom/client';
import "./layout/index.css";
import reportWebVitals from "./game/reportWebVitals.js";
import app from "./game/App.js";
import { Application } from "pixi.js";
import { testBoardData } from './game/testData.js'
import { puzzles } from './game/puzzles.js'
import useSound from 'use-sound';
import Button from '@mui/material/Button';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import jingle from './sounds/jingle.mp3';

const backButtonStyle = {
  position: "absolute",
  top: "10px",
  left: "10px",
  background: "none",
  border: "none",
  padding: "10px",
  // borderRadius: "5px",
  // boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
  cursor: "pointer",
  color: "#EEE",
};

function generateBoardAsciiArt(puzzle) {
  let boardAsciiArt = '';

  for (const char of puzzle.boardDataStr) {
    if (char === '#') {
      boardAsciiArt += '□';
    } else if (char === '\n') {
      boardAsciiArt += '\n';
    } else {
      boardAsciiArt += '■';
    }
  }

  return boardAsciiArt;
}



const Main = () => {
  const [puzzle, setPuzzle] = useState(null);
  const [boardState, setBoardState] = useState(null); 
  const [showConfirmBack, setShowConfirmBack] = useState(false);

  const [playJingle] = useSound(jingle);

  const sounds = {playJingle}


  const handleBackClick = () => {
    if (puzzle) {
      setShowConfirmBack(true);
    }
  };

  const confirmBack = (confirm) => {
    if (confirm) {
      setPuzzle(null); // Go back
    }
    setShowConfirmBack(false); // Close the confirmation dialog
  };


  const miniButtons = puzzles.minis.map((p, i) => (
    <Button
      key={i}
      onClick={() => setPuzzle(p)}
    >
      <pre style={{ 'lineHeight': .6 }}>{generateBoardAsciiArt(p)}</pre>
    </Button>
  ));
  const biggieButtons = puzzles.biggies.map((p, i) => (
    <Button
      key={i}
      onClick={() => setPuzzle(p)}
    >
      <pre style={{ 'lineHeight': .6 }}>{generateBoardAsciiArt(p)}</pre>
    </Button>
  ));

  if (puzzle) {
    return (
      <div className="">
        <IconButton style={backButtonStyle} onClick={() => setShowConfirmBack(true)}>
          <KeyboardBackspaceIcon />
        </IconButton>
        
        <div className="flex justify-center items-center h-screen">
          <Canvas app={app} puzzle={puzzle} sounds={sounds} setBoardState={setBoardState} {...config} />
        </div>
        <Dialog
          open={showConfirmBack}
          onClose={() => confirmBack(false)}
          aria-labelledby="alert-dialog-title"
        >
          <DialogTitle id="alert-dialog-title">
            {"Are you sure you want to go back? Your progress will be lost. (lol)"}
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => confirmBack(false)}>Cancel</Button>
            <Button onClick={() => confirmBack(true)} autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col justify-center items-center" style={{width:"100%"}}>
        <div style={{ maxWidth: '600px', padding: '15px' }}>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'white', marginTop: "50px" }}>slidecross</h1>
          <h4 className="text-xl font-bold mb-4" style={{ color: 'white' }}>a puzzle game by <a href="https://twitter.com/mateomartori" style={{ color: 'white' }}>matthew martori</a></h4>

          <h2 style={{ color: 'white', marginTop: "50px" }}>minis</h2>
          <div>{miniButtons}</div>

          <h2 style={{ color: 'white', marginTop: "50px" }}>biggies</h2>
          <div>{biggieButtons}</div>
        </div>
      </div>
    );
  }
};

const Canvas = memo(({ app, puzzle, sounds,setBoardState, ...props }) => {
  return <canvas ref={(view) => app(new Application({ view, ...props }), puzzle, sounds, setBoardState)}></canvas>
}, (a,b) => true);


export const resolution = Math.min(window.innerWidth, window.innerHeight)
const config = {
  width: resolution,
  height: resolution,
  // antialias: true,
  backgroundColor: 0xFFFFFF,
  resolution: 3,
  autoDensity: true,
};

const domNode = document.getElementById('root');
const root = createRoot(domNode);


root.render(
  <React.StrictMode>
    {/* <Canvas init={init} {...config} /> */}
    <Main />
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
