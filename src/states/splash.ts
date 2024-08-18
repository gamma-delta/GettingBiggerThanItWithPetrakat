import { Assets } from "../assets.js";
import { Consts } from "../consts.js";
import { InputState } from "../inputs.js";
import { GameState } from "../states.js";
import { StateGame } from "./game.js";

export class StateSplash implements GameState {
  constructor() { }

  update(controls: InputState): GameState | null {
    if (controls.isClicked("mouse") && Assets.worldSvg != null) {
      return new StateGame();
    }
    return null;
  }
  draw(controls: InputState, ctx: CanvasRenderingContext2D) {
  }
}
