import { Color, Vector } from "p5";
import { Game } from "../game";
import { Entities, Entity } from "./entity";
import { TransformableExtension } from "../extensions/transformable.ext";

export class ExplosionSpark extends Entity {
  color: Color;
  public zIndex: number = 100;

  constructor(
    game: Game,
    args: {
      position: Vector;
      velocity: Vector;
      radius: number;
      color: Color;
      rotationSpeed: number;
    }
  ) {
    super(game, Entities.EXPLOSION_SPARK);
    this.color = args.color;
    const transformable = new TransformableExtension(game);
    transformable.setPosition(args.position.x, args.position.y);
    transformable.setVelocity(args.velocity.x, args.velocity.y);
    transformable.setRadius(args.radius);
    transformable.setRotationSpeed(args.rotationSpeed);
    transformable.setFriction(0.95);
    transformable.setRotationFriction(0.99);

    this.addExtension(transformable);
  }

  update() {
    super.update();
    const transformable = this.getExtension(TransformableExtension);
    transformable.radius -= 0.05;
  }

  draw() {
    const p = this.game.getP5();
    const transformable = this.getExtension(TransformableExtension);
    const { pos, r, heading } = transformable.getStates();

    if (r <= 0) return;

    p.push();
    p.translate(pos.x, pos.y);
    p.imageMode(p.CENTER);
    p.fill(this.color);
    p.rotate(heading);
    p.rect(0, 0, r, r);
    p.pop();
  }

  shouldRemove(): boolean {
    return this.getExtension(TransformableExtension).radius <= 0;
  }
}
