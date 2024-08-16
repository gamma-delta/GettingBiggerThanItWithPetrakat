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
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Constraint = Matter.Constraint,
  Vector = Matter.Vector,
  Common = Matter.Common;
interface Player {
  composite: Matter.Composite;
  membrane: Matter.Body[];
  crosses: Matter.Body[];
}

export class StateGame implements GameState {
  engine: Matter.Engine;
  render: Matter.Render;

  player: Player;

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
    let fricHigh = { friction: 0.9 };
    var boxA = Bodies.rectangle(400, 200, 80, 80, fricHigh);
    var boxB = Bodies.rectangle(450, 50, 80, 80, fricHigh);
    var ground = Bodies.rectangle(0, 530, 3000, 20, {
      isStatic: true,
      ...fricHigh,
    });

    // add all of the bodies to the world
    this.player = makePlayer(90, 50);
    Composite.add(this.engine.world, [
      boxA,
      boxB,
      ground,
      this.player.composite,
    ]);

    // run the renderer
    Render.run(this.render);
  }

  update(controls: InputState): GameState | null {
    if (controls.isPressed(" ")) {
      for (let constr of this.player.composite.constraints) {
        if (constr.label != "across") continue;

        let pointA = Constraint.pointAWorld(constr);
        let pointB = Constraint.pointBWorld(constr);
        let delta = Vector.normalise(Vector.sub(pointA, pointB));
        // The more above, the more it should be squished.
        // Pointing from B to A.
        // So squish A downwards
        if (delta.y >= 0) {
          Body.applyForce(constr.bodyA!, constr.bodyA!.position, {
            x: 0,
            y: delta.y * 0.02,
          });
          constr.bodyA!.render.strokeStyle = "#FFFF00";
        } else {
          constr.bodyA!.render.strokeStyle = "white";
        }
      }
      // Body.applyForce(this.player.center, this.player.center.position, {
      //   x: 0,
      //   y: -0.1,
      // });
    }
    let left = controls.isPressed("a");
    let right = controls.isPressed("d");
    let dTh = (left ? -1 : 0) + (right ? 1 : 0);
    if (dTh != 0) {
      // Body.setAngularVelocity(
      //   this.player.center,
      //   Body.getAngularVelocity(this.player.center) + dTh * 0.02,
      // );
    }

    Matter.Engine.update(this.engine, 1000 / Consts.fps);
    return null;
  }

  draw(controls: InputState, ctx: CanvasRenderingContext2D) {}
}

function makePlayer(x: number, y: number): Player {
  let membraneOpts = {
    friction: 0.5,
    frictionStatic: 0.1,
    restitution: 0.9,
    render: { visible: true, lineWidth: 1, strokeStyle: "white" },
    label: "membrane",
  };

  let membraneCount = 30;
  let blobRadius = 100;
  let pieceLen = 50;

  let blobOut = Composite.create();
  let crossGroup = Body.nextGroup(true);
  let membrane: Matter.Body[] = [];
  let crosses: Matter.Body[] = [];

  for (let idx = 0; idx < membraneCount; idx++) {
    let theta = (idx / membraneCount) * Math.PI * 2;
    let sin = Math.sin(theta);
    let cos = Math.cos(theta);
    let bodyHere = Bodies.circle(
      x + cos * blobRadius,
      y + sin * blobRadius,
      10,
      membraneOpts,
    );
    membrane.push(bodyHere);
  }

  Composite.add(blobOut, membrane);

  for (let idx = 0; idx < membraneCount; idx++) {
    let nIdx = (idx + 1) % membraneCount;
    let bodyHere = membrane[idx];
    Composite.add(
      blobOut,
      Constraint.create({
        bodyA: membrane[idx],
        bodyB: membrane[nIdx],
        stiffness: 1,
        label: "membrane",
      }),
    );

    if (idx < membraneCount / 2) {
      let theta = (idx / membraneCount) * Math.PI * 2;
      let thetaAcross = theta + Math.PI;
      let sin = Math.sin(theta);
      let cos = Math.cos(theta);
      let sinAcross = Math.sin(thetaAcross);
      let cosAcross = Math.cos(thetaAcross);
      let centerLen = 50;
      let center = Bodies.rectangle(x, y, centerLen, 5, {
        collisionFilter: { group: crossGroup },
        angle: theta,
      });
      crosses.push(center);

      Composite.add(
        blobOut,
        Constraint.create({
          bodyA: membrane[idx],
          bodyB: center,
          pointB: { x: (cos * centerLen) / 2, y: (sin * centerLen) / 2 },
          damping: 0.5,
          stiffness: 0.9,
          label: "across",
        }),
      );
      Composite.add(
        blobOut,
        Constraint.create({
          bodyA: membrane[(idx + membraneCount / 2) % membraneCount],
          bodyB: center,
          pointB: {
            x: (cosAcross * centerLen) / 2,
            y: (sinAcross * centerLen) / 2,
          },
          damping: 0.5,
          stiffness: 0.9,
          label: "across",
        }),
      );
    }
  }

  for (let i = 0; i < crosses.length; i++) {
    Composite.add(
      blobOut,
      Constraint.create({
        bodyA: crosses[i],
        bodyB: crosses[(i + 1) % crosses.length],
        stiffness: 1,
        length: 0,
      }),
    );
  }

  Composite.add(blobOut, crosses);

  return {
    composite: blobOut,
    membrane: membrane,
    crosses: crosses,
  };
}
