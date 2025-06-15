import { HUDComponent } from "./hud";
import { Game } from "../game";

export class PausedHUD implements HUDComponent {
  private readonly centerX: number;
  private readonly centerY: number;
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    const p = game.getP5();
    this.centerX = p.width / 2;
    this.centerY = p.height / 2;
  }

  public update(): void {
    // Paused screen doesn't need updates
  }

  public draw(): void {
    const p = this.game.getP5();
    const pulseAmount = p.sin(p.frameCount * 0.1) * 20 + 235;
    p.fill(255, pulseAmount);
    p.textSize(60);
    p.textAlign(p.CENTER);
    p.text("PAUSED", this.centerX, this.centerY);

    const flashRate = p.sin(p.frameCount * 0.2) * 127 + 128;

    p.fill(255, flashRate);
    p.textSize(24);
    p.text(
      "Click on the game or press [SPACE] to resume",
      this.centerX,
      this.centerY + 50
    );
  }
}
