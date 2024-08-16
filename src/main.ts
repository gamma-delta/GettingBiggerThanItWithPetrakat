import { RollPlayingGame } from "./game.js";
import { InputState } from "./inputs.js";
import { Consts } from "./consts.js";

("use strict");

const elmCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const globals = new RollPlayingGame(elmCanvas);
const controls = new InputState();

window.addEventListener("keydown", (ev) => controls.registerKeydown(ev.key));
window.addEventListener("keyup", (ev) => controls.registerKeyup(ev.key));
elmCanvas.addEventListener("mousedown", (ev) => controls.registerMouseDown());
elmCanvas.addEventListener("mouseup", (ev) => controls.registerMouseUp());
elmCanvas.addEventListener("mousemove", (ev) => controls.registerMouseMove(ev));

function mainLoop() {
  controls.update();
  // console.log(controls);

  globals.update(controls);
  globals.draw(controls);
}

// Main loop!
window.setInterval(mainLoop, 1000 / Consts.fps);
