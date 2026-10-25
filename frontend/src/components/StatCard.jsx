export default function StatCard({ label, value, subtext, icon }) {
  return (
    <div className="metric-card">
      <div className="d-flex justify-content-between align-items-center">
        <span className="metric-label">{label}</span>
        {icon && (
          <i
            className={`bi ${icon}`}
            style={{ color: '#DCA349', fontSize: '1.2rem' }}
          ></i>
        )}
      </div>
      <div className="metric-value">{value}</div>
      {subtext && (
        <small className="text-muted" style={{ fontSize: '0.72rem' }}>
          {subtext}
        </small>
      )}
    </div>
  );
}
