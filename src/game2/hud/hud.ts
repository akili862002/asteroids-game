import { PausedHUD } from "./pause.hud";
import { ToastHUD } from "./toast.hud";
import { InfosHUD } from "./infos.hud";
import { Game } from "../game";
import { ScoreHUD } from "./score.hud";
import { SpeedHUD } from "./speed.hud";
import { LevelHUD } from "./level.hud";
import { LivesHUD } from "./lives.hud";
import { GameOverHUD } from "./game-over.hud";

export class HUD {
  private game: Game;

  private scoreDisplay: ScoreHUD;
  private livesDisplay: LivesHUD;
  private speedDisplay: SpeedHUD;
  private infosHUD: InfosHUD;
  private levelHUD: LevelHUD;
  private gameOverDisplay: GameOverHUD;
  private pausedDisplay: PausedHUD;
  public toast: ToastHUD;

  constructor(game: Game) {
    this.game = game;

    this.scoreDisplay = new ScoreHUD(this.game);
    this.livesDisplay = new LivesHUD(this.game);
    this.speedDisplay = new SpeedHUD(this.game);
    this.infosHUD = new InfosHUD(this.game);
    this.levelHUD = new LevelHUD(this.game);
    this.gameOverDisplay = new GameOverHUD(this.game);
    this.pausedDisplay = new PausedHUD(this.game);
    this.toast = new ToastHUD(this.game);
  }

  public update(): void {
    this.scoreDisplay.update();
    this.livesDisplay.update();
    this.speedDisplay.update();
    this.infosHUD.update();
    this.levelHUD.update();
    this.toast.update();
  }

  public draw(): void {
    this.scoreDisplay.draw();
    this.livesDisplay.draw();
    this.speedDisplay.draw();
    this.infosHUD.draw();
    this.levelHUD.draw();
    this.toast.draw();

    if (this.game.gameState.isPaused && !this.game.gameState.isGameOver) {
      this.pausedDisplay.draw();
    }
  }

  public renderGameOver(): void {
    this.gameOverDisplay.draw();
  }
}

export interface HUDComponent {
  update(): void;
  draw(): void;
}
