import { Monster } from "./monsters.js";
import { pick } from "./utils.js";

export function lethalDamage(roll: number, monster: Monster) {
  let verb = pick(["plunges", "swings", "crushes", "tears", "crunches"]);
  let adverb = pick([
    "wetly ",
    "satisfyingly ",
    "ferociously ",
    "critically ",
    "right ",
    "",
    "",
  ]);
  let bodyPart = Math.random() < 0.2 ? "" : "'s " + pick(monster.bodyParts);
  let excitement = pick([".", ".", "!", "!!"]);
  return `Your ${roll} ${verb} ${adverb}through the ${monster.name}${bodyPart}${excitement}`;
}
export function nonLethalDamage(roll: number, monster: Monster) {
  let verb = pick(["pings", "bounces", "skitters", "flops"]);
  let prep = pick(["off", "against", "across", "away from"]);
  let adverb = pick(["pathetically ", "limply ", "anemically ", "", ""]);
  let bodyPart = Math.random() < 0.2 ? "" : "'s " + pick(monster.bodyParts);
  let excitement = pick([".", ".", "...", "...", " :("]);
  return `Your ${roll} ${adverb}${verb} ${prep} the ${monster.name}${bodyPart}${excitement}`;
}
