import { Asteroid } from "../entities/asteroid.entity";
import { Entity } from "../entities/entity";
import { Game } from "../game";
import { CollisionalExtension } from "../extensions/collisional.ext";
import { Ship } from "../entities/ship.entity";
import { Bullet } from "../entities/bullet.entity";
import { TransformableExtension } from "../extensions/transformable.ext";
import { PointIndicator } from "../entities/point-indicator.entity";
import { Color, Vector } from "p5";
import { ExplosionSpark } from "../entities/explosion-spark.entity";
import {
  ASTEROID_MAX_GENERATE,
  ASTEROID_SPAWN_INTERVAL,
  MIN_SPAWN_DISTANCE,
} from "@/game/config";
import { Rocket } from "../entities/rocket.entity";

export class EntitiesManager {
  game: Game;
  ship: Ship;
  entities: Entity[] = [];

  constructor(game: Game) {
    this.entities = [];
    this.game = game;
    this.ship = new Ship(this.game);
    this.addEntity(this.ship);

    this.createAsteroids();
    this.createRockets();
    this.createRockets();
    this.createRockets();
  }

  createAsteroids() {
    const count = 8;

    for (let i = 0; i < count; i++) {
      this.createAsteroid();
    }
  }

  createRockets() {
    const p = this.game.getP5();

    const rocket = new Rocket(this.game, {
      x: p.random(0, p.width),
      y: p.random(0, p.height),
    });
    this.addEntity(rocket);
  }

  createAsteroid() {
    const p = this.game.getP5();

    const x = p.random(0, p.width);
    const y = p.random(0, p.height);
    const radius = p.random(30, 50);

    // Ensure asteroids don't spawn too close to the ship
    const shipTransformable = this.ship.getExtension(TransformableExtension);
    if (!this.ship.isDead) {
      const shipDist = p.dist(
        x,
        y,
        shipTransformable.position.x,
        shipTransformable.position.y
      );
      if (shipDist < MIN_SPAWN_DISTANCE && x === undefined) {
        return this.createAsteroid();
      }
    }

    const asteroid = new Asteroid(this.game, { x, y, radius });
    this.addEntity(asteroid);
  }

  private spawnAsteroid() {
    if (
      this.game.getP5().frameCount % ASTEROID_SPAWN_INTERVAL === 0 &&
      this.entities.length < ASTEROID_MAX_GENERATE
    ) {
      this.createAsteroid();
    }
  }

  update() {
    for (let entity of this.entities) {
      entity.update();

      // Clean up
      if (entity.shouldRemove()) {
        this.removeEntity(entity);
      }
    }
    this.spawnAsteroid();
  }

  draw() {
    for (let entity of this.entities) {
      entity.draw();
    }
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
    this.entities.sort((a, b) => a.zIndex - b.zIndex);
  }

  removeEntity(entity: Entity) {
    this.entities = this.entities.filter((e) => e !== entity);
  }

  removeEntityById(id: string) {
    this.entities = this.entities.filter((e) => e.id !== id);
  }

  getEntities(): Entity[] {
    return this.entities;
  }

  getShip(): Ship {
    return this.ship;
  }

  public checkCollisions(): void {
    // For now, we'll implement a simple O(n²) collision check
    // This can be optimized later with spatial partitioning
    const entities = this.game.entitiesManager.getEntities();
    const collisionalEntities = entities.filter((e) =>
      e.hasExtension(CollisionalExtension)
    );

    for (let i = 0; i < collisionalEntities.length; i++) {
      const entityA = collisionalEntities[i];
      const colliderA = entityA.getExtension(CollisionalExtension);

      if (!colliderA) continue;

      for (let j = i + 1; j < collisionalEntities.length; j++) {
        const entityB = collisionalEntities[j];
        const colliderB = entityB.getExtension(CollisionalExtension);

        if (!colliderB) continue;

        if (colliderA.intersects(colliderB)) {
          this.collision(entityA, entityB);
        }
      }
    }
  }

