import { useState, useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";
import { useSpring, animated } from "react-spring";
import "./App.scss";

function App() {
  const appRef = useRef(null);
  const playerRef = useRef(null);
  const pixiContainerRef = useRef(null);
  const [playerState, setPlayerState] = useState("idle");

  const playerSpeed = 25;
  const gravity = 2;
  let isJumping = false;
  let verticleVelocity = 0;

  const [springProps, setSpringProps] = useSpring(() => ({
    x: 375,
    config: { tension: 175, friction: 25 },
    onChange: ({ value }) => {
      if (playerRef.current) {
        const clampedX = Math.max(0, Math.min(750, value.x));
        playerRef.current.x = clampedX;

        if (clampedX !== value.x) {
          setSpringProps.stop();
          setSpringProps.set({ x: clampedX });
        }
      }
    },
  }));

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
    renderPlayer(app);

    app.ticker.add(() => gameLoop());
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

    playerRef.current = player;
  };

  const gameLoop = () => {
    const player = playerRef.current;
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
  };

  const handleKeyDown = (e) => {
    const currentX = springProps.x.get();

    if (e.key === "ArrowLeft" || e.key === "a") {
      setSpringProps.start({
        x: Math.max(0, currentX - playerSpeed),
      });
      setPlayerState("running");
    }

    if (e.key === "ArrowRight" || e.key === "d") {
      setSpringProps.start({
        x: Math.max(0, currentX + playerSpeed),
      });
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
