import { rotateCells } from './utils.js';
import { HORIZONTAL, VERTICAL, ANIMATION_TIME } from "./App";
import { Cell } from "./Cell.js";
import { Pill } from './Pill.js';
const TWEEN = require('@tweenjs/tween.js');

export class Conveyor {
  constructor(cells, board, direction, textStyle) {
    this.cells = cells;
    this.pill = new Pill(cells, direction);
    this.board = board;
    this.dir = direction;
    this.isCorrect = false;
    this.selected = false;

    this.textStyle = textStyle;
  }

  shift(reverse) {
    const tweenTarget = {};

    if (this.dir === HORIZONTAL) {
      tweenTarget.x = (reverse ? 1 : -1) * this.board.w;
    } else if (this.dir === VERTICAL) {
      tweenTarget.y = (reverse ? 1 : -1) * this.board.w;
    }

    const hiddenCellsToAnimate = [];

    if (reverse) {
      hiddenCellsToAnimate.push(this.cell1);
    } else {
      hiddenCellsToAnimate.push(this.cell2);
    }

    this.updateHiddenCellLetters();

    this.board.isAnimating = true;

    for (const cell of [...hiddenCellsToAnimate, ...this.cells]) {
      new TWEEN.Tween(cell.offsetContainer.position)
        .to(tweenTarget, ANIMATION_TIME)
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .start()
        .onComplete(() => {
          onComplete();
          cell.offsetContainer.position.x = 0;
          cell.offsetContainer.position.y = 0;
        });
    }

    // hacky way to get single oncomplete
    let happened = false;

    const onComplete = () => {
      if (happened)
        return;

      this.board.startPos = this.board.mousePos;
      rotateCells(this.cells, reverse);
      for (const cell of this.cells) {
        cell.updateText();
      }
      this.board.isAnimating = false;

      this.board.checkConveyorCorrectness();

      // for (const conveyor of [...this.board.horConveyors, ...this.board.vertConveyors]) {
      //   conveyor.updateHiddenCellLetters()
      // }
      happened = true;
    };

  }

  return() {
    const tweenTarget = { x: 0, y: 0 };

    for (const cell of [this.cell1, this.cell2, ...this.cells]) {
      new TWEEN.Tween(cell.offsetContainer.position)
        .to(tweenTarget, ANIMATION_TIME) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .start();
    }

    setTimeout(() => {
      this.board.isAnimating = false;
    }, ANIMATION_TIME);
  }

  createHiddenCells() {
    let i1, j1, i2, j2;

    const letter1 = this.cells.at(-1).letter;
    const letter2 = this.cells.at(0).letter;

    if (this.dir === HORIZONTAL) {
      i1 = this.cells[0].i - 1;
      j1 = this.cells[0].j;

      i2 = this.cells.at(-1).i + 1;
      j2 = this.cells.at(-1).j;
    } else if (this.dir === VERTICAL) {
      i1 = this.cells[0].i;
      j1 = this.cells[0].j - 1;

      i2 = this.cells.at(-1).i;
      j2 = this.cells.at(-1).j + 1;
    }

    this.cell1 = new Cell(letter1, '', i1, j1, this.board.w, this.textStyle);
    this.cell2 = new Cell(letter2, '', i2, j2, this.board.w, this.textStyle);

    return [this.cell1, this.cell2];
  }

  updateHiddenCellLetters() {
    const letter1 = this.cells.at(-1).letter;
    const letter2 = this.cells.at(0).letter;

    this.cell1.letter = letter1;
    this.cell2.letter = letter2;

    this.cell1.updateText();
    this.cell2.updateText();
  }

  draw() {

    // dont redraw if nothing has changed
    if (this.previousState) {
      if (this.previousState.correct === this.correct && this.previousState.selected === this.selected) {
        const previousLetters = this.previousState.letters.join('');
        const currLetters = this.cells.map(c => c.letter).join('')
        if (previousLetters === currLetters) {
          return;
        }
      }
    }


    for (const cell of this.cells) {
      cell.correct = this.correct;
      cell.selected = this.selected;
      cell.draw();
    }

    this.previousState = {
      correct: this.correct,
      selected: this.selected,
      letters: this.cells.map(c => c.letter)
    };
  }

  checkCorrectness() {
    this.correct = true;

    for (const cell of this.cells) {
      if (cell.letter !== cell.correctLetter) {
        this.correct = false;
        // return;
      }
    }

    this.pill.correct = this.correct;

    // this.pill.draw();
    this.pill.animate();

  }
}
