import { HUDComponent } from "./hud";
import { Game } from "../game";

export class InfosHUD implements HUDComponent {
  private game: Game;

  private position = { x: 0, y: 0 };
  private readonly fontSize = 12;
  private fpsHistory: number[] = [];
  private readonly historyLength = 60; // 1 second at 60fps

  constructor(game: Game) {
    this.game = game;
    const p = this.game.getP5();
    this.position = { x: 20, y: p.height - 20 };
  }

  public update(): void {
    const p = this.game.getP5();

    // Store current frame rate
    this.fpsHistory.push(Number(p.frameRate().toFixed(0)));

    // Keep only the last second of data
    if (this.fpsHistory.length > this.historyLength) {
      this.fpsHistory.shift();
    }
  }

  public draw(): void {
    const p = this.game.getP5();

    // Calculate average FPS
    const avgFps =
      this.fpsHistory.length > 0
        ? this.fpsHistory.reduce((sum, fps) => sum + fps, 0) /
          this.fpsHistory.length
        : 0;

    const infos = [
      `FPS      : ${p.frameRate().toFixed(0)}`,
      `AVG FPS  : ${avgFps.toFixed(0)}`,
      `FPS Min  : ${Math.min(...this.fpsHistory)}`,
      `Objs     : ${this.game.entitiesManager.getEntities().length}`,
      // `Buffs: ${this.game.entitiesManager.getBuffs().map((buff) => buff.name).join(", ") || "None"}`,
    ];

    p.push();
    p.fill(255);
    p.textSize(this.fontSize);
    p.textAlign(p.LEFT);
    p.textFont("monospace");

    let y = this.position.y;
    const gap = 7;
    for (let i = infos.length - 1; i >= 0; i--) {
      p.text(infos[i], this.position.x, y);
      y -= this.fontSize + gap;
    }
    p.pop();
  }
}
