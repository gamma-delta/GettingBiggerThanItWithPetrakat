import { Assets } from "./assets.js";
import { Consts } from "./consts.js";
import { DieMod, DieMods, Item, Items } from "./items.js";
import { Monster, Monsters, MonstersAndDifficulties } from "./monsters.js";
import { drawString, randint, titleCase } from "./utils.js";

const dieNumberWidth = 4;
const dieNumberHeight = 7;
const dieNumberCanvas = (() => {
  let canvas = document.createElement("canvas");
  canvas.width = 10 * dieNumberWidth;
  canvas.height = dieNumberHeight;

  return canvas;
})();
const dieCanvasCtx = dieNumberCanvas.getContext("2d")!;
export class Die {
  sides: number;
  mod: DieMod | null = null;

  static TEX_WIDTH = 18;
  static TEX_HEIGHT = 18;

  constructor(sides: number) {
    this.sides = sides;
  }

  roll(): number {
    let roll = randint(1, this.sides + 1);
    if (this.mod !== null) {
      roll = this.mod.modifyRoll(this, roll);
    }
    return Math.max(0, Math.min(99, roll));
  }

  draw(x: number, y: number, roll: number, ctx: CanvasRenderingContext2D) {
    let sideIdx;
    if (this.sides === 2) {
      sideIdx = 0;
    } else if (this.sides === 4) {
      sideIdx = 1;
    } else if (this.sides === 6) {
      sideIdx = 2;
    } else if (this.sides === 8) {
      sideIdx = 3;
    } else if (this.sides === 10) {
      sideIdx = 4;
    } else if (this.sides === 12) {
      sideIdx = 5;
    } else {
      sideIdx = 6;
    }
    ctx.drawImage(
      Assets.textures.diceAtlas,
      sideIdx * Die.TEX_WIDTH,
      0,
      Die.TEX_WIDTH,
      Die.TEX_HEIGHT,
      x,
      y,
      Die.TEX_WIDTH,
      Die.TEX_HEIGHT,
    );

    let color = [
      "#222",
      "#222",
      Consts.BG_COLOR,
      "#222",
      Consts.BG_COLOR,
      Consts.BG_COLOR,
      Consts.BG_COLOR,
    ][sideIdx];
    let dy = [0, 3, 0, -3, 0, 1, 3][sideIdx];
    dieCanvasCtx.fillStyle = color;
    dieCanvasCtx.fillRect(0, 0, 10 * dieNumberWidth, dieNumberHeight);
    dieCanvasCtx.globalCompositeOperation = "destination-in";
    dieCanvasCtx.drawImage(Assets.textures.numberFont, 0, 0);
    dieCanvasCtx.globalCompositeOperation = "source-over";

    let rollStr = roll.toString();
    let dx = -Math.floor(rollStr.length / 2) * (dieNumberWidth - 1);
    for (let i = 0; i < rollStr.length; i++) {
      let cp = rollStr.codePointAt(i)!;
      let num = cp - 0x30; // '0'
      ctx.drawImage(
        dieNumberCanvas,
        num * dieNumberWidth,
        0,
        dieNumberWidth,
        dieNumberHeight,
        x +
          Die.TEX_WIDTH / 2 -
          dieNumberWidth / 2 +
          dx +
          i * (dieNumberWidth + 2),
        y + Die.TEX_HEIGHT / 2 - dieNumberHeight / 2 + dy,
        dieNumberWidth,
        dieNumberHeight,
      );
    }
  }
}

export class Level {
  monsters: Monster[];

  constructor(monsters: Monster[]) {
    this.monsters = monsters;
  }

  static generateFromDepth(depth: number): Level {
    // temp
    let monsters = [];
    if (depth === 0) {
      // Give a tutorial level
      monsters = [Monsters.modron(1), Monsters.goblin(), Monsters.modron(2)];
    } else {
      let monsterManual = MonstersAndDifficulties.slice();
      monsterManual.sort(
        (a, b) => b.difficulty - a.difficulty + Math.random() - 0.5,
      );

      let difficultyRemaining = depth * 2 + 4;
      let len = Math.max(3, Math.min(8, randint(3, depth * 2)));
      let tries = 100;
      while (monsters.length < len && tries-- > 0) {
        let diff = randint(
          Math.ceil(difficultyRemaining / 3),
          difficultyRemaining + 1,
        );
        let success = false;
        for (let i = 0; i < monsterManual.length; i++) {
          let { monster: monsterFactory, difficulty } = monsterManual[i];
          if (difficulty <= diff) {
            monsters.push({ monster: monsterFactory(), difficulty });
            difficultyRemaining -= difficulty;
            success = true;
            break;
          }
        }
        if (!success) {
          difficultyRemaining += depth;
        }
      }
      monsters.sort(
        (a, b) => a.difficulty - b.difficulty + (Math.random() - 0.5) * 3.5,
      );
      monsters = monsters.map((m) => m.monster);
    }
    return new Level(monsters);
  }
}

// Defines your starting inventory
export type PlayerClassType = "Fighter" | "Cleric" | "Rogue" | "Wizard";
export interface PlayerClass {
  type: PlayerClassType;
  description: string;
  powerName: string;
  powerDesc: string;
  difficulty: number;
  dice: Die[];
  items: Item[];
}

export const PlayerClasses: (() => PlayerClass)[] = [
  () => ({
    type: "Fighter",
    description: "A brave adventurer with a trusty cardboard sword.",
    powerName: "Second Wind",
    powerDesc: "Re-roll and restore one of your dice once per floor.",
    difficulty: 1,
    dice: [
      new Die(4),
      new Die(6),
      new Die(6),
      new Die(6),
      new Die(8),
      new Die(12),
    ],
    items: [
      Items.toItem(DieMods.nloon(2, "silver")),
      Items.healingPotion(),
      Items.greaterHealingPotion(),
      Items.luckPotion(),
    ],
  }),
  () => ({
    type: "Rogue",
    description: "A swindler with a clever smirk and cleverer fingers,",
    powerName: "Cheat",
    powerDesc:
      "The first time you would lose a d2 on a floor, you get it back instead.",
    difficulty: 2,
    dice: [new Die(2), new Die(2), new Die(2), new Die(4), new Die(6)],
    items: [
      Items.toItem(DieMods.demonPart(true)),
      Items.toItem(DieMods.demonPart(false)),
    ],
  }),
  () => ({
    type: "Cleric",
    description:
      "A devotee of one of the many deities that sponsor dungeon-delving.",
    powerName: "Rebuke",
    powerDesc: "Immediately defeat a demon or pirate once per floor.",
    difficulty: 3,
    dice: [new Die(4), new Die(4), new Die(4), new Die(4)],
    items: [
      Items.toItem(DieMods.nloon(2, "gold")),
      Items.toItem(DieMods.nloon(3, "gold")),
      Items.toItem(DieMods.modronCore(5)),
    ],
  }),
  () => ({
    type: "Wizard",
    description:
      "A scholar of the arcane spelunking for more hands-on research.",
    powerName: "Transpose",
    powerDesc:
      "Kill a random used die to exchange your used and ready dice once per floor.",
    difficulty: 4,
    dice: [
      new Die(10),
      new Die(10),
      new Die(12),
      (function () {
        const die = new Die(20);
        die.mod = DieMods.nloon(3, "silver");
        return die;
      })(),
    ],
    items: [Items.healingPotion(), Items.luckPotion()],
  }),
];
