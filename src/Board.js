import { Container, TextStyle, BitmapFont } from "pixi.js";
import { parseBoardString, scrambleBoard, getHorizontalConveyors, getVerticalConveyors } from './utils.js';
import { resolution } from './index.jsx';
import { Conveyor } from "./Conveyor";
import { Cell } from "./Cell.js";
import { HORIZONTAL, VERTICAL } from "./App.js";

export class Board {
  constructor(boardStr) {
    this.correctData = parseBoardString(boardStr);
    this.data = scrambleBoard(this.correctData);
    // this.data = parseBoardString(boardStr)
    this.n = this.data.length;
    this.w = resolution / this.n;
    this.isAnimating = false;
    this.startPos = null;
    this.mousePos = null;

    this.selectedCell = null;
  }

  createCells(onDragStart, onClick) {
    const textStyle = new TextStyle({
      fontSize: this.w / 3,
      fontWeight: '400',
      fill: '#000000',
      fontFamily: 'Helvetica',
    });

    BitmapFont.from('AnswerFont', textStyle, { chars: BitmapFont.ALPHA, resolution: 4 });

    this.container = new Container();

    this.overlayContainer = new Container();
    this.whiteContainer = new Container();
    this.blackContainer = new Container();

    this.container.addChild(this.whiteContainer, this.overlayContainer,  this.blackContainer);

    // cells are stored in a 1 dimensional array. 
    // their locations are derived from their i, j member vars
    this.cells = [];

    for (let j = 0; j < this.data.length; j++) {
      for (let i = 0; i < this.data.length; i++) {
        const newCell = new Cell(this.data[j][i], this.correctData[j][i], i, j, this.w, textStyle, onDragStart, onClick);
        this.cells.push(newCell);

        if (newCell.letter) {
          this.whiteContainer.addChild(newCell.container);
        } else {
          this.blackContainer.addChild(newCell.container);
        }
      }
    }
    // this.cells = scrambleCells(this.cells, this.n)
    // this.whiteContainer.addChild(...this.cells.filter(c=>c.letter).map(c => c.container))
    // this.blackContainer.addChild(...this.cells.filter(c=>!c.letter).map(c => c.container))
    const gridData = this.getGridData();
    const horConveyorCellArrs = getHorizontalConveyors(gridData);
    const verConveyorCellArrs = getVerticalConveyors(gridData);

    this.horConveyors = horConveyorCellArrs.map(cells => {
      const conveyor = new Conveyor(cells, this, HORIZONTAL, textStyle);

      this.whiteContainer.addChild(...conveyor.createHiddenCells().map(c => c.container));
      this.overlayContainer.addChild(conveyor.pill.container)

      for (const cell of cells) {
        cell.horConveyor = conveyor;
      }
      return conveyor;
    });
    this.vertConveyors = verConveyorCellArrs.map(cells => {
      const conveyor = new Conveyor(cells, this, VERTICAL, textStyle);

      this.whiteContainer.addChild(...conveyor.createHiddenCells().map(c => c.container));
      this.overlayContainer.addChild(conveyor.pill.container)

      for (const cell of cells) {
        cell.vertConveyor = conveyor;
      }
      return conveyor;
    });

    this.checkConveyorCorrectness()
  }

  // 2d array of cells
  getGridData() {
    const simpleData = [];

    for (let i = 0; i < this.n; i++) {
      const blankArr = new Array(this.n);
      simpleData.push(blankArr);
    }

    for (const cell of this.cells) {
      simpleData[cell.j][cell.i] = cell;
    }

    return simpleData;
  }

  // 2d array of letters and nulls like the original prototype
  getSimpleData() {
    const gridData = this.getGridData();

    const simpleData = [];
    for (const row of gridData) {
      const simpleRow = row.map(c => c.letter);
      simpleData.push(simpleRow);
    }

    return simpleData;
  }

  checkConveyorCorrectness() {
    const allConveyors = [...this.horConveyors, ...this.vertConveyors];
    for (const conveyor of allConveyors) {
      conveyor.checkCorrectness();
    }

    allConveyors.sort((x, y) => {
      // false values first
      return (x.correct === y.correct) ? 0 : x.correct ? 1 : -1;
    });


    for (const conveyor of allConveyors) {
      conveyor.draw();
    }
  }

  deselectAllConveyors() {
    for (const conveyor of [...this.horConveyors, ...this.vertConveyors]) {
      conveyor.selected = false;
      conveyor.draw();
    }
  }

  deselectAllCells() {
    for (const cell of this.cells) {
      cell.selected = false;
      // cell.draw();
    }
  }

  propogateSelected() {
    this.deselectAllCells()

    const conveyors = [...this.horConveyors, ...this.vertConveyors]

    // sort conveyors so that selected ones are drawn last
    conveyors.sort((a,b) => a.selected === b.selected ? 0 : a.selected ? 1 : -1)

    for (const conveyor of conveyors) {
      conveyor.propogateSelected();
    }

  }

}
