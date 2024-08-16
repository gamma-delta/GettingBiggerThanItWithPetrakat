import { Assets } from "./assets.js";
import { Consts, initAudio } from "./consts.js";
import { InputState } from "./inputs.js";
import { GameState } from "./states.js";
import { StateSplash } from "./states/splash.js";

export class GettingBiggerThanIt {
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
      // initAudio();
    }

    const nextState = this.state.update(controls);
    if (nextState !== null) {
      this.state = nextState;
    }
  }

  draw(controls: InputState) {
    this.state.draw(controls, this.ctx, {
      width: this.width,
      height: this.height,
    });
  }
}
