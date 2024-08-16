import { GettingBiggerThanIt } from "./game.js";
import { InputState } from "./inputs.js";
import { Consts } from "./consts.js";

("use strict");

const elmCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
export const the_game = new GettingBiggerThanIt(elmCanvas);
const controls = new InputState();

window.addEventListener("keydown", (ev) => controls.registerKeydown(ev.key));
window.addEventListener("keyup", (ev) => controls.registerKeyup(ev.key));
elmCanvas.addEventListener("mousedown", (ev) => controls.registerMouseDown());
elmCanvas.addEventListener("mouseup", (ev) => controls.registerMouseUp());
elmCanvas.addEventListener("mousemove", (ev) => controls.registerMouseMove(ev));

function mainLoop() {
  controls.update();
  // console.log(controls);

  the_game.update(controls);
  the_game.draw(controls);
}

// Main loop!
window.setInterval(mainLoop, 1000 / Consts.fps);
