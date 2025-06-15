import { HUDComponent } from "./hud";
import { Game } from "../game";
import { TransformableExtension } from "../extensions/transformable.ext";
import { Vector } from "p5";
import { SHIP_MAX_SPEED } from "@/game/config";

export class SpeedHUD implements HUDComponent {
  game: Game;
  private readonly barWidth = 300;
  private readonly barHeight = 10;
  private barPosition = {
    x: 0,
    y: 0,
  };
  private readonly textOffset = { x: 50, y: 10 };

  constructor(game: Game) {
    this.game = game;
    this.barPosition = {
      x: this.game.getP5().width - 300 - 10,
      y: this.game.getP5().height - 10 - 10,
    };
  }

  public update(): void {
    // Speed doesn't need animation updates
  }

  public draw(): void {
    this.renderSpeedBar();
    this.renderSpeedText();
  }

  private renderSpeedBar(): void {
    this.renderBarBackground();
    this.renderBarFill();
  }

  private renderBarBackground(): void {
    const p = this.game.getP5();
    p.fill(50);
    p.noStroke();
    p.rect(
      this.barPosition.x,
      this.barPosition.y,
      this.barWidth,
      this.barHeight
    );
  }

  private renderBarFill(): void {
    const fillWidth = this.calculateFillWidth();
    if (fillWidth > 0) {
      const p = this.game.getP5();
      p.fill(255);
      p.rect(this.barPosition.x, this.barPosition.y, fillWidth, this.barHeight);
    }
  }

  getShipVelocity(): Vector {
    const ship = this.game.entitiesManager.getShip();
    const transformable = ship.getExtension(TransformableExtension);
    return transformable.velocity;
  }

  private calculateFillWidth(): number {
    const shipVelocity = this.getShipVelocity();
    const p = this.game.getP5();
    const speedRatio = shipVelocity
      ? p.constrain(shipVelocity.mag() / SHIP_MAX_SPEED, 0, 1)
      : 0;
    return this.barWidth * speedRatio;
  }

  private renderSpeedText(): void {
    const p = this.game.getP5();
    p.fill(255);
    p.textSize(14);
    p.textAlign(p.LEFT);
    const shipVelocity = this.getShipVelocity();

    const speedValue = Number(shipVelocity.mag().toFixed(2)) || "0.00";
    p.text(
      speedValue,
      p.width - this.textOffset.x,
      this.barPosition.y - this.textOffset.y
    );
  }
}
