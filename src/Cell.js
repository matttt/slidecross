import { Container, Graphics, BitmapText, Color } from "pixi.js";

export class Cell {
  constructor(letter, correctLetter, i, j, width, textStyle, onDragStart, onClick) {
    this.letter = letter;
    this.correctLetter = correctLetter;
    this.i = i;
    this.j = j;
    this.w = width;
    this.container = new Container();
    this.offsetContainer = new Container();
    this.gfx = new Graphics();
    this.text = new BitmapText(this.letter ? this.letter : '', { fontName: 'AnswerFont' });
    this.text.anchor.set(0.5, 0.5);
    this.text.x = this.w / 2;
    this.text.y = this.w / 2 - 3;
    this.correct = false;
    this.selected = false;

    this.previousState = {
      correct: null,
      selected: null
    }

    this.sequentialClicks = 0;

    // set in cell instantiation in board
    this.horConveyor = null;
    this.vertConveyor = null;

    if (onDragStart && this.letter) {
      this.container.interactive = true;
      this.container.on('pointerdown', e => {
        onDragStart(e, this);
      });

      this.container.on('pointerup', e => {
        onClick(e, this);
      });
    }

    this.offsetContainer.addChild(this.gfx, this.text);
    this.container.addChild(this.offsetContainer);

    this.container.x = this.w * this.i;
    this.container.y = this.w * this.j;

    this.draw();
  }

  updateText() {
    this.text.text = this.letter;
    this.text.dirty = true;
    // this.text.updateText()
    // this.text._render()
  }

  draw() {
    if (this.previousState) {
      if (this.previousState.correct === this.correct && this.previousState.selected === this.selected) {
        return;
      }
    }

    this.gfx.lineStyle(2, 0, 1);
    if (this.letter) {
      if (this.selected) {
        // 178,215,251 
        this.gfx.beginFill(11720699);
      } else {
        this.gfx.beginFill(16777215);
      }
    } else {
      this.gfx.beginFill(0);
    }
    // this.gfx.beginFill(this.letter ? 0xFFFFFF : 0x000000);
    this.gfx.drawRect(0, 0, this.w, this.w);
    this.gfx.endFill();

    this.previousState = {
      correct: this.correct,
      selected: this.selected
    }
  }

}
