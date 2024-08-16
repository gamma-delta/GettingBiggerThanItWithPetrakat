import { Assets } from "./assets.js";
import { DieMod, DieMods, Item, Items } from "./items.js";
import { pick, randint } from "./utils.js";

export interface Monster {
  defeatedBy(dice: number[], idx: number): boolean;
  itemDropped(): Item | null;
  name: string;
  blurb: string;
  bodyParts: string[];
  rebukable: boolean;

  image: HTMLImageElement;
  enterSound: HTMLAudioElement;
  dieSound: HTMLAudioElement;
  winSound: HTMLAudioElement;
}

export const Monsters = {
  modron: (rank: number): Monster => ({
    defeatedBy: (dice, idx) => dice[idx] % rank === 0,
    itemDropped() {
      if (Math.random() < 0.7) return null;
      if (Math.random() < 0.2) {
        let pots =
          rank <= 3
            ? [Items.healingPotion(), Items.luckPotion()]
            : [Items.greaterHealingPotion(), Items.greaterLuckPotion()];
        return pick(pots);
      } else {
        return Items.toItem(DieMods.modronCore(rank));
      }
    },
    name: ["monodron", "duodron", "tridron", "quadron", "pentadron"][rank - 1],
    blurb: makeModronBlurb(rank),
    bodyParts: ["chassis", "core", "gears", "wing", "antenna", "plating"],
    rebukable: false,

    image: [
      Assets.textures.monodron,
      Assets.textures.duodron,
      Assets.textures.tridron,
      Assets.textures.quadron,
      Assets.textures.pentadron,
    ][rank - 1],
    enterSound: Assets.audio.modronEnter,
    dieSound: Assets.audio.modronDie,
    winSound: Assets.audio.modronWin,
  }),
  dragon: (heads: number): Monster => {
    let blurb =
      `Defeated by the number ${heads}.\n\nDragonologists INSIST on calling garden-variety dragons "one-headed dragons,"` +
      ` and will NOT shut up about wondering why they look just like high-dras. Dragonologists are no fun at parties.` +
      "\n\nIn retrospect, asking Falkory to draw ten different dragons was probably setting us up for failure. (Sorry)";
    const bodyParts = [];
    for (let i = 0; i < heads; i++) {
      bodyParts.push("head #" + (i + 1));
    }
    return {
      defeatedBy: (dice, idx) => dice[idx] === heads,
      itemDropped: () =>
        pick([Items.greaterHealingPotion(), Items.greaterLuckPotion()]),
      name:
        [
          "zero?!",
          "one",
          "two",
          "three",
          "four",
          "five",
          "six",
          "seven",
          "eight",
          "nine",
          "ten",
        ][heads] + "-headed dragon",
      blurb,
      bodyParts,
      rebukable: false,

      image: Assets.textures.dragon,
      enterSound: Assets.audio.dragonEnter,
      dieSound: Assets.audio.dragonDie,
      winSound: Assets.audio.dragonWin,
    };
  },
  highdra: (): Monster => ({
    defeatedBy(dice, idx) {
      const max = Math.max(...dice);
      return dice[idx] === max;
    },
    itemDropped() {
      if (Math.random() < 0.5) return null;
      return Items.toItem(DieMods.highdraHead());
    },
    name: "high-dra",
    blurb:
      "Defeated by your highest die.\n\nThe high-dra is a cousin to the pi-dra. Pi-dras were hunted to extinction in 754 I.E. after people got sick of dealing with the points they left floating everywhere.",
    bodyParts: ["head", "frill", "teeth"],
    rebukable: false,

    image: Assets.textures.highdra,
    enterSound: Assets.audio.dragonEnter,
    dieSound: Assets.audio.dragonDie,
    winSound: Assets.audio.dragonWin,
  }),
  pirate: (threshold: number): Monster => ({
    defeatedBy(dice, idx) {
      let roll = dice[idx];
      let count = 0;
      for (let die of dice) {
        if (die === roll) {
          count++;
        }
      }
      return count >= threshold;
    },
    itemDropped() {
      if (Math.random() < 0.5) return null;
      let type = threshold <= 2 ? "silver" : "gold";
      let mod = pick([
        DieMods.nloon(2, type as any),
        DieMods.nloon(3, type as any),
      ]);
      return Items.toItem(mod);
    },
    name: ["birate", "trirate"][threshold - 2],
    blurb:
      `Defeated by a number you have ${threshold} or more of.\n\nMost pirates were driven out of work during 754 I.E.` +
      ` Interestingly enough, although pirates were human, birates and trirates are fungi that perfectly resemble humans.`,
    rebukable: true,

    bodyParts: ["eye patch", "hook hand", "peg leg", "grog"],
    image: [Assets.textures.birate, Assets.textures.trirate][threshold - 2],
    enterSound: Assets.audio.pirateEnter,
    dieSound: Assets.audio.pirateDie,
    winSound: Assets.audio.pirateWin,
  }),
  goblin: (): Monster => ({
    defeatedBy(dice, idx) {
      let roll = dice[idx];
      return roll !== 1 && !isPrime(roll);
    },
    itemDropped() {
      if (Math.random() < 0.7) return null;
      return Items.luckPotion();
    },
    name: "cobble goblin",
    blurb:
      "Defeated by composite numbers. 1 is not composite.\n\nIt's this little goblin's first day on dungeon duty, and all it could find was this patchy armor." +
      " It barely fits, and it lets composite numbers straight through. Poor thing.",
    bodyParts: ["leg", "arm", "head", "nose", "hat"],
    rebukable: false,

    image: Assets.textures.cobbleGoblin,
    enterSound: Assets.audio.goblinEnter,
    dieSound: Assets.audio.goblinDie,
    winSound: Assets.audio.goblinWin,
  }),
  goblinLord: (): Monster => ({
    defeatedBy(dice, idx) {
      let roll = dice[idx];
      return roll !== 1 && isPrime(roll);
    },
    itemDropped() {
      if (Math.random() < 0.7) return null;
      return Items.greaterLuckPotion();
    },
    name: "prime goblin",
    blurb:
      "Defeated by prime numbers. 1 is not prime.\n\nAt some point, the idea of giving a prime goblin a cobble goblin's armor was raised, but the discussion fell apart." +
      " The goblins couldn't decide what to do with the number 1, given most of them can't count much higher.",
    bodyParts: ["leg", "arm", "head", "nose", "fancy hat"],
    rebukable: false,

    image: Assets.textures.goblinLord,
    enterSound: Assets.audio.goblinEnter,
    dieSound: Assets.audio.goblinDie,
    winSound: Assets.audio.goblinWin,
  }),
  gelatinousSquare: (): Monster => ({
    defeatedBy(dice, idx) {
      let roll = dice[idx];
      let sqrt = Math.sqrt(roll);
      return Math.abs(sqrt - Math.round(sqrt)) < 0.0001;
    },
    itemDropped() {
      if (Math.random() < 0.7) return null;
      return Items.healingPotion();
    },
    name: "gelatinous square",
    blurb: "Defeated by square numbers.\n\nJust a plane ol' gelatinous square.",
    bodyParts: ["gel", "gelatin", "corner", "edge"],
    rebukable: false,

    image: Assets.textures.gelatinousSquare,
    enterSound: Assets.audio.gelatinEnter,
    dieSound: Assets.audio.gelatinDie,
    winSound: Assets.audio.gelatinWin,
  }),
  gelatinousCube: (): Monster => ({
    defeatedBy(dice, idx) {
      let roll = dice[idx];
      let cbrt = Math.cbrt(roll);
      return Math.abs(cbrt - Math.round(cbrt)) < 0.0001;
    },
    itemDropped() {
      if (Math.random() < 0.7) return null;
      return Items.greaterHealingPotion();
    },
    name: "gelatinous cube",
    blurb:
      'Defeated by cubic numbers.\n\nIn the old days, gelatinous cubes used to be farmed for their gelatin. It was marketed as a "cruelty-free" or vegetarian gelatin, saving those poor pigs from getting their joints melted down.' +
      " Business went remarkably well until all the farmers were dissolved by their livestock.",
    bodyParts: ["gel", "gelatin", "corner", "edge", "face"],
    rebukable: false,

    image: Assets.textures.gelatinousCube,
    enterSound: Assets.audio.gelatinEnter,
    dieSound: Assets.audio.gelatinDie,
    winSound: Assets.audio.gelatinWin,
  }),
  foocubus: (inc: boolean): Monster => ({
    defeatedBy(dice, idx) {
      let roll = dice[idx];
      for (let die of dice) {
        let target = die + (inc ? 1 : -1);
        if (roll === target) return true;
      }
      return false;
    },
    itemDropped() {
      if (Math.random() < 0.7) return null;
      return Items.toItem(DieMods.demonPart(inc));
    },
    name: inc ? "inc-ubus" : "succ-ubus",
    blurb:
      `Defeated by a number one ${inc ? "more" : "less"} than another number you rolled.\n\nInc-ubi and succ-ubi are actually the same creature in different moods.` +
      " Much of demonology involves trying to create a comfortable enough atmosphere for an inc/succ-ubus to become a concubus, a demon which so far has only been spotted in the wild.",
    bodyParts: ["wing", "horn", "tail"],
    rebukable: true,

    image: inc ? Assets.textures.incubus : Assets.textures.succubus,
    enterSound: Assets.audio.demonEnter,
    dieSound: Assets.audio.demonDie,
    winSound: Assets.audio.demonWin,
  }),
};

