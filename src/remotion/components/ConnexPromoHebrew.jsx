import "@fontsource/heebo/400.css";
import "@fontsource/heebo/500.css";
import "@fontsource/heebo/600.css";
import "@fontsource/heebo/700.css";
import "@fontsource/heebo/800.css";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PremiumConnexLockup } from "./Brand.jsx";
import { CinematicBackground } from "./CinematicBackground.jsx";
import { GlassCard } from "./GlassCard.jsx";
import { fade, fadeOut, numberAt, tween } from "../lib/motion.js";
import "../styles/connex-hebrew.css";

const hebrewText = {
  openingTitle: "קונקס",
  openingSubtitle: "מערכת נוכחות חכמה לענף הבנייה",
  openingSmall: "שליטה מלאה בכוח האדם — מכל מקום",
  workerTitle: "כניסה ויציאה מהירה לעובדים",
  gpsTitle: "אימות מיקום GPS באתר",
  gpsSuccess: "מיקום אומת בהצלחה",
  reportsTitle: "דוחות ניהול בזמן אמת",
  outroTitle: "Connex",
  outroSubtitle: "שליטה בכוח האדם. מכל מקום.",
};

const RevealWords = ({ children, delay = 0, className = "", as: Component = "div" }) => {
  const frame = useCurrentFrame();
  const words = String(children).split(" ");

  return (
    <Component className={className} dir="rtl">
      {words.map((word, index) => {
        const start = delay + index * 3;
        const opacity = fade(frame, start, start + 16);
        const y = tween(frame, start, start + 18, 20, 0);
        const blur = interpolate(opacity, [0, 1], [8, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <span
            className="he-reveal-word"
            key={`${word}-${index}`}
            style={{
              opacity,
              filter: `blur(${blur}px)`,
              transform: `translateY(${y}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </Component>
  );
};

const HebrewTitle = ({ children, delay = 10, align = "right", className = "" }) => {
  const frame = useCurrentFrame();
  return (
    <div className={`he-title-block ${align} ${className}`} dir="rtl">
      <div className="he-title-glow" style={{ opacity: fade(frame, delay + 10, delay + 32) }} />
      <RevealWords as="h2" delay={delay} className="he-scene-title">
        {children}
      </RevealWords>
      <span className="he-title-line" style={{ transform: `scaleX(${fade(frame, delay + 20, delay + 44)})` }} />
    </div>
  );
};

const FloatingHebrewCard = ({ label, value, delay, className = "" }) => {
  const frame = useCurrentFrame();
  return (
    <GlassCard className={`he-floating-card ${className}`} style={{ opacity: fade(frame, delay, delay + 18), transform: `translateY(${tween(frame, delay, delay + 24, 18, 0)}px)` }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </GlassCard>
  );
};

const HebrewOpening = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({ frame: frame - 6, fps, config: { damping: 25, stiffness: 88, mass: 0.9 } });
  const opacity = fade(frame, 0, 22) * fadeOut(frame, 106, 120);
  const logoOpacity = fade(frame, 4, 24);
  const sweepX = tween(frame, 22, 76, -120, 118);

  return (
    <CinematicBackground variant="he-intro-bg" intensity={0.9}>
      <div className="he-scene" style={{ opacity }}>
        <div className="he-opening">
          <div className="he-logo-orbit" style={{ opacity: fade(frame, 12, 36), transform: `scale(${0.88 + reveal * 0.12})` }} />
          <PremiumConnexLockup
            className="he-main-logo"
            style={{
              opacity: logoOpacity,
              transform: `translateY(${tween(frame, 4, 28, 18, 0)}px) scale(${0.92 + reveal * 0.08})`,
            }}
            sweepStyle={{
              opacity: fade(frame, 20, 34) * fadeOut(frame, 64, 82),
              transform: `translateX(${sweepX}%) rotate(18deg)`,
            }}
          />
          <div className="he-opening-copy">
            <RevealWords as="h1" delay={22} className="he-main-title">
              {hebrewText.openingTitle}
            </RevealWords>
            <RevealWords as="p" delay={36} className="he-main-subtitle">
              {hebrewText.openingSubtitle}
            </RevealWords>
            <RevealWords as="small" delay={54} className="he-main-small">
              {hebrewText.openingSmall}
            </RevealWords>
          </div>
        </div>
      </div>
    </CinematicBackground>
  );
};

const HebrewPhone = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const switched = fade(frame, 64, 82);
  const tap = fade(frame, 44, 52) * fadeOut(frame, 58, 76);
  const press = spring({ frame: frame - 44, fps, config: { damping: 17, stiffness: 145 } });
  const buttonScale = 1 - Math.sin(Math.min(press, 1) * Math.PI) * 0.045;

  return (
    <div className="he-phone-assembly">
      <div className="he-phone-shadow" />
      <div className="he-phone-body">
        <div className="he-phone-screen" dir="rtl">
          <div className="dynamic-island" />
          <div className="he-phone-status"><span>07:02</span><span>5G</span></div>
          <GlassCard className="he-mobile-panel">
            <div className="he-mobile-header">
              <span>Connex Worker</span>
              <strong>אתר תל אביב</strong>
            </div>
            <div className="he-worker-row">
              <div className="he-worker-avatar">מ</div>
              <div>
                <strong>מינגצ׳יאנג סונג</strong>
                <span>צוות שלד</span>
              </div>
            </div>
            <div className="he-verified-row">
              <i />
              <div>
                <strong>{switched > 0.55 ? "הכניסה אושרה" : "מוכן לכניסה"}</strong>
                <span>אימות GPS בתוך רדיוס האתר</span>
              </div>
            </div>
            <button className="he-action-button" style={{ transform: `scale(${buttonScale})` }}>
              <span className="he-button-aura" />
              <strong style={{ opacity: fadeOut(frame, 58, 72) }}>כניסה</strong>
              <strong className="he-exit-label" style={{ opacity: switched }}>יציאה</strong>
            </button>
            <div className="he-entry-row" style={{ opacity: fade(frame, 78, 104), transform: `translateY(${tween(frame, 78, 104, 18, 0)}px)` }}>
              <span>שעת כניסה</span>
              <strong>07:02</strong>
            </div>
          </GlassCard>
        </div>
        <div className="he-tap-ring" style={{ opacity: tap, transform: `translate(-50%, -50%) scale(${interpolate(frame, [44, 68], [0.45, 1.65], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})` }} />
      </div>
    </div>
  );
};

const HebrewWorkerScene = () => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, 0, 18) * fadeOut(frame, 108, 120);

  return (
    <CinematicBackground variant="he-checkin-bg" intensity={1}>
      <div className="he-scene" style={{ opacity }}>
        <div className="he-checkin-layout">
          <div className="he-copy-wrap">
            <HebrewTitle delay={10}>{hebrewText.workerTitle}</HebrewTitle>
            <RevealWords as="p" delay={42} className="he-body-copy">
              ממשק עובדים נקי, מהיר ומותאם לאתרי בנייה פעילים.
            </RevealWords>
          </div>
          <div className="he-phone-stage" style={{ transform: `translate3d(${tween(frame, 0, 120, -18, 18)}px, ${tween(frame, 0, 120, 14, -8)}px, 0)` }}>
            <HebrewPhone />
            <FloatingHebrewCard className="he-card-a" label="סטטוס" value="נרשם בהצלחה" delay={76} />
            <FloatingHebrewCard className="he-card-b" label="שעה" value="07:02" delay={88} />
            <FloatingHebrewCard className="he-card-c" label="אתר" value="מאומת" delay={96} />
          </div>
        </div>
      </div>
    </CinematicBackground>
  );
};

const HebrewGpsScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pinReveal = spring({ frame: frame - 34, fps, config: { damping: 18, stiffness: 90 } });
  const ring = fade(frame, 54, 104);
  const worker = fade(frame, 82, 128);
  const success = fade(frame, 102, 124);
  const streetReveal = fade(frame, 8, 54);
  const blockReveal = fade(frame, 22, 58);
  const camera = tween(frame, 0, 150, 1.035, 1);
  const opacity = fade(frame, 0, 18) * fadeOut(frame, 136, 150);

  return (
    <CinematicBackground variant="he-gps-bg" intensity={1.15}>
      <div className="he-scene" style={{ opacity }}>
        <div className="he-gps-layout">
          <div className="he-map-panel premium-gps-panel" style={{ transform: `scale(${camera}) translateY(${tween(frame, 0, 150, 22, -8)}px)` }}>
            <div className="he-map-orbital" style={{ opacity: fade(frame, 0, 42), transform: `scale(${tween(frame, 0, 90, 1.18, 1)})` }} />
            <svg className="he-street-map" viewBox="0 0 980 720" aria-hidden="true">
              <defs>
                <linearGradient id="roadGlow" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.35" />
                  <stop offset="52%" stopColor="#38bdf8" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.35" />
                </linearGradient>
                <linearGradient id="siteAmber" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                </linearGradient>
                <filter id="softRoadGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect className="street-map-base" x="0" y="0" width="980" height="720" rx="42" />
              <g className="street-blocks" style={{ opacity: blockReveal }}>
                <path d="M72 92h162v104H72z" />
                <path d="M286 60h156v136H286z" />
                <path d="M506 84h188v96H506z" />
                <path d="M740 66h156v158H740z" />
                <path d="M92 252h206v142H92z" />
                <path d="M344 250h146v116H344z" />
                <path d="M692 286h190v128H692z" />
                <path d="M78 470h196v126H78z" />
                <path d="M324 486h172v104H324z" />
                <path d="M666 492h228v132H666z" />
              </g>
              <g className="street-road-glow" filter="url(#softRoadGlow)" style={{ opacity: streetReveal }}>
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M-40 330 C150 260 264 280 422 338 S730 455 1030 392" />
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M120 760 C260 568 348 424 448 302 S638 118 786 -40" />
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M-30 132 C176 178 274 186 408 176 S690 104 1010 142" />
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M-20 562 C180 506 346 524 506 568 S770 630 1010 554" />
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M246 -40 C292 134 312 256 284 386 S216 604 176 760" />
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M610 -40 C588 152 596 306 650 440 S778 630 842 760" />
              </g>
              <g className="street-road-core" style={{ opacity: streetReveal }}>
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M-40 330 C150 260 264 280 422 338 S730 455 1030 392" />
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M120 760 C260 568 348 424 448 302 S638 118 786 -40" />
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M-30 132 C176 178 274 186 408 176 S690 104 1010 142" />
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M-20 562 C180 506 346 524 506 568 S770 630 1010 554" />
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M246 -40 C292 134 312 256 284 386 S216 604 176 760" />
                <path pathLength="1" style={{ strokeDashoffset: 1 - streetReveal }} d="M610 -40 C588 152 596 306 650 440 S778 630 842 760" />
              </g>
              <g className="minor-streets" style={{ opacity: fade(frame, 34, 78) }}>
                <path d="M66 228h836" />
                <path d="M96 434h770" />
                <path d="M368 20v650" />
                <path d="M528 44v612" />
                <path d="M58 646h820" />
              </g>
              <path className="construction-site" style={{ opacity: fade(frame, 42, 70) }} d="M486 274 L652 304 L632 430 L452 400 Z" />
              <path className="construction-site-inner" style={{ opacity: fade(frame, 52, 82) }} d="M510 306 L622 326 L608 394 L486 376 Z" />
              <circle className="svg-gps-ring ring-a" cx="548" cy="352" r="130" style={{ opacity: ring * 0.6, transform: `scale(${0.5 + ring * 0.86})`, transformOrigin: "548px 352px" }} />
              <circle className="svg-gps-ring ring-b" cx="548" cy="352" r="202" style={{ opacity: ring * 0.35, transform: `scale(${0.62 + ring * 0.9})`, transformOrigin: "548px 352px" }} />
              <path className="worker-route" pathLength="1" style={{ opacity: worker, strokeDashoffset: 1 - worker }} d="M178 560 C260 520 332 486 408 442 S506 378 548 352" />
              <circle className="svg-worker-dot" cx={interpolate(worker, [0, 1], [178, 548])} cy={interpolate(worker, [0, 1], [560, 352])} r="13" style={{ opacity: fade(frame, 74, 90) }} />
            </svg>
            <div className="he-scan-beam" style={{ opacity: fade(frame, 30, 58) * fadeOut(frame, 118, 146), transform: `translateX(${tween(frame, 30, 146, -420, 420)}px) rotate(18deg)` }} />
            <div className="he-premium-pin" style={{ opacity: fade(frame, 26, 46), transform: `translate(-50%, ${interpolate(pinReveal, [0, 1], [-250, -50], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%) scale(${0.82 + pinReveal * 0.18})` }}>
              <span />
            </div>
            <GlassCard className="he-gps-card premium-success" style={{ opacity: success, transform: `translateX(-50%) translateY(${tween(frame, 102, 124, 18, 0)}px)` }}>
              <span>GPS</span>
              <strong>{hebrewText.gpsSuccess}</strong>
            </GlassCard>
          </div>
          <div className="he-copy-wrap he-copy-left">
            <HebrewTitle delay={16}>{hebrewText.gpsTitle}</HebrewTitle>
            <RevealWords as="p" delay={60} className="he-body-copy">
              נוכחות מאושרת רק כאשר העובד נמצא בפועל באזור האתר.
            </RevealWords>
          </div>
        </div>
      </div>
    </CinematicBackground>
  );
};

const HebrewCounter = ({ value, suffix = "", delay = 30 }) => {
  const frame = useCurrentFrame();
  return <>{Math.round(numberAt(frame, delay, delay + 58, 0, value))}{suffix}</>;
};

const HebrewMetric = ({ label, value, suffix, delay, tone }) => {
  const frame = useCurrentFrame();
  return (
    <GlassCard className={`he-dashboard-metric ${tone}`} style={{ opacity: fade(frame, delay, delay + 20), transform: `translateY(${tween(frame, delay, delay + 24, 22, 0)}px)` }}>
      <span>{label}</span>
      <strong><HebrewCounter value={value} suffix={suffix} delay={delay + 12} /></strong>
    </GlassCard>
  );
};

const HebrewReportsScene = () => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, 0, 18) * fadeOut(frame, 136, 150);
  const bars = [54, 68, 48, 82, 73, 92, 78];
  const linePoints = bars.map((height, index) => `${index * 98 + 12},${150 - height}`).join(" ");

  return (
    <CinematicBackground variant="he-reports-bg" intensity={1}>
      <div className="he-scene" style={{ opacity }}>
        <div className="he-reports-layout">
          <div className="he-copy-wrap">
            <HebrewTitle delay={12}>{hebrewText.reportsTitle}</HebrewTitle>
            <RevealWords as="p" delay={52} className="he-body-copy">
              תמונת מצב ניהולית לכל אתר, עם שעות, חוסרים ואחוזי נוכחות.
            </RevealWords>
          </div>
          <div className="he-desktop-stage" style={{ transform: `perspective(1400px) rotateX(${tween(frame, 0, 52, 5, 0)}deg) rotateY(${tween(frame, 0, 150, 5, 1.5)}deg) translateY(${tween(frame, 0, 150, 28, -10)}px)` }}>
            <div className="he-desktop-shell" dir="rtl">
              <div className="he-desktop-chrome"><strong>Connex Admin</strong><span /><span /><span /></div>
              <div className="he-dashboard-body">
                <aside className="he-dashboard-sidebar"><strong>Connex</strong><i /><i /><i /></aside>
                <main className="he-dashboard-main">
                  <div className="he-dashboard-top">
                    <div><span>סנכרון חי</span><strong>סקירת כוח אדם באתרי הבנייה</strong></div>
                    <div className="he-live-pill">Live</div>
                  </div>
                  <div className="he-dashboard-grid">
                    <HebrewMetric label="עובדים נוכחים" value={91} tone="green" delay={30} />
                    <HebrewMetric label="חסרים היום" value={6} tone="amber" delay={38} />
                    <HebrewMetric label="סה״כ שעות" value={687} suffix="ש׳" tone="blue" delay={46} />
                    <HebrewMetric label="אחוז נוכחות" value={94} suffix="%" tone="cyan" delay={54} />
                  </div>
                  <GlassCard className="he-chart-card" style={{ opacity: fade(frame, 64, 86) }}>
                    <div className="he-chart-header"><span>פעילות אתרים</span><strong>היום</strong></div>
                    <div className="chart-area">
                      {bars.map((height, index) => (
                        <span
                          className="chart-bar"
                          key={`${height}-${index}`}
                          style={{
                            height: `${height}%`,
                            opacity: fade(frame, 70 + index * 4, 90 + index * 4),
                            transform: `scaleY(${interpolate(frame, [70 + index * 4, 100 + index * 4], [0.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                          }}
                        />
                      ))}
                      <svg className="chart-line" viewBox="0 0 620 170" aria-hidden="true"><polyline points={linePoints} /></svg>
                    </div>
                  </GlassCard>
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CinematicBackground>
  );
};

const HebrewOutro = () => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, 0, 18) * fadeOut(frame, 48, 60);
  const sweepX = tween(frame, 8, 44, -110, 114);
  return (
    <CinematicBackground variant="he-outro-bg" intensity={0.7}>
      <div className="he-outro" style={{ opacity, transform: `translateY(${tween(frame, 0, 24, 18, 0)}px)` }}>
        <PremiumConnexLockup
          className="he-outro-logo"
          style={{ transform: `scale(${0.96 + fade(frame, 0, 18) * 0.04})` }}
          sweepStyle={{
            opacity: fade(frame, 8, 18) * fadeOut(frame, 34, 48),
            transform: `translateX(${sweepX}%) rotate(18deg)`,
          }}
        />
        <RevealWords as="h2" delay={8} className="he-outro-title">{hebrewText.outroTitle}</RevealWords>
        <RevealWords as="p" delay={18} className="he-outro-subtitle">{hebrewText.outroSubtitle}</RevealWords>
      </div>
    </CinematicBackground>
  );
};

const MUSIC_ASSET = "audio/glass-subcourt-connex-20s.m4a";
const MUSIC_BASE_VOLUME = 0.48;

const HebrewMusicBed = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <Html5Audio
      name="Glass Subcourt - Connex 20s cut"
      src={staticFile(MUSIC_ASSET)}
      volume={(audioFrame) => {
        const intro = interpolate(audioFrame, [0, 42], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const outro = interpolate(audioFrame, [durationInFrames - 54, durationInFrames], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const subtleLift = interpolate(audioFrame, [0, 240, 390, durationInFrames], [0.86, 1, 0.96, 0.82], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return MUSIC_BASE_VOLUME * intro * outro * subtleLift;
      }}
    />
  );
};

export const ConnexPromoHebrew = () => (
  <AbsoluteFill className="hebrew-film-root">
    <Sequence from={0} durationInFrames={120}><HebrewOpening /></Sequence>
    <Sequence from={120} durationInFrames={120}><HebrewWorkerScene /></Sequence>
    <Sequence from={240} durationInFrames={150}><HebrewGpsScene /></Sequence>
    <Sequence from={390} durationInFrames={150}><HebrewReportsScene /></Sequence>
    <Sequence from={540} durationInFrames={60}><HebrewOutro /></Sequence>
  </AbsoluteFill>
);

export const ConnexPromoHebrewWithMusic = () => (
  <AbsoluteFill>
    <ConnexPromoHebrew />
    <HebrewMusicBed />
  </AbsoluteFill>
);

export const ConnexPromoHebrewMobile = () => (
  <AbsoluteFill className="hebrew-mobile-root">
    <ConnexPromoHebrew />
  </AbsoluteFill>
);

export const ConnexPromoHebrewMobileWithMusic = () => (
  <AbsoluteFill className="hebrew-mobile-root">
    <ConnexPromoHebrew />
    <HebrewMusicBed />
  </AbsoluteFill>
);
