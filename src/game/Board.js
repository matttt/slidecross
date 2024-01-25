import { Container, TextStyle, BitmapFont, Graphics } from "pixi.js";
import { Howl } from 'howler';

import { boardStateToStr, getHorizontalConveyors, getVerticalConveyors } from './utils.jsx';
import { resolution } from '../layout/PuzzleView.jsx';
import { Conveyor } from "./Conveyor";
import { Cell } from "./Cell.js";
import { HORIZONTAL, VERTICAL } from "./App.js";


export class Board {
  constructor(boardState, correctBoardState, clues, id, setClue) {
    this.id = id
    this.correctData = correctBoardState;
    this.data = boardState;
    this.clues = clues;
    this.setClue = setClue;

    this.sounds = {
      // slide1: new Howl({
      //   src: ['slide1.mp3'],
      //   volume: 0.1,
      // }),
      // slide2: new Howl({
      //   src: ['slide2.mp3'],
      //   volume: 0.1,
      // }),
      // slide3: new Howl({
      //   src: ['slide3.mp3'],
      //   volume: 0.1,
      // }),
      jingle: new Howl({
        src: ['/jingle.mp3']
      }),
      // wordCorrect: new Howl({
      //   src: ['/correct.mp3']
      // })
    }

    this.undoStack = [];

    // this.data = parseBoardString(boardStr)
    this.n = this.data.length;
    this.w = (resolution - 64) / this.n;
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
      fill: '#0D1821',
      fontName: 'Arial',
    });

    BitmapFont.from('AnswerFont', textStyle, { chars: BitmapFont.ALPHA, resolution: 3 });

    // Create black rectangles on the left and right sides 
    const width = 32;
    const height = resolution;
    const baffles = new Graphics();
    baffles.beginFill(0x0D1821);
    baffles.drawRect(0, 0, width, height);
    baffles.drawRect(height - width, 0, width + 2, height);
    baffles.drawRect(0, height - (width * 2), height, (width * 2) + 2);
    baffles.endFill();

    baffles.cacheAsBitmap = true;

    this.container.addChild(baffles);
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


    if (isCorrect) {
      this.deselectAllConveyors();
      this.sounds.jingle.play()
      this.setClue('Solved!')
      this.isCorrect = true;
    } else {
      this.isCorrect = false;
    }

    localStorage.setItem(this.id, boardStateToStr(this.getSimpleData()))

  }

  onShift() {
    // const idx = Math.floor(Math.random() * 3) + 1
    // this.sounds['slide'+idx].play()
  }

  deselectAllConveyors() {
    for (const conveyor of [...this.horConveyors, ...this.vertConveyors]) {
      conveyor.selected = false;
      conveyor.draw();
    }
    this.setClue('')

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

  selectNextConveyor(reverse = false, loopToOtherDirection = true) {
    const conveyors = [...this.horConveyors, ...this.vertConveyors]

    const selectedConveyorIdx = conveyors.findIndex(c => c.selected === true)
    const selectedConveyor = conveyors[selectedConveyorIdx]

    if (selectedConveyor) {
      selectedConveyor.selected = false;
      selectedConveyor.draw();
    }


    // loop through idxs recursively until we find a conveyor that is not correct (unless all are correct)
    const recur = (idx) => {
      const delta = reverse ? -1 : 1
      const nextIdx = ((idx + delta) + conveyors.length) % conveyors.length
      const nextConveyor = conveyors[nextIdx]

      if (nextConveyor && (!nextConveyor.correct || this.isCorrect)) {
        nextConveyor.selected = true;
        nextConveyor.draw();
        this.showClue()
      } else if (nextIdx !== selectedConveyorIdx) {
        recur(nextIdx)
      }

    }

    recur(selectedConveyorIdx)

  }
  onKeyPress(key) {
    let selectedConveyor = [...this.horConveyors, ...this.vertConveyors].find(c => c.selected === true)

    if (!selectedConveyor) {
      selectedConveyor = this.horConveyors[0]
      selectedConveyor.selected = true;
      selectedConveyor.draw();
    }

    if (key === ' ' || key === 'Enter') {
      selectedConveyor.selected = false;
      const newDirection = selectedConveyor.dir === HORIZONTAL ? VERTICAL : HORIZONTAL;
      const newSelectedConveyor = selectedConveyor.cells[0][newDirection === HORIZONTAL ? 'horConveyor' : 'vertConveyor']
      newSelectedConveyor.selected=true;
      this.propogateSelected()
      newSelectedConveyor.draw()
    }


    if (selectedConveyor.dir === HORIZONTAL) {
      if (key === 'ArrowLeft') {
        selectedConveyor.shift(false)
      } else if (key === 'ArrowRight') {
        selectedConveyor.shift(true)
      } else if (key === 'ArrowUp' || key === 'ArrowDown') {
        this.selectNextConveyor(key === 'ArrowUp', false)
      }
    } else if (selectedConveyor.dir === VERTICAL) {
      if (key === 'ArrowUp') {
        selectedConveyor.shift(false)
      } else if (key === 'ArrowDown') {
        selectedConveyor.shift(true)
      } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
        this.selectNextConveyor(key === 'ArrowLeft', false)
      }
    } 
  }

  showClue() {
    // // font sizes at different break points of clue length
    // const fontSizes = {
    //   12: 24,
    //   24: 22,
    //   36: 20,
    //   48: 18
    // }

    // let fontSize = 14;

    const selected = [...this.horConveyors, ...this.vertConveyors].find(c => c.selected === true)

    if (selected) {

      // for (const size in fontSizes) {
      //   if (selected.clue.length < size) {
      //     fontSize = fontSizes[size]
      //     break;
      //   }
      // }


      this.setClue(selected.clue)
    }
  }

  onUndoableShift(conveyor, reverse = false) {

    this.undoStack.push({
      conveyor,
      reverse
    })
    // this.checkConveyorCorrectness()
  }

  undo() {
    const lastAction = this.undoStack.pop()

    if (lastAction) {
      lastAction.conveyor.shift(!lastAction.reverse, true)
    }
  }

}
