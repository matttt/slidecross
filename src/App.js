import { Container, Text } from "pixi.js";
import { testBoardStr } from "./testData.js";
import { Board } from "./Board.js";
const TWEEN = require('@tweenjs/tween.js')

export const VERTICAL = 1
export const HORIZONTAL = 2

const DRAG_START_ZONE = 5

export const ANIMATION_TIME = 200
function init({ stage, screen, ticker, view }) {


  const root = new Container();
  stage.addChild(root);

  root.interactive = true;

  const board = new Board(testBoardStr)

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

    if (targetCell !== cell) return;

    if (!targetCell.letter) return;

    if (!isClick) return;

    cell.sequentialClicks++;

    const targetHorSelected = !!targetCell.horConveyor.selected;
    const targetVertSelected = !!targetCell.vertConveyor.selected;

    board.deselectAllConveyors()

    if (cell.sequentialClicks > 2 && targetVertSelected) { // lazy hack. need to properly handle click counts
      cell.sequentialClicks = 0
      return
    };

    if (targetHorSelected || targetVertSelected) {
      if (targetHorSelected) {
        targetCell.horConveyor.selected = false;
        // targetCell.horConveyor.draw();

        targetCell.vertConveyor.selected = true;
        // targetCell.vertConveyor.draw();
      } else if (targetVertSelected) {
        targetCell.vertConveyor.selected = false;
        // targetCell.vertConveyor.draw();

        targetCell.horConveyor.selected = true;
        // targetCell.horConveyor.draw();
      }
    } else {
      targetCell.horConveyor.selected = true;
      // targetCell.horConveyor.draw();
    }

    board.propogateSelected()

  }

  board.createCells(onDragStart, onClick)

  let targetCell = null;

  root.on('pointerup', onDragEnd);
  root.on('pointerupoutside', onDragEnd);

  function onDragMove(event) {
    board.mousePos = event.data.global.clone()
    if (targetCell && !board.isAnimating) {

      const curPos = event.data.global;
      const delta = [curPos.x - board.startPos.x, curPos.y - board.startPos.y]

      if (Math.abs(delta[0]) > DRAG_START_ZONE || Math.abs(delta[1]) > DRAG_START_ZONE) {
        isClick = false;
      }

      if (Math.abs(delta[0]) > Math.abs(delta[1])) {
        // x case 
        if (delta[0] >= board.w / 2) {
          targetCell.horConveyor.shift(true)
          board.startPos = event.data.global.clone()
        } else if (delta[0] < -board.w / 2) {
          targetCell.horConveyor.shift(false)
          board.startPos = event.data.global.clone()
        }

        for (const cell of targetCell.horConveyor.cells) {
          cell.offsetContainer.x = delta[0] / 3
        }

      } else if (Math.abs(delta[1])) {
        if (delta[1] >= board.w / 2) {
          targetCell.vertConveyor.shift(true)
          board.startPos = event.data.global.clone()
        } else if (delta[1] < -board.w / 2) {
          targetCell.vertConveyor.shift(false)
          board.startPos = event.data.global.clone()
        }

        for (const cell of targetCell.vertConveyor.cells) {
          cell.offsetContainer.y = delta[1] / 3
        }

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
    }
  }

  root.addChild(board.container)

  ticker.add((delta) => {
    TWEEN.update()
  });
}

export default function main(app) {
  init(app);
}
