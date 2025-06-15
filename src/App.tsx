import P5JS from "p5";
import { useEffect, useRef } from "react";
import { useTitle } from "react-use";
import { Game } from "./game2/game";
import { Guide } from "./game2/guide";

export default function AsteroidsPage() {
  useTitle("Asteroids");

  const canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const p5 = new P5JS(function (p: P5JS) {
      let game: Game;

      p.setup = () => {
        p.createCanvas(innerWidth, innerHeight);
        p.textFont("Orbitron");
        game = new Game(p);
      };

      p.draw = () => {
        if (!game) {
          return;
        }

        game.update();
        game.draw();
      };

      p.keyPressed = (e: KeyboardEvent) => {
        game.onKeyPressed(e);
      };
    }, canvasRef.current);

    return () => {
      p5.remove();
    };
  }, []);

  return (
    <div className={"relative h-screen w-screen bg-[#020307]"}>
      <Guide />
      <div id="canvas-container" ref={canvasRef} />
    </div>
  );
}
