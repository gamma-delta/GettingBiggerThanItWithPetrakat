import { Consts } from "../consts.js";
import { InputState } from "../inputs.js";
import { GameState } from "../states.js";
import { drawString } from "../utils.js";
import { the_game } from "../main.js";
import type _Matter from "../include/matter.js";

declare var Matter: typeof _Matter;
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Composites = Matter.Composites,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies;

export class StateGame implements GameState {
  engine: Matter.Engine;
  render: Matter.Render;

  player: Matter.Composite;

  constructor() {
    this.engine = Engine.create();
    this.render = Render.create({
      canvas: the_game.canvas,
      engine: this.engine,
      options: {
        width: 960,
        height: 540,
      },
    });

    // create two boxes and a ground
    var boxA = Bodies.rectangle(400, 200, 80, 80);
    var boxB = Bodies.rectangle(450, 50, 80, 80);
    var ground = Bodies.rectangle(0, 530, 3000, 20, { isStatic: true });

    // add all of the bodies to the world
    this.player = makeBlob(50, 50);
    Composite.add(this.engine.world, [boxA, boxB, ground, this.player]);

    // run the renderer
    Render.run(this.render);
  }

  update(controls: InputState): GameState | null {
    if (controls.isClicked(" ")) {
      // TODO: jump
    }

    Matter.Engine.update(this.engine, 1000 / Consts.fps);
    return null;
  }

  draw(controls: InputState, ctx: CanvasRenderingContext2D) {}
}

function makeBlob(x: number, y: number) {
  let ballsAcross = 5;
  let ballSize = 20;
  let ballOpts = {
    inertia: Infinity,
    friction: 0.05,
    frictionStatic: 0.1,
    render: { visible: true },
  };
  let softBody = Composites.stack(
    x,
    y,
    ballsAcross,
    ballsAcross,
    0,
    0,
    (x: number, y: number) => Bodies.circle(x, y, ballSize, ballOpts),
  );
  Composites.mesh(softBody, ballsAcross, ballsAcross, true, {
    stiffness: 0.2,
    render: { type: "line", anchors: false },
  });

  return softBody;
}
