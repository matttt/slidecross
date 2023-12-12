import { Container, TextStyle, BitmapFont, Graphics, Text } from "pixi.js";
import { parseBoardString, scrambleBoard, boardStateToStr, getHorizontalConveyors, getVerticalConveyors } from './utils.js';
import { resolution } from '../index.jsx';
import { Conveyor } from "./Conveyor";
import { Cell } from "./Cell.js";
import { HORIZONTAL, VERTICAL } from "./App.js";


export class Board {
  constructor(boardState, correctBoardState, clues, sounds, setBoardState) {
    
    this.correctData = correctBoardState;
    this.data = boardState;
    this.clues = clues;
    this.sounds = sounds;
    this.setBoardState = setBoardState;

    // this.data = parseBoardString(boardStr)
    this.n = this.data.length;
    this.w = (resolution * 0.9) / this.n;
    this.isAnimating = false;
    this.startPos = null;
    this.mousePos = null;

    this.selectedCell = null;
    this.container = new Container();
    this.offsetContainer = new Container();
    this.container.addChild(this.offsetContainer)

    this.offsetContainer.position.x = resolution / 2 - this.w * this.n / 2;

    const textStyle = new TextStyle({
      fontSize: this.w / 3,
      fontWeight: '400',
      fill: '#000000',
      fontFamily: 'Helvetica',
    });
    // Create black rectangles on the left and right sides
    BitmapFont.from('AnswerFont', textStyle, { chars: BitmapFont.ALPHA, resolution: 4 });

    const width = resolution * 0.05;
    const height = resolution;
    const baffles = new Graphics();
    baffles.beginFill(0x000000);
    baffles.drawRect(0, 0, width, height);
    baffles.drawRect(height - width, 0, width, height);
    baffles.drawRect(0, height * .9, height, resolution * .1);
    baffles.endFill();

    baffles.cacheAsBitmap = true;

    const arrowShape = [10, 5, 0, 10, 0, 0].map(n => (n - 5) * 2);

    const leftButton = new Graphics();
    leftButton.lineStyle(2, 0xFFFFFF);
    // draw a left facing arrow 10 px tall
    leftButton.drawPolygon(arrowShape);

    leftButton.position.y = resolution - resolution * 0.05;
    leftButton.position.x = resolution * .075;
    // rotate the arrow 180 degrees
    leftButton.rotation = Math.PI;
    leftButton.cacheAsBitmap = true;
    leftButton.interactive = true;
    leftButton.buttonMode = true
    

    const rightButton = new Graphics();
    rightButton.lineStyle(2, 0xFFFFFF);
    // draw a left facing arrow 10 px tall
    rightButton.drawPolygon(arrowShape);

    rightButton.position.y = resolution - resolution * 0.05;
    rightButton.position.x = resolution * .925;
    rightButton.cacheAsBitmap = true;
    rightButton.interactive = true;
    rightButton.buttonMode = true


    rightButton.on('pointerdown', () => {
      this.selectNextConveyor(false);
    });

    leftButton.on('pointerdown', () => {
      this.selectNextConveyor(true);
    });

    this.text = new Text('', {
      fontFamily: 'Helvetica',
      fill: 0xffffff,
      align: 'center'
    });
    this.text.position.x = resolution / 2;
    this.text.position.y = resolution * 0.95;
    this.text.anchor.set(0.5, 0.5);

    this.container.addChild(baffles, this.text, leftButton, rightButton);

    // const rightRect = new Graphics();
    // rightRect.beginFill(0x000000);
    // rightRect.drawRect(resolution - resolution * 0.05, 0, resolution * 0.05, resolution);
    // rightRect.endFill();
    // this.container.addChild(rightRect);
  }

