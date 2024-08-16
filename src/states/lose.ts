import { Consts } from "../consts.js";
import { InputState } from "../inputs.js";
import { Monster } from "../monsters.js";
import { DrawInfo, GameState } from "../states.js";
import { drawString } from "../utils.js";
import { StateCharSelect } from "./character.js";
import { StatePlaying } from "./playing.js";

export class StateLose implements GameState {
  stats: GameStats;

  constructor(stats: GameStats) {
    this.stats = stats;
  }

  update(controls: InputState): GameState | null {
    if (controls.isClicked("mouse")) {
      return new StateCharSelect();
    }
    return null;
  }

  draw(
    controls: InputState,
    ctx: CanvasRenderingContext2D,
    drawInfo: DrawInfo,
  ) {
    drawString(
      ctx,
      `You died!\n\nYou made it to floor ${this.stats.depth + 1}, where you were killed by a ${this.stats.diedTo.name}.\n\nClick to play again.`,
      Consts.VERT_LINE_OFFSET + Consts.CHAR_WIDTH,
      Consts.CHAR_HEIGHT * 8,
      48,
    );
  }
}

export interface GameStats {
  diedTo: Monster;
  depth: number;
}
