import { Ship } from "./entities/ship";
import {
  DoubleGunBuff,
  ReduceShootCooldownBuff,
  ReduceKnockbackBuff,
} from "./entities/buffs";
import { HealBuff } from "./entities/buffs/heal.buff";
import { BulletSpeedBuff } from "./entities/buffs/bullet-speed.buff";
import { ExtraLiveBuff } from "./entities/buffs/extra-live.buff";
import { Game } from "./game";
import { IBuff } from "./entities/buffs/buff";

// Game
export const LIVES = 3;
// export const DEBUG = true;
export const DEBUG = false;
export const BACKGROUND_COLOR = "#020307";
export const SHIP_SPAWN_DELAY_MS = 300;
export const POINTS_PER_LEVEL = 600;
// export const POINTS_PER_LEVEL = 100;

// Ship
export const SHIP_MAX_SPEED = 15;
// export const SHIP_FRICTION = 1;
export const SHIP_FRICTION = 0.99;
export const SHIP_KNOCKBACK_FORCE = 0.5;
export const SHIP_INVINCIBLE_TIME = 120; // Invincible for 2 seconds (60 frames per second)
export const SHIP_MAX_ROTATION = 0.1;
export const SHIP_BOOST_FORCE = 0.15;
export const SHIP_ROTATION_SPEED = 0.02;
// export const SHIP_SHOOT_COOLDOWN = 150;
export const SHIP_SHOOT_COOLDOWN = 300;

// Bullet
export const BULLET_COLOR = "#74EFF8";
export const BULLET_LIFESPAN = 70; // Frames until bullet disappears
export const BULLET_SPEED = 10;
export const BULLET_RADIUS = 3;

// Asteroid
export const ASTEROID_COLOR = "#FDC271";
export const ASTEROID_MAX_SPEED = 8;
export const ASTEROID_SPAWN_INTERVAL = 300; // 5 seconds
export const ASTEROID_MAX_GENERATE = 12;
export const ASTEROID_SPLIT_COUNT = 2;
export const ASTEROID_INITIAL_COUNT = 8;

// Point indicator
export const POINT_INDICATOR_COLOR = "#74EFF8";

// Rocket
export const ROCKET_COLOR = "#74EFF8";
export const ROCKET_MAX_SPEED = 7;
export const ROCKET_SPAWN_INTERVAL = 12 * 60; // seconds
export const ROCKET_MAX_GENERATE = 5;
export const ROCKET_LIFESPAN = 850;
export const ROCKET_STEER_FORCE = 0.08;

export const MIN_SPAWN_DISTANCE = 300;

export const PROVOCATIONS = [
  "That's all you got?",
  "Oops! Try again",
  "Watch out for those asteroids",
  "Not your best moment",
  "Don't give up now",
  "Need better reflexes?",
  "Close, but not close enough!",
  "Pilot error detected!",
  "Space is dangerous!",
  "Navigate! Better next time",
];

export const buffs: {
  name: string;
  description: string;
  getBuff: (ship: Ship, game: Game) => IBuff;
}[] = [
  {
    name: "Double Gun",
    description: "You got Double Gun!",
    getBuff: (ship: Ship, game: Game) => new DoubleGunBuff(ship),
  },
  {
    name: "Reduce Knockback",
    description: "You got 10% Reduce Knockback!",
    getBuff: (ship: Ship, game: Game) => new ReduceKnockbackBuff(ship, 20),
  },
  {
    name: "Reduce Cooldown",
    description: "You got 15% Reduce Shoot Cooldown!",
    getBuff: (ship: Ship, game: Game) => new ReduceShootCooldownBuff(ship, 20),
  },
  {
    name: "Heal",
    description: "You got a HP!",
    getBuff: (ship: Ship, game: Game) => new HealBuff(game),
  },
  {
    name: "Bullet Speed",
    description: "You got 10% Bullet Speed!",
    getBuff: (ship: Ship, game: Game) => new BulletSpeedBuff(ship, 10),
  },
  {
    name: "Extra Life",
    description: "You got Extra Live!",
    getBuff: (ship: Ship, game: Game) => new ExtraLiveBuff(game),
  },
];
