import { useCurrentFrame } from "remotion";
import { LogoTile } from "../components/Brand.jsx";
import { CinematicBackground } from "../components/CinematicBackground.jsx";
import { fade, fadeOut, tween } from "../lib/motion.js";

export const Outro = () => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, 0, 18) * fadeOut(frame, 48, 60);

  return (
    <CinematicBackground variant="outro-bg" intensity={0.65}>
      <div className="outro-composition" style={{ opacity, transform: `translateY(${tween(frame, 0, 24, 18, 0)}px)` }}>
        <LogoTile className="outro-logo-tile" />
        <h2>Connex</h2>
        <p>Control your workforce. Anywhere.</p>
      </div>
    </CinematicBackground>
  );
};
