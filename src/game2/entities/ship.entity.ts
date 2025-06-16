import P5, { Vector } from "p5";
import { TransformableExtension } from "../extensions/transformable.ext";
import { Game } from "../game";
import { Entities, Entity } from "./entity";
import { CollisionalExtension } from "../extensions/collisional.ext";
import { DEBUG, SHIP_BOOST_FORCE, SHIP_INVINCIBLE_TIME } from "@/game/config";
import { Bullet } from "./bullet.entity";
import { FlammableExtension } from "../extensions/flammable.ext";

export class Ship extends Entity {
  invincible: boolean = false;
  invincibleTimer: number = 0;
  lastShootTime: number = 0;
  shipImage: P5.Image;
  isDead: boolean = false;
  shootCooldown = 300;
  knockbackForce = 0.5;
  bulletSpeed = 10;
  zIndex = 0;

  constructor(game: Game) {
    super(game, Entities.SHIP);

    const p = this.game.getP5();
    this.shipImage = p.loadImage("/game/ship.png");
    this.invincible = true;
    this.invincibleTimer = SHIP_INVINCIBLE_TIME;

    const transformable = new TransformableExtension(this.game)
      .setPosition(p.width / 2, p.height / 2)
      .setFriction(0.99)
      .setRadius(24)
      .setHeading(-p.PI / 2)
      .setRotationFriction(0.95);
    this.addExtension(transformable);

    const collisional = new CollisionalExtension(this.game, transformable);
    this.addExtension(collisional);

    const flammable = new FlammableExtension(this.game, {
      count: 5,
      colors: [p.color("#00e7ff")],
    });
    this.addExtension(flammable);
  }

  reborn() {
    this.isDead = false;
    this.invincible = true;
    this.invincibleTimer = SHIP_INVINCIBLE_TIME;
    const p = this.game.getP5();
    const transformable = this.getExtension(TransformableExtension);
    transformable.setPosition(p.width / 2, p.height / 2);
    transformable
      .setHeading(-p.PI / 2)
      .setVelocity(0, 0)
      .setRotationSpeed(0);
  }

  update() {
    super.update();

    if (this.invincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }
  }

  draw() {
    if (this.isDead) return;

    const p = this.game.getP5();
    const transformable = this.getExtension(TransformableExtension);
    const { pos, heading, r } = transformable.getStates();

    p.push();
    p.translate(pos.x, pos.y);
    p.rotate(heading + p.PI / 2); // Add PI/2 to make the ship point up

    // Flash if invincible
    if (this.invincible && p.frameCount % 10 < 5) {
      p.tint(255, 150); // Semi-transparent
    }

    p.imageMode(p.CENTER);
    const width = r * 2;
    const aspect = 1;
    const height = width / aspect;
    p.image(this.shipImage, 0, 0, width, height);

    p.pop();

    if (DEBUG) {
      p.push();
      p.noFill();
      p.stroke(0, 200, 0);
      p.circle(pos.x, pos.y, r * 2);
      p.pop();
    }
  }

  boost() {
    if (this.isDead) return;

    const transformable = this.getExtension(TransformableExtension);

    const force = Vector.fromAngle(transformable.heading).setMag(
      SHIP_BOOST_FORCE
    );
    transformable.addForce(force);

    this.createFlames();
  }

  createFlames() {
    const p = this.game.getP5();
    const transformable = this.getExtension(TransformableExtension);
    const { pos, heading, r, vel } = transformable.getStates();

    // Get position behind the ship
    const shipBackPos = pos
      .copy()
      .add(Vector.fromAngle(heading + p.PI).mult(r * 0.9));

    const flammable = this.getExtension(FlammableExtension);
    flammable.createFlames(shipBackPos, vel, heading);
  }

  die() {
    this.isDead = true;
  }

  addRotation(rotation: number) {
    const transformable = this.getExtension(TransformableExtension);
    transformable.addRotation(rotation);
  }

  checkIsDead(): boolean {
    return this.isDead;
  }

  applyKnockback(heading: number) {
    const transformable = this.getExtension(TransformableExtension);
    const knockbackForce = Vector.fromAngle(heading)
      .mult(-1)
      .setMag(this.knockbackForce);
    transformable.addForce(knockbackForce);
  }

  shoot() {
    if (this.isDead) return;

    const transformable = this.getExtension(TransformableExtension);
    const now = this.game.getP5().millis();
    if (now - this.lastShootTime < this.shootCooldown) return;
    this.lastShootTime = now;

    this.applyKnockback(transformable.heading);

    const bulletPos = Vector.fromAngle(transformable.heading)
      .mult(transformable.radius)
      .add(transformable.position);

    const bulletVel = Vector.fromAngle(transformable.heading).setMag(
      this.bulletSpeed
    );
    bulletVel.add(transformable.velocity);

    const bullet = new Bullet(this.game, {
      position: bulletPos,
      velocity: bulletVel,
    });

    return [bullet];
  }

  getPosition(): Vector {
    return this.getExtension(TransformableExtension).getStates().pos;
  }

  getVelocity(): Vector {
    return this.getExtension(TransformableExtension).getStates().vel;
  }
}
