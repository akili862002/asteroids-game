import { Color, Vector } from "p5";
import { TransformableExtension } from "../extensions/transformable.ext";
import { Game } from "../game";
import { Entities, Entity } from "./entity";
import { DEBUG } from "@/game/config";
import { CollisionalExtension } from "../extensions/collisional.ext";
import { Bullet } from "./bullet.entity";

export class Asteroid extends Entity {
  private vertices: Vector[] = [];
  private radius: number;
  private strokeColor: Color;
  private fillColor: Color;
  zIndex = 1;

  constructor(
    game: Game,
    args: {
      x: number;
      y: number;
      radius: number;
      vel?: Vector;
    }
  ) {
    super(game, Entities.ASTEROID);

    const p = this.game.getP5();

    this.radius = args.radius;
    this.strokeColor = p.color("#FDC271");
    this.fillColor = p.color("#241f17");

    // Random velocity based on size (smaller = faster)
    const speed = p.map(this.radius, 20, 80, 2.5, 1.2);
    const vel = args.vel || Vector.random2D().mult(speed);
    const rotationSpeed = p.random(-0.03, 0.03);

    const transformable = new TransformableExtension(this.game)
      .setPosition(args.x, args.y)
      .setVelocity(vel.x, vel.y)
      .setFriction(1)
      .setRotationSpeed(rotationSpeed)
      .setRadius(this.radius);
    this.addExtension(transformable);

    const collisional = new CollisionalExtension(this.game, transformable);
    this.addExtension(collisional);

    this.createVertices();
  }

  update() {
    super.update();
  }

  draw() {
    const p = this.game.getP5();
    const transformable = this.getExtension(
      TransformableExtension
    ) as TransformableExtension;

    const pos = transformable.position;

    p.push();
    p.translate(pos.x, pos.y);
    p.rotate(transformable.heading);

    p.stroke(this.strokeColor);
    p.strokeWeight(2);

    p.beginShape();
    p.fill(this.fillColor);
    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      p.vertex(v.x, v.y);
    }
    p.endShape(p.CLOSE);
    p.pop();

    if (DEBUG) {
      p.push();
      p.noFill();
      p.stroke(0, 255, 0);
      p.circle(pos.x, pos.y, this.radius * 2);
      p.pop();
    }
  }

  private createVertices(): void {
    const p = this.game.getP5();

    const vertexCount = p.floor(p.map(this.radius, 20, 80, 20, 25));
    this.vertices = [];

    for (let i = 0; i < vertexCount; i++) {
      const angle = p.map(i, 0, vertexCount, 0, p.TWO_PI);
      // Randomize vertex distance from center
      const offset = p.random(1, 1.3);
      const x = this.radius * offset * p.cos(angle);
      const y = this.radius * offset * p.sin(angle);
      this.vertices.push(p.createVector(x, y));
    }
  }

  split(impactEntity: Entity) {
    try {
      const p = this.game.getP5();
      const impactTransformable = impactEntity.getExtension(
        TransformableExtension
      );
      const asteroidTransformable = this.getExtension(TransformableExtension);

      // Too small to split
      if (asteroidTransformable.radius < 20) return [];

      const impactVel = impactTransformable.velocity.copy();
      const asteroidVel = asteroidTransformable.velocity.copy();
      const asteroidPos = asteroidTransformable.position.copy();

      const oldMag = asteroidVel.mag();
      const newCombinedVel = asteroidVel.add(impactVel);
      newCombinedVel.setMag(oldMag * 1.5).limit(10);

      const newSize = this.radius / 2;

      const ASTEROID_SPLIT_COUNT = 2;
      const newAsteroids: Asteroid[] = [];

      for (let k = 0; k < ASTEROID_SPLIT_COUNT; k++) {
        // Add slight offset to starting positions to prevent sticking together
        const posOffset = Vector.random2D().mult(newSize);

        // Create different angles for the two asteroid pieces
        const angleOffset = k === 0 ? p.PI / 5 : -p.PI / 5;

        const vel = newCombinedVel.copy().add(Vector.fromAngle(angleOffset));

        const newAsteroid = new Asteroid(this.game, {
          x: asteroidPos.x + posOffset.x,
          y: asteroidPos.y + posOffset.y,
          radius: newSize,
          vel: vel,
        });
        newAsteroids.push(newAsteroid);
      }

      return newAsteroids;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
