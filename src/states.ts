import { InputState } from "./inputs.js";

export interface GameState {
  update: (controls: InputState) => GameState | null;
  draw: (
    controls: InputState,
    ctx: CanvasRenderingContext2D,
    drawInfo: DrawInfo,
  ) => void;
}

export type DrawInfo = {
  width: number;
  height: number;
};
