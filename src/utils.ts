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

export function getTfRecursive(elt: SVGGraphicsElement): DOMMatrix {
  let out = new DOMMatrix();
  let cursor = elt;
  for (; ;) {
    let cons = cursor.transform.baseVal.consolidate();
    if (cons != null) {
      out = out.preMultiplySelf(cons.matrix);
    }

    let parent = cursor.parentElement;
    if (parent instanceof SVGGraphicsElement) {
      cursor = parent;
    } else break;
  }
  return out;
}

export function tfMatterVec(v: Matter.Vector, mat: DOMMatrix): Matter.Vector {
  let pt = new DOMPoint(v.x, v.y);
  let pt2 = pt.matrixTransform(mat);
  return { x: pt2.x, y: pt2.y };
}
