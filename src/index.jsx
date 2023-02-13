import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Canvas from "./Canvas";
import App from "./App";

export const resolution = Math.min(window.innerWidth, window.innerHeight)
const config = {
  width: resolution,
  height: resolution,
  // antialias: true,
  backgroundColor: 0xFFFFFF,
  resolution: 2,
  autoDensity : true
};

ReactDOM.render(
  <React.StrictMode>
    <Canvas init={App} {...config} />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
