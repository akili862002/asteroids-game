import { Game } from "../game";
import { HUDComponent } from "./hud";

export class LevelHUD implements HUDComponent {
  game: Game;
  private targetProgress: number = 0;
  private currentProgress: number = 0;
  private readonly easeSpeed: number = 0.1;

  constructor(game: Game) {
    this.game = game;
  }

  public update(): void {
    this.targetProgress = this.game.gameState.getLevelProgress();

    this.currentProgress +=
      (this.targetProgress - this.currentProgress) * this.easeSpeed;
  }

  public draw(): void {
    const p = this.game.getP5();
    let x = p.width / 2;
    let y = 60;
    p.textSize(36);
    p.textAlign(p.CENTER);
    p.fill(253, 194, 113);
    p.text(`LEVEL ${this.game.gameState.getLevel()}`, x, y);

    p.push();
    p.fill(253, 194, 113);
    p.noStroke();
    p.rectMode(p.CENTER);
    p.translate(p.width / 2, 0);
    p.rect(0, 0, this.currentProgress * p.width, 10);
    p.pop();
  }
}
