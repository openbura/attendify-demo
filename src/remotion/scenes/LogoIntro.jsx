import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoTile, Wordmark } from "../components/Brand.jsx";
import { CinematicBackground } from "../components/CinematicBackground.jsx";
import { fade, fadeOut, tween } from "../lib/motion.js";

export const LogoIntro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    frame: frame - 8,
    fps,
    config: { damping: 24, stiffness: 92, mass: 0.9 },
  });
  const sceneOpacity = fade(frame, 0, 18) * fadeOut(frame, 78, 90);

  return (
    <CinematicBackground variant="intro-bg" intensity={0.8}>
      <div className="scene-fade" style={{ opacity: sceneOpacity }}>
        <div className="intro-composition" style={{ transform: `translateY(${tween(frame, 0, 76, 12, -8)}px)` }}>
          <div className="logo-halo" style={{ opacity: fade(frame, 15, 42), transform: `scale(${0.86 + reveal * 0.14})` }} />
          <LogoTile className="intro-logo-tile" />
          <div className="intro-copy" style={{ opacity: fade(frame, 24, 48), transform: `translateY(${tween(frame, 20, 48, 20, 0)}px)` }}>
            <Wordmark />
          </div>
          <div className="intro-microline" style={{ opacity: fade(frame, 44, 64) }}>
            Workforce visibility for every site
          </div>
        </div>
      </div>
    </CinematicBackground>
  );
};
