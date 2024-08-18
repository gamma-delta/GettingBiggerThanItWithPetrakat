import { Consts } from "../consts.js";
import { InputState } from "../inputs.js";
import { GameState } from "../states.js";
import { getTfRecursive, tfMatterVec } from "../utils.js";
import { the_game } from "../main.js";
import type _Matter from "../include/matter.js";
import { MEMBRANE_CELL_RADIUS, Player } from "../player.js";
import { Assets } from "../assets.js";

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
  Bounds = Matter.Bounds,
  Svg = Matter.Svg,
  Vertices = Matter.Vertices
  ;

declare var decomp: any;
// wait until it's all loaded
window.addEventListener("load", () => {
  Matter.Common.setDecomp(decomp);
});

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
        width: 1920,
        height: 1080,
        wireframes: false,
        hasBounds: true,
      },
    });

    this.player = new Player(this.engine, 20, 0, 0);
    Composite.add(this.engine.world, [
      this.player.composite,
    ]);
    this.parseWorldSvg();

    // run the renderer
    Render.run(this.render);
  }

  update(controls: InputState): GameState | null {
    this.player.update(controls, this.engine.timing.lastDelta / 1000);

    Matter.Engine.update(this.engine, 1000 / Consts.fps);

    let boundsSz =
      Vector.sub(this.render.bounds.max, this.render.bounds.min);
    Bounds.shift(
      this.render.bounds,
      Vector.sub(this.player.cameraFloating, Vector.div(boundsSz, 2)));

    return null;
  }

  draw(controls: InputState, ctx: CanvasRenderingContext2D) { }

  parseWorldSvg() {
    function select(root: Document, selector: string): Element[] {
      return Array.prototype.slice.call(root.querySelectorAll(selector));
    };
    function svgGetNum(prop: SVGAnimatedLength): number {
      return prop.baseVal.value;
    }

    let vertSets = [];
    for (let elt of select(Assets.worldSvg, "*")) {
      if (!(elt instanceof SVGElement)) {
        console.log("not svg???");
        continue;
      }

      if (elt.style.stroke == "rgb(255, 255, 255)") {
        let verts = null;
        if (elt instanceof SVGPathElement) {
          verts = Svg.pathToVertices(elt, 30)
            .map(vector => {
              let v2 = tfMatterVec(vector, getTfRecursive(elt));
              return v2;
            });
        } else if (elt instanceof SVGRectElement) {
          let x1 = svgGetNum(elt.x);
          let y1 = svgGetNum(elt.y);
          let x2 = x1 + svgGetNum(elt.width);
          let y2 = y1 + svgGetNum(elt.height);
          let out = [
            { x: x1, y: y1 },
            { x: x1, y: y2 },
            { x: x2, y: y2 },
            { x: x2, y: y1 },
          ];
          let outTf = out.map(v => {
            return tfMatterVec(v, getTfRecursive(elt));
          });
          verts = outTf;
        } else {
          console.warn(`Can't process elements of type ${elt.tagName}`);
        }
        if (verts != null) {
          vertSets.push(verts);
        }
      } else if (elt instanceof SVGCircleElement) {
        let rawPt = { x: svgGetNum(elt.cx), y: svgGetNum(elt.cy) };
        let pt = tfMatterVec(rawPt, getTfRecursive(elt));
        let usePt = pt;
        if (elt.id == "player-start") {
          console.log("placing player", usePt, elt);
          Composite.translate(
            this.player.composite,
            usePt,
            true
          );
        }
      }
    }

    let body =
      betterFromVertices(0, 0, vertSets, {
        isStatic: true,
        friction: 1.0,
        render: {
          strokeStyle: "#9090B0",
          fillStyle: "#14151f",
          lineWidth: 4,
        },
        label: "ground",
      });
    console.log(body);
    Composite.add(this.engine.world, body);
  }
}


function betterFromVertices(x: number, y: number, pointSets: Matter.Vector[][], options: Matter.IBodyDefinition) {
  var decomp = Common.getDecomp(),
    canDecomp,
    body,
    isConvex,
    isConcave,
    vertices,
    i,
    j,
    k,
    v,
    z;

  // check decomp is as expected
  canDecomp = Boolean(decomp && decomp.quickDecomp);

  options = options || {};
  let parts: Matter.IBodyDefinition[] = [];

  var flagInternal = false;
  var removeCollinear = false;
  var minimumArea = 0;
  var removeDuplicatePoints = false;

  for (v = 0; v < pointSets.length; v += 1) {
    let points = pointSets[v];
    isConvex = Vertices.isConvex(points);
    isConcave = !isConvex;

    if (isConcave && !canDecomp) {
      Common.warnOnce(
        'Bodies.fromVertices: Install the \'poly-decomp\' library and use Common.setDecomp or provide \'decomp\' as a global to decompose concave vertices.'
      );
    }

    if (isConvex || !canDecomp) {
      let verts;
      if (isConvex) {
        verts = Vertices.clockwiseSort(points);
      } else {
        // fallback to convex hull when decomposition is not possible
        // verts = Vertices.hull(points);
      }

      parts.push({
        position: Vertices.centre(verts as any),
        vertices: verts
      });
    } else {
      // initialise a decomposition
      var concave = points.map(function(vertex) {
        return [vertex.x, vertex.y];
      });

      // vertices are concave and simple, we can decompose into parts
      decomp.makeCCW(concave);
      if (removeCollinear !== false)
        decomp.removeCollinearPoints(concave, removeCollinear);
      if (removeDuplicatePoints !== false && decomp.removeDuplicatePoints)
        decomp.removeDuplicatePoints(concave, removeDuplicatePoints);

      // use the quick decomposition algorithm (Bayazit)
      var decomposed = decomp.quickDecomp(concave);

      // for each decomposed chunk
      for (i = 0; i < decomposed.length; i++) {
        var chunk = decomposed[i];

        // convert vertices into the correct structure
        var chunkVertices: Matter.Vector[] = chunk.map(function(vertices: any) {
          return {
            x: vertices[0],
            y: vertices[1]
          };
        });

        // skip small chunks
        if (minimumArea > 0 && Vertices.area(chunkVertices, false) < minimumArea)
          continue;

        // create a compound part
        parts.push({
          position: { x: 0, y: 0 },
          vertices: chunkVertices
        });
      }
    }
  }

  // create body parts
  let subBodies = [];
  console.log(parts);
  for (i = 0; i < parts.length; i++) {
    subBodies.push(Body.create(Common.extend(parts[i], options as any)));
  }

  if (subBodies.length > 1) {
    // create the parent body to be returned, that contains generated compound parts
    body = Body.create({ parts: subBodies.slice(0), ...options });

    // offset such that body.position is at the centre off mass
    // Body.setPosition(body, { x: x, y: y });

    return body;
  } else {
    return subBodies[0];
  }
};
