import React, { memo } from "react";
import { Application } from "pixi.js";

export default memo(({ init, ...props }) => (
  <canvas ref={(view) => init(new Application({ view, ...props }))}></canvas>
));
