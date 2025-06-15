import { HUDComponent } from "./hud";
import { Game } from "../game";

export class ScoreHUD implements HUDComponent {
  private readonly fontSize = 44;
  private readonly position = { x: 20, y: 10 };
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    // No animation initialization needed
  }

  public update(): void {
    // No animation to update
  }

  public draw(): void {
    const p = this.game.getP5();
    const score = this.game.gameState.getScore();

    p.fill(111, 215, 237);
    p.textSize(this.fontSize);
    p.textAlign(p.LEFT);
    p.text(`${score}`, this.position.x, this.position.y + this.fontSize);
  }
}
