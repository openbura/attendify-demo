export const GlassCard = ({ children, className = "", style }) => (
  <div className={`glass-card ${className}`} style={style}>
    {children}
  </div>
);
