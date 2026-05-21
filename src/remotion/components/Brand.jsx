import { Img } from "remotion";
import connexIcon from "../../../assets/connex-icon-transparent.png";
import realConnexLogo from "../../../assets/connex-logo-transparent.png";

export const LogoTile = ({ className = "" }) => (
  <div className={`logo-tile ${className}`}>
    <div className="logo-mark-core">
      <span className="logo-mark-grid" />
      <span className="logo-c-ring" />
      <strong>C</strong>
    </div>
    <span className="logo-light-sweep" />
  </div>
);

export const RealConnexLogo = ({ className = "" }) => (
  <div className={`real-connex-logo ${className}`}>
    <Img src={realConnexLogo} />
    <span className="real-logo-sweep" />
  </div>
);

export const PremiumConnexLockup = ({ className = "", style, sweepStyle }) => (
  <div className={`premium-connex-lockup ${className}`} style={style}>
    <div className="premium-connex-icon">
      <Img src={connexIcon} />
    </div>
    <div className="premium-connex-word" dir="ltr">
      <strong>
        Conne<span>x</span>
      </strong>
      <small>חכמת עובדים זרים לבנייה</small>
    </div>
    <span className="premium-lockup-sweep" style={sweepStyle} />
  </div>
);

export const Wordmark = ({ compact = false }) => (
  <div className={compact ? "wordmark compact" : "wordmark"}>
    <strong>Connex</strong>
    {!compact && <span>Smart attendance for construction teams</span>}
  </div>
);
