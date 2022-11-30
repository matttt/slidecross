import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Canvas from "./Canvas";
import App from "./App";

const config = {
  width: 1920,
  height: 1080,
  antialias: true,
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
