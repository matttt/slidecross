import { Container, Graphics, Text, TextStyle, BitmapFont, BitmapText } from "pixi.js";
import { parseBoardString, rotateCells, scrambleBoard, getHorizontalConveyors, getVerticalConveyors } from './utils.js'
import { resolution } from './index.jsx'
import { testBoardStr } from "./testData.js";
const TWEEN = require('@tweenjs/tween.js')

const VERTICAL = 1
const HORIZONTAL = 2

const DRAG_START_ZONE = 5

const ANIMATION_TIME = 200

let startPos = null;
let mousePos = null
let isAnimating = false

class Conveyor {
  constructor(cells, board, direction, textStyle) {
    this.cells = cells
    this.board = board
    this.dir = direction
    this.isCorrect = false

    this.textStyle = textStyle
  }

  shift(reverse) {
    const tweenTarget = {}

    if (this.dir === HORIZONTAL) {
      tweenTarget.x = (reverse ? 1 : -1) * this.board.w
    } else if (this.dir === VERTICAL) {
      tweenTarget.y = (reverse ? 1 : -1) * this.board.w
    }

    const hiddenCellsToAnimate = []

    if (reverse) {
      hiddenCellsToAnimate.push(this.cell1)
    } else {
      hiddenCellsToAnimate.push(this.cell2)
    }

    this.updateHiddenCellLetters()

    isAnimating = true

    for (const cell of [...hiddenCellsToAnimate, ...this.cells]) {
      new TWEEN.Tween(cell.offsetContainer.position)
        .to(tweenTarget, ANIMATION_TIME) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .start()
        .onComplete(() => {
          onComplete()
          cell.offsetContainer.position.x = 0
          cell.offsetContainer.position.y = 0
        })
    }

    // hacky way to get single oncomplete
    let happened = false

    const onComplete = () => {
      if (happened) return;

      startPos = mousePos
      rotateCells(this.cells, reverse)
      for (const cell of this.cells) {
        cell.updateText()
      }
      isAnimating = false

      this.board.checkConveyorCorrectness()



      // for (const conveyor of [...this.board.horConveyors, ...this.board.vertConveyors]) {
      //   conveyor.updateHiddenCellLetters()
      // }

      happened = true
    }

  }

  return() {
    const tweenTarget = { x: 0, y: 0 }

    for (const cell of [this.cell1, this.cell2, ...this.cells]) {
      new TWEEN.Tween(cell.offsetContainer.position)
        .to(tweenTarget, ANIMATION_TIME) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .start()
    }

    setTimeout(() => {
      isAnimating = false
    }, ANIMATION_TIME)
  }

  createHiddenCells() {
    let i1, j1, i2, j2;

    const letter1 = this.cells.at(-1).letter
    const letter2 = this.cells.at(0).letter

    if (this.dir === HORIZONTAL) {
      i1 = this.cells[0].i - 1
      j1 = this.cells[0].j

      i2 = this.cells.at(-1).i + 1
      j2 = this.cells.at(-1).j
    } else if (this.dir === VERTICAL) {
      i1 = this.cells[0].i
      j1 = this.cells[0].j - 1

      i2 = this.cells.at(-1).i
      j2 = this.cells.at(-1).j + 1
    }

    this.cell1 = new Cell(letter1, '', i1, j1, this.board.w, this.textStyle)
    this.cell2 = new Cell(letter2, '', i2, j2, this.board.w, this.textStyle)

    return [this.cell1, this.cell2]
  }

  updateHiddenCellLetters() {
    const letter1 = this.cells.at(-1).letter
    const letter2 = this.cells.at(0).letter

    this.cell1.letter = letter1
    this.cell2.letter = letter2

    this.cell1.updateText()
    this.cell2.updateText()
  }

  draw() {
    for (const cell of this.cells) {
      cell.isCorrect = this.isCorrect
      cell.draw()
    }
  }

  checkCorrectness() {
    for (const cell of this.cells) {
      if (cell.letter !== cell.correctLetter) {
        this.isCorrect = false
        return 
      }
    }

    this.isCorrect = true
  }
}

class Cell {
  constructor(letter, correctLetter, i, j, width, textStyle, onDragStart) {
    this.letter = letter
    this.correctLetter = correctLetter
    this.i = i
    this.j = j
    this.w = width
    this.container = new Container();
    this.offsetContainer = new Container();
    this.gfx = new Graphics();
    this.text = new BitmapText(this.letter ? this.letter : '', { fontName: 'AnswerFont' });
    this.text.anchor.set(.5)
    this.text.x = this.w / 2
    this.text.y = this.w / 2
    this.isCorrect = false

    // set in cell instantiation in board
    this.horConveyor = null
    this.vertConveyor = null

    if (onDragStart && this.letter) {
      this.container.interactive = true;
      this.container.on('pointerdown', e => {
        onDragStart(e, this)
      });
    }

    this.offsetContainer.addChild(this.gfx, this.text);
    this.container.addChild(this.offsetContainer)

    this.container.x = this.w * this.i
    this.container.y = this.w * this.j

    this.draw()
  }

  updateText() {
    this.text.text = this.letter
    this.text.dirty = true
    // this.text.updateText()
    // this.text._render()
  }