function makeModronBlurb(rank: number): string {
  let defeat =
    rank === 1
      ? "Defeated by any number."
      : `Defeated by multiples of ${rank}.`;
  let message = [
    "These foot soldiers of Primus' army are so brittle, any value will defeat them." +
      ' Such is the fate of fodder. A god of order must have pawns, and monodrons are ... well, not "happy," but willing to serve.',
    "Primus' priests hold that when a higher-ranking modron dies, a modron of the rank below somewhere in the multiverse becomes a rank higher in a puff of smoke." +
      " No one has ever actually seen this happen, however. Devotees claim this is proof of Primus' power; there are simply so many modrons the chance that the" +
      " one you're fighting gets upgraded is infinitesimal.",
    "Legend has it that the various arities of modron do not get any stronger." +
      " They simply acquire a taste for more exotic numbers as their processors get more sophisticated.",
    "Quadrons are the lowest rank of modron with the ability to speak. They spend much of this newfound power griping about " +
      ' how much they hate being called quadcopters and emphasizing that "quadron" is pronounced with a short "o."',
    'As the popular jumprope rhyme goes: "Five, Ten, Fifteen, Twenty. Never leave the-- OH GOD A PENTADRON RUN"',
  ][rank - 1];
  return `${defeat}\n\n${message}`;
}

