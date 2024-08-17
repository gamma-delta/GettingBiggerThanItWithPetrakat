import type _Matter from "include/matter.js";
import { InputState } from "./inputs.js";
import { clamp } from "./utils.js";

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
  Common = Matter.Common,
  World = Matter.World
  ;

export const MEMBRANE_CELL_RADIUS = 5;
export const MEMBRANE_CELL_DIST = 12;

export const JUMP_WINDDOWN_TIME = 0.7;

const MEMBRANE_CONSTR_OPTS: Matter.IConstraintDefinition = {
  stiffness: 0.9,
  damping: 0.03,
  length: MEMBRANE_CELL_DIST,
  label: "membrane",
  render: { type: "line" },
};

export class Player {
  world: Matter.World;

  jumpHeld: boolean;
  // goes from 0 to 1
  jumpWindDown: number;

  composite: Matter.Composite;
  membrane: Matter.Body[];
  center: Matter.Body;
  membraneConstraints: Matter.Constraint[];
  crossConstraints: Matter.Constraint[];
  centerToCOMConstraint: Matter.Constraint;

  cameraFloating: Matter.Vector;

  constructor(world: Matter.World, membraneCount: number, x: number, y: number) {
    this.jumpHeld = false;
    this.jumpWindDown = 0;
    this.world = world;
    this.cameraFloating = { x, y };

    this.composite = Composite.create();
    let radius = this.radius(membraneCount);
    this.center = Bodies.circle(x, y, MEMBRANE_CELL_DIST * 1.2, {
      density: 0.003,
      render: {
        fillStyle: "#E03020",
      }
    });
    Composite.add(this.composite, this.center);

    let membGroup = Body.nextGroup(true);
    this.membrane = [];
    for (let idx = 0; idx < membraneCount; idx++) {
      let theta = (idx / membraneCount) * Math.PI * 2;
      let sin = Math.sin(theta);
      let cos = Math.cos(theta);
      let bodyHere = makeMembranePart(
        x + cos * this.radius(membraneCount),
        y + sin * this.radius(membraneCount),
      );
      this.membrane.push(bodyHere);
    }

    Composite.add(this.composite, this.membrane);

    this.membraneConstraints = [];
    this.crossConstraints = [];
    for (let idx = 0; idx < membraneCount; idx++) {
      let nIdx = (idx + 1) % membraneCount;
      let memb =
        Constraint.create({
          bodyA: this.membrane[idx],
          bodyB: this.membrane[nIdx],
          ...MEMBRANE_CONSTR_OPTS,
        }); Composite.add(
          this.composite,
          memb,
        );
      this.membraneConstraints.push(memb);

      let cross =
        Constraint.create({
          bodyA: this.membrane[idx],
          bodyB: this.center,
          ...crossConstrParts(this.radius()),
        });
      Composite.add(
        this.composite,
        cross,
      );
      this.crossConstraints.push(cross);
    }

    Composite.add(this.composite, this.membraneConstraints);
    Composite.add(this.composite, this.crossConstraints);

    this.centerToCOMConstraint = Constraint.create({
      bodyA: this.center,
      pointB: { x, y },
      stiffness: 0.5,
      damping: 1,
      length: 0,
    });
  }

  radius(membraneCount: number = this.membrane.length): number {
    let circumference = membraneCount * MEMBRANE_CELL_DIST;
    return circumference / Math.PI / 2;
  }

  addToMembrane() {
    // Place it just inside the junction between the first and last.
    let oldConstr = this.membraneConstraints.pop()!;
    let first = oldConstr.bodyA!;
    let second = oldConstr.bodyB!;
    let pos = Vector.div(Vector.add(first.position, second.position), 2);
    let newPart = makeMembranePart(pos.x, pos.y);
    this.membrane.push(newPart);
    Composite.add(this.composite, newPart);

    // Add new constraints
    let firstToNew = Constraint.create({
      bodyA: first,
      bodyB: newPart,
      ...MEMBRANE_CONSTR_OPTS,
    });
    this.membraneConstraints.push(firstToNew);
    let newToSecond = Constraint.create({
      bodyA: newPart,
      bodyB: second,
      ...MEMBRANE_CONSTR_OPTS,
    });
    let news =
      [firstToNew, newToSecond];
    this.membraneConstraints.push(...news);
    let newToCenter = Constraint.create({
      bodyA: newPart,
      bodyB: this.center,
      ...crossConstrParts(this.radius()),
    });
    this.crossConstraints.push(newToCenter);
    Composite.add(this.composite, news);
    Composite.add(this.composite, newToCenter);

    Composite.remove(this.composite, oldConstr, true);
    World.remove(this.world, oldConstr, true);

    let scale = this.membrane.length / (this.membrane.length - 1);
    Body.scale(this.center, scale, scale);
    Body.setDensity(this.center, this.center.density / scale);
  }

