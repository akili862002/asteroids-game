import P5, { Vector } from "p5";
import { Game } from "../game";
import { IExtension } from "./extensions.type";
import { Flame } from "../entities/flame.entity";

export class FlammableExtension implements IExtension {
  name = "flammable";
  game: Game;
  count: number;
  colors: P5.Color[];

  constructor(
    game: Game,
    args: {
      count: number;
      colors: P5.Color[];
    }
  ) {
    this.game = game;
    this.count = args.count;
    this.colors = args.colors;
  }

  update() {
    // Nothing to update for base flammable
  }

  createFlames(pos: Vector, vel: Vector, heading: number): Flame[] {
    const p = this.game.getP5();
    const flames: Flame[] = [];

    for (let i = 0; i < this.count; i++) {
      // Add randomness to position
      const offsetAngle = p.random(-p.PI / 3, p.PI / 3) + heading + p.PI;
      const offsetMagnitude = p.random(0, 10);
      const flamePos = pos
        .copy()
        .add(Vector.fromAngle(offsetAngle).mult(offsetMagnitude));

      let color = this.colors[p.floor(p.random(0, this.colors.length))];

      const flame = new Flame(this.game, {
        pos: flamePos,
        heading: heading + p.random(-0.3, 0.3),
        color: color,
        sizeDecrease: p.random(0.05, 0.2),
        size: p.random(2, 6),
        vel: vel.copy().mult(1 / 15),
      });

      flames.push(flame);
      this.game.entitiesManager.addEntity(flame);
    }

    return flames;
  }
}