function isPrime(n: number) {
  for (let i = 2; i <= Math.ceil(Math.sqrt(n)) && i < n; i++) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
}

export const MonstersAndDifficulties: Array<{
  monster: () => Monster;
  difficulty: number;
}> = [
  { monster: () => Monsters.modron(1), difficulty: 1 },
  { monster: () => Monsters.goblin(), difficulty: 1 },
  { monster: () => Monsters.modron(2), difficulty: 1 },
  { monster: () => Monsters.highdra(), difficulty: 2 },
  { monster: () => Monsters.goblinLord(), difficulty: 3 },
  { monster: () => Monsters.modron(3), difficulty: 3 },
  { monster: () => Monsters.foocubus(true), difficulty: 4 },
  { monster: () => Monsters.foocubus(true), difficulty: 4 },
  { monster: () => Monsters.foocubus(false), difficulty: 4 },
  { monster: () => Monsters.foocubus(false), difficulty: 4 },
  { monster: () => Monsters.modron(4), difficulty: 5 },
  { monster: () => Monsters.gelatinousSquare(), difficulty: 6 },
  { monster: () => Monsters.gelatinousSquare(), difficulty: 6 },
  { monster: () => Monsters.modron(5), difficulty: 6 },
  { monster: () => Monsters.gelatinousCube(), difficulty: 7 },
  { monster: () => Monsters.gelatinousCube(), difficulty: 7 },
  { monster: () => Monsters.pirate(2), difficulty: 8 },
  { monster: () => Monsters.dragon(randint(1, 11)), difficulty: 8 },
  { monster: () => Monsters.pirate(3), difficulty: 12 },
];
