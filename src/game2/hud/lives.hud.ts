import P5 from "p5";
import { HUDComponent } from "./hud";
import { Game } from "../game";

export class LivesHUD implements HUDComponent {
  private readonly heartSize = 40;
  private readonly heartGap = 3;
  private readonly position = { y: 10 };
  private readonly activeOpacity = 255;
  private readonly inactiveOpacity = 40;
  private previousLives: number;
  private flashingHeartIndex: number | null = null;
  private flashTimer = 0;
  private readonly flashDuration = 60; // frames (1 second at 60fps)
  private game: Game;
  private heartImage: P5.Image;

  constructor(game: Game) {
    this.game = game;
    const p = game.getP5();
    this.heartImage = p.loadImage("/game/heart.png");
  }

  public update(): void {
    // Check if we lost a life
    if (this.game.gameState.getLives() < this.previousLives) {
      // Flash the last remaining heart (leftmost of the active hearts)
      this.flashingHeartIndex = this.game.gameState.getLives() - 1;
      this.flashTimer = this.flashDuration;
    }

    // Update flash timer
    if (this.flashTimer > 0) {
      this.flashTimer--;
    } else {
      this.flashingHeartIndex = null;
    }

    this.previousLives = this.game.gameState.getLives();
  }

  public draw(): void {
    const p = this.game.getP5();
    for (let i = 0; i < this.game.gameState.getMaxLives(); i++) {
      const heartX = this.calculateHeartX(i);
      this.setHeartOpacity(i);
      p.image(
        this.heartImage,
        heartX,
        this.position.y,
        this.heartSize,
        this.heartSize
      );
    }
    p.noTint();
  }

  private calculateHeartX(index: number): number {
    const p = this.game.getP5();
    return p.width - (index + 1) * (this.heartSize + this.heartGap) - 10;
  }

  private setHeartOpacity(index: number): void {
    const p = this.game.getP5();
    if (index === this.flashingHeartIndex) {
      // Flash the leftmost active heart
      const flashRate = p.sin(p.frameCount * 0.5) * 127 + 128;
      p.tint(flashRate); // Red flashing
    } else {
      const opacity =
        index >= this.game.gameState.getLives()
          ? this.inactiveOpacity
          : this.activeOpacity;
      p.tint(255, opacity);
    }
  }
}
