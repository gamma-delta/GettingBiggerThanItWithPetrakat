import { Consts } from "../consts.js";
import { InputState } from "../inputs.js";
import { PlayerClass, PlayerClasses } from "../model.js";
import { DrawInfo, GameState } from "../states.js";
import { drawString, splitIntoWordsWithLen } from "../utils.js";
import { Widget } from "../widget.js";
import { StatePlaying } from "./playing.js";

const WIDTH = 60;

export class StateCharSelect implements GameState {
  swapState: GameState | null = null;
  widgets: Widget<StateCharSelect>[];
  constructor() {
    this.widgets = [];
    let y = Consts.HORIZ_LINE_SPACING * 4 + 4;
    for (let clazzFactory of PlayerClasses) {
      let wig = new WidgetCharacter(
        this,
        Consts.VERT_LINE_OFFSET + Consts.CHAR_WIDTH * 4,
        y,
        clazzFactory(),
      );
      y += wig.h + Consts.HORIZ_LINE_SPACING;
      this.widgets.push(wig);
    }
  }

  update(controls: InputState): GameState | null {
    for (let wig of this.widgets) {
      wig.update(controls);
    }

    return this.swapState;
  }
  draw(
    controls: InputState,
    ctx: CanvasRenderingContext2D,
    drawInfo: DrawInfo,
  ) {
    drawString(
      ctx,
      "Choose your Class",
      Consts.VERT_LINE_OFFSET + Consts.CHAR_WIDTH * 4,
      Consts.HORIZ_LINE_SPACING * 2 + 4,
    );
    for (let wig of this.widgets) {
      wig.draw(ctx);
    }
  }
}

class WidgetCharacter extends Widget<StateCharSelect> {
  clazz: PlayerClass;
  addlLines: string[];
  constructor(
    state: StateCharSelect,
    x: number,
    y: number,
    clazz: PlayerClass,
  ) {
    // height: name, dice, items, power, difficulty.
    super(state, x, y, Consts.CHAR_WIDTH * WIDTH, Consts.CHAR_HEIGHT * 5);
    this.clazz = clazz;

    let dieString = "Dice: ";
    for (let i = 0; i < this.clazz.dice.length; i++) {
      let die = this.clazz.dice[i];
      dieString += "d" + die.sides;
      if (die.mod !== null) {
        dieString += " with " + die.mod.name;
      }
      if (i < this.clazz.dice.length - 1) {
        dieString += ", ";
      }
    }
    const itemString =
      "Items: " + this.clazz.items.map((item) => item.name).join(", ");
    const powString = this.clazz.powerName + ": " + this.clazz.powerDesc;
    const diffString = "Difficulty: " + "\x04".repeat(this.clazz.difficulty);

    const lines = `${this.clazz.description}\n${dieString}\n${itemString}\n${powString}\n${diffString}`;
    this.addlLines = splitIntoWordsWithLen(lines, WIDTH - 2);
    this.h = Consts.HORIZ_LINE_SPACING * (this.addlLines.length + 1);
  }

  onClick(): void {
    this.state.swapState = StatePlaying.start(this.clazz);
  }
  draw(ctx: CanvasRenderingContext2D): void {
    drawString(
      ctx,
      this.clazz.type,
      this.x,
      this.y,
      WIDTH,
      Consts.PINK_LINE_COLOR,
    );
    for (let i = 0; i < this.addlLines.length; i++) {
      drawString(
        ctx,
        this.addlLines[i],
        this.x + Consts.CHAR_WIDTH * 2,
        this.y + (i + 1) * Consts.HORIZ_LINE_SPACING,
        WIDTH - 2,
      );
    }
  }
}
