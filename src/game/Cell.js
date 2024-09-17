import { Container, Graphics, BitmapText } from "pixi.js";
import { FontEnum } from "./Board.js";
import * as TWEEN from '@tweenjs/tween.js'


export class Cell {
  constructor(letter, correctLetter, i, j, width, onDragStart, onClick, board) {
    this.letter = letter;
    this.correctLetter = correctLetter;
    this.i = i;
    this.j = j;
    this.w = width;
    this.board = board;
    this.bgContainer = new Container();
    this.bgOffsetContainer = new Container();
    this.fgContainer = new Container();
    this.fgOffsetContainer = new Container();
    this.selectionContainer = new Container();
    this.selectionOffsetContainer = new Container();
    this.gfx = new Graphics();
    this.selectedGfx = new Graphics();
    this.selectedGfx.alpha = 0;
    this.highlightedGfx = new Graphics();
    this.highlightedGfx.alpha = 0;

    this.animatingCorrectness = false;


    this.font = FontEnum.REGULAR;

    const inputLetter = letter ? letter : "";

    const fontStyle = {
      fontSize: this.w / 2.5,
    };

    this.texts = {
      [FontEnum.REGULAR]: new BitmapText({
        text: inputLetter,
        style: { fontFamily: FontEnum.REGULAR, ...fontStyle  },
      }),
      [FontEnum.ITALIC]: new BitmapText({
        text: inputLetter,
        style: { fontFamily: FontEnum.ITALIC, ...fontStyle },
      }),
      [FontEnum.BOLD]: new BitmapText({
        text: inputLetter,
        style: { fontFamily: FontEnum.BOLD, ...fontStyle},
      }),
      [FontEnum.BOLD_ITALIC]: new BitmapText({
        text: inputLetter,
        style: { fontFamily: FontEnum.BOLD_ITALIC, ...fontStyle },
      }),
    };

    for (const text of Object.values(this.texts)) {
      text.anchor.set(0.5, 0.5);
      text.x = this.w / 2;
      text.y = this.w / 2;
    }

    this.correct = false;
    this.selected = false;
    this.highlighted = false;

    this.fgContainer.eventMode = "none";

    this.previousState = {
      correct: null,
      selected: null,
    };

    this.sequentialClicks = 0;

    this.horConveyor = null;
    this.vertConveyor = null;

    this.updateText();

    this.bgOffsetContainer.addChild(this.gfx);
    this.bgContainer.addChild(this.bgOffsetContainer);

    for (const text of Object.values(this.texts)) {
      this.fgOffsetContainer.addChild(text);
    }
    this.fgContainer.addChild(this.fgOffsetContainer);

    this.selectionOffsetContainer.addChild(
      this.selectedGfx,
      this.highlightedGfx,
    );
    this.selectionContainer.addChild(this.selectionOffsetContainer);

    if (onDragStart && this.letter) {
      this.bgContainer.interactive = true;
      this.bgContainer.on("pointerdown", (e) => {
        onDragStart(e, this);
      });

      this.bgContainer.on("pointerup", (e) => {
        onClick(e, this);
      });
    } else if (this.letter === null) {
      this.bgContainer.interactive = true;
      this.bgContainer.on("pointerdown", (e) => {
        this.board.deselectAllConveyors();
      });
    }

    const x = this.w * i;
    const y = (this.w) * j + 1;

    this.bgContainer.x = x;
    this.bgContainer.y = y;

    this.fgContainer.x = x;
    this.fgContainer.y = y;

    this.selectionContainer.x = x;
    this.selectionContainer.y = y;

    this.draw();
  }

  setOffset(x, y) {
    this.bgOffsetContainer.x = x;
    this.bgOffsetContainer.y = y;

    this.fgOffsetContainer.x = x;
    this.fgOffsetContainer.y = y;

    this.selectionOffsetContainer.x = x;
    this.selectionOffsetContainer.y = y;
  }

  setFont(font) {
    this.font = font;
    this.updateText();
  }


  animateCorrectness() {
    if (this.animatingCorrectness) return; 

    this.animatingCorrectness = true;
    try {
      new TWEEN.Tween(this.fgOffsetContainer.scale)
          .to({x: 1.05, y: 1.05}, 175)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start()
          .onComplete(() => {
            new TWEEN.Tween(this.fgOffsetContainer.scale)
            .to({x: 1, y: 1}, 175)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start()
            .onComplete(() => {
              this.animatingCorrectness = false;
            });
          });

    } catch (e) {
      // alert(e)
    }
  }

  hideAllTexts() {
    for (const text of Object.values(this.texts)) {
      text.visible = false;
    }
  }

  updateText() {
    this.hideAllTexts();

    this.texts[this.font].visible = true;
    this.texts[this.font].text = this.letter ? this.letter : "";
    this.texts[this.font].dirty = true;
  }

  updateSelected() {
    if (this.selected) {
      this.selectedGfx.alpha = 0.5;
    } else {
      this.selectedGfx.alpha = 0;
    }
  }

  updateHighlighted() {
    if (this.highlighted) {
      this.highlightedGfx.alpha = 1;
    } else {
      this.highlightedGfx.alpha = 0;
    }
  }

  draw() {
    [this.gfx, this.selectedGfx, this.highlightedGfx].forEach((gfx) => {
      gfx.clear();
    });

    this.gfx.setStrokeStyle(2, 0x0d1821, 1);

    this.selectedGfx.rect(1, 1, this.w - 2, this.w - 2).fill(0xb2d7fb);
    // this.selectedGfx.rect(1, 1, this.w - 2, this.w - 2).fill(0xFF0000);

    this.highlightedGfx.rect(1, 1, this.w - 2, this.w - 2).fill(0xf8ecca);

    if (this.letter) {
      this.gfx.rect(0, 0, this.w, this.w).fill({alpha:0, color:0xFFFFFF}).stroke({color:0x0d1821, width:2});

    } else {
      this.gfx.rect(-1, -1, this.w+2, this.w+2).fill(0x0d1821);
    }


    if (this.selected) {
      this.selectedGfx.alpha = 0.5;
    } else {
      this.selectedGfx.alpha = 0;
    }

    // this.gfx.cacheAsBitmap = true;
    this.selectedGfx.cacheAsBitmap = true;
    this.highlightedGfx.cacheAsBitmap = true;
  }
}
