import { Assets } from "./assets.js";

const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 8;
const KERNING_X = 0;
const KERNING_Y = 2;

export const Consts = {
  fps: 120,

  CANVAS_SCALE: 1920 / 1080,

  CHAR_WIDTH,
  CHAR_HEIGHT,
  KERNING_X,
  KERNING_Y,

  BG_COLOR: "#ede6d5",
  PINK_LINE_COLOR: "#f4887c",
  BLUE_LINE_COLOR: "#acd8f1",
  PENCIL_COLOR: "#494d47",
  HORIZ_LINE_SPACING: CHAR_HEIGHT + KERNING_Y,
  VERT_LINE_OFFSET: CHAR_WIDTH * 2,

  MUSIC_VOLUME: 0.2,
};

export const GameAudio: {
  initialized: boolean;
  ctx: AudioContext;

  bgMusic: HTMLAudioElement;
  trackBgMusic: MediaElementAudioSourceNode;
  bgGainNode: GainNode;
} = {
  initialized: false,
  ctx: null!,

  bgMusic: null!,
  trackBgMusic: null!,

  bgGainNode: null!,
};
export function initAudio() {
  if (GameAudio.initialized) return;

  const anyWindow = window as any;
  const AudioContext = anyWindow.AudioContext || anyWindow.webkitAudioContext;
  GameAudio.ctx = new AudioContext();
  if (GameAudio.ctx.state === "suspended") {
    GameAudio.ctx.resume();
  }
  GameAudio.bgMusic = Assets.audio.bgMusic.cloneNode(true) as HTMLAudioElement;
  GameAudio.trackBgMusic = GameAudio.ctx.createMediaElementSource(
    GameAudio.bgMusic,
  );
  // Make it a bit quieter
  GameAudio.bgGainNode = GameAudio.ctx.createGain();
  GameAudio.bgGainNode.gain.value = Consts.MUSIC_VOLUME;
  GameAudio.trackBgMusic
    .connect(GameAudio.bgGainNode)
    .connect(GameAudio.ctx.destination);

  // Loop the bg music
  if (typeof GameAudio.bgMusic.loop == "boolean") GameAudio.bgMusic.loop = true;
  else
    GameAudio.bgMusic.addEventListener(
      "ended",
      () => {
        GameAudio.bgMusic.currentTime = 0;
        GameAudio.bgMusic.play();
      },
      false,
    );
  GameAudio.bgMusic.play();

  GameAudio.initialized = true;
}
