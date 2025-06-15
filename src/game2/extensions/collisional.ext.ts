import { Game } from "../game";
import { IExtension } from "./extensions.type";
import { TransformableExtension } from "./transformable.ext";

export class CollisionalExtension implements IExtension {
  name = "collisional";
  game: Game;
  transformable: TransformableExtension;

  constructor(game: Game, transformable: TransformableExtension) {
    this.game = game;
    this.transformable = transformable;
  }

  update() {
    // Nothing to update for base collider
  }

  public intersects(other: CollisionalExtension): boolean {
    const myPosition = this.transformable.position;
    const otherPosition = other.transformable.position;

    const distance = myPosition.dist(otherPosition);

    return distance < this.transformable.radius + other.transformable.radius;
  }

  public collision(other: CollisionalExtension): void {
    const myTransformable = this.transformable;
    const otherTransformable = other.transformable;

    const myPos = myTransformable.position;
    const otherPos = otherTransformable.position;

    const dx = otherPos.x - myPos.x;
    const dy = otherPos.y - myPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate mass based on radius (area proportional to mass)
    const r1 = myTransformable.radius;
    const r2 = otherTransformable.radius;
    const m1 = r1 * r1;
    const m2 = r2 * r2;

    // Calculate normal vectors for collision
    const normalX = dx / distance;
    const normalY = dy / distance;

    // Calculate relative velocity along normal
    const v1 = myTransformable.velocity;
    const v2 = otherTransformable.velocity;
    const relVelX = v2.x - v1.x;
    const relVelY = v2.y - v1.y;
    const relVelDotNormal = relVelX * normalX + relVelY * normalY;

    // If asteroids are moving away from each other, skip collision response
    if (relVelDotNormal > 0) return;

    // Calculate impulse scalar
    const impulseScalar = (2 * relVelDotNormal) / (1 / m1 + 1 / m2);

    // Apply impulse to velocities
    const impulseX = normalX * impulseScalar;
    const impulseY = normalY * impulseScalar;

    myTransformable.setVelocity(v1.x + impulseX / m1, v1.y + impulseY / m1);
    otherTransformable.setVelocity(v2.x - impulseX / m2, v2.y - impulseY / m2);

    // Push asteroids apart slightly to prevent sticking
    const overlap = r1 + r2 - distance;
    if (overlap > 0) {
      const pushRatio1 = m2 / (m1 + m2);
      const pushRatio2 = m1 / (m1 + m2);

      myTransformable.setPosition(
        myPos.x - normalX * overlap * pushRatio1,
        myPos.y - normalY * overlap * pushRatio1
      );

      otherTransformable.setPosition(
        otherPos.x + normalX * overlap * pushRatio2,
        otherPos.y + normalY * overlap * pushRatio2
      );
    }
  }
}
