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
  ROCKET_MAX_GENERATE,
  ROCKET_SPAWN_INTERVAL,
} from "@/game/config";
import { Rocket } from "../entities/rocket.entity";

export class EntitiesManager {
  game: Game;
  ship: Ship;
  entities: Entity[] = [];
  lastSpawnedRocketTime = 0;

  constructor(game: Game) {
    this.entities = [];
    this.game = game;
    this.ship = new Ship(this.game);
    this.addEntity(this.ship);

    this.createInitialAsteroids();
    this.createRocket();
    this.createRocket();
    this.createRocket();
    this.createRocket();
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
    this.spawnRocket();
  }

  draw() {
    for (let entity of this.entities) {
      entity.draw();
    }
  }

  createInitialAsteroids() {
    const count = 8;

    for (let i = 0; i < count; i++) {
      this.createAsteroid();
    }
  }

  createRocket() {
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

  private spawnRocket() {
    const p = this.game.getP5();
    // Calculate adjusted spawn interval based on level
    const adjustedRocketSpawnInterval =
      ROCKET_SPAWN_INTERVAL - this.game.gameState.getLevel() * 60;

    // Check if enough time has passed since last rocket spawn
    const isSpawnTimeElapsed =
      p.frameCount - this.lastSpawnedRocketTime >
      Math.max(60, adjustedRocketSpawnInterval);

    if (!this.ship.isDead && this.game.getLevel() >= 2 && isSpawnTimeElapsed) {
      this.createRocket();
      this.lastSpawnedRocketTime = p.frameCount;
    }
  }

  private spawnAsteroid() {
    const p = this.game.getP5();
    const asteroidCount = this.entities.filter(
      (e) => e instanceof Asteroid
    ).length;

    if (
      p.frameCount % ASTEROID_SPAWN_INTERVAL === 0 &&
      asteroidCount < ASTEROID_MAX_GENERATE
    ) {
      this.createAsteroid();
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
    const isBothAsteroids =
      entityA instanceof Asteroid && entityB instanceof Asteroid;
    const isBulletAsteroid =
      (entityA instanceof Bullet && entityB instanceof Asteroid) ||
      (entityB instanceof Bullet && entityA instanceof Asteroid);
    const isBulletRocket =
      (entityA instanceof Bullet && entityB instanceof Rocket) ||
      (entityB instanceof Bullet && entityA instanceof Rocket);
    const isShipAsteroid =
      (entityA instanceof Ship && entityB instanceof Asteroid) ||
      (entityB instanceof Ship && entityA instanceof Asteroid);
    const isShipRocket =
      (entityA instanceof Ship && entityB instanceof Rocket) ||
      (entityB instanceof Ship && entityA instanceof Rocket);
    const isRocketAsteroid =
      (entityA instanceof Rocket && entityB instanceof Asteroid) ||
      (entityB instanceof Rocket && entityA instanceof Asteroid);

    if (isBothAsteroids) {
      this.handleAsteroidAsteroidCollision(
        entityA as Asteroid,
        entityB as Asteroid
      );
    } else if (isBulletAsteroid) {
      this.handleBulletAsteroidCollision(entityA, entityB);
    } else if (isBulletRocket) {
      this.handleBulletRocketCollision(entityA, entityB);
    } else if (isShipAsteroid) {
      this.handleShipAsteroidCollision(entityA, entityB);
    } else if (isShipRocket) {
      this.handleShipRocketCollision(entityA, entityB);
    } else if (isRocketAsteroid) {
      this.handleRocketAsteroidCollision(entityA, entityB);
    }
  }

  private handleAsteroidAsteroidCollision(
    asteroidA: Asteroid,
    asteroidB: Asteroid
  ) {
    const colliderA = asteroidA.getExtension(CollisionalExtension);
    const colliderB = asteroidB.getExtension(CollisionalExtension);
    colliderA.collision(colliderB);
  }

  private handleBulletAsteroidCollision(entityA: Entity, entityB: Entity) {
    const p = this.game.getP5();
    const bullet = entityA instanceof Bullet ? entityA : (entityB as Bullet);
    const asteroid =
      entityA instanceof Asteroid ? entityA : (entityB as Asteroid);

    const asteroidTransformable = asteroid.getExtension(TransformableExtension);
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
  }

  private handleBulletRocketCollision(entityA: Entity, entityB: Entity) {
    const p = this.game.getP5();
    const bullet = entityA instanceof Bullet ? entityA : (entityB as Bullet);
    const rocket = entityA instanceof Rocket ? entityA : (entityB as Rocket);

    const bulletTransformable = bullet.getExtension(TransformableExtension);
    const rocketTransformable = rocket.getExtension(TransformableExtension);

    // Award points for destroying a rocket
    const points = 150;
    this.game.gameState.addScore(points);

    const pointIndicator = new PointIndicator(this.game, {
      text: `+${points}`,
      position: rocketTransformable.position,
      size: 16,
      color: p.color("#00e7ff"),
    });
    this.addEntity(pointIndicator);

    this.removeEntity(bullet);
    this.removeEntity(rocket);

    this.createExplosion(
      rocketTransformable.position.copy(),
      bulletTransformable.velocity.copy().setMag(5),
      150,
      p.color("#FF6B6B")
    );
  }

  private handleShipAsteroidCollision(entityA: Entity, entityB: Entity) {
    if (this.ship.isDead || this.ship.invincible) return;

    const ship = entityA instanceof Ship ? entityA : (entityB as Ship);
    const asteroid =
      entityA instanceof Asteroid ? entityA : (entityB as Asteroid);

    const force = asteroid.getExtension(TransformableExtension).velocity;
    this.destroyShip(ship, force.copy());
    this.removeEntity(asteroid);
  }

  private handleShipRocketCollision(entityA: Entity, entityB: Entity) {
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

  private handleRocketAsteroidCollision(entityA: Entity, entityB: Entity) {
    const p = this.game.getP5();
    const rocket = entityA instanceof Rocket ? entityA : (entityB as Rocket);
    const asteroid =
      entityA instanceof Asteroid ? entityA : (entityB as Asteroid);

    const asteroidTransformable = asteroid.getExtension(TransformableExtension);
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
