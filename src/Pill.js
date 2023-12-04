import { HORIZONTAL, VERTICAL, ANIMATION_TIME } from "./App";
import { Container, Graphics } from 'pixi.js';
const TWEEN = require('@tweenjs/tween.js');

export class Pill {
  constructor(cells, dir) {
    this.cells = cells;
    this.dir = dir;
    this.gfx = new Graphics();

    this.gfx.alpha = 0;

    this.container = new Container();
    this.container.addChild(this.gfx);

    this.draw();

    this.correct = false;

  }

  animate() {
    const tweenTarget = { alpha: this.correct ? 0.25 : 0 };

    new TWEEN.Tween(this.gfx)
      .to(tweenTarget, ANIMATION_TIME)
      .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      .start();
    // .onComplete(() => {
    //   onComplete();
    //   cell.offsetContainer.position.x = 0;
    //   cell.offsetContainer.position.y = 0;
    // });
  }


  draw() {

    const cell1 = this.cells[0];
    const cell2 = this.cells.at(-1); // last element

    const w = cell1.w;

    const x1 = cell1.i * w + w / 2;
    const y1 = cell1.j * w + w / 2;

    const x2 = cell2.i * w + w / 2;
    const y2 = cell2.j * w + w / 2;

    this.gfx.lineStyle(2, 0, 1);
    this.gfx.beginFill(5087591);

    const barWidth = cell1.w / 3 * 2;
    const endCapLength = cell1.w / 3;

    if (this.dir === VERTICAL) {

      this.gfx.drawRoundedRect(x1 - barWidth / 2, y1 - endCapLength, barWidth, y2 - y1 + endCapLength * 2);

    } else if (this.dir === HORIZONTAL) {

      this.gfx.drawRoundedRect(x1 - endCapLength, y1 - barWidth / 2, x2 - x1 + endCapLength * 2, barWidth);

    }


    this.gfx.endFill();
  }


}