  createCells(onDragStart, onClick) {


    this.textContainer = new Container();
    this.overlayContainer = new Container();
    this.whiteContainer = new Container();
    this.blackContainer = new Container();

    this.offsetContainer.addChild(this.overlayContainer, this.whiteContainer, this.blackContainer, this.textContainer);

    // cells are stored in a 1 dimensional array. 
    // their locations are derived from their i, j member vars
    this.cells = [];

    for (let j = 0; j < this.data.length; j++) {
      for (let i = 0; i < this.data.length; i++) {
        const newCell = new Cell(this.data[j][i], this.correctData[j][i], i, j, this.w, onDragStart, onClick, this);
        this.cells.push(newCell);

        if (newCell.letter) {
          this.whiteContainer.addChild(newCell.bgContainer);
          this.textContainer.addChild(newCell.fgContainer);
        } else {
          this.blackContainer.addChild(newCell.bgContainer);
        }
      }
    }

    const gridData = this.getGridData();
    const horConveyorCellArrs = getHorizontalConveyors(gridData);
    const verConveyorCellArrs = getVerticalConveyors(gridData);

    const createConveyor = (cells, direction, clue) => {
      const conveyor = new Conveyor(cells, this, direction, clue);
      const newCells = conveyor.createHiddenCells()

      this.whiteContainer.addChild(...newCells.map(c => c.bgContainer));
      this.textContainer.addChild(...newCells.map(c => c.fgContainer));

      this.overlayContainer.addChild(conveyor.pill.container);

      for (const cell of cells) {
        if (direction === HORIZONTAL) {
          cell.horConveyor = conveyor;
        } else if (direction === VERTICAL) {
          cell.vertConveyor = conveyor;
        }
      }
      return conveyor;
    };

    this.horConveyors = horConveyorCellArrs.map((cells, i) => createConveyor(cells, HORIZONTAL, this.clues.across[i]));
    this.vertConveyors = verConveyorCellArrs.map((cells, i) => createConveyor(cells, VERTICAL, this.clues.down[i]));


    // setInterval(() => {

    //   const randomConveyor = Math.random() < 0.5 ? this.horConveyors[Math.floor(Math.random() * this.horConveyors.length)] : this.vertConveyors[Math.floor(Math.random() * this.vertConveyors.length)];
    //   const randomDirection = Math.random() < 0.5 ? true : false;
    //   randomConveyor.shift(randomDirection);
    // }, 250)

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

    let isCorrect = true;
    
    for (const conveyor of allConveyors) {
      const result = conveyor.checkCorrectness();

      if (!result) {
        isCorrect = false;
      }
    }

    // allConveyors.sort((x, y) => {
    //   // false values first
    //   return (x.correct === y.correct) ? 0 : x.correct ? 1 : -1;
    // });


    for (const conveyor of allConveyors) {
      conveyor.draw();
    }

    if (isCorrect) {
      this.deselectAllConveyors();
      this.text.text = 'Solved!';
      this.text.dirty = true;
      this.sounds.playJingle()
    }

    this.setBoardState(boardStateToStr(this.getSimpleData()))
    console.log(boardStateToStr(this.getSimpleData()))

  }

  deselectAllConveyors() {
    for (const conveyor of [...this.horConveyors, ...this.vertConveyors]) {
      conveyor.selected = false;
      conveyor.draw();
    }
    this.text.text = ''

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
    conveyors.sort((a, b) => a.selected === b.selected ? 0 : a.selected ? 1 : -1)

    for (const conveyor of conveyors) {
      conveyor.propogateSelected();
    }

  }

  selectNextConveyor(reverse = false) {
    const conveyors = [...this.horConveyors, ...this.vertConveyors]

    const selectedConveyorIdx = conveyors.findIndex(c => c.selected === true)
    const selectedConveyor = conveyors[selectedConveyorIdx]

    if (selectedConveyor) {
      selectedConveyor.selected = false;
      selectedConveyor.draw();
    }

    const delta = reverse ? -1 : 1
    const nextConveyor = conveyors[((selectedConveyorIdx + delta) + conveyors.length) % conveyors.length]

    if (nextConveyor) {
      nextConveyor.selected = true;
      nextConveyor.draw();
    }

    this.showClue()
  }

  showClue() {
    // font sizes at different break points of clue length
    const fontSizes = {
      12: 24,
      24: 22,
      36: 20,
      48: 18
    }

    let fontSize = 14;

    const selected = [...this.horConveyors, ...this.vertConveyors].find(c => c.selected === true)

    if (selected) {

      for (const size in fontSizes) {
        if (selected.clue.length < size) {
          fontSize = fontSizes[size]
          break;
        }
      }
      
      this.text.style.fontSize = fontSize;

      this.text.text = selected.clue
      this.text.dirty = true;
    }
  }

}
