import P5 from "p5";
import { Game } from "../game";

export class ToastHUD {
  private items: ToastItem[] = [];
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  add(message: string, duration: number = 60) {
    this.items.push(new ToastItem(message, duration));
  }

  clean() {
    this.items = [];
  }

  update() {
    for (const item of this.items) {
      item.update();
      if (item.shouldRemove()) {
        this.items.splice(this.items.indexOf(item), 1);
      }
    }
  }

  draw() {
    const p = this.game.getP5();
    p.push();
    p.textAlign(p.CENTER, p.BOTTOM);
    p.fill(255);
    p.textSize(16);

    let yOffset = 30;
    this.items.forEach((item) => {
      item.draw(p, yOffset);
      yOffset += 30;
    });
    p.pop();
  }
}

export class ToastItem {
  public duration: number;
  private charIndex = 0;
  private frameCounter = 0;
  private readonly charRevealSpeed = 2; // Reveal a new character every 2 frames

  constructor(public message: string, duration: number) {
    this.duration = duration;
  }

  update() {
    this.duration--;

    // Increment the character animation counter
    this.frameCounter++;

    // Reveal one more character when the frame counter reaches the reveal speed
    if (
      this.frameCounter >= this.charRevealSpeed &&
      this.charIndex < this.message.length
    ) {
      this.charIndex++;
      this.frameCounter = 0;
    }
  }

  draw(p: P5, yOffset: number) {
    // Only display characters up to the current animation index
    const displayText = this.message.substring(0, this.charIndex);

    // Calculate opacity based on remaining duration for fade-out effect
    const opacity = this.duration < 30 ? (this.duration / 30) * 255 : 255;

    p.fill(255, opacity);
    p.text(displayText, p.width / 2, p.height - yOffset);
  }

  shouldRemove(): boolean {
    return this.duration <= 0;
  }
}
