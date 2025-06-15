import { Color, Vector } from "p5";
import { TransformableExtension } from "../extensions/transformable.ext";
import { Game } from "../game";
import { Entities, Entity } from "./entity";
import { CollisionalExtension } from "../extensions/collisional.ext";

export class Bullet extends Entity {
  private fillColor: Color;
  private lifespan = 70;

  constructor(
    game: Game,
    args: {
      position: Vector;
      velocity: Vector;
    }
  ) {
    super(game, Entities.BULLET);

    const p = this.game.getP5();
    this.fillColor = p.color("#74EFF8");

    const transformable = new TransformableExtension(this.game)
      .setPosition(args.position.x, args.position.y)
      .setVelocity(args.velocity.x, args.velocity.y)
      .setRadius(3);
    this.addExtension(transformable);

    const collisional = new CollisionalExtension(this.game, transformable);
    this.addExtension(collisional);
  }

  update() {
    super.update();
    this.lifespan--;
  }

  draw() {
    const p = this.game.getP5();
    const transformable = this.getExtension(TransformableExtension);

    p.push();
    p.stroke(this.fillColor);
    p.strokeWeight(3);
    const scale = 2;
    p.line(
      transformable.position.x,
      transformable.position.y,
      transformable.position.x - transformable.velocity.x * scale,
      transformable.position.y - transformable.velocity.y * scale
    );

    p.noStroke();
    p.fill(this.fillColor);
    p.circle(
      transformable.position.x,
      transformable.position.y,
      transformable.radius * 2
    );
    p.pop();
  }

  getVelocity() {
    return this.getExtension(TransformableExtension).velocity;
  }

  shouldRemove() {
    return this.lifespan <= 0;
  }
}
