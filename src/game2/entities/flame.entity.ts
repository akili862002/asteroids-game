import P5 from "p5";
import { Game } from "../game";
import { Entities, Entity, IEntity } from "./entity";
import { TransformableExtension } from "../extensions/transformable.ext";

export class Flame extends Entity implements IEntity {
  heading: number;
  color: P5.Color;
  sizeDecrease = 0.2;
  zIndex = 0;

  constructor(
    game: Game,
    args: {
      pos: P5.Vector;
      heading: number;
      color: P5.Color;
      sizeDecrease?: number;
      size?: number;
      vel?: P5.Vector;
    }
  ) {
    super(game, Entities.FLAME);

    const transformable = new TransformableExtension(game)
      .setPosition(args.pos.x, args.pos.y)
      .setHeading(args.heading)
      .setRadius(args.size || 5);
    if (args.vel) {
      transformable.setVelocity(args.vel.x, args.vel.y);
    }

    this.addExtension(transformable);

    this.color = args.color;
    this.sizeDecrease = args.sizeDecrease || 0.2;
  }

  update() {
    super.update();

    const transformable = this.getExtension(TransformableExtension);
    transformable.setRadius(transformable.radius - this.sizeDecrease);
  }

  draw() {
    const p = this.game.getP5();
    const transformable = this.getExtension(TransformableExtension);
    const { pos, heading, r } = transformable.getStates();

    p.push();
    p.noStroke();
    p.translate(pos.x, pos.y);
    p.rotate(heading);
    p.fill(this.color);
    p.rect(-r / 2, -r / 2, r, r);
    p.pop();
  }

  shouldRemove() {
    const transformable = this.getExtension(TransformableExtension);
    return transformable.radius < 0;
  }
}
