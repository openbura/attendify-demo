import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CinematicBackground } from "../components/CinematicBackground.jsx";
import { GlassCard } from "../components/GlassCard.jsx";
import { fade, fadeOut, tween } from "../lib/motion.js";

const FloatingCard = ({ label, value, delay, side }) => {
  const frame = useCurrentFrame();
  const show = fade(frame, delay, delay + 20);
  const y = tween(frame, delay, delay + 26, 24, 0);

  return (
    <GlassCard className={`floating-card ${side}`} style={{ opacity: show, transform: `translate3d(0, ${y}px, 0)` }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </GlassCard>
  );
};

const PhoneMock = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tap = fade(frame, 58, 66) * fadeOut(frame, 72, 92);
  const switched = fade(frame, 78, 96);
  const buttonPress = spring({ frame: frame - 58, fps, config: { damping: 16, stiffness: 140 } });
  const buttonScale = 1 - Math.sin(Math.min(buttonPress, 1) * Math.PI) * 0.045;

  return (
    <div className="phone-assembly">
      <div className="phone-shadow" />
      <div className="phone-body">
        <div className="phone-metal" />
        <div className="phone-screen">
          <div className="dynamic-island" />
          <div className="phone-status-row"><span>07:02</span><span>5G</span></div>
          <section className="mobile-panel">
            <div className="mobile-header">
              <span>Connex Worker</span>
              <strong>Forma Tel Aviv</strong>
            </div>
            <div className="worker-profile">
              <div className="worker-photo">MS</div>
              <div>
                <strong>MINGQIANG SONG</strong>
                <span>Concrete team</span>
              </div>
            </div>
            <div className="site-verification">
              <span className="verification-dot" />
              <div>
                <strong>{switched > 0.55 ? "Site verified" : "Ready to enter"}</strong>
                <span>GPS lock within allowed radius</span>
              </div>
            </div>
            <button className="premium-action" style={{ transform: `scale(${buttonScale})` }}>
              <span className="button-aura" style={{ opacity: 0.32 + switched * 0.18 }} />
              <strong style={{ opacity: fadeOut(frame, 72, 86) }}>Enter</strong>
              <strong className="exit-label" style={{ opacity: switched }}>Exit</strong>
            </button>
            <div className="entry-time-row" style={{ opacity: fade(frame, 92, 118), transform: `translateY(${tween(frame, 92, 118, 18, 0)}px)` }}>
              <span>Entry time</span>
              <strong>07:02</strong>
            </div>
          </section>
        </div>
        <div className="tap-indicator" style={{ opacity: tap, transform: `translate(-50%, -50%) scale(${interpolate(frame, [58, 82], [0.45, 1.65], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})` }} />
      </div>
    </div>
  );
};

export const WorkerCheckIn = () => {
  const frame = useCurrentFrame();
  const sceneOpacity = fade(frame, 0, 18) * fadeOut(frame, 136, 150);
  const cameraX = tween(frame, 0, 150, 16, -18);
  const cameraY = tween(frame, 0, 150, 14, -10);

  return (
    <CinematicBackground variant="checkin-bg" intensity={1}>
      <div className="scene-fade premium-scene" style={{ opacity: sceneOpacity }}>
        <div className="scene-kicker" style={{ opacity: fade(frame, 8, 30), transform: `translateY(${tween(frame, 8, 30, 20, 0)}px)` }}>
          Worker Check-in
        </div>
        <div className="checkin-layout" style={{ transform: `translate3d(${cameraX}px, ${cameraY}px, 0)` }}>
          <div className="scene-copy left">
            <span>Mobile attendance</span>
            <h2>Clock in with confidence.</h2>
            <p>Site verification, attendance status, and entry time land in one polished worker flow.</p>
          </div>
          <div className="phone-stage">
            <PhoneMock />
            <FloatingCard side="top-left" label="Status" value="Checked in" delay={92} />
            <FloatingCard side="right" label="Entry" value="07:02" delay={102} />
            <FloatingCard side="bottom-left" label="Location" value="Site verified" delay={112} />
          </div>
        </div>
      </div>
    </CinematicBackground>
  );
};
