import { Assets } from "./assets.js";
import { Consts, initAudio } from "./consts.js";
import { InputState } from "./inputs.js";
import { GameState } from "./states.js";
import { StateSplash } from "./states/splash.js";

export class RollPlayingGame {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  state: GameState;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    const ctxAny = this.ctx as any;
    ctxAny.mozImageSmoothingEnabled = false;
    ctxAny.webkitImageSmoothingEnabled = false;
    ctxAny.msImageSmoothingEnabled = false;
    ctxAny.imageSmoothingEnabled = false;

    this.width = canvas.width;
    this.height = canvas.height;

    this.state = new StateSplash();
  }

  update(controls: InputState) {
    if (controls.isClicked("mouse")) {
      initAudio();
    }

    const nextState = this.state.update(controls);
    if (nextState !== null) {
      this.state = nextState;
    }
  }

  draw(controls: InputState) {
    this.ctx.fillStyle = Consts.BG_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.lineWidth = 1.0;
    this.ctx.strokeStyle = Consts.BLUE_LINE_COLOR;
    for (
      let y = Consts.CHAR_HEIGHT * 3 - Consts.KERNING_Y;
      y < this.height;
      y += Consts.HORIZ_LINE_SPACING
    ) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y - 0.5);
      this.ctx.lineTo(this.width, y - 0.5);
      this.ctx.stroke();
    }
    this.ctx.strokeStyle = Consts.PINK_LINE_COLOR;
    this.ctx.lineWidth = 2.0;
    this.ctx.beginPath();
    this.ctx.moveTo(Consts.VERT_LINE_OFFSET, 0);
    this.ctx.lineTo(Consts.VERT_LINE_OFFSET, this.height);
    this.ctx.stroke();

    this.state.draw(controls, this.ctx, {
      width: this.width,
      height: this.height,
    });
  }
}
