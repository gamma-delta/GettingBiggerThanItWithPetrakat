import { Consts } from "../consts.js";
import { InputState } from "../inputs.js";
import { GameState } from "../states.js";
import { drawString } from "../utils.js";
import { StateGame } from "./game.js";

export class StateSplash implements GameState {
  constructor() {}

  update(controls: InputState): GameState | null {
    if (controls.isClicked("mouse")) {
      return new StateGame();
    }
    return null;
  }
  draw(controls: InputState, ctx: CanvasRenderingContext2D) {
    drawString(
      ctx,
      "Some kind of game god knows what",
      Consts.VERT_LINE_OFFSET + Consts.CHAR_WIDTH * 8,
      Consts.CHAR_HEIGHT * 8,
    );
  }
}