  collision(entityA: Entity, entityB: Entity) {
    const p = this.game.getP5();
    const isBothAsteroids =
      entityA instanceof Asteroid && entityB instanceof Asteroid;

    if (isBothAsteroids) {
      const asteroidA = entityA.getExtension(CollisionalExtension);
      const asteroidB = entityB.getExtension(CollisionalExtension);
      asteroidA.collision(asteroidB);
      return;
    }

    const isBulletAsteroid =
      (entityA instanceof Bullet && entityB instanceof Asteroid) ||
      (entityB instanceof Bullet && entityA instanceof Asteroid);

    if (isBulletAsteroid) {
      const bullet = entityA instanceof Bullet ? entityA : (entityB as Bullet);
      const asteroid =
        entityA instanceof Asteroid ? entityA : (entityB as Asteroid);

      const asteroidTransformable = asteroid.getExtension(
        TransformableExtension
      );
      const bulletTransformable = bullet.getExtension(TransformableExtension);
      const points = Math.floor(100 / asteroidTransformable.radius) * 15;
      this.game.gameState.addScore(points);

      const pointIndicator = new PointIndicator(this.game, {
        text: `+${points}`,
        position: asteroidTransformable.position,
        size: 16,
        color: p.color("#00e7ff"),
      });
      this.addEntity(pointIndicator);

      this.removeEntity(bullet);
      this.removeEntity(asteroid);
      const newAsteroids = asteroid.split(bullet);
      for (let asteroid of newAsteroids) {
        this.addEntity(asteroid);
      }

      // Create explosion effect
      this.createExplosion(
        bulletTransformable.position.copy(),
        bulletTransformable.velocity.copy().limit(5),
        100,
        p.color("#FDC271")
      );

      return;
    }

    const isShipAsteroid =
      (entityA instanceof Ship && entityB instanceof Asteroid) ||
      (entityB instanceof Ship && entityA instanceof Asteroid);

    if (isShipAsteroid && !this.ship.isDead && !this.ship.invincible) {
      const ship = entityA instanceof Ship ? entityA : (entityB as Ship);
      const asteroid =
        entityA instanceof Asteroid ? entityA : (entityB as Asteroid);

      if (ship.isDead || ship.invincible) return;

      const force = asteroid.getExtension(TransformableExtension).velocity;
      this.destroyShip(ship, force.copy());
      this.removeEntity(asteroid);
    }

    const isShipRocket =
      (entityA instanceof Ship && entityB instanceof Rocket) ||
      (entityB instanceof Ship && entityA instanceof Rocket);

    if (isShipRocket) {
      const ship = entityA instanceof Ship ? entityA : (entityB as Ship);
      const rocket = entityA instanceof Rocket ? entityA : (entityB as Rocket);

      if (ship.isDead || ship.invincible) return;

      const force = rocket
        .getExtension(TransformableExtension)
        .velocity.copy()
        .add(ship.getVelocity().copy())
        .setMag(rocket.getExtension(TransformableExtension).velocity.mag());

      this.destroyShip(ship, force);
      this.removeEntity(rocket);
    }

    const isRocketAsteroid =
      (entityA instanceof Rocket && entityB instanceof Asteroid) ||
      (entityB instanceof Rocket && entityA instanceof Asteroid);

    if (isRocketAsteroid) {
      const rocket = entityA instanceof Rocket ? entityA : (entityB as Rocket);
      const asteroid =
        entityA instanceof Asteroid ? entityA : (entityB as Asteroid);

      const asteroidTransformable = asteroid.getExtension(
        TransformableExtension
      );
      const rocketTransformable = rocket.getExtension(TransformableExtension);

      this.removeEntity(rocket);
      this.removeEntity(asteroid);

      const newAsteroids = asteroid.split(rocket);
      for (let asteroid of newAsteroids) {
        this.addEntity(asteroid);
      }

      const force = asteroidTransformable.velocity
        .copy()
        .add(rocketTransformable.velocity.copy());

      this.createExplosion(
        asteroidTransformable.position.copy(),
        force.limit(6),
        100,
        p.color("#FDC271")
      );
    }
  }

  destroyShip(ship: Ship, force: Vector) {
    const p = this.game.getP5();

    const shipTransformable = ship.getExtension(TransformableExtension);
    const explosionPos = shipTransformable.position.copy();
    const explosionVel = shipTransformable.velocity.copy().add(force);

    if (explosionVel.mag() < 5) {
      explosionVel.setMag(5);
    }
    this.createExplosion(explosionPos, explosionVel, 100, p.color("#00e7ff"));

    // Play explosion sound
    // this.soundManager.playAsteroidExplosionSound();

    ship.die();
    setTimeout(() => {
      ship.reborn();
    }, 500);

    this.game.gameState.decrementLives();

    // if (this.lives <= 0) {
    //   this.gameOver();
    // } else {
    //   // Reset ship
    //   this.ship.die();
    //   setTimeout(() => {
    //     this.ship.reset(this.p.width / 2, this.p.height / 2);
    //   }, SHIP_SPAWN_DELAY_MS);

    //   // Show toast
    //   const message =
    //     PROVOCATIONS[Math.floor(Math.random() * PROVOCATIONS.length)];
    //   this.hud.toast.add(message, 3 * 60);
    // }
  }

  createExplosion(
    position: Vector,
    velocity: Vector,
    count: number,
    color: Color
  ) {
    const p = this.game.getP5();

    const sparks: ExplosionSpark[] = [];
    const explosionAngle = velocity.heading();

    for (let i = 0; i < count; i++) {
      const angleSpread = p.random(-Math.PI / 6, Math.PI / 6);
      const sparkAngle = explosionAngle + angleSpread;
      const sparkSpeed = p.random(0.5, 3) * (count / 10);

      const sparkVel = p.createVector(
        Math.cos(sparkAngle) * sparkSpeed,
        Math.sin(sparkAngle) * sparkSpeed
      );
      sparkVel.mult(0.7);

      const sparkMagnitude = sparkVel.mag();
      const sparkSize = p.map(sparkMagnitude, 0, velocity.mag(), 10, 6);

      const spark = new ExplosionSpark(this.game, {
        position: position.copy(),
        velocity: sparkVel,
        radius: sparkSize,
        color,
        rotationSpeed: p.random(0.01, 0.1),
      });

      sparks.push(spark);
    }

    for (let spark of sparks) {
      this.addEntity(spark);
    }
  }
}
