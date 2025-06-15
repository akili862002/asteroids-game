import { Color, Vector } from "p5";
import { Game } from "../game";
import { Entities, Entity } from "./entity";

export class PointIndicator extends Entity {
  text: string;
  opacity: number;
  size: number;
  position: Vector;
  color: Color;

  constructor(
    game: Game,
    args: {
      text: string;
      position: Vector;
      size: number;
      color?: Color;
    }
  ) {
    super(game, Entities.POINT_INDICATOR);
    const p = game.getP5();

    this.text = args.text;
    this.opacity = 255;
    this.size = args.size;
    this.position = args.position;
    this.color = args.color || p.color(255, 255, 255);
    this.zIndex = 100;
  }

  update() {
    super.update();
    this.opacity -= 5;
    this.position.y -= 1;
  }

  draw() {
    super.draw();
    const p = this.game.getP5();

    this.color.setAlpha(this.opacity);
    p.fill(this.color);
    p.textSize(this.size);
    p.textAlign(p.LEFT);
    p.text(this.text, this.position.x, this.position.y);
  }

  shouldRemove(): boolean {
    return this.opacity <= 0;
  }
}
