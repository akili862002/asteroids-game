import { EventSystem, GameEvent } from "./event-system";
import { LIVES } from "@/game/config";
import { Game } from "../game";

export class GameState {
  private game: Game;
  private score: number = 0;
  private lives: number = LIVES;
  private maxLives: number = LIVES;
  private level: number = 1;
  private eventSystem: EventSystem;
  public isGameOver: boolean = false;
  public isPaused: boolean = false;

  constructor(game: Game) {
    this.game = game;
    this.eventSystem = EventSystem.getInstance();
    this.reset();
  }

  public reset(): void {
    this.score = 0;
    this.lives = LIVES;
    this.maxLives = LIVES;
    this.level = 1;

    // Dispatch events for the reset values
    this.eventSystem.dispatchEvent(GameEvent.SCORE_CHANGED, {
      score: this.score,
    });
    this.eventSystem.dispatchEvent(GameEvent.LIVES_CHANGED, {
      lives: this.lives,
    });
    this.eventSystem.dispatchEvent(GameEvent.LEVEL_CHANGED, {
      level: this.level,
    });
  }

  public update(): void {
    // Check for level progression based on score
    const previousLevel = this.level;
    this.level = Math.floor(this.score / 1000) + 1;

    if (this.level !== previousLevel) {
      this.eventSystem.dispatchEvent(GameEvent.LEVEL_CHANGED, {
        level: this.level,
        previousLevel,
      });
    }
  }

  public addScore(points: number): void {
    this.score += points;
    this.eventSystem.dispatchEvent(GameEvent.SCORE_CHANGED, {
      score: this.score,
    });
  }

  public setScore(score: number): void {
    this.score = score;
    this.eventSystem.dispatchEvent(GameEvent.SCORE_CHANGED, {
      score: this.score,
    });
  }

  public getScore(): number {
    return this.score;
  }

  // Decrement lives by 1
  public decrementLives(): void {
    this.lives = Math.max(0, this.lives - 1);
    this.eventSystem.dispatchEvent(GameEvent.LIVES_CHANGED, {
      lives: this.lives,
    });

    if (this.lives <= 0) {
      this.eventSystem.dispatchEvent(GameEvent.GAME_OVER);
      this.isGameOver = true;
    }
  }

  public setLives(lives: number): void {
    this.lives = lives;
    this.eventSystem.dispatchEvent(GameEvent.LIVES_CHANGED, {
      lives: this.lives,
    });
  }

  public getLives(): number {
    return this.lives;
  }

  public getMaxLives(): number {
    return this.maxLives;
  }

  public getLevel(): number {
    return this.level;
  }

  public setGameOver(isGameOver: boolean): void {
    this.isGameOver = isGameOver;
  }

  public setPaused(isPaused: boolean): void {
    this.isPaused = isPaused;
  }
}