  update(controls: InputState, dt: number) {
    let chargeJump = controls.isPressed(" ");
    let jumpReleased = this.jumpHeld && !chargeJump;
    if (jumpReleased) {
      this.jumpWindDown = 1;
    }

    let squishSidewaysAmount;
    if (chargeJump) {
      squishSidewaysAmount = 0.5;
    } else {
      squishSidewaysAmount = -this.jumpWindDown * 1.25;
      if (this.jumpWindDown == 0) {
        squishSidewaysAmount += controls.isPressed("w")
          ? -0.5 : 0;
      }
    }

    let left = controls.isPressed("a");
    let right = controls.isPressed("d");
    let moveDx = (left ? -1 : 0) + (right ? 1 : 0);

    for (let constr of this.crossConstraints) {
      let length = this.radius();

      let pointA = Constraint.pointAWorld(constr);
      let bodyPos = this.center.position;
      let deltaFromBody = Vector.normalise(Vector.sub(pointA, bodyPos));
      let deltaDx = Math.abs(deltaFromBody.x);
      let deltaDy = Math.abs(deltaFromBody.y);

      // Make the vertical constraints smaller and horz constraints
      // larger
      length -= squishSidewaysAmount * deltaDy * this.radius();
      length += squishSidewaysAmount * deltaDx * this.radius() * 0.5;

      // Make constraints on the move side shrink
      // and constraints on the other side grow
      length -= (moveDx * deltaFromBody.x) * this.radius() * 0.35;

      // Press F to inflate
      if (controls.isPressed("f")) {
        length += MEMBRANE_CELL_DIST * 2;
      }

      constr.length = length;

      let r = 1, g = 1, b = 1;
      let howMuchLonger = (length / this.radius()) - 1;
      if (howMuchLonger > 0) {
        // Blue for expanding
        r -= howMuchLonger;
        g -= howMuchLonger;
      } else {
        // Red for contracting
        g += howMuchLonger;
        b += howMuchLonger;
      }
      r = clamp(r, 0, 1);
      g = clamp(g, 0, 1);
      b = clamp(b, 0, 1);
      constr.bodyA!.render.fillStyle = `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
    }

    if (controls.isClicked("b")) {
      this.addToMembrane();
    }

    let com = { x: 0, y: 0 };
    for (let membr of this.membrane) {
      com = Vector.add(com, membr.position)
    }
    com = Vector.div(com, this.membrane.length);
    this.centerToCOMConstraint.pointB = com;

    let cameraTarget = Vector.add(this.center.position,
      { x: moveDx * 2, y: 0 });
    this.cameraFloating =
      Vector.div(Vector.add(this.cameraFloating, cameraTarget), 2);

    if (this.jumpWindDown > 0) {
      this.jumpWindDown = Math.max(0, this.jumpWindDown - dt / JUMP_WINDDOWN_TIME)
    }
    this.jumpHeld = chargeJump;

    console.log(this.radius());
  }
}

function makeMembranePart(x: number, y: number): Matter.Body {
  return Bodies.circle(
    x, y,
    MEMBRANE_CELL_RADIUS,
    {
      friction: 0.9,
      frictionStatic: 0.5,
      restitution: 0.9,
      render: { visible: true, lineWidth: 0, fillStyle: "white" },
      label: "membrane",
    }
  )
}

function crossConstrParts(radius: number): Matter.IConstraintDefinition {
  return {
    stiffness: 0.03,
    damping: 0.1,
    length: radius,
    label: "cross",
    render: { visible: false }
  };
}
