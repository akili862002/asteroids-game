import P5 from "p5";
import { EntitiesManager } from "./managers/entities.manager";
import { MapManager } from "./managers/map.manager";
import { EventSystem } from "./managers/event-system";
import { GameState } from "./managers/game-state";
import { SHIP_ROTATION_SPEED } from "@/game/config";
import { HUD } from "./hud/hud";
import { ScoreManager } from "@/game/score";

export class Game {
  entitiesManager: EntitiesManager;
  mapManager: MapManager;
  eventSystem: EventSystem;
  gameState: GameState;
  hud: HUD;

  private p5: P5;

  constructor(p5: P5) {
    this.p5 = p5;
    this.newGame();
    this.eventSystem = EventSystem.getInstance();
    this.gameState = new GameState(this);
  }

  public newGame() {
    this.entitiesManager = new EntitiesManager(this);
    this.mapManager = new MapManager(this);
    this.hud = new HUD(this);
  }

  public update() {
    if (this.gameState.isPaused) {
      return;
    }

    this.mapManager.update();
    this.entitiesManager.update();
    this.entitiesManager.checkCollisions();
    this.gameState.update();
    this.hud.update();
    this.keyboards();
  }

  public draw() {
    this.mapManager.draw();
    this.entitiesManager.draw();
    this.hud.draw();
  }

  public getP5() {
    return this.p5;
  }

  public getLevel() {
    return this.gameState.getLevel();
  }

  public getScore() {
    return this.gameState.getScore();
  }

  keyboards() {
    const p = this.getP5();

    const LEFT_ARROW = p.LEFT_ARROW;
    const RIGHT_ARROW = p.RIGHT_ARROW;
    const UP_ARROW = p.UP_ARROW;
    const SPACE = 32;
    const A = 65;
    const D = 68;
    const W = 87;
    const ESC = 27;
    const R = 82;
    const P = 80;
    const ENTER = p.ENTER;

    const ship = this.entitiesManager.ship;

    if (ship.checkIsDead()) return;

    if (p.keyIsDown(LEFT_ARROW) || p.keyIsDown(A)) {
      ship.addRotation(-SHIP_ROTATION_SPEED);
    }
    if (p.keyIsDown(RIGHT_ARROW) || p.keyIsDown(D)) {
      ship.addRotation(SHIP_ROTATION_SPEED);
    }
    if (p.keyIsDown(SPACE)) {
      const bullets = ship.shoot();
      if (bullets?.length) {
        for (let bullet of bullets) {
          this.entitiesManager.addEntity(bullet);
        }
      }
    }

    const isHoldingUp = p.keyIsDown(UP_ARROW) || p.keyIsDown(W);
    if (isHoldingUp) {
      ship.boost();
    }

    if (p.keyIsDown(ESC)) {
      this.gameState.setPaused(true);
      return;
    }
  }

  private gameOver() {
    this.gameState.setGameOver(true);
    this.entitiesManager.ship.die();
    ScoreManager.saveScore(this.gameState.getScore());
  }

  onKeyPressed(e: KeyboardEvent) {
    if (this.gameState.isGameOver) {
      if (e.key === "Enter") {
        this.newGame();
        return;
      }
    }

    if (this.gameState.isPaused && (e.key === " " || e.key === "Enter")) {
      this.gameState.setPaused(false);
      return;
    }

    if (!this.gameState.isPaused && (e.key === "p" || e.key === "P")) {
      this.gameState.setPaused(!this.gameState.isPaused);
      return;
    }
  }
}
