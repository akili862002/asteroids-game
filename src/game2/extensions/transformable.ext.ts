import { Vector } from "p5";
import { IExtension } from "./extensions.type";
import { Game } from "../game";

export class TransformableExtension implements IExtension {
  name = "transformable";

  radius = 0;
  position = new Vector(0, 0);
  velocity = new Vector(0, 0);
  acceleration = new Vector(0, 0);
  heading = 0;
  rotationDental = 0;
  rotationFriction = 1;
  friction = 1;
  maxSpeed = Infinity;
  game: Game;
  maxRotation = 0.1;

  constructor(game: Game) {
    this.game = game;
  }

  public update() {
    // Update heading based on rotation
    this.rotationDental *= this.rotationFriction; // Dampen rotation
    if (Math.abs(this.rotationDental) > this.maxRotation) {
      this.rotationDental = this.maxRotation * Math.sign(this.rotationDental);
    }

    this.heading += this.rotationDental;

    // Apply physics
    this.velocity.add(this.acceleration);
    this.velocity.mult(this.friction);

    this.rotationDental *= this.rotationFriction;

    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    // Reset acceleration
    this.acceleration.mult(0);

    this.edges();
  }

  public addForce(force: Vector) {
    this.acceleration.add(force);
    return this;
  }

  public applyImpulse(impulse: Vector) {
    this.velocity.add(impulse);
    return this;
  }

  public setPosition(x: number, y: number) {
    this.position.set(x, y);
    return this;
  }

  public setVelocity(x: number, y: number) {
    this.velocity.set(x, y);
    return this;
  }

  public setHeading(heading: number) {
    this.heading = heading;
    return this;
  }

  public setRotationSpeed(rotationSpeed: number) {
    this.rotationDental = rotationSpeed;
    return this;
  }

  public addRotation(rotation: number) {
    this.rotationDental += rotation;
    return this;
  }

  public setRotationFriction(friction: number) {
    this.rotationFriction = friction;
    return this;
  }

  public setFriction(friction: number) {
    this.friction = friction;
    return this;
  }

  public setMaxSpeed(maxSpeed: number) {
    this.maxSpeed = maxSpeed;
    return this;
  }

  public setRadius(radius: number) {
    this.radius = radius;
    return this;
  }

  private edges() {
    const pos = this.position;
    const p = this.game.getP5();

    // Wrap around edges of canvas with momentum preservation
    if (pos.x < -this.radius) {
      pos.x = p.width + this.radius;
    } else if (pos.x > p.width + this.radius) {
      pos.x = -this.radius;
    }

    if (pos.y < -this.radius) {
      pos.y = p.height + this.radius;
    } else if (pos.y > p.height + this.radius) {
      pos.y = -this.radius;
    }
  }

  public getStates() {
    return {
      pos: this.position,
      vel: this.velocity,
      acc: this.acceleration,
      heading: this.heading,
      rotationSpeed: this.rotationDental,
      friction: this.friction,
      maxSpeed: this.maxSpeed,
      r: this.radius,
    };
  }
}
