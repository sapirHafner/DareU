export default function StatusBar() {
  return (
    <div className="status" aria-label="Status bar">
      <span className="status-time">9:41</span>
      <div className="status-right">
        <div className="dots" aria-hidden="true">
          <span className="dot on" />
          <span className="dot on" />
          <span className="dot on" />
          <span className="dot off" />
        </div>
        <div className="battery" aria-hidden="true">
          <span className="battery-fill" />
        </div>
        <span className="signal" aria-hidden="true" />
      </div>
    </div>
  );
}
