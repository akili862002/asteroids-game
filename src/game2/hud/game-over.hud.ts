import P5 from "p5";
import { HUDComponent } from "./hud";
import { Game } from "../game";

export class GameOverHUD implements HUDComponent {
  private readonly centerX: number;
  private readonly centerY: number;
  private readonly maxTopScores = 5;
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    const p = game.getP5();
    this.centerX = p.width / 2;
    this.centerY = p.height / 2;
  }

  public update(): void {
    // Game over screen doesn't need updates
  }

  public draw(): void {
    this.renderGameOverText();
    this.renderScoreSection();
    this.renderRestartPrompt();
  }

  private renderGameOverText(): void {
    const p = this.game.getP5();
    const pulseAmount = p.sin(p.frameCount * 0.1) * 20 + 235;
    p.fill(255, pulseAmount);
    p.textSize(60);
    p.textAlign(p.CENTER);
    p.text("GAME OVER", this.centerX, this.centerY - 100);
  }

  private renderScoreSection(): void {
    const p = this.game.getP5();
    const score = this.game.gameState.getScore();
    p.textSize(32);
    p.fill(255);
    p.text(`Your Score: ${score}`, this.centerX, this.centerY - 40);
  }

  private renderRestartPrompt(): void {
    const p = this.game.getP5();
    const flashRate = p.sin(p.frameCount * 0.2) * 127 + 128;
    p.fill(255, flashRate);
    p.textSize(24);
    p.text("Press [Enter] to play again", this.centerX, this.centerY + 300);
  }
}
