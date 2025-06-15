import P5, { Vector } from "p5";
import { Game } from "../game";
import { Entities, Entity, IEntity } from "./entity";
import { TransformableExtension } from "../extensions/transformable.ext";
import {
  ROCKET_LIFESPAN,
  ROCKET_MAX_SPEED,
  ROCKET_STEER_FORCE,
} from "@/game/config";
import { FlammableExtension } from "../extensions/flammable.ext";
import { CollisionalExtension } from "../extensions/collisional.ext";

export class Rocket extends Entity implements IEntity {
  lifespan: number;
  allowLaunch: boolean;
  rocketImg: P5.Image;
  maxSpeed = ROCKET_MAX_SPEED;
  trackingForce = ROCKET_STEER_FORCE;

  constructor(
    game: Game,
    args: {
      x: number;
      y: number;
      lifespan?: number;
    }
  ) {
    super(game, Entities.FLAME);
    const radius = 4;
    this.lifespan = args.lifespan || ROCKET_LIFESPAN;
    this.allowLaunch = false;
    const p5 = game.getP5();
    this.rocketImg = p5.loadImage("/game/rocket.png");

    const transformable = new TransformableExtension(game)
      .setPosition(args.x, args.y)
      .setRadius(radius);

    this.addExtension(transformable);

    const collisional = new CollisionalExtension(game, transformable);
    this.addExtension(collisional);

    const flammable = new FlammableExtension(game, {
      count: 5,
      colors: [p5.color("#FB511C"), p5.color("#F9C630"), p5.color("#FCF6B4")],
    });
    this.addExtension(flammable);
  }

  update() {
    const ship = this.game.entitiesManager.getShip();
    if (ship && !ship.isDead) {
      this.tracking(ship.getPosition());
    }

    if (this.allowLaunch && ship) {
      super.update();
    }

    this.lifespan--;
    const allowedLaunchTime = 60 * 3;
    if (this.lifespan < ROCKET_LIFESPAN - allowedLaunchTime) {
      this.allowLaunch = true;
    }
  }

  draw() {
    const p = this.game.getP5();
    const transformable = this.getExtension(TransformableExtension);
    const { pos, vel } = transformable.getStates();

    p.push();
    p.translate(pos.x, pos.y);
    const angle = vel.heading() + p.PI / 2;
    p.rotate(angle);

    if (!this.allowLaunch) {
      const pulseAmount = p.sin(p.frameCount * 0.1);

      const alpha = p.map(pulseAmount, -1, 1, 0, 150);
      const circleSize = p.map(-pulseAmount, -1, 1, 40, 50);

      p.fill(255, 69, 90, alpha);
      p.circle(0, 0, circleSize);
    }

    p.imageMode(p.CENTER);
    p.image(this.rocketImg, 0, 0, 30, 30);

    p.pop();
  }

  tracking(target: Vector) {
    const transformable = this.getExtension(TransformableExtension);
    const { vel, pos } = transformable.getStates();

    const desired = Vector.sub(target, pos);
    desired.setMag(this.maxSpeed);
    const steer = Vector.sub(desired, vel);
    steer.limit(this.trackingForce);

    vel.add(steer);

    if (this.allowLaunch) {
      this.createFlames();
    }
  }

  createFlames() {
    const p = this.game.getP5();
    const flammable = this.getExtension(FlammableExtension);
    const transformable = this.getExtension(TransformableExtension);
    const { vel, r } = transformable.getStates();

    const pos = transformable
      .getStates()
      .pos.copy()
      .add(Vector.fromAngle(vel.heading() + p.PI).mult(r * r));

    flammable.createFlames(pos, vel, vel.heading());
  }

  shouldRemove() {
    return this.lifespan <= 0;
  }
}
