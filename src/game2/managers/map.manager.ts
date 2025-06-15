import P5 from "p5";
import { Vector } from "p5";
import { Game } from "../game";

export class MapManager {
  game: Game;
  background = "#020307";
  stars: Star[] = [];
  starCount = 0;

  constructor(game: Game) {
    this.game = game;
    const p = this.game.getP5();

    this.starCount = p.map(p.width, 600, 1400, 40, 100);
    this.createStars();
  }

  update() {}

  draw() {
    const p = this.game.getP5();

    p.background(p.color(this.background));

    for (let star of this.stars) {
      star.draw(p);
    }
  }

  createStars() {
    const p = this.game.getP5();

    for (let i = 0; i < this.starCount; i++) {
      const star = new Star(
        p.createVector(p.random(0, p.width), p.random(0, p.height)),
        p.random(0.1, 3),
        p.random(160, 220)
      );
      this.stars.push(star);
    }
  }
}

class Star {
  pos: Vector;
  size: number;
  color: number;

  constructor(pos: Vector, size: number, color: number) {
    this.pos = pos;
    this.size = size;
    this.color = color;
  }

  draw(p: P5) {
    p.push();
    p.stroke(this.color);
    p.strokeWeight(this.size);
    p.point(this.pos.x, this.pos.y);
    p.pop();
  }
}
