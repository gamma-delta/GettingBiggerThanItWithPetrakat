import { Consts, GameAudio } from "./consts.js";

const sfxAudios: HTMLAudioElement[] = [];
export const Assets = {
  textures: {
    font: image("font"),
    numberFont: image("number_font"),
    diceAtlas: image("dice"),

    monodron: image("monsters/monodron"),
    duodron: image("monsters/duodron"),
    tridron: image("monsters/tridron"),
    quadron: image("monsters/quadron"),
    pentadron: image("monsters/pentadron"),
    cobbleGoblin: image("monsters/goblin"),
    goblinLord: image("monsters/goblin_lord"),
    gelatinousSquare: image("monsters/gelatinous_square"),
    gelatinousCube: image("monsters/gelatinous_cube"),
    dragon: image("monsters/dragon"),
    highdra: image("monsters/highdra"),
    succubus: image("monsters/succubus"),
    incubus: image("monsters/incubus"),
    birate: image("monsters/birate"),
    trirate: image("monsters/trirate"),
    ninja: image("monsters/masterful_ninja"),

    potionHealing: image("items/healing"),
    potionHealing2: image("items/greater_healing"),
    potionLuck: image("items/luck"),
    potionLuck2: image("items/greater_luck"),
    modronCore: image("items/modron_core"),
    doubloon: image("items/doubloon"),
    trebloon: image("items/trebloon"),
    horn: image("items/horn"),
    tail: image("items/tail"),
    highdraHead: image("items/highdra_head"),

    treasureChest: image("treasure_chest"),
  },
  audio: {
    bgMusic: audio("dicejam.mp3", false),
    silence: audio("silence.ogg"),

    modronEnter: audio("modron_enter.ogg"),
    modronDie: audio("modron_die.ogg"),
    modronWin: audio("modron_win.ogg"),
    gelatinEnter: audio("gelatin_enter.ogg"),
    gelatinDie: audio("gelatin_die.ogg"),
    gelatinWin: audio("gelatin_win.ogg"),
    goblinEnter: audio("goblin_enter.ogg"),
    goblinDie: audio("goblin_die.ogg"),
    goblinWin: audio("goblin_win.ogg"),
    dragonEnter: audio("dragon_enter.ogg"),
    dragonDie: audio("dragon_die.ogg"),
    dragonWin: audio("dragon_win.ogg"),
    pirateEnter: audio("pirate_enter.ogg"),
    pirateDie: audio("pirate_die.ogg"),
    pirateWin: audio("pirate_win.ogg"),
    demonEnter: audio("demon_enter.ogg"),
    demonDie: audio("demon_die.ogg"),
    demonWin: audio("demon_win.ogg"),

    treasureChest: audio("treasure_chest.ogg"),
    diceRoll: audio("diceroll.ogg"),

    toggleSfx() {
      for (let sfx of sfxAudios) {
        sfx.muted = !sfx.muted;
      }
    },
    toggleMusic() {
      if (GameAudio.bgGainNode.gain.value <= 0.0001) {
        GameAudio.bgGainNode.gain.value = Consts.MUSIC_VOLUME;
      } else {
        GameAudio.bgGainNode.gain.value = 0.0;
      }
    },
  },
};

function image(url: string) {
  let img = new Image();
  img.src = "assets/textures/" + url + ".png";
  return img;
}

function audio(url: string, sfx: boolean = true) {
  let audio = new Audio();
  audio.src = "assets/audio/" + url;
  if (sfx) {
    (audio as any).preservesPitch = false;
    sfxAudios.push(audio);
  }
  return audio;
}
