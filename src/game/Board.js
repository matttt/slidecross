import { Container, TextStyle, BitmapFont, Graphics } from "pixi.js";
import { Howl } from 'howler';

import { boardStateToStr, getHorizontalConveyors, getVerticalConveyors } from './utils.js';
import { resolution } from '../react/PuzzleView.jsx';
import { Conveyor } from "./Conveyor.js";
import { Cell } from "./Cell.js";
import { HORIZONTAL, VERTICAL } from "./App.js";

const initBoardStateMeta = {
  elapsedTime: 0,
  hasBeenCorrect: false
}

export class Board {
  constructor({boardState, correctBoardState, clues, id, setClue, puzzleSolved, boardStateMeta, ticker}) {
    this.id = id
    this.correctData = correctBoardState;
    this.data = boardState;
    this.clues = clues;
    this.setClue = setClue;
    this.puzzleSolved = puzzleSolved;
    this.ticker = ticker;
    this.boardStateMeta = boardStateMeta || {...initBoardStateMeta};

    this.timerInterval = this.startTimer()

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
        src: ['/jingle.mp3'],
        volume: 0.5
      })
    }
    
    // setup word corrects 1-5
    for (let i = 1; i < 6; i++) {
      this.sounds['wordCorrect'+i] = new Howl({
        src: ['/correct'+i+'.mp3'],
        volume: 0.3
      })
    }

    this.undoStack = [];

    // this.data = parseBoardString(boardStr)
    this.n = Math.max(this.data.length, this.data[0].length);
    this.numRows = this.data.length;
    this.numCols = this.data[0].length;
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
    baffles.drawRect(0, 0, width, height);//left
    baffles.drawRect(height - width, 0, width + 2, height);//right
    baffles.drawRect(0, height - (width * 2), height, (width * 2) + 2);//bottom
    baffles.endFill();

    baffles.cacheAsBitmap = true;

    this.container.addChild(baffles);
  }

  startTimer() {
    return setInterval(() => {
      if (!this.boardStateMeta.hasBeenCorrect) {
        this.boardStateMeta.elapsedTime++
      }
    }, 1000)
  }

  setHighlighting() {
    this.cells.forEach(cell => {
      cell.highlighted = true;
      cell.updateHighlighted();
    })
  }

  createCells(onDragStart, onClick) {
    this.selectionContainer = new Container();
    this.textContainer = new Container();
    this.overlayContainer = new Container();
    this.whiteContainer = new Container();
    this.blackContainer = new Container();

    this.offsetContainer.addChild(this.selectionContainer, this.overlayContainer, this.whiteContainer, this.blackContainer, this.textContainer);

    // cells are stored in a 1 dimensional array. 
    // their locations are derived from their i, j member vars
    this.cells = [];


    for (let j = 0; j < this.data.length; j++) {
      for (let i = 0; i < this.data[0].length; i++) {
        const newCell = new Cell(this.data[j][i], this.correctData[j][i], i, j, this.w, onDragStart, onClick, this);
        this.cells.push(newCell);

        if (newCell.letter) {
          this.whiteContainer.addChild(newCell.bgContainer);
          this.selectionContainer.addChild(newCell.selectionContainer);
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
      this.selectionContainer.addChild(...newCells.map(c => c.selectionContainer));


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

    if (this.horConveyors[0]) {

      this.horConveyors[0].selected = true;
  
      this.propogateSelected()
      this.showClue()
    }

    // setInterval(() => {

    //   const randomConveyor = Math.random() < 0.5 ? this.horConveyors[Math.floor(Math.random() * this.horConveyors.length)] : this.vertConveyors[Math.floor(Math.random() * this.vertConveyors.length)];
    //   const randomDirection = Math.random() < 0.5 ? true : false;
    //   randomConveyor.shift(randomDirection);
    // }, 250)

    this.checkConveyorCorrectness(true)
  }

  // 2d array of cells
  getGridData() {
    const simpleData = [];

    for (let i = 0; i < this.numRows; i++) {
      const blankArr = new Array(this.numCols);
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

  getMetaData() {
    return this.boardStateMeta
  }

  // this method checks if the whole puzzle is correct. also it handles playing different sounds depending on how many conveyors are correct for the first time
  checkConveyorCorrectness(muteCorrectSound = false) {
    const allConveyors = [...this.horConveyors, ...this.vertConveyors];

    let boardCorrect = true;
    let numberOfConveyorsCorrectForFirstTime = 0
    // let selectedConveyorBecameCorrect = false; // code related to this variable is for highlighting next clue after currently selected one becomes correct

    for (const conveyor of allConveyors) {
      const {isCorrect, hasBeenCorrect} = conveyor.checkCorrectness();

      if (isCorrect && !hasBeenCorrect) {
        numberOfConveyorsCorrectForFirstTime++;
      }

      // if (isCorrect && conveyor.selected) {
      //   selectedConveyorBecameCorrect = true
      // }

      if (!isCorrect) {
        boardCorrect = false;
      }
    } 

    const soundIdx = Math.min(numberOfConveyorsCorrectForFirstTime, 5)
    
    let soundPlayed = false
    if (numberOfConveyorsCorrectForFirstTime > 0 && !muteCorrectSound) {
      this.sounds[`wordCorrect${soundIdx}`].play()
      soundPlayed = true
    }


    // allConveyors.sort((x, y) => {
    //   // false values first
    //   return (x.correct === y.correct) ? 0 : x.correct ? 1 : -1;
    // });


    if (boardCorrect) {
      // this.deselectAllConveyors();
      // setTimeout(() => this.deselectAllCells(), 50)
      if (soundPlayed) {
        !muteCorrectSound && setTimeout(() => this.sounds.jingle.play(), 1500)
      } else {
        !muteCorrectSound && this.sounds.jingle.play()
      }

      // this.setClue('Solved!');
      if (!this.boardStateMeta.hasBeenCorrect) {
        !muteCorrectSound && setTimeout(()=>{this.puzzleSolved()}, 1000)
      }
      this.isCorrect = true;
      this.boardStateMeta.hasBeenCorrect = true;
    } else {
      this.isCorrect = false;
    }

    // if (selectedConveyorBecameCorrect && !boardCorrect) {
    //   this.selectNextConveyor(false, false);
    // }


    // console.log(JSON.stringify(this.getMetaData()))
    this.writeBoardStateToLocalStorage()

  }

  writeBoardStateToLocalStorage() {
    localStorage.setItem(this.id, boardStateToStr(this.getSimpleData()))
    localStorage.setItem(this.id + '_meta', JSON.stringify(this.getMetaData()))
  }


  resetConveyorCorrectnessMemory () {
    const allConveyors = [...this.horConveyors, ...this.vertConveyors];

    for (const c of allConveyors) {
      c.hasBeenCorrect = false;
    }
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
      cell.draw();
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

      clearTimeout(this.timeout)

      this.ticker.start()
      this.timeout = setTimeout(() => this.ticker.stop(), 500)


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
      clearTimeout(this.timeout)

      this.ticker.start()
      this.timeout = setTimeout(() => this.ticker.stop(), 500)

      lastAction.conveyor.shift(!lastAction.reverse, true)
    }

  }

  resetPuzzleToFactorySettings() {
    this.resetConveyorCorrectnessMemory()
    this.boardStateMeta = {...initBoardStateMeta};
    this.undoStack = []
    this.writeBoardStateToLocalStorage()
  }

  shuffle() {
    this.ticker.start()
    const conveyors = [...this.horConveyors, ...this.vertConveyors]
    const numShuffles = conveyors.length*3 // length of conveyors * 2 meaning two shuffles per word

    let prevShuffle = null
    let i = numShuffles
    const oneShuffle = () => { 
      const pickConveyorAndDirection = () => {
        const idx = Math.floor(Math.random() * conveyors.length);
        const conveyor = conveyors[idx]
        const direction = Math.random() < 0.5 ? true : false;

        return {conveyor, direction}
      }

      let conveyorAndDirection = pickConveyorAndDirection()
      while (conveyorAndDirection.conveyor === prevShuffle && !conveyorAndDirection.direction === prevShuffle.direction) {
        conveyorAndDirection = pickConveyorAndDirection()
      }
      
      const {conveyor, direction} = conveyorAndDirection

      conveyor.shift(direction, true, 150)
      i--
      prevShuffle = conveyorAndDirection

      if (i > 0) {
        setTimeout(oneShuffle, 155)
      } else {
        // on complete
        this.resetPuzzleToFactorySettings()

        setTimeout(() => this.ticker.stop(), 1000);
      }
    }

    oneShuffle();
  }

}
