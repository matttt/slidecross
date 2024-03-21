import { Container } from "pixi.js";
import { Board } from "./Board.js";
import { parseBoardString, scrambleBoard } from "./utils.js";
import * as TWEEN from '@tweenjs/tween.js'

export const VERTICAL = 1
export const HORIZONTAL = 2

const DRAG_START_ZONE = 5

export const ANIMATION_TIME = 200
function app({ app, puzzle, boardStateStr, boardStateMeta, setClue, puzzleSolved }) {
  const { stage, ticker, renderer } = app;
  stage.eventMode = 'passive';

  const root = new Container();
  stage.addChild(root);

  ticker.stop()


  // root.eventMode = 'static';
  root.interactive = true;

  const correctBoardState = parseBoardString(puzzle.boardDataStr);

  let startingBoardState = scrambleBoard(correctBoardState);
  if (boardStateStr) {
    startingBoardState = parseBoardString(boardStateStr);
  }

  const boardInput = { 
    boardState: startingBoardState, 
    correctBoardState: correctBoardState, 
    boardStateMeta: boardStateMeta,
    clues: puzzle.clues, 
    id: puzzle.id, 
    setClue,
    puzzleSolved 
  };

  const board = new Board(boardInput)

  let isClick = false;

  function onDragStart(e, cell) {
    board.startPos = e.data.global.clone();
    targetCell = cell;
    root.on('pointermove', onDragMove);

    // lets start by assuming a mouse down is part of a click
    // several things can disprove this, like dragging movement or a conveyor transition
    isClick = true;
  }

  function onClick(e, cell) {
    if (targetCell !== cell || !targetCell.letter || !isClick) return;

    cell.sequentialClicks++;

    const targetHorSelected = !!targetCell.horConveyor.selected;
    const targetVertSelected = !!targetCell.vertConveyor.selected;

    const isVertSelected = !!board.vertConveyors.find(vc => vc.selected)

    board.deselectAllConveyors();

    if (!targetVertSelected && isVertSelected) {
      targetCell.vertConveyor.selected = true;

      board.propogateSelected();
      board.showClue()

      return
    }

    if (cell.sequentialClicks > 2 && targetVertSelected) {
      cell.sequentialClicks = 0;
      return;
    }

    if (targetHorSelected || targetVertSelected) {
      targetCell.horConveyor.selected = !targetHorSelected;
      targetCell.vertConveyor.selected = !targetVertSelected;
    } else {
      targetCell.horConveyor.selected = true;
    }

    board.propogateSelected();
    board.showClue()


  }

  board.createCells(onDragStart, onClick)

  let targetCell = null;
  let selectedDirection = null

  root.on('pointerup', onDragEnd);
  root.on('pointerupoutside', onDragEnd);

  function getNextTargetCell(conveyor, reverse) {
    const delta = reverse ? 1 : -1;
    return conveyor.cells[(conveyor.cells.indexOf(targetCell) + delta + conveyor.cells.length) % conveyor.cells.length]
  }

  function shiftConveyor(conveyor, delta, isHorizontal, event) {
    if (delta >= board.w / 2) {
      conveyor.shift(true);
      board.startPos = event.data.global.clone();
      targetCell = getNextTargetCell(conveyor, true)
    } else if (delta < -board.w / 2) {
      conveyor.shift(false);
      board.startPos = event.data.global.clone();
      targetCell = getNextTargetCell(conveyor, false)
    }

    const hiddenCellsToAnimate = []

    if (delta > 0) {
      hiddenCellsToAnimate.push(conveyor.cell1)
    } else {
      hiddenCellsToAnimate.push(conveyor.cell2)
    }

    for (const cell of [...conveyor.cells, ...hiddenCellsToAnimate]) {
      if (isHorizontal) {
        cell.setOffset(delta/3, 0)
      } else {
        cell.setOffset(0, delta/3)
      }
    }
  }

  function onDragMove(event) {
    board.mousePos = event.data.global.clone();
    if (targetCell && !board.isAnimating) {
      const curPos = event.data.global;
      const delta = [curPos.x - board.startPos.x, curPos.y - board.startPos.y];

      if ((Math.abs(delta[0]) > DRAG_START_ZONE || Math.abs(delta[1]) > DRAG_START_ZONE) && selectedDirection === null) {
        isClick = false;
        selectedDirection = Math.abs(delta[0]) > Math.abs(delta[1]) ? HORIZONTAL : VERTICAL;
      }

      // if (Math.abs(delta[0]) > Math.abs(delta[1])) {
      if (selectedDirection === HORIZONTAL) {
        // x case 
        shiftConveyor(targetCell.horConveyor, delta[0], true, event);
      } else if (selectedDirection === VERTICAL) {
        shiftConveyor(targetCell.vertConveyor, delta[1], false, event);
      }
    }
  }

  function onDragEnd() {
    if (targetCell) {
      if (!board.isAnimating) {
        board.isAnimating = true
        targetCell.horConveyor.return()
        targetCell.vertConveyor.return()

      }
      root.off('pointermove', onDragMove);
      targetCell = null;
      selectedDirection = null
    }
  }

  root.addChild(board.container)

  ticker.add((delta) => {
    TWEEN.update()
  });

  renderer.render(stage)

  return {
    onUndo() {
      board.undo()
    },
    onNextClue() {
      board.selectNextConveyor(false)
    },
    onPreviousClue() {
      board.selectNextConveyor(true)
    },
    onShuffle() {
      console.log('bkajf')
      board.shuffle()
    },
    onKeyPress(key) {
      board.onKeyPress(key)
    },
    renderer,
    stage,
    ticker
  }
}

export default app
