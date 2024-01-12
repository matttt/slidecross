import React, { useState } from "react";
import { createRoot } from 'react-dom/client';
import "./layout/index.css";
import reportWebVitals from "./game/reportWebVitals.js";

import { PuzzleView } from "./layout/PuzzleView.jsx";
import { MainMenu } from "./layout/MainMenu.jsx";



const Main = () => {
  const [puzzle, setPuzzle] = useState(null);
  


  const handlePuzzleSelect = (selectedPuzzle) => {
    setPuzzle(selectedPuzzle);
  };

  if (puzzle) {
    return (
      <PuzzleView
        puzzle={puzzle}
        onBack={() => setPuzzle(null)}
      />
    );
  } else {
    return (
      <MainMenu onPuzzleSelect={handlePuzzleSelect} />
    );
  }
};


const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(
  // <React.StrictMode>
  <Main />
  // </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
