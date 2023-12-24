import { rotateCells } from './utils.jsx';
import { HORIZONTAL, VERTICAL, ANIMATION_TIME } from "./App";
import { Cell } from "./Cell.js";
import { Pill } from './Pill.js';
const TWEEN = require('@tweenjs/tween.js');

export class Conveyor {
  constructor(cells, board, direction, clue) {
    this.cells = cells;
    this.pill = new Pill(cells, direction);
    this.board = board;
    this.dir = direction;
    this.correct = false;
    this.selected = false;
    this.clue = clue;
  }


  shift(reverse, isUndo = false) {


    const tweenTarget = {};

    if (this.dir === HORIZONTAL) {
      tweenTarget.x = (reverse ? 1 : -1) * this.board.w;
    } else if (this.dir === VERTICAL) {
      tweenTarget.y = (reverse ? 1 : -1) * this.board.w;
    }

    this.updateHiddenCellLetters();

    this.board.isAnimating = true;


    const animateCell = (cell, tweenTarget, reverse, idx) => {
      // idx is either the idx of the cell within the conveyor or null if it is the hidden cell
      new TWEEN.Tween(cell.bgOffsetContainer.position)
        .to(tweenTarget, ANIMATION_TIME)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
        .onComplete(() => {
          onComplete();
          cell.bgOffsetContainer.position.x = 0;
          cell.bgOffsetContainer.position.y = 0;
        });

      new TWEEN.Tween(cell.fgOffsetContainer.position)
        .to(tweenTarget, ANIMATION_TIME)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
        .onComplete(() => {
          cell.fgOffsetContainer.position.x = 0;
          cell.fgOffsetContainer.position.y = 0;
          onComplete();
        });

      let destinationCell

      if (idx === null) {
        destinationCell = reverse ? this.cells[0] : this.cells.at(-1);
      } else {
        const delta = reverse ? 1 : -1;
        destinationCell = this.cells[(idx + this.cells.length + delta) % this.cells.length]
      }

      const alphaValue = destinationCell.selected ? 0.5 : 0;
      const oppositeAlphaValue = destinationCell.selected ? 0 : 0.5;


      const outOfSelection = cell.selected && !destinationCell.selected
      const intoSelection = !cell.selected && destinationCell.selected
      if (!(outOfSelection || intoSelection)) {
        return
      }

      new TWEEN.Tween(cell.selectedGfx)
        .to({ alpha: alphaValue }, ANIMATION_TIME)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
        .onComplete(() => {
          cell.selectedGfx.alpha = oppositeAlphaValue;
        });
    }

    // animate hidden cell
    animateCell(reverse ? this.cell1 : this.cell2, tweenTarget, reverse, null);

    // animate main conveyor cells
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      animateCell(cell, tweenTarget, reverse, i);
    }

    /**
 * The completions counter keeps track of the number of completed animations.
 * It is used to determine when all animations have finished executing.
 * The expectedCompletions variable is set to the total number of cells plus one (for the hidden cell).
 * The onComplete function is called after each animation completes and increments the completions counter.
 */

    let completions = 0;
    const expectedCompletions = this.cells.length + 1;

    const onComplete = () => {
      completions += 1;
      if (completions === expectedCompletions) {
        afterAllComplete();
      }
    }

    const afterAllComplete = () => {

      this.board.startPos = this.board.mousePos;
      rotateCells(this.cells, reverse);
      for (const cell of this.cells) {
        cell.updateText();
      }
      this.board.isAnimating = false;

      this.board.checkConveyorCorrectness();
      this.board.propogateSelected()


      this.board.showClue()
      if (!isUndo) {
        this.board.onUndoableShift(this, reverse)
      }
    };

  }

  return() {
    // REENABLE IF YOU REENABLE THE 1/3 PX DIFF CREEP
    // IN APP.JS line 115 or so
    const tweenTarget = { x: 0, y: 0 };

    for (const cell of [this.cell1, this.cell2, ...this.cells]) {
      new TWEEN.Tween(cell.bgOffsetContainer.position)
        .to(tweenTarget, ANIMATION_TIME) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .start();

      new TWEEN.Tween(cell.fgOffsetContainer.position)
        .to(tweenTarget, ANIMATION_TIME) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .start()
        .onComplete(() => {
          this.board.isAnimating = false;
        })
    }

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

    this.cell1 = new Cell(letter1, '', i1, j1, this.board.w);
    this.cell2 = new Cell(letter2, '', i2, j2, this.board.w);

    return [this.cell1, this.cell2];
  }

  updateHiddenCellLetters() {
    const letter1 = this.cells.at(-1).letter;
    const letter2 = this.cells.at(0).letter;

    this.cell1.letter = letter1;
    this.cell2.letter = letter2;

    this.cell1.selected = this.selected;
    this.cell2.selected = this.selected;

    this.cell1.updateText();
    this.cell2.updateText();

    this.cell1.updateSelected();
    this.cell2.updateSelected();

    // this.cell1.draw();
    // this.cell2.draw();
  }

  draw() {
    for (const cell of this.cells) {
      cell.selected = this.selected;
      cell.updateSelected();
    }
  }

  propogateSelected() {
    // if (this.selected === true) {
    for (const cell of this.cells) {
      if (this.selected === true) {
        cell.selected = this.selected;
      }
    }

    this.updateHiddenCellLetters()
    // }

    this.draw();
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

    return this.correct

  }
}
