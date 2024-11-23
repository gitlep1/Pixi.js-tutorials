import { useState, useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";
import "./App.scss";

function App() {
  const appRef = useRef(null);
  const playerRef = useRef(null);
  const pixiContainerRef = useRef(null);
  const [playerState, setPlayerState] = useState("idle");

  const playerSpeed = 5;
  const gravity = 2;
  let isJumping = false;
  let verticleVelocity = 0;

  useEffect(() => {
    initPixiApp();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }

      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []); // eslint-disable-line

  const initPixiApp = async () => {
    if (appRef.current) {
      return;
    }

    const app = new Application();
    await app.init({
      width: 800,
      height: 700,
      backgroundColor: 0x87ceeb,
    });

    if (pixiContainerRef.current) {
      pixiContainerRef.current.replaceChildren(app.canvas);
    }

    appRef.current = app;

    renderGround(app);
    const player = renderPlayer(app);
    playerRef.current = player;

    app.ticker.add(() => gameLoop(player));
  };

  const renderGround = (app) => {
    const ground = new Graphics();
    ground.rect(0, 650, 800, 50);
    ground.fill(0x228b22);

    app.stage.addChild(ground);
  };

  const renderPlayer = (app) => {
    const player = new Graphics();
    player.rect(0, 0, 50, 50);
    player.fill(0xffd700);

    player.x = 375;
    player.y = 600;

    app.stage.addChild(player);

    return player;
  };

  const gameLoop = (player) => {
    if (!player) {
      return;
    }

    if (isJumping || player.y < 600) {
      verticleVelocity += gravity;
      player.y += verticleVelocity;

      if (player.y >= 600) {
        player.y = 600;
        verticleVelocity = 0;
        isJumping = false;
      }
    }

    player.x = Math.max(0, Math.min(750, player.x));
  };

  const handleKeyDown = (e) => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (e.key === "ArrowLeft" || e.key === "a") {
      player.x = Math.max(0, player.x - playerSpeed);
      setPlayerState("running");
    }

    if (e.key === "ArrowRight" || e.key === "d") {
      player.x = Math.max(0, player.x + playerSpeed);
      setPlayerState("running");
    }

    if (e.key === " " && !isJumping) {
      isJumping = true;
      verticleVelocity = -20;
      setPlayerState("jumping");
    }
  };

  const handleKeyUp = (e) => {
    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "a" ||
      e.key === "d"
    ) {
      setPlayerState("idle");
    }
  };

  return (
    <section>
      <h1>Platforming Tutorial</h1>
      <div ref={pixiContainerRef}></div>
    </section>
  );
}

export default App;
