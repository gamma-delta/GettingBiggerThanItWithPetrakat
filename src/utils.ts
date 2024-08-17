import { Assets } from "./assets.js";
import { Consts } from "./consts.js";

/**
 * Random number: min <= n < max;
 */
export function randint(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
export function pick<T>(arr: T[]): T {
  let idx = randint(0, arr.length);
  return arr[idx];
}

const wordSplitter = /(\n)|\s+/;

export function splitIntoWordsWithLen(s: string, charsWidth: number): string[] {
  let words = s.split(wordSplitter);
  let line = [];
  let out = [];
  let cursor = 0;
  for (let word of words) {
    if (word === undefined) continue;
    if (word === "\n") {
      cursor = 0;
      out.push(line.join(" "));
      line = [];
    } else {
      if (cursor + word.length >= charsWidth) {
        cursor = 0;
        out.push(line.join(" "));
        line = [];
      }
      line.push(word);
      cursor += word.length + 1; // for the space
    }
  }
  if (line.length !== 0) {
    out.push(line.join(" "));
  }
  return out;
}

const fontCanvas = (() => {
  let canvas = document.createElement("canvas");
  canvas.width = 16 * Consts.CHAR_WIDTH;
  canvas.height = 16 * Consts.CHAR_HEIGHT;

  return canvas;
})();
const fontCanvasCtx = fontCanvas.getContext("2d")!;
export function drawString(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  charsWidth: number = 32,
  color: string = Consts.PENCIL_COLOR,
): number {
  fontCanvasCtx.fillStyle = color;
  fontCanvasCtx.fillRect(0, 0, Consts.CHAR_WIDTH * 16, Consts.CHAR_HEIGHT * 16);
  fontCanvasCtx.globalCompositeOperation = "destination-in";
  fontCanvasCtx.drawImage(Assets.textures.font, 0, 0);
  fontCanvasCtx.globalCompositeOperation = "source-over";

  let lines = splitIntoWordsWithLen(s, charsWidth);

  for (let [lineY, line] of lines.entries()) {
    for (let i = 0; i < line.length; i++) {
      let cp = line.codePointAt(i)!;
      let sx = cp % 16;
      let sy = Math.floor(cp / 16);

      ctx.drawImage(
        fontCanvas,
        sx * Consts.CHAR_WIDTH,
        sy * Consts.CHAR_HEIGHT,
        Consts.CHAR_WIDTH,
        Consts.CHAR_HEIGHT,
        x + i * (Consts.CHAR_WIDTH + Consts.KERNING_X),
        y + lineY * (Consts.CHAR_HEIGHT + Consts.KERNING_Y),
        Consts.CHAR_WIDTH,
        Consts.CHAR_HEIGHT,
      );
    }
  }
  return lines.length;
}
export function drawStringAlign(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  align: "left" | "center" | "right",
  color: string = Consts.PENCIL_COLOR,
) {
  fontCanvasCtx.fillStyle = color;
  fontCanvasCtx.fillRect(0, 0, Consts.CHAR_WIDTH * 16, Consts.CHAR_HEIGHT * 16);
  fontCanvasCtx.globalCompositeOperation = "destination-in";
  fontCanvasCtx.drawImage(Assets.textures.font, 0, 0);
  fontCanvasCtx.globalCompositeOperation = "source-over";

  let dx = 0;
  if (align === "center") {
    dx = -s.length / 2;
  } else if (align === "right") {
    dx = -s.length;
  }
  for (let i = 0; i < s.length; i++) {
    let cp = s.codePointAt(i)!;
    let sx = cp % 16;
    let sy = Math.floor(cp / 16);

    ctx.drawImage(
      fontCanvas,
      sx * Consts.CHAR_WIDTH,
      sy * Consts.CHAR_HEIGHT,
      Consts.CHAR_WIDTH,
      Consts.CHAR_HEIGHT,
      x + Math.floor((i + dx) * (Consts.CHAR_WIDTH + Consts.KERNING_X)),
      y,
      Consts.CHAR_WIDTH,
      Consts.CHAR_HEIGHT,
    );
  }
}

export function titleCase(s: string): string {
  return s.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
}

export function clamp(x: number, min: number, max: number) {
  if (x < min) return min;
  else if (x > max) return max;
  else return x;
}
