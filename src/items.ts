import { Assets } from "./assets.js";
import { Die } from "./model.js";
import { randint, titleCase } from "./utils.js";

export interface DieMod {
  modifyRoll(die: Die, roll: number): number;
  name: string;
  short: string;
  description: string;
  flavor: string;

  image: HTMLImageElement;
}

export const DieMods = {
  modronCore(rank: number): DieMod {
    return {
      modifyRoll(die, roll) {
        return rank;
      },
      name: "modron core " + rank,
      short: "=" + rank,
      description: `Makes the die always roll ${rank}.`,
      flavor: `Due to Primus' divine influence, a modron's core suppresses probability near itself.`,
      image: Assets.textures.modronCore,
    };
  },
  highdraHead(): DieMod {
    return {
      modifyRoll(die, roll) {
        return die.sides;
      },
      name: "High-dra Head",
      short: "MAX",
      description: "Makes the die always roll its highest possible value.",
      flavor:
        "High-dra venom is sometimes sold in irreputable taverns for its ... strengthening effects.",
      image: Assets.textures.highdraHead,
    };
  },
  nloon(multiplier: number, metal: "silver" | "gold"): DieMod {
    let description;
    let short;
    if (metal === "gold") {
      description = `Multiplies the die roll by ${multiplier}.`;
      short = "$" + multiplier;
    } else {
      description = `Makes the die act as if it had ${multiplier}x as many sides.`;
      // cp437 cent ... well
      // Wikipedia and my spritesheet disagree here.
      short = "\xbd" + multiplier;
    }
    let coinType = ["doubloon", "trebloon"][multiplier - 2];
    return {
      modifyRoll(die, roll) {
        if (metal === "gold") {
          return roll * multiplier;
        } else {
          return randint(1, die.sides * multiplier + 1);
        }
      },
      name: metal + " " + coinType,
      short,
      description,
      flavor:
        "Doubloons and trebloons are useless as currency, due to their tendency to mess up ledgers and accounting books.",
      image: [Assets.textures.doubloon, Assets.textures.trebloon][
        multiplier - 2
      ],
    };
  },
  demonPart(inc: boolean): DieMod {
    return {
      modifyRoll(die, roll) {
        return roll + (inc ? 1 : -1);
      },
      name: inc ? "inc-ubus horn" : "succ-ubus tail",
      short: (inc ? "+" : "-") + "1",
      description: inc
        ? "Adds one to the die roll."
        : "Subtracts one from the die roll.",
      flavor:
        "Inc/succ-ubi can detach certain parts of their body in defense, like lizards. Demonologists postulate that concubi would be given to dropping" +
        ' their "philtrum," but no one\'s managed to get a straight answer out of a demonologist as to what a "philtrum" is.',
      image: inc ? Assets.textures.horn : Assets.textures.tail,
    };
  },
};

export interface Item {
  data:
    | {
        type: "mod";
        dieMod: DieMod;
      }
    | {
        type: "restoreOne";
      }
    | {
        type: "restoreAll";
      }
    | {
        type: "rerollOne";
      }
    | {
        type: "rerollAll";
      }
    | {
        type: "fighterSecondWind";
      };
  name: string;
  short: string;
  description: string;
  image: HTMLImageElement;
}

export const Items = {
  healingPotion(): Item {
    return {
      name: "healing potion",
      short: "\x031", // cp437 heart
      description: "Restores a single die.",
      data: { type: "restoreOne" },
      image: Assets.textures.potionHealing,
    };
  },
  greaterHealingPotion(): Item {
    return {
      name: "greater healing potion",
      short: "\x03A",
      description: "Restores all your dice.",
      data: { type: "restoreAll" },
      image: Assets.textures.potionHealing2,
    };
  },
  luckPotion(): Item {
    return {
      name: "luck potion",
      short: "\xf51", // section, but looks like a swirl
      description: "Rerolls a single die.",
      data: { type: "rerollOne" },
      image: Assets.textures.potionLuck,
    };
  },
  greaterLuckPotion(): Item {
    return {
      name: "greater luck potion",
      short: "\xf5A",
      description: "Rerolls all your dice.",
      data: { type: "rerollAll" },
      image: Assets.textures.potionLuck2,
    };
  },
  fighterSecondWind(): Item {
    return {
      name: "second wind",
      short: "??",
      description: "Whoopsy, you should never see this!",
      data: { type: "fighterSecondWind" },
      image: Assets.textures.ninja,
    };
  },
  toItem(mod: DieMod): Item {
    return {
      name: mod.name,
      short: mod.short,
      description: "Equipment. " + mod.description + "\n\n" + mod.flavor,
      data: {
        type: "mod",
        dieMod: mod,
      },
      image: mod.image,
    };
  },
};
