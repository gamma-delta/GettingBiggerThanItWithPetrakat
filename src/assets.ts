import { Consts, GameAudio } from "./consts.js";

import type _Matter from "include/matter.js";
declare var Matter: typeof _Matter;

var Engine = Matter.Engine,
  Svg = Matter.Svg
  ;

const sfxAudios: HTMLAudioElement[] = [];
export const Assets = {
  textures: {
  },
  audio: {
    bgMusic: audio("dicejam.mp3", false),
    silence: audio("silence.ogg"),

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

  worldSvg: Document = null!,
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

fetch("assets/world.svg")
  .then(r => r.text())
  .then(svgSource => {
    let doc = (new window.DOMParser()).parseFromString(svgSource, "image/svg+xml");

    //@ts-ignore
    Assets.worldSvg = doc;
  });