  draw() {
    this.gfx.lineStyle(2, 0x000000, 1);
    if (this.letter) {
      if (this.isCorrect) {
        this.gfx.beginFill(0x4DA167)
      } else {
        this.gfx.beginFill(0xFFFFFF)
      }
    } else {
      this.gfx.beginFill(0x000000)
    }
    // this.gfx.beginFill(this.letter ? 0xFFFFFF : 0x000000);
    this.gfx.drawRect(0, 0, this.w, this.w);
    this.gfx.endFill();
  }
}
class Board {
  constructor(boardStr, onDragStart) {
    const correctData = parseBoardString(boardStr)
    const data = scrambleBoard(correctData)
    // const data = parseBoardString(boardStr)
    this.n = data.length
    this.w = resolution / this.n

    const textStyle = new TextStyle({
      fontSize: this.w / 3,
      fontWeight: '400',
      fill: '#000000',
      fontFamily: 'Arial',
    });

    BitmapFont.from('AnswerFont', textStyle, { chars: BitmapFont.ALPHA, resolution: 2 })

    this.container = new Container();

    this.whiteContainer = new Container()
    this.blackContainer = new Container()

    this.container.addChild(this.whiteContainer, this.blackContainer)

    // cells are stored in a 1 dimensional array. 
    // their locations are derived from their i, j member vars
    this.cells = []

    for (let j = 0; j < data.length; j++) {
      for (let i = 0; i < data.length; i++) {
        const newCell = new Cell(data[j][i], correctData[j][i], i, j, this.w, textStyle, onDragStart)
        this.cells.push(newCell)

        if (newCell.letter) {
          this.whiteContainer.addChild(newCell.container)
        } else {
          this.blackContainer.addChild(newCell.container)
        }
      }
    }
    // this.cells = scrambleCells(this.cells, this.n)

    // this.whiteContainer.addChild(...this.cells.filter(c=>c.letter).map(c => c.container))
    // this.blackContainer.addChild(...this.cells.filter(c=>!c.letter).map(c => c.container))

    const gridData = this.getGridData()
    const horConveyorCellArrs = getHorizontalConveyors(gridData)
    const verConveyorCellArrs = getVerticalConveyors(gridData)

    this.horConveyors = horConveyorCellArrs.map(cells => {
      const conveyor = new Conveyor(cells, this, HORIZONTAL, textStyle)

      this.whiteContainer.addChild(...conveyor.createHiddenCells().map(c => c.container))

      for (const cell of cells) {
        cell.horConveyor = conveyor
      }
      return conveyor
    })
    this.vertConveyors = verConveyorCellArrs.map(cells => {
      const conveyor = new Conveyor(cells, this, VERTICAL, textStyle)

      this.whiteContainer.addChild(...conveyor.createHiddenCells().map(c => c.container))

      for (const cell of cells) {
        cell.vertConveyor = conveyor
      }
      return conveyor
    })
  }

  // 2d array of cells
  getGridData() {
    const simpleData = []

    for (let i = 0; i < this.n; i++) {
      const blankArr = new Array(this.n)
      simpleData.push(blankArr)
    }

    for (const cell of this.cells) {
      simpleData[cell.j][cell.i] = cell
    }

    return simpleData
  }

  // 2d array of letters and nulls like the original prototype
  getSimpleData() {
    const gridData = this.getGridData()

    const simpleData = []
    for (const row of gridData) {
      const simpleRow = row.map(c => c.letter)
      simpleData.push(simpleRow)
    }

    return simpleData
  }

  checkConveyorCorrectness() {
    const allConveyors = [...this.horConveyors, ...this.vertConveyors]
    for (const conveyor of allConveyors) {
      conveyor.checkCorrectness()
    }

    allConveyors.sort((x, y) => {
      // false values first
      return (x.isCorrect === y.isCorrect) ? 0 : x.isCorrect ? 1 : -1;
    })

    console.log(allConveyors.map(c => c.isCorrect))

    for (const conveyor of allConveyors) {
      conveyor.draw()
    }
  }

}

function init({ stage, screen, ticker }) {

  const root = new Container();
  stage.addChild(root);

  root.interactive = true;


  function onDragStart(e, cell) {
    startPos = e.data.global.clone();
    targetCell = cell;
    root.on('pointermove', onDragMove);
  }

  let targetCell = null;

  root.on('pointerup', onDragEnd);
  root.on('pointerupoutside', onDragEnd);

  function onDragMove(event) {
    mousePos = event.data.global.clone()
    if (targetCell && !isAnimating) {

      const curPos = event.data.global;
      const delta = [curPos.x - startPos.x, curPos.y - startPos.y]
      if (Math.abs(delta[0]) > Math.abs(delta[1])) {
        // x case 
        if (delta[0] >= board.w / 2) {
          targetCell.horConveyor.shift(true)
          startPos = event.data.global.clone()
        } else if (delta[0] < -board.w / 2) {
          targetCell.horConveyor.shift(false)
          startPos = event.data.global.clone()
        }

        for (const cell of targetCell.horConveyor.cells) {
          cell.offsetContainer.x = delta[0] / 3
        }

      } else if (Math.abs(delta[1])) {
        if (delta[1] >= board.w / 2) {
          targetCell.vertConveyor.shift(true)
          startPos = event.data.global.clone()
        } else if (delta[1] < -board.w / 2) {
          targetCell.vertConveyor.shift(false)
          startPos = event.data.global.clone()
        }

        for (const cell of targetCell.vertConveyor.cells) {
          cell.offsetContainer.y = delta[1] / 3
        }

      }
    }

  }

  function onDragEnd() {
    if (targetCell) {
      if (!isAnimating) {
        isAnimating = true
        targetCell.horConveyor.return()
        targetCell.vertConveyor.return()
      }
      root.off('pointermove', onDragMove);
      targetCell = null;
    }
  }

  const board = new Board(testBoardStr, onDragStart)
  root.addChild(board.container)

  ticker.add((delta) => {
    TWEEN.update()
  });
}

export default function main(app) {
  init(app);
}
