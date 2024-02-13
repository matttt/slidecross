import { Container, Graphics, BitmapText } from "pixi.js";
import { isMobile } from 'react-device-detect';
// const TWEEN = require('@tweenjs/tween.js');


export class Cell {
  constructor(letter, correctLetter, i, j, width, onDragStart, onClick, board) {
    this.letter = letter;
    this.correctLetter = correctLetter;
    this.i = i;
    this.j = j;
    this.w = width;
    this.board = board
    this.bgContainer = new Container();
    this.bgOffsetContainer = new Container();
    this.fgContainer = new Container();
    this.fgOffsetContainer = new Container();
    // this.container = new Container();
    this.gfx = new Graphics();
    this.selectedGfx = new Graphics();
    this.selectedGfx.alpha = 0;
    this.text = new BitmapText(this.letter ? this.letter : '', { fontName: 'AnswerFont', });
    this.text.anchor.set(0.5, 0.5);
    this.text.x = this.w / 2;
    this.text.y = this.w / 2 - 3;

    if (isMobile) {
      // this.text.y -= this.w/12;
    }

    this.correct = false;
    this.selected = false;

    this.fgContainer.eventMode = 'none'

    this.previousState = {
      correct: null,
      selected: null
    }

    this.sequentialClicks = 0;

    // set in cell instantiation in board
    this.horConveyor = null;
    this.vertConveyor = null;

    this.bgOffsetContainer.addChild(this.gfx, this.selectedGfx);
    this.bgContainer.addChild(this.bgOffsetContainer);

    this.fgOffsetContainer.addChild(this.text);
    this.fgContainer.addChild(this.fgOffsetContainer);

    if (onDragStart && this.letter) {
      this.bgContainer.interactive = true
      // this.bgContainer.eventMode = 'static'
      // this.bgContainer.cursor = 'pointer';
      this.bgContainer.on('pointerdown', e => {
        onDragStart(e, this);
      });

      this.bgContainer.on('pointerup', e => {
        onClick(e, this);
      });

    } else if (this.letter === null) {

      this.bgContainer.interactive = true

      this.bgContainer.on('pointerdown', e => {
        // console.log('happens')
        this.board.deselectAllConveyors();
      });

    }

    this.bgContainer.x = this.w * this.i;
    this.bgContainer.y = this.w * this.j;

    this.fgContainer.x = this.w * this.i;
    this.fgContainer.y = this.w * this.j;

    this.draw();
  }

  updateText() {
    this.text.text = this.letter;
    this.text.dirty = true;
    // this.text.updateText()
    // this.text._render()
  }

  updateSelected() {
    if (this.selected) {
      this.selectedGfx.alpha = .5;

      // new TWEEN.Tween(this.selectedGfx)
      //   .to({alpha: .5}, 500)
      //   .easing(TWEEN.Easing.Quadratic.Out)
      //   .start()
      //   .onComplete(() => {
          
      //   });
    } else {
      this.selectedGfx.alpha = 0;

      // new TWEEN.Tween(this.selectedGfx)
      // .to({alpha: 0}, 500)
      // .easing(TWEEN.Easing.Quadratic.Out)
      // .start()
      // .onComplete(() => {
        
      // });
    }
  }

  draw() {
    this.gfx.lineStyle(2, 0x0D1821, 1);

    this.selectedGfx.beginFill(0xB2D7FB);
    this.selectedGfx.drawRect(1, 1, this.w - 2, this.w - 2);
    this.selectedGfx.endFill();
    // this.selectedGfx.alpha = .5;

    if (this.letter) {
      // this.gfx.beginFill(0xF0F4EF);
    } else {
      this.gfx.beginFill(0x0D1821);
    }

    // this.gfx.beginFill(this.letter ? 0xFFFFFF : 0x000000);
    this.gfx.drawRect(0, 0, this.w, this.w);
    this.gfx.endFill();


    if (this.selected) {
      this.selectedGfx.alpha = .5;
    } else {
      this.selectedGfx.alpha = 0;
    }

    this.gfx.cacheAsBitmap = true;
    this.selectedGfx.cacheAsBitmap = true;
  }

}
