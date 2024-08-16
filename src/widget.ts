import { InputState } from "./inputs.js";
import { GameState } from "./states.js";

export abstract class Widget<S extends GameState> {
  x: number;
  y: number;
  w: number;
  h: number;
  isHovered: boolean = false;
  state: S;

  constructor(state: S, x: number, y: number, w: number, h: number) {
    this.state = state;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  update(controls: InputState) {
    const hovering =
      controls.mouseX >= this.x &&
      controls.mouseX <= this.x + this.w &&
      controls.mouseY >= this.y &&
      controls.mouseY <= this.y + this.h;

    if (hovering != this.isHovered) {
      this.isHovered = hovering;
      this.onHoverChange();
    }
    if (hovering && controls.isClicked("mouse")) {
      this.onClick();
    }
  }

  abstract onClick(): void;
  onHoverChange(): void {}
  abstract draw(ctx: CanvasRenderingContext2D): void;
}
