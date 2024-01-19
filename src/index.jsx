import React, { useState } from "react";
import { createRoot } from 'react-dom/client';
import "./layout/index.css";
import reportWebVitals from "./game/reportWebVitals.js";

import { PuzzleView } from "./layout/PuzzleView.jsx";
import { MainMenu } from "./layout/MainMenu.jsx";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainMenu/>,
  },
  {
    path: "/puzzles/:puzzleType/:puzzleId",
    element: <PuzzleView/>,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
